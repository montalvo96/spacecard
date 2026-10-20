<?php
/**
 * Modelo Device para representar los dispositivos físicos NFC/QR.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'code',
    'type',
    'has_qr',
    'status',
    'owner_id',
    'claimed_at',
    'printed_at',
    'shipped_at',
    'qr_generated_at',
    'destination_type',
    'external_url',
    'space_id',
    'review_target_id',
    'design_logo_url',
    'design_color_primary',
    'design_color_secondary',
    'batch_id',
    'order_item_id'
])]
class Device extends Model
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
            'has_qr' => 'boolean',
            'claimed_at' => 'datetime',
            'printed_at' => 'datetime',
            'shipped_at' => 'datetime',
            'qr_generated_at' => 'datetime',
        ];
    }

    /**
     * Relación con el usuario dueño del dispositivo.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Relación con el Space al que apunta este dispositivo.
     */
    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class, 'space_id');
    }

    /**
     * Relación con el destino de reseña al que apunta este dispositivo.
     */
    public function reviewTarget(): BelongsTo
    {
        return $this->belongsTo(ReviewTarget::class, 'review_target_id');
    }

    /**
     * Relación con el lote de producción al que pertenece.
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(DeviceBatch::class, 'batch_id');
    }

    /**
     * Relación con el artículo de pedido que originó este dispositivo.
     */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class, 'order_item_id');
    }

    /**
     * Relación con los escaneos registrados de este dispositivo.
     */
    public function scans(): HasMany
    {
        return $this->hasMany(Scan::class, 'device_id');
    }

    /**
     * Etiquetas de organización del dueño (Módulo B).
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(DeviceTag::class, 'device_device_tag')->withTimestamps();
    }

    /**
     * ¿Ya fue reclamado por un usuario?
     */
    public function isClaimed(): bool
    {
        return $this->status === 'claimed' && $this->owner_id !== null;
    }

    /**
     * URL pública de resolución (lo que se graba en el NFC y codifica el QR).
     */
    public function resolveUrl(): string
    {
        return route('devices.resolve', ['code' => $this->code]);
    }

    /**
     * Genera un código legible único y de alta entropía.
     * Excluye caracteres ambiguos: O, 0, I, 1, L, l.
     */
    public static function generateUniqueCode(): string
    {
        $alphabet = 'ABCDEFGHJKMNPQRSTUVWXY23456789';
        $alphabetLength = strlen($alphabet);
        
        do {
            $part1 = '';
            $part2 = '';
            for ($i = 0; $i < 4; $i++) {
                $part1 .= $alphabet[random_int(0, $alphabetLength - 1)];
                $part2 .= $alphabet[random_int(0, $alphabetLength - 1)];
            }
            $code = "SPC-{$part1}-{$part2}";
        } while (self::where('code', $code)->exists());

        return $code;
    }
}
