<?php
/**
 * Modelo Space para representar la tarjeta de presentación digital.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'owner_id',
    'slug',
    'display_name',
    'headline',
    'company',
    'bio',
    'avatar_url',
    'cover_url',
    'contact_phone',
    'contact_email',
    'contact_website',
    'theme_template',
    'theme_config',
    'is_public',
    'show_branding'
])]
class Space extends Model
{
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'theme_config' => 'array',
            'is_public' => 'boolean',
            'show_branding' => 'boolean',
        ];
    }

    /**
     * Relación con el usuario dueño del Space.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Relación con los bloques modulares del Space, ordenados por posición.
     */
    public function blocks(): HasMany
    {
        return $this->hasMany(SpaceBlock::class, 'space_id')->orderBy('position', 'asc');
    }

    /**
     * Relación con los dispositivos que apuntan a este Space.
     */
    public function devices(): HasMany
    {
        return $this->hasMany(Device::class, 'space_id');
    }

    /**
     * Relación con los escaneos registrados.
     */
    public function scans(): HasMany
    {
        return $this->hasMany(Scan::class, 'space_id');
    }

    /**
     * Relación con los leads recolectados a través de este Space.
     */
    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class, 'space_id');
    }

    /**
     * Categorías del catálogo del Space (Módulo C).
     */
    public function categories(): HasMany
    {
        return $this->hasMany(SpaceProductCategory::class, 'space_id')->orderBy('position');
    }

    /**
     * Productos del catálogo del Space (Módulo C).
     */
    public function products(): HasMany
    {
        return $this->hasMany(SpaceProduct::class, 'space_id')->orderBy('position');
    }

    /** Colores que se usan si el Space aún no tiene los suyos (el cliente los cambia en el editor). */
    public const DEFAULT_PALETTE = [
        'primary'    => '#d42410',
        'secondary'  => '#525252',
        'background' => '#ffffff',
        'text'       => '#0b0b0b',
    ];

    /** Estilos de botón y esquinas permitidos (ver public/css/space-themes.css). */
    public const BUTTON_STYLES = ['filled', 'outline', 'soft', 'hard', 'glass'];
    public const RADII = ['0px', '8px', '12px', '16px', '24px', '999px'];

    /** Tipografías disponibles: título, cuerpo y la familia para Google Fonts. */
    public const FONT_PAIRS = [
        'Outfit_Inter'       => ["'Outfit', sans-serif", "'Inter', sans-serif", 'family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700'],
        'Playfair_Source'    => ["'Playfair Display', serif", "'Source Sans 3', sans-serif", 'family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Source+Sans+3:wght@400;500;600;700'],
        'SpaceGrotesk_Inter' => ["'Space Grotesk', sans-serif", "'Inter', sans-serif", 'family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700'],
        'Fraunces_Inter'     => ["'Fraunces', serif", "'Inter', sans-serif", 'family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600;700'],
    ];

    /**
     * Variables CSS del tema (public/css/space-themes.css) a partir de los
     * colores, tipografía y esquinas que eligió el cliente.
     *
     * @return array{vars: string, fonts_url: string, avatar: string, button: string}
     */
    public function themeStyle(): array
    {
        $cfg = is_array($this->theme_config) ? $this->theme_config : [];
        $hex = fn ($v, $d) => is_string($v) && preg_match('/^#[0-9a-fA-F]{6}$/', $v) ? strtolower($v) : $d;
        $p = $cfg['palette'] ?? [];

        $accent = $hex($p['primary'] ?? null, self::DEFAULT_PALETTE['primary']);
        $accent2 = $hex($p['secondary'] ?? null, self::DEFAULT_PALETTE['secondary']);
        $bg = $hex($p['background'] ?? null, self::DEFAULT_PALETTE['background']);
        $ink = $hex($p['text'] ?? null, self::DEFAULT_PALETTE['text']);

        $pairKey = array_key_exists($cfg['font_pair'] ?? '', self::FONT_PAIRS) ? $cfg['font_pair'] : 'Outfit_Inter';
        [$title, $body, $family] = self::FONT_PAIRS[$pairKey];

        $radius = in_array($cfg['corner_radius'] ?? null, self::RADII, true) ? $cfg['corner_radius'] : '12px';
        $button = in_array($cfg['button_style'] ?? null, self::BUTTON_STYLES, true) ? $cfg['button_style'] : 'filled';
        $avatar = in_array($cfg['avatar_shape'] ?? null, ['circle', 'squircle', 'square'], true) ? $cfg['avatar_shape'] : 'circle';

        $vars = [
            '--accent'     => $accent,
            '--accent-2'   => $accent2,
            '--bg'         => $bg,
            '--ink'        => $ink,
            '--on-accent'  => self::readableOn($accent),
            '--inv-bg'     => $ink,
            '--inv-ink'    => $bg,
            '--radius'     => $radius,
            '--font-title' => $title,
            '--font-body'  => $body,
        ];

        return [
            'vars'      => collect($vars)->map(fn ($v, $k) => "{$k}: {$v}")->implode('; '),
            'fonts_url' => "https://fonts.googleapis.com/css2?{$family}&display=swap",
            'avatar'    => $avatar,
            'button'    => $button,
        ];
    }

    /** Texto negro o blanco, el que se lea mejor sobre ese color. */
    public static function readableOn(string $hex): string
    {
        $c = array_map(fn ($i) => hexdec(substr($hex, $i, 2)) / 255, [1, 3, 5]);
        $lin = array_map(fn ($v) => $v <= 0.03928 ? $v / 12.92 : (($v + 0.055) / 1.055) ** 2.4, $c);
        $l = 0.2126 * $lin[0] + 0.7152 * $lin[1] + 0.0722 * $lin[2];

        return $l > 0.179 ? '#0b0b0b' : '#ffffff';
    }
}
