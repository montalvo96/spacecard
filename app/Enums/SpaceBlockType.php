<?php
/**
 * Módulo C · Spaces.
 * Tipos de bloque que puede contener un Space. Consolida en un solo enum las
 * secciones que avaspace manejaba en tablas separadas (redes, testimonios,
 * diferenciadores, pasos, FAQ, clientes, media, video, catálogo...).
 *
 * Cada tipo define la forma esperada del payload JSON `data` de SpaceBlock.
 *
 * Autor: SpaceCard 2.0
 */

namespace App\Enums;

enum SpaceBlockType: string
{
    // Enlaces y contacto (los que ya existían).
    case Link      = 'link';
    case Social    = 'social';
    case Header    = 'header';
    case Email     = 'email';
    case Phone     = 'phone';
    case Whatsapp  = 'whatsapp';
    case File      = 'file';
    case Embed     = 'embed';

    // Secciones ricas heredadas de avaspace.
    case Testimonial   = 'testimonial';   // { author, role, quote, avatar_url, rating }
    case Differentiator = 'differentiator'; // { title, description, icon }
    case Step          = 'step';          // { order, title, description }
    case Faq           = 'faq';           // { question, answer }
    case Client        = 'client';        // { name, logo_url, url }
    case Media         = 'media';         // { image_url, caption }
    case Video         = 'video';         // { provider, url, thumbnail_url }
    case Catalog       = 'catalog';       // { category_ids: [], layout }

    /**
     * Etiqueta legible para la UI.
     */
    public function label(): string
    {
        return match ($this) {
            self::Link           => 'Enlace',
            self::Social         => 'Red social',
            self::Header         => 'Encabezado',
            self::Email          => 'Correo',
            self::Phone          => 'Teléfono',
            self::Whatsapp       => 'WhatsApp',
            self::File           => 'Archivo',
            self::Embed          => 'Incrustado',
            self::Testimonial    => 'Testimonio',
            self::Differentiator => 'Diferenciador',
            self::Step           => 'Paso del proceso',
            self::Faq            => 'Pregunta frecuente',
            self::Client         => 'Cliente',
            self::Media          => 'Galería / Media',
            self::Video          => 'Video',
            self::Catalog        => 'Catálogo',
        };
    }

    /**
     * ¿Es un bloque simple de acción (un solo enlace) o una sección rica
     * con payload estructurado? Útil para el renderizador del Space.
     */
    public function isRichSection(): bool
    {
        return in_array($this, [
            self::Testimonial, self::Differentiator, self::Step,
            self::Faq, self::Client, self::Media, self::Video, self::Catalog,
        ], true);
    }

    /**
     * Valores para reglas de validación (`Rule::enum` o `in:`).
     *
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn (self $c) => $c->value, self::cases());
    }
}
