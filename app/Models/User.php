<?php
/**
 * Modelo User para representar a los usuarios del sistema.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable([
    'name', 'email', 'password', 'plan', 'plan_expires_at', 'is_admin', 'is_master',
    'nickname', 'nickname_changed_at', 'phone', 'bio', 'avatar_url',
    'activated_at', 'invited_by',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Días que deben pasar entre cambios de nickname (regla heredada de avaspace).
     */
    public const NICKNAME_COOLDOWN_DAYS = 30;

    /**
     * Máximo de Spaces por plan.
     */
    public const MAX_SPACES_FREE = 1;
    public const MAX_SPACES_PRO  = 3;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'plan_expires_at' => 'datetime',
            'is_admin' => 'boolean',
            'is_master' => 'boolean',
            'nickname_changed_at' => 'datetime',
            'activated_at' => 'datetime',
        ];
    }

    /**
     * ¿Es el usuario maestro (dueño de la plataforma)?
     */
    public function isMaster(): bool
    {
        return (bool) $this->is_master;
    }

    /**
     * Relación con los dispositivos del usuario.
     */
    public function devices(): HasMany
    {
        return $this->hasMany(Device::class, 'owner_id');
    }

    /**
     * Relación con los Spaces (perfiles digitales) del usuario.
     */
    public function spaces(): HasMany
    {
        return $this->hasMany(Space::class, 'owner_id');
    }

    /**
     * Relación con los destinos de reseñas del usuario.
     */
    public function reviewTargets(): HasMany
    {
        return $this->hasMany(ReviewTarget::class, 'owner_id');
    }

    /**
     * Relación con los lotes creados por este administrador.
     */
    public function deviceBatches(): HasMany
    {
        return $this->hasMany(DeviceBatch::class, 'created_by');
    }

    /**
     * Etiquetas de dispositivos creadas por el usuario (Módulo B).
     */
    public function deviceTags(): HasMany
    {
        return $this->hasMany(DeviceTag::class, 'owner_id');
    }

    /**
     * Usuario que lo invitó / refirió (Módulo A).
     */
    public function invitedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    /**
     * Usuarios que este usuario ha invitado.
     */
    public function invitees(): HasMany
    {
        return $this->hasMany(User::class, 'invited_by');
    }

    /**
     * Máximo de Spaces permitidos según el plan del usuario.
     */
    public function maxSpaces(): int
    {
        return $this->isPro() ? self::MAX_SPACES_PRO : self::MAX_SPACES_FREE;
    }

    /**
     * ¿Puede crear un Space más? (respeta el límite del plan).
     */
    public function canCreateSpace(): bool
    {
        return $this->spaces()->count() < $this->maxSpaces();
    }

    /**
     * Verifica si el usuario es Pro y su plan está activo.
     */
    public function isPro(): bool
    {
        if ($this->plan !== 'pro') {
            return false;
        }

        if ($this->plan_expires_at && $this->plan_expires_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * ¿La cuenta ya fue activada?
     */
    public function isActivated(): bool
    {
        return $this->activated_at !== null;
    }

    /**
     * Marca la cuenta como activada (idempotente).
     */
    public function activate(): void
    {
        if (! $this->isActivated()) {
            $this->forceFill(['activated_at' => now()])->save();
        }
    }

    /**
     * ¿Puede cambiar su nickname ahora mismo? (respeta el cooldown).
     */
    public function canChangeNickname(): bool
    {
        return $this->nickname_changed_at === null
            || $this->nickname_changed_at->addDays(self::NICKNAME_COOLDOWN_DAYS)->isPast();
    }

    /**
     * Fecha en la que volverá a poder cambiar el nickname (o null si ya puede).
     */
    public function nicknameAvailableAt(): ?\Illuminate\Support\Carbon
    {
        if ($this->canChangeNickname()) {
            return null;
        }

        return $this->nickname_changed_at->copy()->addDays(self::NICKNAME_COOLDOWN_DAYS);
    }
}
