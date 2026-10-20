<?php
/**
 * Módulo B · Tarjetas — Etiqueta.
 * Sustituye la clase `Etiquetas` de avaspace. Pertenece a un usuario y agrupa
 * dispositivos vía relación N:M.
 *
 * Autor: SpaceCard 2.0
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['owner_id', 'name', 'color'])]
class DeviceTag extends Model
{
    use HasFactory;

    /**
     * Usuario dueño de la etiqueta.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Dispositivos marcados con esta etiqueta.
     */
    public function devices(): BelongsToMany
    {
        return $this->belongsToMany(Device::class, 'device_device_tag')->withTimestamps();
    }
}
