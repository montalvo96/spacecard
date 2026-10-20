<?php
/**
 * Controlador para las páginas públicas de Space y generación de vCards.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

namespace App\Http\Controllers;

use App\Models\Space;
use App\Models\Lead;
use App\Services\WalletPassService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SpaceController extends Controller
{
    /**
     * Muestra la tarjeta de presentación digital pública.
     */
    public function show(Request $request, string $slug)
    {
        $space = Space::where('slug', $slug)->with(['blocks' => function($query) {
            $query->where('is_active', true)->orderBy('position', 'asc');
        }])->firstOrFail();

        // Si es privado y no es el dueño
        if (!$space->is_public) {
            if (!auth()->check() || auth()->id() !== $space->owner_id) {
                abort(403, 'Esta tarjeta de presentación es privada.');
            }
        }

        $wallet = app(WalletPassService::class);

        return view('spaces.show', [
            'space'        => $space,
            'appleWallet'  => $wallet->isAppleConfigured(),
            'googleWallet' => $wallet->isGoogleConfigured(),
        ]);
    }

    /**
     * Descarga el pase .pkpass para agregar la tarjeta a Apple Wallet.
     */
    public function appleWallet(Request $request, string $slug, WalletPassService $wallet)
    {
        $space = Space::where('slug', $slug)->firstOrFail();

        try {
            $pkpass = $wallet->applePkpass($space);
        } catch (\Throwable $e) {
            return redirect()->route('spaces.show', ['slug' => $slug])
                ->with('error', 'No se pudo generar el pase de Apple Wallet.');
        }

        return response($pkpass)
            ->header('Content-Type', 'application/vnd.apple.pkpass')
            ->header('Content-Disposition', 'attachment; filename="' . $space->slug . '.pkpass"');
    }

    /**
     * Redirige al enlace "Save to Google Wallet".
     */
    public function googleWallet(Request $request, string $slug, WalletPassService $wallet)
    {
        $space = Space::where('slug', $slug)->firstOrFail();

        try {
            return redirect()->away($wallet->googleSaveUrl($space));
        } catch (\Throwable $e) {
            return redirect()->route('spaces.show', ['slug' => $slug])
                ->with('error', 'No se pudo generar el pase de Google Wallet.');
        }
    }

    /**
     * Genera y descarga el archivo vCard (vCF 3.0) on-the-fly.
     */
    public function downloadVCard(Request $request, string $slug)
    {
        $space = Space::where('slug', $slug)->firstOrFail();

        // Armar vCard en formato 3.0
        $vcard = [];
        $vcard[] = 'BEGIN:VCARD';
        $vcard[] = 'VERSION:3.0';
        $vcard[] = 'FN:' . $space->display_name;
        
        if ($space->headline) {
            $vcard[] = 'TITLE:' . $space->headline;
        }
        
        if ($space->company) {
            $vcard[] = 'ORG:' . $space->company;
        }
        
        if ($space->contact_phone) {
            $vcard[] = 'TEL;TYPE=CELL,VOICE:' . $space->contact_phone;
        }
        
        if ($space->contact_email) {
            $vcard[] = 'EMAIL;TYPE=PREFER,INTERNET:' . $space->contact_email;
        }
        
        if ($space->contact_website) {
            $vcard[] = 'URL:' . $space->contact_website;
        }

        if ($space->avatar_url) {
            $vcard[] = 'PHOTO;VALUE=URI:' . $space->avatar_url;
        }
        
        $vcard[] = 'END:VCARD';

        $vcardContent = implode("\r\n", $vcard);

        return response($vcardContent)
            ->header('Content-Type', 'text/vcard; charset=utf-8')
            ->header('Content-Disposition', 'attachment; filename="' . $space->slug . '.vcf"');
    }

    /**
     * Guarda la información de un lead/contacto desde el Space público.
     */
    public function storeLead(Request $request, string $slug)
    {
        $space = Space::where('slug', $slug)->firstOrFail();

        // Validar
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:30',
            'note' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos.',
                'errors' => $validator->errors()
            ], 422);
        }

        // Crear Lead
        Lead::create([
            'space_id' => $space->id,
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'note' => $request->input('note'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Contacto enviado correctamente.'
        ]);
    }
}
