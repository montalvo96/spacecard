<?php
/**
 * Producción (admin): registro de clientes y de los diseños que dejan en
 * SpaceShop, con descarga (ZIP / CSV) y hoja de impresión a tamaño real.
 *
 * La impresión va por el diálogo del navegador, así funciona con cualquier
 * impresora instalada en la computadora (incluidas las de tarjetas PVC tipo
 * Evolis / Zebra / Magicard, que se instalan como impresoras de Windows con
 * el tamaño CR80 de 85.6 × 54 mm).
 */

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\OrderItem;
use App\Models\User;
use App\Services\CardDesignRenderer;
use App\Services\DeviceProvisioningService;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use F9WebLtd\QrCode\Facades\QrCode;
use Symfony\Component\HttpFoundation\StreamedResponse;
use ZipArchive;

class AdminDesignController extends Controller
{
    /** Estado de producción de un artículo según sus dispositivos. */
    private function stage(OrderItem $item): string
    {
        $devices = $item->devices;
        if ($devices->isEmpty()) {
            return 'pending';                       // aún sin dispositivos (sin QR real)
        }
        if ($devices->every(fn ($d) => $d->shipped_at)) {
            return 'shipped';
        }
        if ($devices->every(fn ($d) => $d->printed_at)) {
            return 'printed';
        }

        return 'ready';                             // con QR real, listo para imprimir
    }

    private function itemPayload(OrderItem $item): array
    {
        $order = $item->order;
        $design = $item->design_config ?? [];

        return [
            'id'          => $item->id,
            'order_id'    => $order->id,
            'order_code'  => 'SPC-' . (10000 + $order->id),
            'order_status'=> $order->status,
            'created_at'  => $item->created_at?->toDateTimeString(),
            'product'     => $item->product_type,
            'quantity'    => $item->quantity,
            'mode'        => $design['mode'] ?? ($item->product_type === 'card' ? 'custom' : null),
            'preset_name' => $design['preset_name'] ?? null,
            'info'        => $design['el']['info'] ?? null,
            'colors'      => array_values(array_filter([$item->color_primary, $item->color_secondary])),
            'logo_url'    => $item->logo_url,
            'stage'       => $this->stage($item),
            'devices'     => $item->devices->map(fn ($d) => [
                'code'    => $d->code,
                'nfc_url' => route('devices.resolve', ['code' => $d->code]),
                'printed' => (bool) $d->printed_at,
            ])->values(),
            'customer'    => [
                'name'    => $order->customer_name,
                'email'   => $order->customer_email,
                'address' => $order->shipping_address,
                'user'    => $order->user ? ['id' => $order->user->id, 'name' => $order->user->name, 'email' => $order->user->email] : null,
            ],
        ];
    }

    private function items()
    {
        return OrderItem::with(['order.user', 'devices'])
            ->where('product_type', 'card')
            ->latest()
            ->get();
    }

    public function index()
    {
        $items = $this->items()->map(fn ($i) => $this->itemPayload($i));

        // Registro de usuarios con su actividad de compra.
        $users = User::withCount(['devices', 'spaces'])
            ->latest()
            ->get()
            ->map(fn (User $u) => [
                'id'            => $u->id,
                'name'          => $u->name,
                'email'         => $u->email,
                'plan'          => $u->plan,
                'devices_count' => $u->devices_count,
                'spaces_count'  => $u->spaces_count,
                'designs_count' => $items->where('customer.user.id', $u->id)->count(),
                'created_at'    => $u->created_at?->toDateString(),
            ]);

        return Inertia::render('Admin/Designs', [
            'items' => $items->values(),
            'users' => $users,
        ]);
    }

