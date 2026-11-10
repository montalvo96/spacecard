{{--
    Hoja de impresión de una SpaceCard a tamaño real (CR80: 85.6 × 54 mm).
    Cada cara es una página; el orden es frente, reverso, frente, reverso…
    para impresoras de tarjetas a doble cara (o para imprimir a dos caras en papel).
    Todas las medidas internas usan cqw (ancho de la tarjeta), igual que el
    diseñador de la tienda usa porcentajes, así lo que se imprime es lo que el
    cliente vio.
--}}
@php
    $preset = $faces['mode'] === 'preset';
    $standalone = $standalone ?? false;
    $sides = $preview ? [$preview] : ['front', 'back'];
    $orderCode = 'SPC-' . (10000 + $item->order_id);
    // Esquina real de una CR80 (3.18 mm), en % del ancho / alto de la tarjeta.
    $radius = $preset ? '5.9% / 3.7%' : '3.7% / 5.9%';
@endphp
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Impresión {{ $orderCode }} · SpaceCard</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Inter+Tight:wght@600;700&display=swap" rel="stylesheet">
    <style>
        @page { size: {{ $preset ? '54mm 85.6mm' : '85.6mm 54mm' }}; margin: 0; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

        .face {
            position: relative;
            overflow: hidden;
            container-type: inline-size;
            aspect-ratio: {{ $preset ? '54 / 85.6' : '85.6 / 54' }};
        }
        .chip { position: absolute; top: 3.7cqw; right: 3.7cqw; width: 6.3cqw; height: 6.3cqw; }
        .el { position: absolute; transform: translate(-50%, -50%); }
        .el img { width: 100%; height: 100%; object-fit: contain; display: block; }
        .qr-box { width: 100%; height: 100%; background: #fff; border-radius: 2.1cqw; display: flex; align-items: center; justify-content: center; }
        .qr-box svg { width: 82%; height: 82%; display: block; }
        .qr-sample { width: 82%; height: 82%; display: flex; align-items: center; justify-content: center; border: .5cqw dashed #9ca3af; color: #6b7280; font-size: 3cqw; font-weight: 700; text-align: center; line-height: 1.1; }
        .info { display: flex; flex-direction: column; gap: .25cqw; white-space: nowrap; }
        .info .n { font-family: 'Inter Tight', sans-serif; font-weight: 700; line-height: 1.1; }
        .info .t { opacity: .9; }
        .info .l { opacity: .8; }
        .preset-img { width: 100%; height: 100%; object-fit: cover; display: block; }

        /* ---- Vista previa (miniatura en el panel de producción) ---- */
        body.is-preview { background: transparent; }
        body.is-preview .face { width: 100%; border-radius: {{ $radius }}; }

        /* ---- Pantalla: barra de ayuda y tarjetas centradas ---- */
        @media screen {
            body:not(.is-preview) { background: #F4F4F5; color: #171717; padding: 0 16px 48px; }
            .bar { max-width: 760px; margin: 0 auto; padding: 28px 0 20px; }
            .kicker { font-size: 11px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #D42410; }
            .bar h1 { font-family: 'Inter Tight', sans-serif; font-size: 30px; letter-spacing: -.03em; margin: 6px 0 4px; }
            .bar p { font-size: 14px; color: #525252; }
            .btn { display: inline-flex; align-items: center; gap: 8px; margin-top: 16px; padding: 12px 22px; border: 0; border-radius: 999px; background: #D42410; color: #fff; font: 600 14px 'Inter', sans-serif; cursor: pointer; box-shadow: 0 10px 24px rgba(212,36,16,.3); }
            .btn:hover { background: #B81E0C; }
            .tips { margin-top: 18px; padding: 14px 18px; border-radius: 16px; background: #fff; border: 1px solid rgba(0,0,0,.07); font-size: 13px; color: #404040; line-height: 1.6; }
            .tips strong { color: #171717; }
            .warn { margin-top: 12px; padding: 12px 16px; border-radius: 14px; background: #FFF4F2; border: 1px solid rgba(212,36,16,.25); color: #B81E0C; font-size: 13px; }
            .sheet { max-width: 760px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fill, minmax({{ $preset ? '200px' : '320px' }}, 1fr)); gap: 18px; }
            .page { display: flex; flex-direction: column; gap: 6px; }
            .page .label { font-size: 11px; font-weight: 600; color: #737373; }
            .page .face { width: 100%; border-radius: {{ $radius }}; box-shadow: 0 14px 30px rgba(0,0,0,.15); }
            /* Miniatura: la cara llena el iframe, sin rejilla ni sombra */
            html:has(body.is-preview), body.is-preview { overflow: hidden; }
            body.is-preview .sheet { display: block; max-width: none; }
            body.is-preview .page .face { box-shadow: none; }
        }

        /* ---- Impresión: cada cara ocupa exactamente una página CR80 ---- */
        @media print {
            .bar, .label { display: none !important; }
            .sheet { display: block; }
            .page { width: {{ $preset ? '54mm' : '85.6mm' }}; height: {{ $preset ? '85.6mm' : '54mm' }}; page-break-after: always; break-after: page; overflow: hidden; }
            .page:last-child { page-break-after: auto; break-after: auto; }
            .page .face { width: 100%; height: 100%; aspect-ratio: auto; border-radius: 0; }
        }
    </style>
</head>
<body class="{{ $preview ? 'is-preview' : '' }}">

@unless ($preview)
    <div class="bar">
        <div class="kicker">Hoja de impresión · {{ $orderCode }}</div>
        <h1>{{ $item->order->customer_name }}</h1>
        <p>{{ count($cards) }} tarjeta(s) · {{ $preset ? 'Diseño de catálogo' : 'Diseño personalizado' }} · tamaño real 85.6 × 54 mm</p>
        <button type="button" class="btn" onclick="window.print()">Imprimir tarjetas</button>
        <div class="tips">
            <strong>En el cuadro de impresión:</strong> elige tu impresora de tarjetas (o la de papel),
            tamaño de papel <strong>CR80 / 85.6 × 54 mm</strong>{{ $preset ? ' en vertical' : '' }}, escala <strong>100%</strong>,
            márgenes <strong>Ninguno</strong> y activa <strong>Gráficos de fondo</strong>.
            Para doble cara activa <strong>impresión a dos caras</strong>: las páginas van frente, reverso, frente, reverso…
        </div>
        @if ($item->devices->isEmpty())
            <div class="warn">Este pedido aún no tiene dispositivos generados: el QR es solo una muestra. Genera los dispositivos en el panel de admin antes de imprimir para que cada tarjeta lleve su QR real.</div>
        @endif
    </div>
@endunless

<div class="sheet">
@foreach ($cards as $card)
    @foreach ($sides as $side)
        <div class="page">
            @unless ($preview)
                <div class="label">{{ $side === 'front' ? 'Frente' : 'Reverso' }}{{ $card['code'] ? ' · ' . $card['code'] : '' }}</div>
            @endunless

            @if ($preset)
                {{-- Catálogo: el arte de AVASPACE trae un QR de muestra en el frente
                     (centro 49.4% / 49.7%, ~48% del ancho); encima va el QR real.
                     El reverso es el color liso del diseño. --}}
                <div class="face" style="background: {{ $faces['color'] }}">
                    @if ($side === 'front')
                        <img class="preset-img" src="{{ $faces['preset_data'] ?? asset('img/products/fronts/card-' . $faces['preset'] . '.png') }}" alt="">
                        <div class="el" style="left:49.4%; top:49.7%; width:54cqw; height:54cqw;">
                            <div class="qr-box">
                                @if ($card['qr']) {!! $card['qr'] !!} @else <div class="qr-sample">QR<br>muestra</div> @endif
                            </div>
                        </div>
                    @endif
                </div>
            @else
                @php
                    $bg = $faces['bg'][$side];
                    $el = $faces['el'];
                    $ink = $bg['ink'];
                    $info = $el['info'];
                    $fs = max(1.84, 5.2 * $info['size'] / 100); // mismo cálculo que el diseñador, en cqw
                @endphp
                <div class="face" style="background: {{ $bg['css'] }}; color: {{ $ink }};">
                    {{-- Icono de contacto (NFC), como en el diseñador --}}
                    <svg class="chip" viewBox="0 0 24 24" fill="none" stroke="{{ $ink }}" stroke-width="2" stroke-linecap="round" style="opacity: {{ $side === 'front' ? '.8' : '.25' }}">
                        <path d="M8.5 8.5a5 5 0 0 1 0 7"/><path d="M12 6a8.5 8.5 0 0 1 0 12"/><path d="M15.5 3.5a12 12 0 0 1 0 17"/>
                    </svg>

                    @if ($el['logo']['on'] && $el['logo']['side'] === $side && $logo)
                        <div class="el" style="left:{{ $el['logo']['x'] }}%; top:{{ $el['logo']['y'] }}%; width:{{ $el['logo']['size'] }}cqw; height:{{ $el['logo']['size'] * 0.62 }}cqw;">
                            <img src="{{ $logo }}" alt="">
                        </div>
                    @endif

                    @if ($el['qr']['on'] && $el['qr']['side'] === $side)
                        <div class="el" style="left:{{ $el['qr']['x'] }}%; top:{{ $el['qr']['y'] }}%; width:{{ $el['qr']['size'] }}cqw; height:{{ $el['qr']['size'] }}cqw;">
                            <div class="qr-box">
                                @if ($card['qr']) {!! $card['qr'] !!} @else <div class="qr-sample">QR<br>muestra</div> @endif
                            </div>
                        </div>
                    @endif

                    @if ($info['on'] && $info['side'] === $side)
                        <div class="el info" style="left:{{ $info['x'] }}%; top:{{ $info['y'] }}%; font-size:{{ $fs }}cqw; text-align:{{ $info['align'] }}; align-items:{{ $info['align'] === 'center' ? 'center' : ($info['align'] === 'right' ? 'flex-end' : 'flex-start') }};">
                            @if ($info['name'])<div class="n" style="font-size:{{ $fs * 1.25 }}cqw">{{ $info['name'] }}</div>@endif
                            @if ($info['title'])<div class="t">{{ $info['title'] }}</div>@endif
                            @if ($info['company'])<div class="l" style="font-weight:600">{{ $info['company'] }}</div>@endif
                            @if ($info['phone'])<div class="l">{{ $info['phone'] }}</div>@endif
                            @if ($info['website'])<div class="l">{{ $info['website'] }}</div>@endif
                        </div>
                    @endif
                    {{-- Sin marca SPACECARD: el diseño personalizado es del cliente. Los prediseñados ya traen la suya en la imagen. --}}
                </div>
            @endif
        </div>
    @endforeach
@endforeach
</div>

@if (!$preview && !$standalone && request()->boolean('auto'))
    <script>window.addEventListener('load', () => setTimeout(() => window.print(), 400));</script>
@endif
</body>
</html>
