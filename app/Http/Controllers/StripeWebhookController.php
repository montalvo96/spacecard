<?php
/**
 * Recibe los eventos de Stripe Checkout y actualiza el estado de las órdenes.
 * En local llegan reenviados por `stripe listen --forward-to .../stripe/webhook`.
 *
 * Última modificación: 2026-11-10
 */

namespace App\Http\Controllers;

use App\Services\StripeCheckoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function __invoke(Request $request, StripeCheckoutService $payments)
    {
        $secret = (string) config('services.stripe.webhook_secret');
        if ($secret === '') {
            Log::error('Webhook de Stripe recibido sin STRIPE_WEBHOOK_SECRET configurado.');
            return response('Webhook no configurado', 500);
        }

        try {
            $event = Webhook::constructEvent(
                $request->getContent(),
                (string) $request->header('Stripe-Signature'),
                $secret
            );
        } catch (\UnexpectedValueException | SignatureVerificationException $e) {
            Log::warning('Webhook de Stripe rechazado: ' . $e->getMessage());
            return response('Firma inválida', 400);
        }

        $session = $event->data->object;

        match ($event->type) {
            // Tarjeta: llega ya cobrado. Pagos diferidos (OXXO, etc.) llegan 'unpaid' y se confirman después.
            'checkout.session.completed'               => $payments->syncFromSession($session),
            'checkout.session.async_payment_succeeded' => $payments->markPaid($session),
            'checkout.session.async_payment_failed',
            'checkout.session.expired'                 => $payments->markCancelled($session),
            default                                    => null,
        };

        return response('ok', 200);
    }
}
