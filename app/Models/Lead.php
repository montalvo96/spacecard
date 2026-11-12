<?php
/**
 * Modelo Lead: mensajes que deja un visitante en un Space (formulario
 * «¿Hablamos?») o el feedback privado de la página de reseñas.
 * read_at = cuándo lo marcó como leído el dueño (null = sin leer).
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['space_id', 'review_target_id', 'name', 'email', 'phone', 'note'])]
class Lead extends Model
{
    use HasFactory;

    /** Solo registramos la fecha de creación. */
    const UPDATED_AT = null;

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'read_at' => 'datetime',
        ];
    }

    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class, 'space_id');
    }

    public function reviewTarget(): BelongsTo
    {
        return $this->belongsTo(ReviewTarget::class, 'review_target_id');
    }

    /** Mensajes que llegaron a los Spaces o a las páginas de reseñas de un usuario. */
    public function scopeOwnedBy(Builder $query, User $user): Builder
    {
        return $query->where(function (Builder $q) use ($user) {
            $q->whereIn('space_id', Space::select('id')->where('owner_id', $user->id))
                ->orWhereIn('review_target_id', ReviewTarget::select('id')->where('owner_id', $user->id));
        });
    }

    public function scopeUnread(Builder $query): Builder
    {
        return $query->whereNull('read_at');
    }
}
