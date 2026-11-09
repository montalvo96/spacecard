<?php
/**
 * Convierte el diseño de una SpaceCard (el que el cliente arma en SpaceShop)
 * en archivos finales para imprenta: SVG vectorial y PNG a 300 dpi, a tamaño
 * real CR80 (85.6 × 54 mm), con el QR real de cada tarjeta ya colocado.
 *
 * Reproduce el mismo cálculo del diseñador de la tienda: posiciones en % de la
 * tarjeta y tamaños en % de su ancho. El lienzo mide 856 × 540 unidades
 * (1 unidad = 0.1 mm), así 1% del ancho = 8.56 unidades.
 */

namespace App\Services;

use Imagick;

class CardDesignRenderer
{
    private const W = 856;
    private const H = 540;

    /**
     * @param array       $faces   Diseño saneado (AdminDesignController::faces)
     * @param string      $side    'front' | 'back'
     * @param string|null $qrSvg   SVG del QR real (null = muestra)
     * @param string|null $logo    Logo como data URI
     * @param string|null $preset  Arte de catálogo como data URI
     */
    public function svg(array $faces, string $side, ?string $qrSvg, ?string $logo, ?string $preset = null): string
    {
        return $faces['mode'] === 'preset'
            ? $this->presetSvg($faces, $side, $qrSvg, $preset)
            : $this->customSvg($faces, $side, $qrSvg, $logo);
    }

    /** PNG a 300 dpi (1011 × 638 px en horizontal). */
    public function png(string $svg): string
    {
        // rsvg-convert respeta degradados, SVG anidados y fuentes; el lector
        // interno de ImageMagick no, así que solo se usa como respaldo.
        $bin = trim((string) @shell_exec('command -v rsvg-convert'));
        if ($bin !== '') {
            $proc = proc_open([$bin, '--dpi-x', '300', '--dpi-y', '300', '--format', 'png'], [
                0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w'],
            ], $pipes);
            if (is_resource($proc)) {
                fwrite($pipes[0], $svg);
                fclose($pipes[0]);
                $png = stream_get_contents($pipes[1]);
                fclose($pipes[1]);
                fclose($pipes[2]);
                if (proc_close($proc) === 0 && $png !== '') {
                    return $png;
                }
            }
        }

        $im = new Imagick();
        $im->setResolution(300, 300);
        $im->setBackgroundColor('transparent');
        $im->readImageBlob($svg);
        $im->setImageFormat('png');
        $im->setImageUnits(Imagick::RESOLUTION_PIXELSPERINCH);
        $im->setImageResolution(300, 300);
        $blob = $im->getImageBlob();
        $im->clear();

        return $blob;
    }

    private function open(int $w, int $h): string
    {
        $mmW = $w / 10;
        $mmH = $h / 10;

        return '<?xml version="1.0" encoding="UTF-8"?>' . "\n"
            . "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"{$mmW}mm\" height=\"{$mmH}mm\" viewBox=\"0 0 {$w} {$h}\">";
    }

    private function e(string $s): string
    {
        return htmlspecialchars($s, ENT_QUOTES | ENT_XML1, 'UTF-8');
    }

