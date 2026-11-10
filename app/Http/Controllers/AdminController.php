<?php
/**
 * Controlador para las acciones del Panel de Administración (Avaspace).
 * Maneja lotes de producción, órdenes de compra y exportaciones masivas a ZIP.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\DeviceBatch;
use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use F9WebLtd\QrCode\Facades\QrCode;
use ZipArchive;
use Inertia\Inertia;

class AdminController extends Controller
{
    /**
     * Muestra el panel de administración.
     */
    public function index()
    {
        // Lotes con el estado del pipeline de producción (impreso/enviado/reclamado).
        $batches = DeviceBatch::with('creator')
            ->withCount([
                'devices',
                'devices as printed_count' => fn ($q) => $q->whereNotNull('printed_at'),
                'devices as shipped_count' => fn ($q) => $q->whereNotNull('shipped_at'),
                'devices as claimed_count' => fn ($q) => $q->where('status', 'claimed'),
                // Utilizadas: marcadas a mano en el checklist o ya reclamadas por un cliente.
                'devices as used_count' => fn ($q) => $q->where(fn ($w) => $w->whereNotNull('used_at')->orWhere('status', 'claimed')),
                // Tarjetas que surten un pedido de SpaceShop: el lote no se puede borrar.
                'devices as order_linked_count' => fn ($q) => $q->whereNotNull('order_item_id'),
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        // TODOS los usuarios (el maestro los ve a todos) con conteos.
        $users = User::withCount(['devices', 'spaces'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (User $u) => [
                'id'            => $u->id,
                'name'          => $u->name,
                'email'         => $u->email,
                'nickname'      => $u->nickname,
                'plan'          => $u->plan,
                'plan_expires_at' => $u->plan_expires_at?->toDateTimeString(),
                'is_admin'      => $u->is_admin,
                'is_master'     => $u->is_master,
                'devices_count' => $u->devices_count,
                'spaces_count'  => $u->spaces_count,
                'created_at'    => $u->created_at?->toDateString(),
            ]);

        // Cargar las órdenes de compra con sus artículos personalizados y la cuenta vinculada
        $orders = Order::with(['items', 'user'])->orderBy('created_at', 'desc')->get();

        // Conteos rápidos
        $stats = [
            'total_devices' => Device::count(),
            'stock_devices' => Device::where('status', 'stock')->count(),
            'claimed_devices' => Device::where('status', 'claimed')->count(),
            'disabled_devices' => Device::where('status', 'disabled')->count(),
            'total_users' => User::count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'batches' => $batches,
            'users' => $users,
            'orders' => $orders,
            'stats' => $stats,
            'currentUserId' => auth()->id(),
        ]);
    }

    /**
     * Crea un lote de manufactura y genera los dispositivos correspondientes en stock.
     */
    public function storeBatch(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            // Solo los tres productos que se venden: tarjeta, pulsera y placa de reseñas.
            'type' => 'required|string|in:card,bracelet,review_plate',
            'quantity' => 'required|integer|min:1|max:1000',
            'notes' => 'nullable|string',
        ]);

        $type = $request->input('type');
        $quantity = (int)$request->input('quantity');

        try {
            DB::transaction(function () use ($request, $type, $quantity) {
                // 1. Crear el Lote
                $batch = DeviceBatch::create([
                    'name' => $request->input('name'),
                    'type' => $type,
                    'quantity' => $quantity,
                    'notes' => $request->input('notes'),
                    'created_by' => auth()->id(),
                ]);

                // Determinar si genera QR (pulsera/bracelet es false, los demás true)
                $hasQr = $type !== 'bracelet';

                // 2. Generar dispositivos
                for ($i = 0; $i < $quantity; $i++) {
                    Device::create([
                        'code' => Device::generateUniqueCode(),
                        'type' => $type,
                        'has_qr' => $hasQr,
                        'status' => 'stock',
                        'batch_id' => $batch->id,
                    ]);
                }
            });

            return redirect()->back()->with('success', "Lote y {$quantity} dispositivos creados exitosamente en stock.");

        } catch (\Exception $e) {
            Log::error("Error al crear lote administrativo: " . $e->getMessage());
            return redirect()->back()->with('error', 'Ocurrió un error al procesar el lote.');
        }
    }

    /**
     * Genera dispositivos y lote automáticamente para surtir una orden de compra personalizada.
     */
    public function generateDevicesFromOrder(Request $request, int $orderId)
    {
        $order = Order::with('items')->findOrFail($orderId);

        if ($order->status !== 'paid') {
            return redirect()->back()->with('error', 'Solo se pueden procesar órdenes que estén pagadas.');
        }

        try {
            DB::transaction(function () use ($order) {
                // ¿A qué usuario corresponde la tarjeta? (comprador con cuenta)
                $recipientId = $order->user_id;

                foreach ($order->items as $item) {
                    // Crear un lote de producción automático para este artículo
                    $batch = DeviceBatch::create([
                        'name' => "Surtido Pedido #SPC-" . (10000 + $order->id) . " - " . ucfirst($item->product_type),
                        'type' => $item->product_type,
                        'quantity' => $item->quantity,
                        'notes' => "Cliente: {$order->customer_name} ({$order->customer_email}). "
                            . "Envío a: {$order->shipping_address}. "
                            . ($recipientId ? "Cuenta vinculada #{$recipientId}." : "Comprador invitado (sin cuenta)."),
                        'created_by' => auth()->id(),
                    ]);

                    $hasQr = $item->product_type !== 'bracelet';

                    // Generar la cantidad de dispositivos comprados heredando el diseño.
                    // Si la compra está vinculada a una cuenta, la tarjeta se pre-asigna
                    // a ese usuario (se refleja en su dashboard); el maestro solo la
                    // imprime y la envía. Si es invitado, queda en stock para reclamar
                    // al recibirla.
                    for ($i = 0; $i < $item->quantity; $i++) {
                        Device::create([
                            'code' => Device::generateUniqueCode(),
                            'type' => $item->product_type,
                            'has_qr' => $hasQr,
                            'status' => $recipientId ? 'claimed' : 'stock',
                            'owner_id' => $recipientId,
                            'claimed_at' => $recipientId ? now() : null,
                            'destination_type' => 'none',
                            'batch_id' => $batch->id,
                            'order_item_id' => $item->id,
                            'design_logo_url' => $item->logo_url,
                            'design_color_primary' => $item->color_primary,
                            'design_color_secondary' => $item->color_secondary,
                        ]);
                    }
                }

                // Actualizar estado de la orden a completada
                $order->update(['status' => 'completed']);
            });

            return redirect()->back()->with('success', "Dispositivos generados y orden de compra completada exitosamente. Lotes listos para exportar.");

        } catch (\Exception $e) {
            Log::error("Error al procesar orden de compra admin: " . $e->getMessage());
            return redirect()->back()->with('error', 'Ocurrió un error al procesar el surtido del pedido.');
        }
    }

    /**
     * Genera un archivo ZIP con los QRs e información NFC (CSV) del lote para imprenta/manufactura.
     */
    public function exportBatch(int $id)
    {
        $batch = DeviceBatch::findOrFail($id);
        $devices = Device::where('batch_id', $batch->id)->get();

        if ($devices->isEmpty()) {
            return redirect()->back()->with('error', 'El lote no contiene dispositivos para exportar.');
        }

        // 1. Crear archivo temporal para el ZIP
        $zipFileName = 'batch_' . $batch->id . '_' . filter_var($batch->name, FILTER_SANITIZE_URL) . '.zip';
        $zipPath = tempnam(sys_get_temp_dir(), 'zip');

        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            return redirect()->back()->with('error', 'No se pudo generar el archivo ZIP temporal.');
        }

        // 2. Generar archivo CSV en memoria
        $csvContent = [];
        $csvContent[] = "\xEF\xBB\xBF" . 'Codigo,Enlace NFC,Tipo,Utilizada,Nota';

        foreach ($devices as $device) {
            $nfcUrl = route('devices.resolve', ['code' => $device->code]);
            $used = $device->used_at || $device->status === 'claimed';
            $csvContent[] = sprintf('"%s","%s","%s","%s","%s"', $device->code, $nfcUrl, $device->type,
                $used ? 'Sí' : 'No', str_replace('"', '""', (string) $device->used_note));

            // 3. Generar y adjuntar códigos QR (PNG) si aplica
            if ($device->has_qr) {
                try {
                    // Generar el código QR en PNG usando simple-qrcode
                    $qrImage = QrCode::format('png')
                        ->size(400)
                        ->margin(1)
                        ->generate($nfcUrl);

                    $zip->addFromString("qrs/{$device->code}.png", $qrImage);
                } catch (\Exception $e) {
                    Log::error("No se pudo generar QR para el dispositivo {$device->code}: " . $e->getMessage());
                }
            }
        }

        // Adjuntar el archivo CSV al ZIP
        $zip->addFromString('nfc_urls.csv', implode("\r\n", $csvContent));

        // Cerrar el archivo ZIP
        $zip->close();

        // 4. Retornar el ZIP como descarga y eliminar el temporal tras enviar
        return response()->download($zipPath, $zipFileName)->deleteFileAfterSend(true);
    }

    /** Datos de una tarjeta para el checklist del lote. */
    private function checklistRow(Device $d): array
    {
        return [
            'id'        => $d->id,
            'code'      => $d->code,
            'has_qr'    => (bool) $d->has_qr,
            'nfc_url'   => route('devices.resolve', ['code' => $d->code]),
            'status'    => $d->status,
            'printed'   => (bool) $d->printed_at,
            'shipped'   => (bool) $d->shipped_at,
            'claimed'   => $d->status === 'claimed',
            'owner'     => $d->owner?->name,
            'used'      => (bool) $d->used_at || $d->status === 'claimed',
            'used_at'   => $d->used_at?->format('d/m/Y H:i'),
            'used_note' => $d->used_note,
        ];
    }

    /**
     * Checklist de un lote: cada tarjeta con su enlace NFC, su QR y si ya se utilizó.
     */
    public function batchDevices(int $id)
    {
        $batch = DeviceBatch::findOrFail($id);

        return response()->json(
            $batch->devices()->with('owner:id,name')->orderBy('id')->get()->map(fn ($d) => $this->checklistRow($d))
        );
    }

    /**
     * Sella una tarjeta como utilizada (entregada/asignada), con una nota opcional.
     * Es definitivo: funciona como sello de autenticidad, así que una tarjeta ya
     * utilizada (o reclamada por un cliente) no se puede desmarcar ni reutilizar.
     */
    public function toggleDeviceUsed(Request $request, int $id)
    {
        $data = $request->validate([
            'note' => 'nullable|string|max:255',
        ]);
        $device = Device::with('owner:id,name')->findOrFail($id);

        if ($device->used_at || $device->status === 'claimed') {
            return response()->json([
                'message' => "La tarjeta {$device->code} ya fue utilizada y no se puede volver a usar.",
                'device'  => $this->checklistRow($device),
            ], 409);
        }

        $device->forceFill([
            'used_at'   => now(),
            'used_note' => $data['note'] ?? null,
        ])->save();

        return response()->json($this->checklistRow($device));
    }

    /**
     * Descarga el QR de una tarjeta en PNG (alta resolución, listo para imprimir).
     */
    public function deviceQr(int $id)
    {
        $device = Device::findOrFail($id);
        $png = QrCode::format('png')->size(1000)->margin(2)
            ->generate(route('devices.resolve', ['code' => $device->code]));

        return response((string) $png, 200, [
            'Content-Type'        => 'image/png',
            'Content-Disposition' => 'attachment; filename="' . $device->code . '.png"',
        ]);
    }

    /**
     * Cambia el estado o desactiva un dispositivo.
     */
    public function toggleDeviceStatus(Request $request, int $id)
    {
        $device = Device::findOrFail($id);
        $newStatus = $request->input('status');

        $request->validate([
            'status' => 'required|in:stock,claimed,disabled'
        ]);

        $device->update(['status' => $newStatus]);

        return redirect()->back()->with('success', "Estado del dispositivo {$device->code} actualizado a {$newStatus}.");
    }

    /**
     * Modifica el plan y la fecha de expiración de un usuario.
     */
    public function updateUserPlan(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'plan' => 'required|in:free,pro',
            'plan_expires_at' => 'nullable|date',
        ]);

        $user->update([
            'plan' => $request->input('plan'),
            'plan_expires_at' => $request->input('plan') === 'pro' && $request->input('plan_expires_at')
                ? $request->input('plan_expires_at')
                : null,
        ]);

        return redirect()->back()->with('success', "Plan del usuario {$user->name} actualizado a {$user->plan}.");
    }

    /**
     * Concede o retira privilegios de administrador a un usuario.
     * Solo hay dos roles (cliente y administrador) y cualquier admin puede
     * cambiarlos; lo único bloqueado es quitarse el rol a uno mismo, para que
     * nunca se quede el sistema sin administradores por accidente.
     */
    public function toggleUserAdmin(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'No puedes cambiar tus propios privilegios.');
        }

        // Al quitar el rol también se apaga la marca antigua de "maestro".
        $user->forceFill($user->is_admin
            ? ['is_admin' => false, 'is_master' => false]
            : ['is_admin' => true])->save();

        $estado = $user->is_admin ? 'ahora es administrador' : 'ya no es administrador';
        return redirect()->back()->with('success', "{$user->name} {$estado}.");
    }

    /**
     * Marca todas las tarjetas de un lote como impresas (pipeline de producción).
     */
    public function markBatchPrinted(Request $request, int $id, \App\Services\DeviceProvisioningService $prov)
    {
        $batch = DeviceBatch::findOrFail($id);
        $n = 0;
        foreach ($batch->devices()->whereNull('printed_at')->get() as $device) {
            $prov->markPrinted($device);
            $n++;
        }

        return redirect()->back()->with('success', "{$n} tarjeta(s) del lote «{$batch->name}» marcadas como impresas.");
    }

    /**
     * Marca todas las tarjetas impresas de un lote como enviadas.
     */
    public function markBatchShipped(Request $request, int $id, \App\Services\DeviceProvisioningService $prov)
    {
        $batch = DeviceBatch::findOrFail($id);
        $n = 0;
        foreach ($batch->devices()->whereNotNull('printed_at')->whereNull('shipped_at')->get() as $device) {
            $prov->markShipped($device);
            $n++;
        }

        if ($n === 0) {
            return redirect()->back()->with('error', 'No hay tarjetas impresas pendientes de envío en este lote. Imprime primero.');
        }

        return redirect()->back()->with('success', "{$n} tarjeta(s) del lote «{$batch->name}» marcadas como enviadas.");
    }

    /**
     * Acción sobre varias tarjetas de un lote a la vez (las seleccionadas en el checklist).
     * - printed: marca impresas.
     * - shipped: marca enviadas (solo las ya impresas; las demás se omiten).
     * - used:    sella como utilizadas (definitivo; omite las ya utilizadas o reclamadas).
     * Devuelve las tarjetas actualizadas y cuántas se omitieron.
     */
    public function bulkDevices(Request $request, int $id, \App\Services\DeviceProvisioningService $prov)
    {
        $data = $request->validate([
            'action' => 'required|in:printed,shipped,used',
            'ids'    => 'required|array|min:1|max:5000',
            'ids.*'  => 'integer',
            'note'   => 'nullable|string|max:255',
        ]);

        $batch = DeviceBatch::findOrFail($id);
        $devices = $batch->devices()->with('owner:id,name')->whereIn('id', $data['ids'])->get();

        $done = 0;
        $skipped = 0;
        DB::transaction(function () use ($devices, $data, $prov, &$done, &$skipped) {
            foreach ($devices as $device) {
                if ($data['action'] === 'printed') {
                    if ($device->printed_at) {
                        $skipped++;
                        continue;
                    }
                    $prov->markPrinted($device);
                    $done++;
                } elseif ($data['action'] === 'shipped') {
                    if (!$device->printed_at || $device->shipped_at) {
                        $skipped++;
                        continue;
                    }
                    $prov->markShipped($device);
                    $done++;
                } else { // used
                    if ($device->used_at || $device->status === 'claimed') {
                        $skipped++;
                        continue;
                    }
                    $device->forceFill(['used_at' => now(), 'used_note' => $data['note'] ?? null])->save();
                    $done++;
                }
            }
        });

        return response()->json([
            'done'    => $done,
            'skipped' => $skipped,
            'devices' => $devices->map(fn ($d) => $this->checklistRow($d))->values(),
        ]);
    }

    /**
     * Elimina un lote creado por error, con todas sus tarjetas.
     * Solo se permite si ninguna tarjeta salió al mundo: sin enviar, sin utilizar,
     * sin reclamar y sin estar ligada a un pedido de SpaceShop.
     */
    public function destroyBatch(int $id)
    {
        $batch = DeviceBatch::findOrFail($id);
        $devices = $batch->devices();

        $blocked = (clone $devices)->where(fn ($q) => $q
            ->whereNotNull('shipped_at')
            ->orWhereNotNull('used_at')
            ->orWhere('status', 'claimed')
            ->orWhereNotNull('order_item_id')
        )->count();

        if ($blocked > 0) {
            return redirect()->back()->with('error', "No se puede eliminar «{$batch->name}»: {$blocked} tarjeta(s) ya se enviaron, se utilizaron, las reclamó un cliente o surten un pedido.");
        }

        DB::transaction(function () use ($batch) {
            $batch->devices()->delete();
            $batch->delete();
        });

        Log::info("Lote {$batch->id} «{$batch->name}» eliminado por el usuario " . auth()->id());

        return redirect()->back()->with('success', "Lote «{$batch->name}» eliminado.");
    }
}
