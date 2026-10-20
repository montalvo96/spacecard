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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
    public function showForm()
    {
        $prices = self::PRICES;
        return view('shop.comprar', compact('prices'));
    }

    /**
     * Procesa la compra de un CARRITO (uno o varios productos) en una sola orden.
     * Cada item del carrito trae su propia personalización y logo (base64).
     */
    public function checkout(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'shipping_address' => 'required|string',
            'cart' => 'required|string|max:12000000',
        ]);

        $cart = json_decode($request->input('cart'), true);
        if (!is_array($cart) || count($cart) === 0) {
            return redirect()->back()->with('error', 'Tu carrito está vacío.')->withInput();
        }
        if (count($cart) > 50) {
            return redirect()->back()->with('error', 'El carrito supera el máximo de artículos.')->withInput();
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

                // 2. Crear la Orden (paid = pasarela simulada). Vinculada al usuario si hay sesión.
                $order = Order::create([
                    'user_id' => auth()->id(),
                    'status' => 'paid',
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

            return redirect()->route('shop.success', ['id' => $order->id]);

        } catch (\Exception $e) {
            Log::error("Error en el checkout del carrito SpaceShop: " . $e->getMessage());
            return redirect()->back()->with('error', 'Ocurrió un error al procesar tu compra. Por favor, inténtalo de nuevo.')->withInput();
        }
    }

    /**
     * Guarda un logo recibido como data URL base64 y devuelve su URL pública.
     */
    protected function storeLogoData(?string $dataUrl): ?string
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

        $path = 'logos/' . Str::uuid() . '.' . $ext;
        Storage::disk('public')->put($path, $data);

        return asset('storage/' . $path);
    }

    /**
     * Muestra la página de éxito del pedido.
     */
    public function showSuccess(int $id)
    {
        $order = Order::with('items')->findOrFail($id);
        return view('shop.compra_exitosa', compact('order'));
    }
}
