<?php
/**
 * Modelo Scan para representar los escaneos/taps de dispositivos físicos.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['device_id', 'space_id', 'review_target_id', 'scanned_at', 'ip', 'country', 'city', 'device_family', 'referrer'])]
class Scan extends Model
{
    use HasFactory;

    /**
     * Desactivar timestamps automáticos (created_at/updated_at).
     * Usamos una sola columna scanned_at.
     */
    public $timestamps = false;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'scanned_at' => 'datetime',
        ];
    }

    /**
     * Relación con el dispositivo físico escaneado.
     */
    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class, 'device_id');
    }

    /**
     * Relación con el Space visualizado al momento del escaneo.
     */
    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class, 'space_id');
    }

    /**
     * Relación con el destino de reseña al momento del escaneo.
     */
    public function reviewTarget(): BelongsTo
    {
        return $this->belongsTo(ReviewTarget::class, 'review_target_id');
    }
}
