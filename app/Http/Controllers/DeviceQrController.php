<?php
/**
 * QR de un dispositivo para su dueño (Mi panel → Mis dispositivos).
 *
 * El QR apunta al enlace del dispositivo (/t/CÓDIGO), no al destino final:
 * así, si el cliente cambia a dónde lleva su tarjeta, el mismo QR impreso
 * sigue funcionando y los escaneos se cuentan en sus estadísticas.
 */

namespace App\Http\Controllers;

use F9WebLtd\QrCode\Facades\QrCode;
use Illuminate\Http\Request;

class DeviceQrController extends Controller
{
    public function show(Request $request, int $id)
    {
        // Solo los dispositivos del usuario con sesión.
        $device = $request->user()->devices()->findOrFail($id);

        $png = QrCode::format('png')->size(1000)->margin(2)
            ->generate(route('devices.resolve', ['code' => $device->code]));

        // ?descargar=1 → se baja como archivo; sin él, se muestra en la ventana.
        $disposition = $request->boolean('descargar') ? 'attachment' : 'inline';

        return response((string) $png, 200, [
            'Content-Type'        => 'image/png',
            'Content-Disposition' => $disposition . '; filename="qr-' . $device->code . '.png"',
            'Cache-Control'       => 'private, max-age=86400',
        ]);
    }
}
