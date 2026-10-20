<?php
/**
 * Modelo OrderItem para representar los artículos de una orden con su personalización física.
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

#[Fillable(['order_id', 'product_type', 'quantity', 'color_primary', 'color_secondary', 'logo_url', 'design_config', 'price'])]
class OrderItem extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['design_config' => 'array'];
    }

    /**
     * Relación con el pedido general.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    /**
     * Relación con los dispositivos físicos generados para este artículo.
     */
    public function devices(): HasMany
    {
        return $this->hasMany(Device::class, 'order_item_id');
    }
}
