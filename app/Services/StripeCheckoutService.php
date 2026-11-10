<?php
/**
 * Crea sesiones de Stripe Checkout para las órdenes de SpaceShop y aplica a la
 * orden el resultado del pago (desde el webhook o al volver el cliente).
 *
 * Última modificación: 2026-11-10
 */

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session;
use Stripe\StripeClient;

class StripeCheckoutService
{
    /** Nombres visibles en la página de pago de Stripe. */
    protected const PRODUCT_NAMES = [
        'card'         => 'SpaceCard NFC personalizada',
        'bracelet'     => 'Pulsera NFC SpaceCard',
        'review_plate' => 'Placa NFC de reseñas',
    ];

    /** Minutos que el cliente tiene para pagar antes de que la orden se cancele (mínimo de Stripe: 30). */
    protected const SESSION_MINUTES = 30;

    public function isConfigured(): bool
    {
        return filled(config('services.stripe.secret')) && filled(config('services.stripe.webhook_secret'));
    }

    protected function client(): StripeClient
    {
        return new StripeClient((string) config('services.stripe.secret'));
    }

    /**
     * Crea la sesión de pago con los artículos y precios ya guardados en la orden.
     */
    public function createCheckoutSession(Order $order): Session
    {
        $currency = strtolower((string) config('services.stripe.currency', 'mxn'));

        $lineItems = $order->items->map(fn ($item) => [
            'quantity'   => (int) $item->quantity,
            'price_data' => [
                'currency'     => $currency,
                'unit_amount'  => (int) round(((float) $item->price) * 100),
                'product_data' => [
                    'name' => self::PRODUCT_NAMES[$item->product_type] ?? 'Producto SpaceCard',
                ],
            ],
        ])->values()->all();

        return $this->client()->checkout->sessions->create([
            'mode'                => 'payment',
            'line_items'          => $lineItems,
            'customer_email'      => $order->customer_email,
            'client_reference_id' => (string) $order->id,
            'metadata'            => ['order_id' => (string) $order->id],
            'payment_intent_data' => ['metadata' => ['order_id' => (string) $order->id]],
            'expires_at'          => now()->addMinutes(self::SESSION_MINUTES)->getTimestamp(),
            'success_url'         => route('shop.success', ['id' => $order->id]) . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url'          => route('shop.cancelled'),
        ], [
            // Si se reintenta la misma orden, Stripe no crea una segunda sesión.
            'idempotency_key' => 'spacecard-order-' . $order->id,
        ]);
    }

    public function retrieveSession(string $sessionId): Session
    {
        return $this->client()->checkout->sessions->retrieve($sessionId);
    }

    /**
     * Marca la orden pagada si la sesión ya está cobrada. Es idempotente: solo
     * cambia órdenes que siguen pendientes.
     */
    public function syncFromSession(Session $session): void
    {
        if ($session->payment_status === 'paid') {
            $this->markPaid($session);
        }
    }

    public function markPaid(Session $session): void
    {
        $this->transition($session, 'paid', function (Order $order) use ($session) {
            $order->update([
                'status'                   => 'paid',
                'paid_at'                  => now(),
                'stripe_payment_intent_id' => is_string($session->payment_intent) ? $session->payment_intent : ($session->payment_intent->id ?? null),
            ]);
        });
    }

    public function markCancelled(Session $session): void
    {
        $this->transition($session, 'cancelled', fn (Order $order) => $order->update(['status' => 'cancelled']));
    }

    /**
     * Busca la orden de la sesión y aplica el cambio solo si sigue pendiente.
     */
    protected function transition(Session $session, string $to, callable $apply): void
    {
        DB::transaction(function () use ($session, $to, $apply) {
            $order = Order::where('stripe_session_id', $session->id)->lockForUpdate()->first();

            if (!$order) {
                Log::warning("Stripe: sesión {$session->id} sin orden asociada (evento → {$to}).");
                return;
            }

            if ($order->status !== 'pending') {
                return; // ya procesada (eventos repetidos o fuera de orden)
            }

            $apply($order);
            Log::info("Stripe: orden {$order->id} → {$to}.");
        });
    }
}
