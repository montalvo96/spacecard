<?php
/**
 * Controlador para resolver la URL física de los dispositivos NFC/QR (/t/{code}).
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

namespace App\Http\Controllers;

use App\Models\Device;
use App\Jobs\RegisterScanJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ResolveDeviceController extends Controller
{
    /**
     * Resuelve el código del dispositivo y decide qué acción/redirección ejecutar.
     */
    public function resolve(Request $request, string $code)
    {
        // 1. Buscar el dispositivo
        $device = Device::where('code', $code)->firstOrFail();

        // 2. Si el dispositivo está inactivo/desactivado
        if ($device->status === 'disabled') {
            return view('devices.disabled', compact('device'));
        }

        // 3. Si el dispositivo está en stock (sin dueño)
        if ($device->status === 'stock') {
            if (Auth::check()) {
                // Usuario autenticado: Ofrecer confirmación de reclamo
                return view('devices.claim_confirm', compact('device'));
            }

            // Usuario no autenticado: Guardar en sesión y llevar a onboarding de reclamo
            session(['claim_code' => $code]);
            return redirect()->route('devices.claim.landing', ['code' => $code]);
        }

        // 4. Si el dispositivo ya está reclamado
        if ($device->status === 'claimed') {
            // Despachar el registro del escaneo a la cola de forma asíncrona
            RegisterScanJob::dispatch(
                $device->id,
                $device->space_id,
                $device->review_target_id,
                $request->ip(),
                $request->userAgent() ?? '',
                $request->header('referer')
            );

            // Redirigir según el tipo de destino configurado
            switch ($device->destination_type) {
                case 'external':
                    if ($device->external_url) {
                        return redirect()->away($device->external_url);
                    }
                    break;

                case 'space':
                    if ($device->space && $device->space->is_public) {
                        return redirect()->route('spaces.show', ['slug' => $device->space->slug]);
                    }
                    break;

                case 'review':
                    if ($device->reviewTarget) {
                        // Si tiene activado feedback privado (y idealmente el dueño es Pro)
                        // Para simplificar, si está activo a nivel de base de datos lo mostramos
                        if ($device->reviewTarget->feedback_enabled) {
                            return view('devices.reviews_feedback', [
                                'device' => $device,
                                'target' => $device->reviewTarget
                            ]);
                        }

                        // Si no, redirección directa a Google Reviews
                        if ($device->reviewTarget->review_url) {
                            return redirect()->away($device->reviewTarget->review_url);
                        }
                    }
                    break;
            }

            // Si no tiene destino configurado (destination_type = none)
            return view('devices.claimed_no_destination', compact('device'));
        }

        // En caso de estados desconocidos
        abort(404);
    }
}
