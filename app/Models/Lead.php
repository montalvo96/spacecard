<?php
/**
 * Modelo Lead para representar contactos guardados y feedback privado.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['space_id', 'review_target_id', 'name', 'email', 'phone', 'note'])]
class Lead extends Model
{
    use HasFactory;

    /**
     * Desactivar el campo updated_at ya que solo registramos la fecha de creación (created_at).
     */
    const UPDATED_AT = null;

    /**
     * Relación con el Space al que pertenece el prospecto.
     */
    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class, 'space_id');
    }

    /**
     * Relación con el destino de reseñas al que pertenece el comentario.
     */
    public function reviewTarget(): BelongsTo
    {
        return $this->belongsTo(ReviewTarget::class, 'review_target_id');
    }
}
