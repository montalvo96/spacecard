<!DOCTYPE html>
<!--
  Página pública del Space (tarjeta de presentación digital), estilo "link in bio".
  El diseño vive en public/css/space-themes.css y es el mismo que usa la
  vista previa del editor (resources/js/Components/SpacePreview.jsx): si
  cambias la estructura aquí, cámbiala también allá.
  Los colores son los que eligió el cliente (Space::themeStyle()).
-->
@php
    $theme = $space->themeStyle();
    $template = in_array($space->theme_template, ['corporate', 'editorial', 'aurora', 'bento', 'neon'], true) ? $space->theme_template : 'corporate';
    $bgImage = $space->cover_url ?: $space->avatar_url;

    $initials = collect(preg_split('/\s+/', trim($space->display_name)))->filter()->take(2)
        ->map(fn ($w) => mb_strtoupper(mb_substr($w, 0, 1)))->implode('');

    $phoneDigits = $space->contact_phone ? preg_replace('/\D+/', '', $space->contact_phone) : null;
    $icons = array_values(array_filter([
        $space->contact_phone ? ['href' => 'tel:' . preg_replace('/[^\d+]/', '', $space->contact_phone), 'icon' => 'call', 'label' => 'Llamar'] : null,
        $phoneDigits ? ['href' => 'https://wa.me/' . $phoneDigits, 'icon' => 'chat', 'label' => 'WhatsApp'] : null,
        $space->contact_email ? ['href' => 'mailto:' . $space->contact_email, 'icon' => 'mail', 'label' => 'Correo'] : null,
        $space->contact_website ? ['href' => $space->contact_website, 'icon' => 'language', 'label' => 'Sitio web'] : null,
    ]));
    $hasContact = $space->contact_phone || $space->contact_email || $space->contact_website;
    $role = collect([$space->headline, $space->company])->filter()->implode(' · ');

    $blockType = fn ($b) => $b->type instanceof \App\Enums\SpaceBlockType ? $b->type->value : $b->type;

    // Icono de cada botón según el tipo o el sitio al que apunta.
    $linkIcon = function (string $type, ?string $url): string {
        $host = strtolower((string) parse_url((string) $url, PHP_URL_HOST));
        $map = [
            'instagram' => 'photo_camera', 'linkedin' => 'work', 'youtube' => 'play_circle', 'youtu.be' => 'play_circle',
            'tiktok' => 'music_note', 'spotify' => 'music_note', 'x.com' => 'alternate_email', 'twitter' => 'alternate_email',
            'threads' => 'alternate_email', 'facebook' => 'groups', 'wa.me' => 'chat', 'whatsapp' => 'chat',
            'calendly' => 'calendar_month', 'maps' => 'location_on',
        ];
        foreach ($map as $needle => $icon) {
            if ($host && str_contains($host, $needle)) return $icon;
        }
        return [
            'social' => 'share', 'whatsapp' => 'chat', 'email' => 'mail', 'phone' => 'call',
            'file' => 'description', 'embed' => 'play_circle',
        ][$type] ?? 'link';
    };
