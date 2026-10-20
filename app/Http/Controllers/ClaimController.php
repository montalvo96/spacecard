<?php
/**
 * Controlador para manejar el flujo de reclamo y auto-vinculación de dispositivos.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

namespace App\Http\Controllers;

use App\Models\Device;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ClaimController extends Controller
{
    /**
     * Muestra la landing page pública de reclamo de un dispositivo.
     */
    public function showClaimLanding(Request $request, string $code)
    {
        $device = Device::where('code', $code)->firstOrFail();

        // Si ya está reclamado, redirigir a su resolvedor para evitar duplicados
        if ($device->status !== 'stock') {
            return redirect()->route('devices.resolve', ['code' => $code])
                ->with('error', 'Este dispositivo ya ha sido reclamado.');
        }

        // Asegurar que el código se guarde en sesión
        session(['claim_code' => $code]);

        return view('devices.claim_landing', compact('device'));
    }

    /**
     * Procesa la confirmación de reclamo para un usuario logueado de forma atómica.
     */
    public function confirmClaim(Request $request, string $code)
    {
        if (!Auth::check()) {
            return redirect()->route('login')->with('error', 'Debes iniciar sesión para reclamar un dispositivo.');
        }

        try {
            DB::transaction(function () use ($code) {
                // Bloqueo pesimista para evitar que dos usuarios reclamen concurrentemente
                $device = Device::where('code', $code)
                    ->where('status', 'stock')
                    ->lockForUpdate()
                    ->first();

                if (!$device) {
                    throw new \Exception("El dispositivo ya ha sido reclamado o no está disponible.");
                }

                $device->update([
                    'owner_id' => Auth::id(),
                    'status' => 'claimed',
                    'claimed_at' => now(),
                    'destination_type' => 'none', // Sin destino inicial (desata onboarding)
                ]);
            });

            // Limpiar código de la sesión si existiera
            session()->forget('claim_code');

            return redirect()->route('dashboard')
                ->with('success', "¡Dispositivo {$code} vinculado correctamente! Vamos a configurarlo.");

        } catch (\Exception $e) {
            Log::error("Error al reclamar dispositivo {$code}: " . $e->getMessage());
            return redirect()->route('dashboard')
                ->with('error', 'El dispositivo ya fue reclamado por otro usuario o no está disponible.');
        }
    }
}
