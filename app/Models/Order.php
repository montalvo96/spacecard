<?php
/**
 * Modelo Order para representar las órdenes de compra.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'status', 'is_test', 'customer_name', 'customer_email', 'shipping_address', 'total', 'stripe_session_id', 'stripe_payment_intent_id', 'paid_at'])]
class Order extends Model
{
    use HasFactory;

    /** Estados de una orden ya cobrada (pending = esperando pago, cancelled = no pagó). */
    public const PAID_STATUSES = ['paid', 'completed'];

    protected function casts(): array
    {
        return ['paid_at' => 'datetime', 'is_test' => 'boolean'];
    }

    /**
     * Relación con los artículos comprados en este pedido.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    /**
     * Usuario comprador (si tenía sesión al comprar). Puede ser null (invitado).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Cuenta del comprador: la que tenía sesión al comprar o, si compró como
     * invitado, la que tiene el mismo correo que puso en el pedido.
     */
    public function buyer(): ?User
    {
        if ($this->user_id) {
            return $this->user;
        }

        $email = strtolower(trim((string) $this->customer_email));

        return $email === '' ? null : User::whereRaw('LOWER(email) = ?', [$email])->first();
    }

    /**
     * Una compra real ya cobrada activa el plan Pro del comprador.
     * Los pedidos de prueba de admin no cuentan.
     */
    public function grantBuyerPro(): void
    {
        if ($this->is_test || !in_array($this->status, self::PAID_STATUSES, true)) {
            return;
        }

        $this->buyer()?->grantProFromPurchase($this->paid_at ?? now());
    }
}
