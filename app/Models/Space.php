<?php
/**
 * Modelo Space para representar la tarjeta de presentación digital.
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

#[Fillable([
    'owner_id',
    'slug',
    'display_name',
    'headline',
    'company',
    'bio',
    'avatar_url',
    'cover_url',
    'contact_phone',
    'contact_email',
    'contact_website',
    'theme_template',
    'theme_config',
    'is_public',
    'show_branding'
])]
class Space extends Model
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
            'theme_config' => 'array',
            'is_public' => 'boolean',
            'show_branding' => 'boolean',
        ];
    }

    /**
     * Relación con el usuario dueño del Space.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Relación con los bloques modulares del Space, ordenados por posición.
     */
    public function blocks(): HasMany
    {
        return $this->hasMany(SpaceBlock::class, 'space_id')->orderBy('position', 'asc');
    }

    /**
     * Relación con los dispositivos que apuntan a este Space.
     */
    public function devices(): HasMany
    {
        return $this->hasMany(Device::class, 'space_id');
    }

    /**
     * Relación con los escaneos registrados.
     */
    public function scans(): HasMany
    {
        return $this->hasMany(Scan::class, 'space_id');
    }

    /**
     * Relación con los leads recolectados a través de este Space.
     */
    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class, 'space_id');
    }

    /**
     * Categorías del catálogo del Space (Módulo C).
     */
    public function categories(): HasMany
    {
        return $this->hasMany(SpaceProductCategory::class, 'space_id')->orderBy('position');
    }

    /**
     * Productos del catálogo del Space (Módulo C).
     */
    public function products(): HasMany
    {
        return $this->hasMany(SpaceProduct::class, 'space_id')->orderBy('position');
    }
}
