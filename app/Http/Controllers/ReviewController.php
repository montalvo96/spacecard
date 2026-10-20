<?php
/**
 * Controlador para manejar la lógica de reseñas y feedback privado.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\ReviewTarget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * Guarda el comentario/feedback privado de un cliente.
     */
    public function storeFeedback(Request $request, int $id)
    {
        // 1. Validar la solicitud
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:30',
            'note' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos o faltantes.',
                'errors' => $validator->errors()
            ], 422);
        }

        // 2. Verificar existencia del destino de reseña
        $target = ReviewTarget::findOrFail($id);

        // 3. Crear el registro en la tabla leads
        Lead::create([
            'review_target_id' => $target->id,
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'note' => $request->input('note'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Comentario privado enviado con éxito.'
        ]);
    }
}