    /** Recuadro blanco con el QR real (o un aviso de muestra) centrado en (cx, cy). */
    private function qr(float $cx, float $cy, float $size, ?string $qrSvg): string
    {
        $x = $cx - $size / 2;
        $y = $cy - $size / 2;
        $r = 0.021 * self::W;
        $out = "<rect x=\"{$x}\" y=\"{$y}\" width=\"{$size}\" height=\"{$size}\" rx=\"{$r}\" fill=\"#ffffff\"/>";

        $inner = $size * 0.82;
        $ix = $cx - $inner / 2;
        $iy = $cy - $inner / 2;

        if ($qrSvg) {
            // El SVG del QR se anida con su propio viewBox, escalado al recuadro.
            $body = preg_replace('/^.*?<svg[^>]*>/s', '', $qrSvg);
            $body = preg_replace('/<\/svg>\s*$/', '', $body);
            preg_match('/viewBox="([^"]+)"/', $qrSvg, $vb);
            $viewBox = $vb[1] ?? '0 0 300 300';
            $out .= "<svg x=\"{$ix}\" y=\"{$iy}\" width=\"{$inner}\" height=\"{$inner}\" viewBox=\"{$viewBox}\">{$body}</svg>";
        } else {
            $fs = $size * 0.12;
            $out .= "<rect x=\"{$ix}\" y=\"{$iy}\" width=\"{$inner}\" height=\"{$inner}\" fill=\"none\" stroke=\"#9ca3af\" stroke-width=\"3\" stroke-dasharray=\"8 6\"/>"
                . "<text x=\"{$cx}\" y=\"" . ($cy + $fs * 0.35) . "\" font-family=\"DejaVu Sans, Arial, sans-serif\" font-weight=\"700\" font-size=\"{$fs}\" fill=\"#6b7280\" text-anchor=\"middle\">QR muestra</text>";
        }

        return $out;
    }

