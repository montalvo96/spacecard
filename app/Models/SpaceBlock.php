<?php
/**
 * Modelo SpaceBlock para representar los bloques dinámicos dentro de un Space.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

namespace App\Models;

use App\Enums\SpaceBlockType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['space_id', 'type', 'label', 'heading', 'url', 'icon', 'data', 'position', 'is_active'])]
class SpaceBlock extends Model
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
            'type' => SpaceBlockType::class,
            'data' => 'array',
            'is_active' => 'boolean',
            'position' => 'integer',
        ];
    }

    /**
     * Relación con el Space al que pertenece el bloque.
     */
    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class, 'space_id');
    }

    /**
     * Solo bloques visibles (activos), ya ordenados por posición.
     */
    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('position');
    }

    /**
     * Lee un valor del payload `data` con notación de punto.
     */
    public function payload(string $key, mixed $default = null): mixed
    {
        return data_get($this->data, $key, $default);
    }
}
