<?php
/**
 * Modelo ReviewTarget para representar los destinos de reseñas (Google/Facebook/etc).
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

#[Fillable(['owner_id', 'business_name', 'platform', 'place_id', 'review_url', 'feedback_enabled'])]
class ReviewTarget extends Model
{
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'feedback_enabled' => 'boolean',
        ];
    }

    /**
     * Relación con el usuario dueño del negocio.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Relación con los dispositivos que apuntan a este destino de reseña.
     */
    public function devices(): HasMany
    {
        return $this->hasMany(Device::class, 'review_target_id');
    }

    /**
     * Relación con los escaneos registrados para este destino.
     */
    public function scans(): HasMany
    {
        return $this->hasMany(Scan::class, 'review_target_id');
    }

    /**
     * Relación con los comentarios/leads privados registrados para este destino.
     */
    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class, 'review_target_id');
    }
}