    /** CSV con todos los diseños y los datos del cliente (abre en Excel). */
    public function exportCsv(): StreamedResponse
    {
        $items = $this->items();

        return response()->streamDownload(function () use ($items) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // BOM para que Excel lea bien los acentos
            fputcsv($out, ['Pedido', 'Fecha', 'Estado', 'Cliente', 'Correo', 'Cuenta', 'Dirección de envío', 'Cantidad', 'Tipo de diseño',
                'Nombre en tarjeta', 'Puesto', 'Empresa', 'Teléfono', 'Sitio web', 'Color 1', 'Color 2', 'Logo', 'Códigos', 'Enlaces NFC']);

            foreach ($items as $item) {
                $p = $this->itemPayload($item);
                $info = $p['info'] ?? [];
                fputcsv($out, [
                    $p['order_code'], $p['created_at'],
                    ['pending' => 'Sin QR', 'ready' => 'Listo para imprimir', 'printed' => 'Impreso', 'shipped' => 'Enviado'][$p['stage']],
                    $p['customer']['name'], $p['customer']['email'],
                    $p['customer']['user']['email'] ?? 'Invitado', $p['customer']['address'], $p['quantity'],
                    $p['mode'] === 'preset' ? 'Catálogo · ' . $p['preset_name'] : 'Personalizado',
                    $info['name'] ?? '', $info['title'] ?? '', $info['company'] ?? '', $info['phone'] ?? '', $info['website'] ?? '',
                    $item->color_primary, $item->color_secondary, $item->logo_url,
                    $item->devices->pluck('code')->implode(' '),
                    $item->devices->map(fn ($d) => route('devices.resolve', ['code' => $d->code]))->implode(' '),
                ]);
            }
            fclose($out);
        }, 'spacecard-disenos-' . now()->format('Y-m-d') . '.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /** Datos listos para la vista de tarjeta (colores y posiciones saneados). */
    private function faces(OrderItem $item): array
    {
        $d = $item->design_config ?? [];
        $hex = fn ($c, $f) => is_string($c) && preg_match('/^#[0-9a-fA-F]{3,8}$/', $c) ? $c : $f;
        $num = fn ($v, $min, $max, $f) => is_numeric($v) ? max($min, min($max, (float) $v)) : $f;

        if (($d['mode'] ?? null) === 'preset') {
            $name = preg_replace('/[^a-z]/', '', (string) ($d['preset'] ?? 'black')) ?: 'black';
            return ['mode' => 'preset', 'preset' => $name, 'color' => $hex($item->color_primary, '#0c0b14')];
        }

        $bg = [];
        foreach (['front', 'back'] as $s) {
            $b = $d['bg'][$s] ?? [];
            $c1 = $hex($b['c1'] ?? null, '#070707');
            $c2 = $hex($b['c2'] ?? null, $c1);
            $bg[$s] = [
                'css' => ($b['type'] ?? 'solid') === 'gradient'
                    ? 'linear-gradient(' . (int) $num($b['angle'] ?? 135, 0, 360, 135) . "deg, {$c1} 0%, {$c2} 100%)"
                    : $c1,
                'ink' => $this->ink($c1),
            ];
        }

        $el = [];
        foreach (['logo' => [50, 30, 30], 'info' => [50, 74, 100], 'qr' => [50, 50, 34]] as $k => [$x, $y, $size]) {
            $e = $d['el'][$k] ?? [];
            $el[$k] = [
                'on'   => (bool) ($e['on'] ?? true),
                'side' => ($e['side'] ?? 'front') === 'back' ? 'back' : 'front',
                'x'    => $num($e['x'] ?? null, 0, 100, $x),
                'y'    => $num($e['y'] ?? null, 0, 100, $y),
                'size' => $num($e['size'] ?? null, 5, 200, $size),
            ];
        }
        $info = $d['el']['info'] ?? [];
        $el['info']['align'] = in_array($info['align'] ?? '', ['left', 'right'], true) ? $info['align'] : 'center';
        foreach (['name', 'title', 'company', 'phone', 'website'] as $f) {
            $el['info'][$f] = trim((string) ($info[$f] ?? ''));
        }

        return ['mode' => 'custom', 'bg' => $bg, 'el' => $el, 'has_logo' => (bool) $item->logo_url];
    }

    /** Mismo criterio de contraste que el diseñador de la tienda. */
    private function ink(string $hex): string
    {
        $c = ltrim($hex, '#');
        if (strlen($c) === 3) {
            $c = $c[0] . $c[0] . $c[1] . $c[1] . $c[2] . $c[2];
        }
        [$r, $g, $b] = [hexdec(substr($c, 0, 2)), hexdec(substr($c, 2, 2)), hexdec(substr($c, 4, 2))];

        return (0.299 * $r + 0.587 * $g + 0.114 * $b) / 255 > 0.6 ? '#111827' : '#ffffff';
    }

    /** Una tarjeta por dispositivo (con su QR real) o una muestra si aún no hay. */
    private function cards(OrderItem $item): array
    {
        if ($item->devices->isEmpty()) {
            return [['code' => null, 'qr' => null]];
        }

        return $item->devices->map(fn (Device $d) => [
            'code' => $d->code,
            'qr'   => (string) QrCode::format('svg')->margin(0)->size(300)->generate(route('devices.resolve', ['code' => $d->code])),
        ])->all();
    }

    /**
     * Hoja de impresión: cada cara es una página CR80 (85.6 × 54 mm).
     * ?preview=front|back muestra una sola cara (miniatura del panel).
     */
    public function print(Request $request, int $id)
    {
        $item = OrderItem::with(['order', 'devices'])->where('product_type', 'card')->findOrFail($id);
        $preview = in_array($request->query('preview'), ['front', 'back'], true) ? $request->query('preview') : null;

        return view('admin.print-card', [
            'item'    => $item,
            'faces'   => $this->faces($item),
            'cards'   => $preview ? [['code' => null, 'qr' => null]] : $this->cards($item),
            'preview' => $preview,
            'logo'    => $item->logo_url,
        ]);
    }

    /** ZIP con todo lo que necesita imprenta: hoja de impresión, datos, logo y QRs. */
    public function download(int $id)
    {
        $item = OrderItem::with(['order.user', 'devices'])->where('product_type', 'card')->findOrFail($id);
        $code = 'SPC-' . (10000 + $item->order_id) . '-' . $item->id;

        $zipPath = tempnam(sys_get_temp_dir(), 'dsg');
        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            return back()->with('error', 'No se pudo generar el ZIP.');
        }

        // Logo original del cliente (embebido también en la hoja para que funcione sin conexión).
        $logoData = null;
        if ($item->logo_url && str_contains($item->logo_url, '/storage/')) {
            $rel = substr($item->logo_url, strpos($item->logo_url, '/storage/') + 9);
            if (Storage::disk('public')->exists($rel)) {
                $bytes = Storage::disk('public')->get($rel);
                $zip->addFromString('logo.' . pathinfo($rel, PATHINFO_EXTENSION), $bytes);
                $mime = Storage::disk('public')->mimeType($rel) ?: 'image/png';
                $logoData = 'data:' . $mime . ';base64,' . base64_encode($bytes);
            }
        }

        $faces = $this->faces($item);
        if ($faces['mode'] === 'preset') {
            $front = public_path("img/products/fronts/card-{$faces['preset']}.png");
            if (is_file($front)) {
                $faces['preset_data'] = 'data:image/png;base64,' . base64_encode(file_get_contents($front));
            }
        }

        $zip->addFromString('impresion.html', view('admin.print-card', [
            'item' => $item, 'faces' => $faces, 'cards' => $this->cards($item), 'preview' => null,
            'logo' => $logoData ?? $item->logo_url, 'standalone' => true,
        ])->render());

        $p = $this->itemPayload($item);
        $zip->addFromString('datos.json', json_encode([
            'pedido'   => $p['order_code'],
            'cliente'  => $p['customer'],
            'cantidad' => $p['quantity'],
            'codigos'  => $item->devices->pluck('code'),
            'diseno'   => $item->design_config,
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

        // Diseño final de cada tarjeta (SVG vectorial + PNG 300 dpi) con su QR real,
        // y la lista de enlaces NFC para grabar los chips.
        $renderer = app(CardDesignRenderer::class);
        $links = ["\xEF\xBB\xBF" . 'Codigo,Enlace NFC'];
        foreach ($this->cards($item) as $card) {
            $name = $card['code'] ?? 'MUESTRA-sin-QR';
            foreach (['front' => 'frente', 'back' => 'reverso'] as $side => $label) {
                $svg = $renderer->svg($faces, $side, $card['qr'], $logoData, $faces['preset_data'] ?? null);
                $zip->addFromString("disenos/{$name}-{$label}.svg", $svg);
                try {
                    $zip->addFromString("disenos/{$name}-{$label}.png", $renderer->png($svg));
                } catch (\Throwable $e) {
                    Log::warning("No se pudo generar el PNG de {$name}-{$label}: " . $e->getMessage());
                }
            }
            if ($card['code']) {
                $links[] = $card['code'] . ',' . route('devices.resolve', ['code' => $card['code']]);
            }
        }
        if ($item->devices->isNotEmpty()) {
            $zip->addFromString('enlaces_nfc.csv', implode("\r\n", $links));
        }

        foreach ($item->devices as $d) {
            $zip->addFromString("qrs/{$d->code}.png", QrCode::format('png')->size(600)->margin(1)
                ->generate(route('devices.resolve', ['code' => $d->code])));
        }
        $zip->close();

        return response()->download($zipPath, "{$code}.zip")->deleteFileAfterSend(true);
    }

    public function markPrinted(int $id, DeviceProvisioningService $prov)
    {
        $item = OrderItem::with('devices')->findOrFail($id);
        if ($item->devices->isEmpty()) {
            return back()->with('error', 'Primero genera los dispositivos del pedido para tener los QR reales.');
        }
        $item->devices->each(fn ($d) => $prov->markPrinted($d));

        return back()->with('success', "{$item->devices->count()} tarjeta(s) marcadas como impresas.");
    }
}
