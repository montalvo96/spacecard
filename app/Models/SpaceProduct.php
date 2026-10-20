<?php
/**
 * Módulo C · Spaces — Producto de catálogo.
 *
 * Autor: SpaceCard 2.0
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'space_id', 'category_id', 'name', 'description',
    'price', 'currency', 'image_url', 'cta_url', 'is_active', 'position',
])]
class SpaceProduct extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'is_active' => 'boolean',
            'position' => 'integer',
        ];
    }

    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class, 'space_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(SpaceProductCategory::class, 'category_id');
    }
}