    private function customSvg(array $f, string $side, ?string $qrSvg, ?string $logo): string
    {
        $W = self::W;
        $H = self::H;
        $bgCss = $f['bg'][$side]['css'];
        $ink = $f['bg'][$side]['ink'];

        $svg = $this->open($W, $H) . '<defs>';
        if (preg_match('/^linear-gradient\((\d+)deg, (#[0-9a-fA-F]{3,8}) 0%, (#[0-9a-fA-F]{3,8}) 100%\)$/', $bgCss, $m)) {
            // Misma geometría que linear-gradient de CSS: 0deg = hacia arriba, 90deg = hacia la derecha.
            $a = deg2rad((float) $m[1]);
            $dx = sin($a);
            $dy = -cos($a);
            $half = (abs($W * $dx) + abs($H * $dy)) / 2;
            [$x1, $y1, $x2, $y2] = [$W / 2 - $dx * $half, $H / 2 - $dy * $half, $W / 2 + $dx * $half, $H / 2 + $dy * $half];
            $svg .= "<linearGradient id=\"bg\" gradientUnits=\"userSpaceOnUse\" x1=\"{$x1}\" y1=\"{$y1}\" x2=\"{$x2}\" y2=\"{$y2}\">"
                . "<stop offset=\"0\" stop-color=\"{$m[2]}\"/><stop offset=\"1\" stop-color=\"{$m[3]}\"/></linearGradient>";
            $fill = 'url(#bg)';
        } else {
            $fill = $bgCss;
        }
        $svg .= "</defs><rect width=\"{$W}\" height=\"{$H}\" fill=\"{$fill}\"/>";

        // Icono de contacto (NFC) arriba a la derecha, como en el diseñador.
        $chip = 0.063 * $W;
        $cx = $W - 0.037 * $W - $chip;
        $cy = 0.037 * $W;
        $op = $side === 'front' ? '0.8' : '0.25';
        $s = $chip / 24;
        $svg .= "<g transform=\"translate({$cx} {$cy}) scale({$s})\" fill=\"none\" stroke=\"{$ink}\" stroke-width=\"2\" stroke-linecap=\"round\" opacity=\"{$op}\">"
            . '<path d="M8.5 8.5a5 5 0 0 1 0 7"/><path d="M12 6a8.5 8.5 0 0 1 0 12"/><path d="M15.5 3.5a12 12 0 0 1 0 17"/></g>';

        $el = $f['el'];

        $L = $el['logo'];
        if ($L['on'] && $L['side'] === $side && $logo) {
            $lw = $L['size'] / 100 * $W;
            $lh = $lw * 0.62;
            $lx = $L['x'] / 100 * $W - $lw / 2;
            $ly = $L['y'] / 100 * $H - $lh / 2;
            $svg .= "<image x=\"{$lx}\" y=\"{$ly}\" width=\"{$lw}\" height=\"{$lh}\" preserveAspectRatio=\"xMidYMid meet\" xlink:href=\"{$this->e($logo)}\" href=\"{$this->e($logo)}\"/>";
        }

        $Q = $el['qr'];
        if ($Q['on'] && $Q['side'] === $side) {
            $svg .= $this->qr($Q['x'] / 100 * $W, $Q['y'] / 100 * $H, $Q['size'] / 100 * $W, $qrSvg);
        }

        $I = $el['info'];
        if ($I['on'] && $I['side'] === $side) {
            $fs = max(1.84, 5.2 * $I['size'] / 100) / 100 * $W;
            $gap = 0.0025 * $W;
            $lines = [];
            if ($I['name'])    $lines[] = [$I['name'], $fs * 1.25, 700, 1, 1.1];
            if ($I['title'])   $lines[] = [$I['title'], $fs, 400, 0.9, 1.2];
            if ($I['company']) $lines[] = [$I['company'], $fs, 600, 0.8, 1.2];
            if ($I['phone'])   $lines[] = [$I['phone'], $fs, 400, 0.8, 1.2];
            if ($I['website']) $lines[] = [$I['website'], $fs, 400, 0.8, 1.2];

            if ($lines) {
                $total = array_sum(array_map(fn ($l) => $l[1] * $l[4], $lines)) + $gap * (count($lines) - 1);
                // Ancho aproximado del bloque (para alinear a izquierda/derecha como el diseñador).
                $blockW = max(array_map(fn ($l) => mb_strlen($l[0]) * $l[1] * ($l[2] >= 700 ? 0.6 : 0.55), $lines));
                $cxI = $I['x'] / 100 * $W;
                [$anchor, $tx] = match ($I['align']) {
                    'left'  => ['start', $cxI - $blockW / 2],
                    'right' => ['end', $cxI + $blockW / 2],
                    default => ['middle', $cxI],
                };
                $y = $I['y'] / 100 * $H - $total / 2;
                foreach ($lines as [$text, $size, $weight, $opacity, $lh]) {
                    $base = $y + $size * $lh * 0.78; // línea base dentro de su renglón
                    $family = $weight >= 700 ? 'Inter Tight, Inter, DejaVu Sans, Arial, sans-serif' : 'Inter, DejaVu Sans, Arial, sans-serif';
                    $svg .= "<text x=\"{$tx}\" y=\"{$base}\" font-family=\"{$family}\" font-size=\"{$size}\" font-weight=\"{$weight}\" fill=\"{$ink}\" fill-opacity=\"{$opacity}\" text-anchor=\"{$anchor}\">{$this->e($text)}</text>";
                    $y += $size * $lh + $gap;
                }
            }
        }

        // Marca discreta abajo a la izquierda.
        [$dimColor, $dimOp] = $ink === '#ffffff' ? ['#ffffff', '0.75'] : ['#000000', '0.55'];
        $bs = 0.024 * $W;
        $svg .= "<text x=\"" . (0.042 * $W) . "\" y=\"" . ($H - 0.032 * $W) . "\" font-family=\"Inter, DejaVu Sans, Arial, sans-serif\" font-size=\"{$bs}\" font-weight=\"700\" letter-spacing=\"" . (0.0026 * $W) . "\" fill=\"{$dimColor}\" fill-opacity=\"{$dimOp}\">SPACECARD® NFC</text>";

        return $svg . '</svg>';
    }

    /** Catálogo: vertical (54 × 85.6 mm). Frente = arte + QR real encima; reverso = color liso. */
    private function presetSvg(array $f, string $side, ?string $qrSvg, ?string $preset): string
    {
        $W = self::H; // vertical
        $H = self::W;
        $svg = $this->open($W, $H) . "<rect width=\"{$W}\" height=\"{$H}\" fill=\"{$f['color']}\"/>";

        if ($side === 'front') {
            if ($preset) {
                $svg .= "<image x=\"0\" y=\"0\" width=\"{$W}\" height=\"{$H}\" preserveAspectRatio=\"xMidYMid slice\" xlink:href=\"{$preset}\" href=\"{$preset}\"/>";
            }
            $svg .= $this->qr(0.494 * $W, 0.497 * $H, 0.54 * $W, $qrSvg);
        }

        return $svg . '</svg>';
    }
}
