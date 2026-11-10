<?php
/**
 * Controlador para la tienda pública y flujo de personalización de hardware antes del registro.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Services\StripeCheckoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ShopController extends Controller
{
    /**
     * Precios de los dispositivos
     */
    protected const PRICES = [
        'card' => 29.99,
        'bracelet' => 19.99,
        'review_plate' => 39.99,
    ];

    /**
     * Muestra la página pública de compras y personalización física.
     */
    public function showForm(Request $request)
    {
        // La tienda es Blade, no Inertia: si llega desde un <Link> de Inertia, forzamos una
        // carga completa. Si no, Inertia la abre en un iframe y Stripe Checkout no carga ahí.
        if ($request->header('X-Inertia')) {
            return Inertia::location(route('shop.comprar'));
        }

        $prices = self::PRICES;
        return view('shop.comprar', compact('prices'));
    }

    /**
     * Procesa la compra de un CARRITO (uno o varios productos) en una sola orden.
     * Cada item del carrito trae su propia personalización y logo (base64).
     */
    public function checkout(Request $request, StripeCheckoutService $payments)
    {
        if (!$payments->isConfigured()) {
            Log::error('Checkout de SpaceShop sin Stripe configurado (faltan STRIPE_SECRET / STRIPE_WEBHOOK_SECRET).');
            return redirect()->back()->with('error', 'Los pagos no están disponibles en este momento. Por favor, inténtalo más tarde.')->withInput();
        }

        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'shipping_address' => 'required|string',
            'cart' => 'required|string|max:12000000',
        ], [
            'customer_name.required'    => 'Escribe tu nombre completo.',
            'customer_email.required'   => 'Escribe tu correo electrónico.',
            'customer_email.email'      => 'El correo electrónico no es válido.',
            'shipping_address.required' => 'Escribe la dirección de entrega.',
            'cart.required'             => 'Tu carrito está vacío.',
            'cart.max'                  => 'Tu diseño es demasiado pesado. Prueba con un logo más ligero.',
        ]);

        $cart = json_decode($request->input('cart'), true);
        if (!is_array($cart) || count($cart) === 0) {
            return redirect()->back()->with('error', 'Tu carrito está vacío.')->withInput();
        }
        if (count($cart) > 50) {
            return redirect()->back()->with('error', 'El carrito supera el máximo de artículos.')->withInput();
        }

        // Un logo que no se puede guardar se avisa, en vez de perderse en silencio.
        foreach ($cart as $ci) {
            $logo = $ci['logo_data'] ?? null;
            if ($logo && $this->storeLogoData($logo, dryRun: true) === null) {
                return redirect()->back()->with('error', 'El logo que subiste no es válido o pesa más de 4 MB. Prueba con un PNG, JPG o SVG más ligero.');
            }
        }

        try {
            $order = DB::transaction(function () use ($request, $cart) {
                // 1. Preparar los artículos y calcular el total con precios del servidor.
                $total = 0;
                $prepared = [];

                foreach ($cart as $ci) {
                    $type = $ci['product_type'] ?? null;
                    if (!in_array($type, ['card', 'bracelet', 'review_plate'], true)) {
                        throw new \Exception('Tipo de producto inválido en el carrito.');
                    }
                    $qty = max(1, min(100, (int)($ci['quantity'] ?? 1)));
                    $price = self::PRICES[$type];       // precio de confianza (servidor)
                    $total += $price * $qty;

                    // Logo del item (viene como data URL base64 desde el diseñador).
                    $logoUrl = $this->storeLogoData($ci['logo_data'] ?? null);

                    // Diseño completo (2 caras) del item, si aplica.
                    $design = is_array($ci['design'] ?? null) ? $ci['design'] : null;
                    if ($design && $logoUrl) {
                        $design['logo_url'] = $logoUrl;
                    }

                    $prepared[] = [
                        'product_type'    => $type,
                        'quantity'        => $qty,
                        'color_primary'   => $ci['color_primary'] ?? null,
                        'color_secondary' => $ci['color_secondary'] ?? null,
                        'logo_url'        => $logoUrl,
                        'design_config'   => $design,
                        'price'           => $price,
                    ];
                }

                // 2. Crear la Orden como pendiente: solo el webhook de Stripe la marca pagada.
                $order = Order::create([
                    'user_id' => auth()->id(),
                    'status' => 'pending',
                    'customer_name' => $request->input('customer_name'),
                    'customer_email' => $request->input('customer_email'),
                    'shipping_address' => $request->input('shipping_address'),
                    'total' => $total,
                ]);

                // 3. Crear cada artículo del carrito.
                foreach ($prepared as $it) {
                    OrderItem::create(['order_id' => $order->id] + $it);
                }

                return $order;
            });

        } catch (\Exception $e) {
            Log::error("Error en el checkout del carrito SpaceShop: " . $e->getMessage());
            return redirect()->back()->with('error', 'Ocurrió un error al procesar tu compra. Por favor, inténtalo de nuevo.')->withInput();
        }

        // 4. Mandar al cliente a pagar en Stripe Checkout.
        try {
            $session = $payments->createCheckoutSession($order->load('items'));
            $order->update(['stripe_session_id' => $session->id]);

            return redirect()->away($session->url, 303);

        } catch (\Throwable $e) {
            Log::error("No se pudo crear la sesión de Stripe para la orden {$order->id}: " . $e->getMessage());
            $order->update(['status' => 'cancelled']);
            return redirect()->back()->with('error', 'No pudimos conectar con la pasarela de pago. Por favor, inténtalo de nuevo en unos minutos.')->withInput();
        }
    }

    /**
     * El cliente canceló en Stripe Checkout y volvió a la tienda.
     * La orden no se toca aquí (la URL es pública): queda pendiente hasta que
     * Stripe expira la sesión y el webhook la marca como cancelada.
     */
    public function cancelled()
    {
        return redirect()->route('shop.comprar')
            ->with('error', 'Cancelaste el pago, así que tu pedido no se realizó. Puedes intentarlo de nuevo cuando quieras.');
    }

    /**
     * Guarda un logo recibido como data URL base64 y devuelve su URL pública.
     */
    protected function storeLogoData(?string $dataUrl, bool $dryRun = false): ?string
    {
        if (!$dataUrl || !preg_match('/^data:image\/([a-zA-Z0-9.+-]+);base64,/', $dataUrl, $m)) {
            return null;
        }

        $ext = strtolower($m[1]);
        $ext = $ext === 'jpeg' ? 'jpg' : $ext;
        if (!in_array($ext, ['png', 'jpg', 'gif', 'svg', 'webp'], true)) {
            return null;
        }

        $data = base64_decode(substr($dataUrl, strpos($dataUrl, ',') + 1), true);
        if ($data === false || strlen($data) > 4 * 1024 * 1024) {
            return null; // inválido o mayor a 4MB
        }

        if ($dryRun) {
            return 'ok'; // solo se comprobó que es válido
        }

        $path = 'logos/' . Str::uuid() . '.' . $ext;
        Storage::disk('public')->put($path, $data);

        return asset('storage/' . $path);
    }

    /**
     * Muestra la página de éxito del pedido.
     */
    public function showSuccess(Request $request, int $id, StripeCheckoutService $payments)
    {
        $order = Order::with('items')->findOrFail($id);

        // Si el webhook aún no llega, confirmamos directo con Stripe usando la sesión
        // con la que volvió el cliente (solo si coincide con la de esta orden).
        $sessionId = (string) $request->query('session_id', '');
        if ($order->status === 'pending' && $sessionId !== '' && hash_equals((string) $order->stripe_session_id, $sessionId)) {
            try {
                $payments->syncFromSession($payments->retrieveSession($sessionId));
                $order->refresh();
            } catch (\Throwable $e) {
                Log::warning("No se pudo confirmar con Stripe la orden {$order->id}: " . $e->getMessage());
            }
        }

        return view('shop.compra_exitosa', compact('order'));
    }
}
