<?php
/**
 * Middleware para validar que el usuario sea el usuario maestro (dueño SaaS).
 * Reservado para acciones sensibles: gestionar admins, etc.
 *
 * Autor: SpaceCard 2.0
 */

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class IsMaster
{
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check() && Auth::user()->is_master) {
            return $next($request);
        }

        if ($request->expectsJson()) {
            return response()->json(['error' => 'No autorizado. Se requiere el usuario maestro.'], 403);
        }

        abort(403, 'Acceso denegado. Solo el usuario maestro puede realizar esta acción.');
    }
}
