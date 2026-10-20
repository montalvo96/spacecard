<?php
/**
 * Feature · Crear Space con IA.
 *
 * Toma una descripción libre ("quién soy / qué hago") y pide a Claude que
 * genere el contenido de un Space: headline, empresa, bio, tema y una lista
 * de bloques (incluyendo secciones ricas). Devuelve un arreglo normalizado
 * listo para que SpaceBuilderService lo materialice.
 *
 * La llamada es server-side (la API key nunca llega al frontend).
 *
 * Autor: SpaceCard 2.0
 */

namespace App\Services;

use App\Enums\SpaceBlockType;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class AiSpaceGeneratorService
{
    /** Temas válidos que la IA puede elegir. */
    private const THEMES = ['aurora', 'bento', 'editorial', 'neon', 'corporate'];

    /**
     * Genera la estructura de un Space a partir de una descripción.
     *
     * @return array{headline:?string, company:?string, bio:?string, theme_template:string, blocks:array<int,array<string,mixed>>}
     */
    public function generate(string $description, ?string $displayName = null): array
    {
        $apiKey = config('services.anthropic.key');
        if (empty($apiKey)) {
            throw new RuntimeException('La generación con IA no está configurada. Agrega ANTHROPIC_API_KEY en tu archivo .env.');
        }

        $response = Http::withHeaders([
            'x-api-key'         => $apiKey,
            'anthropic-version' => config('services.anthropic.version'),
            'content-type'      => 'application/json',
        ])->timeout(60)->post('https://api.anthropic.com/v1/messages', [
            'model'      => config('services.anthropic.model'),
            'max_tokens' => 2000,
            'output_config' => ['effort' => 'low'],
            'system'     => $this->systemPrompt(),
            'messages'   => [[
                'role'    => 'user',
                'content' => $this->userPrompt($description, $displayName),
            ]],
        ]);

        if ($response->failed()) {
            throw new RuntimeException('La IA no pudo responder ('.$response->status().'). Verifica tu API key y crédito.');
        }

        $text = collect($response->json('content', []))
            ->firstWhere('type', 'text')['text'] ?? '';

        $data = $this->parseJson($text);

        return $this->normalize($data);
    }

    /**
     * Instrucción de sistema: define el rol y el formato JSON estricto.
     */
    private function systemPrompt(): string
    {
        $themes = implode(', ', self::THEMES);
        $types  = implode(', ', SpaceBlockType::values());

        return <<<TXT
        Eres un diseñador experto de tarjetas de presentación digitales (micrositios "Space").
        A partir de una descripción de una persona o negocio, generas el contenido de su Space.

        Respondes ÚNICAMENTE con un objeto JSON válido (sin texto adicional, sin markdown, sin ```),
        con exactamente esta forma:

        {
          "headline": "cargo o propuesta de valor breve (máx 60 car.)",
          "company": "empresa o marca (o null)",
          "bio": "2-3 frases en primera persona, cálidas y profesionales",
          "theme_template": "uno de: {$themes}",
          "blocks": [
            { "type": "header", "label": "nombre a mostrar", "heading": "subtítulo corto" },
            { "type": "whatsapp", "label": "texto del botón" },
            { "type": "differentiator", "heading": "Por qué elegirme",
              "items": [ { "title": "...", "description": "...", "icon": "star" } ] },
            { "type": "step", "heading": "Cómo funciona",
              "items": [ { "order": 1, "title": "...", "description": "..." } ] },
            { "type": "faq", "heading": "Preguntas frecuentes",
              "items": [ { "question": "...", "answer": "..." } ] },
            { "type": "social", "label": "Instagram", "url": "https://instagram.com/usuario", "icon": "instagram" }
          ]
        }

        Reglas:
        - Idioma: español neutro.
        - "type" debe ser uno de: {$types}.
        - Incluye entre 4 y 7 bloques relevantes al rubro descrito.
        - Para bloques de sección (differentiator, step, faq, testimonial, client, media) usa "items" (lista).
        - Para bloques simples (header, whatsapp, social, link, email, phone) usa "label" y opcionalmente "url"/"icon".
        - No inventes teléfonos, correos ni URLs reales; deja "url" vacío si no aplica.
        TXT;
    }

    private function userPrompt(string $description, ?string $displayName): string
    {
        $name = $displayName ? "Nombre: {$displayName}\n" : '';

        return "{$name}Descripción: {$description}\n\nGenera el Space en JSON.";
    }

    /**
     * Extrae el objeto JSON aunque venga con texto o fences alrededor.
     *
     * @return array<string, mixed>
     */
    private function parseJson(string $text): array
    {
        $text = trim($text);
        $text = preg_replace('/^```(?:json)?|```$/m', '', $text);

        // Recorta al primer {...} balanceado por si acaso.
        $start = strpos($text, '{');
        $end   = strrpos($text, '}');
        if ($start !== false && $end !== false) {
            $text = substr($text, $start, $end - $start + 1);
        }

        $data = json_decode($text, true);
        if (! is_array($data)) {
            throw new RuntimeException('La IA devolvió una respuesta que no se pudo interpretar. Intenta de nuevo.');
        }

        return $data;
    }

    /**
     * Sanea y valida la estructura devuelta por la IA.
     *
     * @param  array<string, mixed>  $data
     * @return array{headline:?string, company:?string, bio:?string, theme_template:string, blocks:array<int,array<string,mixed>>}
     */
    private function normalize(array $data): array
    {
        $theme = in_array($data['theme_template'] ?? null, self::THEMES, true)
            ? $data['theme_template']
            : 'corporate';

        $blocks = [];
        foreach ($data['blocks'] ?? [] as $b) {
            $type = SpaceBlockType::tryFrom($b['type'] ?? '');
            if (! $type) {
                continue; // descarta tipos desconocidos
            }
            $blocks[] = [
                'type'    => $type,
                'label'   => isset($b['label']) ? (string) $b['label'] : $type->label(),
                'heading' => isset($b['heading']) ? (string) $b['heading'] : null,
                'url'     => $b['url'] ?? null,
                'icon'    => $b['icon'] ?? null,
                'items'   => is_array($b['items'] ?? null) ? $b['items'] : [],
            ];
        }

        return [
            'headline'       => isset($data['headline']) ? (string) $data['headline'] : null,
            'company'        => isset($data['company']) ? (string) $data['company'] : null,
            'bio'            => isset($data['bio']) ? (string) $data['bio'] : null,
            'theme_template' => $theme,
            'blocks'         => $blocks,
        ];
    }
}
