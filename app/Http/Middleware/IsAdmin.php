<?php
/**
 * Middleware para validar que el usuario tenga privilegios de administrador.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check() && Auth::user()->is_admin) {
            return $next($request);
        }

        // Si la petición espera JSON, devolvemos 403 JSON, si no, abortamos con 403 Blade
        if ($request->expectsJson()) {
            return response()->json(['error' => 'No autorizado. Se requieren permisos de administrador.'], 403);
        }

        abort(403, 'Acceso denegado. Se requieren permisos de administrador.');
    }
}
