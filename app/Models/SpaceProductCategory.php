<?php
/**
 * Módulo C · Spaces — Categoría de catálogo.
 *
 * Autor: SpaceCard 2.0
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['space_id', 'name', 'position'])]
class SpaceProductCategory extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['position' => 'integer'];
    }

    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class, 'space_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(SpaceProduct::class, 'category_id')->orderBy('position');
    }
}
