<?php
/**
 * Controlador de proxy para consumir de forma segura la API de Google Places.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PlacesProxyController extends Controller
{
    /**
     * Busca negocios mediante Google Places Autocomplete API.
     */
    public function autocomplete(Request $request)
    {
        $input = $request->query('input');
        
        if (blank($input)) {
            return response()->json(['predictions' => []]);
        }

        $apiKey = config('services.google.places_key');

        // Fallback para desarrollo si no se configura la API Key
        if (blank($apiKey)) {
            Log::warning("GOOGLE_PLACES_API_KEY no está configurada en el archivo .env. Usando fallback de desarrollo.");
            return response()->json([
                'predictions' => [
                    [
                        'description' => 'Café Bonito (Demo), Ciudad de México',
                        'place_id' => 'ChIJ2d2G245u0oUR5hJ1K3J9z8A'
                    ],
                    [
                        'description' => 'Tacos El Patrón (Demo), Guadalajara, Jal.',
                        'place_id' => 'ChIJs8n8XG6v0oUR89J8j2J8z9B'
                    ]
                ],
                'is_demo' => true
            ]);
        }

        try {
            $response = Http::get('https://maps.googleapis.com/maps/api/place/autocomplete/json', [
                'input' => $input,
                'key' => $apiKey,
                'types' => 'establishment',
                'language' => 'es'
            ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json(['error' => 'Error en la API de Google Places.'], 502);

        } catch (\Exception $e) {
            Log::error("Error en PlacesProxy Autocomplete: " . $e->getMessage());
            return response()->json(['error' => 'Error de conexión.'], 500);
        }
    }

    /**
     * Obtiene los detalles de un negocio mediante Google Place Details API.
     */
    public function details(Request $request)
    {
        $placeId = $request->query('place_id');

        if (blank($placeId)) {
            return response()->json(['error' => 'El place_id es obligatorio.'], 400);
        }

        $apiKey = config('services.google.places_key');

        // Fallback para desarrollo si no se configura la API Key
        if (blank($apiKey)) {
            return response()->json([
                'result' => [
                    'name' => $placeId === 'ChIJ2d2G245u0oUR5hJ1K3J9z8A' ? 'Café Bonito (Demo)' : 'Tacos El Patrón (Demo)',
                    'place_id' => $placeId,
                    'url' => 'https://search.google.com/local/writereview?placeid=' . $placeId
                ],
                'is_demo' => true
            ]);
        }

        try {
            $response = Http::get('https://maps.googleapis.com/maps/api/place/details/json', [
                'place_id' => $placeId,
                'key' => $apiKey,
                'fields' => 'name,formatted_address,url',
                'language' => 'es'
            ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json(['error' => 'Error al obtener detalles de la API de Google Places.'], 502);

        } catch (\Exception $e) {
            Log::error("Error en PlacesProxy Details: " . $e->getMessage());
            return response()->json(['error' => 'Error de conexión.'], 500);
        }
    }
}