@endphp
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>{{ $space->display_name }} | SpaceCard</title>
    <meta name="theme-color" content="{{ data_get($space->theme_config, 'palette.background', \App\Models\Space::DEFAULT_PALETTE['background']) }}">

    <meta name="description" content="{{ $space->bio ?? $space->headline }}">
    <meta property="og:title" content="{{ $space->display_name }} | SpaceCard">
    <meta property="og:description" content="{{ $space->bio ?? $space->headline }}">
    @if($space->avatar_url)
        <meta property="og:image" content="{{ $space->avatar_url }}">
    @endif
    <meta property="og:type" content="profile">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="{{ $theme['fonts_url'] }}" rel="stylesheet">
    <link href="{{ asset('css/space-themes.css') }}?v={{ @filemtime(public_path('css/space-themes.css')) }}" rel="stylesheet">
    <style>html, body { margin: 0; padding: 0; } body { background: var(--bg, #fff); }</style>
    @include('partials.icon-font')
</head>
<body style="{{ $theme['vars'] }}">

<main class="sp sp-anim" data-theme="{{ $template }}" data-btn="{{ $theme['button'] }}" data-avatar="{{ $theme['avatar'] }}" style="{{ $theme['vars'] }}">
    <div class="sp-bg" aria-hidden="true">
        @if($bgImage)
            <div class="sp-bg-img" style="background-image: url('{{ $bgImage }}');"></div>
        @endif
    </div>

    <div class="sp-shell">
        @if($space->cover_url)
            <div class="sp-cover" style="background-image: url('{{ $space->cover_url }}');"></div>
        @endif

        {{-- Perfil --}}
        <header class="sp-profile">
            <div class="sp-avatar">
                @if($space->avatar_url)
                    <img src="{{ $space->avatar_url }}" alt="{{ $space->display_name }}">
                @else
                    <span aria-hidden="true">{{ $initials }}</span>
                @endif
            </div>
            <h1 class="sp-name">{{ $space->display_name }}</h1>
            @if($role)
                <p class="sp-role">{{ $role }}</p>
            @endif
            @if($space->bio)
                <p class="sp-bio">{{ $space->bio }}</p>
            @endif

            @if(count($icons))
                <nav class="sp-icons" aria-label="Contacto">
                    @foreach($icons as $i)
                        <a href="{{ $i['href'] }}" class="sp-icon" aria-label="{{ $i['label'] }}" title="{{ $i['label'] }}" @if(str_starts_with($i['href'], 'http')) target="_blank" rel="noopener" @endif>
                            <span class="ms" aria-hidden="true">{{ $i['icon'] }}</span>
                        </a>
                    @endforeach
                </nav>
            @endif
        </header>

        {{-- Botones y secciones --}}
        <div class="sp-links">
            @if($hasContact)
                <a href="{{ route('spaces.vcard', ['slug' => $space->slug]) }}" class="sp-btn sp-btn--main">
                    <span class="sp-btn-ic"><span class="ms" aria-hidden="true">person_add</span></span>
                    <span class="sp-btn-label">Guardar contacto</span>
                </a>
            @endif
            @if($appleWallet)
                <a href="{{ route('spaces.wallet.apple', ['slug' => $space->slug]) }}" class="sp-btn">
                    <span class="sp-btn-ic"><span class="ms" aria-hidden="true">wallet</span></span>
                    <span class="sp-btn-label">Agregar a Apple Wallet</span>
                </a>
            @endif
            @if($googleWallet)
                <a href="{{ route('spaces.wallet.google', ['slug' => $space->slug]) }}" class="sp-btn">
                    <span class="sp-btn-ic"><span class="ms" aria-hidden="true">wallet</span></span>
                    <span class="sp-btn-label">Agregar a Google Wallet</span>
                </a>
            @endif

            @foreach($space->blocks as $block)
                @php
                    $t = $blockType($block);
                    $items = is_array($block->data) ? $block->data : [];
                    // Sin items vacíos (p. ej. una pregunta frecuente sin texto).
                    $items = array_values(array_filter($items, fn ($i) => is_array($i) && collect($i)->except(['icon', 'order', 'rating'])->filter(fn ($v) => filled($v))->isNotEmpty()));
                    $url = $block->url;
                    if ($t === 'whatsapp' && !$url && $phoneDigits) $url = 'https://wa.me/' . $phoneDigits;
                @endphp

                @if($t === 'header')
                    <h2 class="sp-heading">{{ $block->heading ?? $block->label }}</h2>

                @elseif(in_array($t, ['differentiator', 'step', 'faq', 'testimonial', 'client', 'media'], true))
                    @if(count($items))
                        <section class="sp-card">
                            @if($block->heading)
                                <h2 class="sp-card-title">{{ $block->heading }}</h2>
                            @endif

                            @if($t === 'faq')
                                <div>
                                    @foreach($items as $item)
                                        <details class="sp-faq">
                                            <summary>{{ $item['question'] ?? '' }}<span class="ms" aria-hidden="true">expand_more</span></summary>
                                            <p>{{ $item['answer'] ?? '' }}</p>
                                        </details>
                                    @endforeach
                                </div>
                            @elseif($t === 'testimonial')
                                <div class="sp-list">
                                    @foreach($items as $item)
                                        <figure class="sp-quote">
                                            @if(!empty($item['rating']))
                                                <div class="sp-stars" aria-label="{{ (int) $item['rating'] }} de 5">
                                                    @for($i = 0; $i < min(5, (int) $item['rating']); $i++)<span class="ms" aria-hidden="true">star</span>@endfor
                                                </div>
                                            @endif
                                            <p class="sp-quote-text">“{{ $item['quote'] ?? '' }}”</p>
                                            <figcaption class="sp-quote-by">{{ $item['author'] ?? '' }}@if(!empty($item['role'])) <span>· {{ $item['role'] }}</span>@endif</figcaption>
                                        </figure>
                                    @endforeach
                                </div>
                            @elseif($t === 'step')
                                <div class="sp-list">
                                    @foreach($items as $i => $item)
                                        <div class="sp-row-item">
                                            <span class="sp-step-n">{{ $item['order'] ?? $i + 1 }}</span>
                                            <div>
                                                <p class="sp-item-title">{{ $item['title'] ?? '' }}</p>
                                                @if(!empty($item['description']))<p class="sp-item-desc">{{ $item['description'] }}</p>@endif
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                            @elseif($t === 'client')
                                <div class="sp-chips">
                                    @foreach($items as $item)
                                        <span class="sp-chip">
                                            @if(!empty($item['logo_url']))<img src="{{ $item['logo_url'] }}" alt="">@endif
                                            {{ $item['name'] ?? '' }}
                                        </span>
                                    @endforeach
                                </div>
                            @elseif($t === 'media')
                                <div class="sp-gallery">
                                    @foreach($items as $item)
                                        @if(!empty($item['image_url']))
                                            <figure>
                                                <img src="{{ $item['image_url'] }}" alt="{{ $item['caption'] ?? '' }}" loading="lazy">
                                                @if(!empty($item['caption']))<figcaption>{{ $item['caption'] }}</figcaption>@endif
                                            </figure>
                                        @endif
                                    @endforeach
                                </div>
                            @else
                                <div class="sp-list">
                                    @foreach($items as $item)
                                        <div class="sp-row-item">
                                            <span class="ms" aria-hidden="true">check_circle</span>
                                            <div>
                                                <p class="sp-item-title">{{ $item['title'] ?? ($item['name'] ?? '') }}</p>
                                                @if(!empty($item['description']))<p class="sp-item-desc">{{ $item['description'] }}</p>@endif
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                            @endif
                        </section>
                    @endif

                @elseif($url && !in_array($t, ['video', 'catalog'], true))
                    <a href="{{ $url }}" class="sp-btn" @if(str_starts_with($url, 'http')) target="_blank" rel="noopener" @endif>
                        <span class="sp-btn-ic"><span class="ms" aria-hidden="true">{{ $linkIcon($t, $url) }}</span></span>
                        <span class="sp-btn-label">{{ $block->label }}</span>
                    </a>
                @endif
            @endforeach
        </div>

        {{-- Formulario: el mensaje llega a la bandeja de Analíticas del dueño --}}
        <section class="sp-card sp-lead" id="contacto">
            <h2 class="sp-card-title">¿Hablamos?</h2>
            <p class="sp-lead-desc">Déjame tus datos y te escribo.</p>

            <div id="lead-ok" class="sp-lead-ok" hidden>
                <span class="ms" aria-hidden="true">check_circle</span>
                <h3 class="sp-card-title" style="margin:0">¡Gracias! Tu mensaje llegó</h3>
                <p>{{ \Illuminate\Support\Str::of($space->display_name)->explode(' ')->first() }} te contactará pronto.</p>
            </div>

            <form id="lead-form" class="sp-form">
                @csrf
                <input type="text" name="name" class="sp-input" placeholder="Nombre" aria-label="Nombre" autocomplete="name" maxlength="255" required>
                <div class="sp-form-row">
                    <input type="email" name="email" class="sp-input" placeholder="Correo" aria-label="Correo" autocomplete="email" maxlength="255" required>
                    <input type="tel" name="phone" class="sp-input" placeholder="Teléfono" aria-label="Teléfono (opcional)" autocomplete="tel" maxlength="30">
                </div>
                <textarea name="note" class="sp-input" rows="3" maxlength="2000" placeholder="¿En qué te puedo ayudar?" aria-label="Mensaje"></textarea>
                <button type="submit" id="lead-submit" class="sp-btn sp-btn--main">
                    Enviar mensaje <span class="ms" aria-hidden="true">send</span>
                </button>
            </form>
        </section>

        {{-- Marca fija en todos los Spaces --}}
        <footer class="sp-foot">
            <a href="{{ url('/') }}" class="sp-badge" target="_blank" rel="noopener">Hecho con <strong>SpaceCard</strong></a>
        </footer>
    </div>
</main>

<script>
    (function () {
        const form = document.getElementById('lead-form');
        const btn = document.getElementById('lead-submit');
        const ok = document.getElementById('lead-ok');
        const label = btn.innerHTML;
        const reset = () => { btn.disabled = false; btn.innerHTML = label; };

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            btn.disabled = true;
            btn.textContent = 'Enviando…';

            fetch(@json(route('spaces.lead.store', ['slug' => $space->slug])), {
                method: 'POST',
                body: new FormData(form),
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
            })
                .then((res) => res.json().then((data) => ({ status: res.status, data })))
                .then(({ status, data }) => {
                    if (data.success) {
                        form.reset();
                        form.hidden = true;
                        ok.hidden = false;
                        return;
                    }
                    const msg = status === 429 ? 'Enviaste varios mensajes seguidos. Espera un minuto e inténtalo de nuevo.' : (data.message || 'Revisa los datos e inténtalo de nuevo.');
                    scToast(msg, 'error', 'No se pudo enviar');
                    reset();
                })
                .catch(() => {
                    scToast('Revisa tu conexión e inténtalo de nuevo.', 'error', 'Error al enviar');
                    reset();
                });
        });
    })();
</script>
@include('partials.notify')
</body>
</html>
