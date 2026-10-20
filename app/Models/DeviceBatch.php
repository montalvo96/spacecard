<?php
/**
 * Modelo DeviceBatch para representar los lotes de manufactura física.
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

#[Fillable(['name', 'type', 'quantity', 'notes', 'created_by'])]
class DeviceBatch extends Model
{
    use HasFactory;

    /**
     * Relación con el administrador creador del lote.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relación con los dispositivos incluidos en el lote.
     */
    public function devices(): HasMany
    {
        return $this->hasMany(Device::class, 'batch_id');
    }
}
