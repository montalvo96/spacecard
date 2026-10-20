<!DOCTYPE html>
<!--
  Vista de visualización pública del Space Digital (tarjeta de presentación).
  Última modificación: 2026-08-06
  Autor: Antigravity
-->
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ $space->display_name }} | SpaceCard</title>
    
    <!-- Metatags SEO / OpenGraph -->
    <meta name="description" content="{{ $space->bio ?? $space->headline }}">
    <meta property="og:title" content="{{ $space->display_name }} | SpaceCard">
    <meta property="og:description" content="{{ $space->bio ?? $space->headline }}">
    @if($space->avatar_url)
        <meta property="og:image" content="{{ $space->avatar_url }}">
    @endif
    <meta property="og:type" content="profile">

    <!-- Cargar Google Fonts de forma dinámica según el font_pair -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    @php
        $fontPair = $space->theme_config['font_pair'] ?? 'Outfit_Inter';
        $fontsToLoad = [];
        if (str_contains($fontPair, 'Outfit')) {
            $fontsToLoad[] = 'family=Outfit:wght@400;500;600;700';
        }
        if (str_contains($fontPair, 'Inter')) {
            $fontsToLoad[] = 'family=Inter:wght@400;500;600;700';
        }
        if (str_contains($fontPair, 'Playfair')) {
            $fontsToLoad[] = 'family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400';
        }
        if (str_contains($fontPair, 'Source')) {
            $fontsToLoad[] = 'family=Source+Sans+3:wght@400;500;600;700';
        }
        $fontsUrl = 'https://fonts.googleapis.com/css2?' . implode('&', $fontsToLoad) . '&display=swap';
    @endphp
    <link href="{{ $fontsUrl }}" rel="stylesheet">

    <!-- Estilos base y motor de inyección de variables CSS -->
    <style>
        @php
            $cfg = $space->theme_config;
            $palette = $cfg['palette'] ?? [];
            $primaryColor = $palette['primary'] ?? '#8b5cf6';
            $secondaryColor = $palette['secondary'] ?? '#6b7280';
            $bgColor = $palette['background'] ?? '#0c0b14';
            $textColor = $palette['text'] ?? '#ffffff';
            
            // Deducir fuentes
            $titleFont = 'sans-serif';
            $bodyFont = 'sans-serif';
            if ($fontPair === 'Outfit_Inter') {
                $titleFont = "'Outfit', sans-serif";
                $bodyFont = "'Inter', sans-serif";
            } elseif ($fontPair === 'Playfair_Source') {
                $titleFont = "'Playfair Display', serif";
                $bodyFont = "'Source Sans 3', sans-serif";
            }
        @endphp

        :root {
            --primary: {{ $primaryColor }};
            --secondary: {{ $secondaryColor }};
            --bg-color: {{ $bgColor }};
            --text-color: {{ $textColor }};
            --font-title: {!! $titleFont !!};
            --font-body: {!! $bodyFont !!};
            --radius: {{ $cfg['corner_radius'] ?? '12px' }};
            
            /* Colores de ayuda */
            --bg-glass: rgba(255, 255, 255, 0.05);
            --border-glass: rgba(255, 255, 255, 0.08);
            --shadow-glow: rgba(139, 92, 246, 0.25);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-color);
            font-family: var(--font-body);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0;
            overflow-x: hidden;
            position: relative;
        }

        /* ----------------------------------------------------
           TEMAS BASE & BACKGROUNDS
           ---------------------------------------------------- */
        
        /* Tema Aurora (Mesh + Glass) */
        @if($space->theme_template === 'aurora')
            body {
                background-attachment: fixed;
                background-image: 
                    radial-gradient(circle at 20% 30%, rgba(236, 72, 153, 0.18) 0%, transparent 45%),
                    radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.18) 0%, transparent 45%),
                    radial-gradient(circle at 50% 10%, rgba(59, 130, 246, 0.12) 0%, transparent 40%);
            }
            .card-wrapper {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                backdrop-filter: blur(20px);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }
            .block-item {
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.08);
                backdrop-filter: blur(10px);
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .block-item:hover {
                background: rgba(255, 255, 255, 0.08);
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
            }
        @endif

        /* Tema Bento Grid */
        @if($space->theme_template === 'bento')
            body {
                background-color: var(--bg-color);
            }
            .card-wrapper {
                background: transparent;
                border: none;
                box-shadow: none;
                max-width: 520px !important;
            }
            .bento-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 16px;
                width: 100%;
                margin-top: 24px;
            }
            .bento-item-full {
                grid-column: span 2;
            }
            .block-item {
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 24px 16px !important;
                background: var(--bg-glass);
                border: 1px solid var(--border-glass);
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            }
            .block-item:hover {
                transform: scale(1.02);
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
            }
        @endif

        /* Tema Editorial (Serif + Minimal) */
        @if($space->theme_template === 'editorial')
            body {
                background-color: var(--bg-color);
            }
            .card-wrapper {
                background: transparent;
                border: none;
                box-shadow: none;
                padding: 40px 16px !important;
            }
            .block-item {
                background: transparent;
                border: none;
                border-bottom: 1.5px solid var(--text-color);
                border-radius: 0 !important;
                padding: 16px 0 !important;
                justify-content: space-between;
            }
            .block-item:hover {
                opacity: 0.7;
                transform: none;
            }
            .btn-save-contact {
                border: 1.5px solid var(--text-color) !important;
                border-radius: 0px !important;
                background: transparent !important;
                color: var(--text-color) !important;
            }
        @endif

        /* Tema Neon (Dark + Glow) */
        @if($space->theme_template === 'neon')
            body {
                background-color: #030307;
            }
            .card-wrapper {
                background: rgba(13, 13, 21, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.05);
                box-shadow: 0 0 50px rgba(0, 0, 0, 0.8);
            }
            .block-item {
                background: rgba(255, 255, 255, 0.02);
                border: 1.5px solid var(--primary);
                box-shadow: 0 0 10px rgba(139, 92, 246, 0.1);
                transition: all 0.25s ease-in-out;
            }
            .block-item:hover {
                box-shadow: 0 0 20px var(--primary);
                background: rgba(139, 92, 246, 0.1);
                transform: translateY(-2px);
            }
            .btn-save-contact {
                box-shadow: 0 0 15px var(--primary) !important;
            }
        @endif

        /* Tema Corporate */
        @if($space->theme_template === 'corporate')
            body {
                background-color: var(--bg-color);
            }
            .card-wrapper {
                background: #ffffff;
                color: #1e293b;
                border: 1px solid #e2e8f0;
                box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            }
            .block-item {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                color: #1e293b;
            }
            .block-item:hover {
                background: #f1f5f9;
                transform: translateY(-1px);
            }
            .btn-save-contact {
                background: var(--primary) !important;
                color: #ffffff !important;
            }
        @endif

        /* Layout general del wrapper de tarjeta */
        .card-wrapper {
            width: 100%;
            max-width: 460px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 30px 20px;
            position: relative;
            z-index: 10;
        }

        @media(min-width: 480px) {
            .card-wrapper {
                min-height: auto;
                margin: 40px 0;
                border-radius: 32px;
                padding: 40px 32px;
            }
        }

        /* Cabecera / Cover */
        .cover-photo {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 140px;
            background-size: cover;
            background-position: center;
            z-index: 1;
            opacity: 0.6;
        }

        .avatar-container {
            margin-top: 70px;
            position: relative;
            z-index: 2;
            margin-bottom: 20px;
        }

        .avatar {
            width: 100px;
            height: 100px;
            border-radius: @if(($cfg['avatar_shape'] ?? 'circle') === 'circle') 50% @elseif(($cfg['avatar_shape'] ?? 'circle') === 'squircle') 28px @else 0px @endif;
            border: 3px solid #ffffff;
            box-shadow: 0 8px 16px rgba(0,0,0,0.15);
            object-fit: cover;
        }

        /* Perfil */
        .display-name {
            font-family: var(--font-title);
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 6px;
            letter-spacing: -0.5px;
            z-index: 2;
            position: relative;
        }

        .headline {
            font-size: 15px;
            color: var(--secondary);
            margin-bottom: 4px;
            z-index: 2;
            position: relative;
        }

        .company {
            font-size: 13px;
            font-weight: 600;
            opacity: 0.8;
            margin-bottom: 16px;
            z-index: 2;
            position: relative;
        }

        .bio {
            font-size: 14px;
            line-height: 1.6;
            opacity: 0.85;
            margin-bottom: 24px;
            max-width: 360px;
            z-index: 2;
            position: relative;
        }

        /* Botón de Guardar Contacto */
        .btn-save-contact {
            width: 100%;
            padding: 16px 24px;
            background: var(--primary);
            color: #ffffff;
            font-family: var(--font-title);
            font-size: 15px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            transition: all 0.25s ease;
            margin-bottom: 24px;
            z-index: 2;
            position: relative;
        }

        .btn-save-contact:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }

        /* Variantes de botón */
        .btn-apple-wallet {
            background: #000000;
            color: #ffffff;
            margin-bottom: 12px;
            text-transform: none;
            letter-spacing: 0;
        }
        .btn-google-wallet {
            background: #ffffff;
            color: #3c4043;
            border: 1px solid #dadce0;
            margin-bottom: 12px;
            text-transform: none;
            letter-spacing: 0;
        }
        .btn-save-secondary {
            background: transparent;
            color: var(--text, #fff);
            border: 1px solid rgba(255,255,255,0.25);
            text-transform: none;
            letter-spacing: 0;
            font-weight: 500;
            font-size: 14px;
        }

        /* Secciones ricas (testimonios, diferenciadores, pasos, FAQ...) */
        .rich-section {
            width: 100%;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: var(--radius);
            padding: 18px 20px;
            z-index: 2;
            position: relative;
        }
        .rich-section-title {
            font-family: var(--font-title);
            font-size: 15px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            opacity: 0.85;
            margin-bottom: 12px;
        }
        .rich-item { padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.06); }
        .rich-item:first-of-type { border-top: none; }
        .rich-item-title { font-weight: 600; font-size: 14px; margin-bottom: 2px; }
        .rich-item-desc { font-size: 13px; opacity: 0.75; line-height: 1.45; }

        /* Bloques de Enlaces Modulares */
        .blocks-container {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 12px;
            z-index: 2;
            position: relative;
        }

        .block-header {
            font-family: var(--font-title);
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--secondary);
            margin-top: 16px;
            text-align: left;
            padding-left: 4px;
        }

        .block-item {
            width: 100%;
            padding: 16px 20px;
            border-radius: var(--radius);
            text-decoration: none;
            color: var(--text-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-weight: 500;
            font-size: 15px;
            cursor: pointer;
        }

        .block-label {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .block-arrow {
            opacity: 0.5;
            font-size: 13px;
        }

        /* Sección Leads (Contacto de Vuelta) */
        .lead-section {
            width: 100%;
            margin-top: 36px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            padding-top: 24px;
            text-align: left;
            z-index: 2;
            position: relative;
        }

        .lead-title {
            font-family: var(--font-title);
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .lead-desc {
            font-size: 13px;
            color: var(--secondary);
            margin-bottom: 16px;
            line-height: 1.5;
        }

        .form-group {
            margin-bottom: 14px;
        }

        .form-input {
            width: 100%;
            padding: 12px 14px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            color: #ffffff;
            font-family: var(--font-body);
            font-size: 14px;
            transition: all 0.2s;
        }

        .form-input:focus {
            outline: none;
            border-color: var(--primary);
            background: rgba(255, 255, 255, 0.08);
        }

        .btn-submit-lead {
            width: 100%;
            padding: 12px;
            background: var(--primary);
            color: #ffffff;
            border: none;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-submit-lead:hover {
            opacity: 0.9;
        }

        .alert-success {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.2);
            color: #34d399;
            padding: 12px;
            border-radius: 10px;
            font-size: 13px;
            margin-bottom: 16px;
            text-align: center;
        }

        /* Branding */
        .branding {
            margin-top: 40px;
            font-size: 11px;
            opacity: 0.4;
            z-index: 2;
            position: relative;
            text-decoration: none;
            color: var(--text-color);
        }
        
        .branding strong {
            font-family: var(--font-title);
        }
    </style>
</head>
<body>

    <div class="card-wrapper">
        <!-- Portada (Cover Photo) -->
        @if($space->cover_url)
            <div class="cover-photo" style="background-image: url('{{ $space->cover_url }}');"></div>
        @else
            <div class="cover-photo" style="background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);"></div>
        @endif

        <!-- Avatar -->
        <div class="avatar-container">
            <img 
                src="{{ $space->avatar_url ?? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' }}" 
                alt="{{ $space->display_name }}" 
                class="avatar"
            />
        </div>

        <!-- Perfil -->
        <h1 class="display-name">{{ $space->display_name }}</h1>
        @if($space->headline)
            <p class="headline">{{ $space->headline }}</p>
        @endif
        @if($space->company)
            <p class="company">{{ $space->company }}</p>
        @endif
        @if($space->bio)
            <p class="bio">{{ $space->bio }}</p>
        @endif

        <!-- Agregar a la wallet nativa del teléfono (modelo rekuCard) -->
        @if($appleWallet)
            <a href="{{ route('spaces.wallet.apple', ['slug' => $space->slug]) }}" class="btn-save-contact btn-apple-wallet">
                 Agregar a Apple Wallet
            </a>
        @endif
        @if($googleWallet)
            <a href="{{ route('spaces.wallet.google', ['slug' => $space->slug]) }}" class="btn-save-contact btn-google-wallet">
                Agregar a Google Wallet
            </a>
        @endif

        <!-- Fallback universal: contactos del teléfono -->
        @if($space->contact_phone || $space->contact_email || $space->contact_website)
            <a href="{{ route('spaces.vcard', ['slug' => $space->slug]) }}" class="btn-save-contact {{ ($appleWallet || $googleWallet) ? 'btn-save-secondary' : '' }}">
                Guardar en contactos del teléfono
            </a>
        @endif

        <!-- Bloques Modulares -->
        @php
            // El tipo viene como enum SpaceBlockType; normalizamos a string.
            $blockType = fn($b) => $b->type instanceof \App\Enums\SpaceBlockType ? $b->type->value : $b->type;
            $richTypes = ['differentiator', 'step', 'faq', 'testimonial', 'client', 'media'];
        @endphp
        <div class="blocks-container {{ $space->theme_template === 'bento' ? 'bento-grid' : '' }}">
            @foreach($space->blocks as $block)
                @php($t = $blockType($block))
                @if($t === 'header')
                    <div class="block-header {{ $space->theme_template === 'bento' ? 'bento-item-full' : '' }}">
                        {{ $block->heading ?? $block->label }}
                    </div>
                @elseif(in_array($t, $richTypes))
                    {{-- Sección rica: encabezado + lista de items del payload data --}}
                    <div class="rich-section">
                        @if($block->heading)
                            <h3 class="rich-section-title">{{ $block->heading }}</h3>
                        @endif
                        @foreach(($block->data ?? []) as $item)
                            <div class="rich-item">
                                @if($t === 'faq')
                                    <p class="rich-item-title">{{ $item['question'] ?? '' }}</p>
                                    <p class="rich-item-desc">{{ $item['answer'] ?? '' }}</p>
                                @elseif($t === 'testimonial')
                                    <p class="rich-item-desc">“{{ $item['quote'] ?? '' }}”</p>
                                    <p class="rich-item-title">{{ $item['author'] ?? '' }}{{ !empty($item['role']) ? ' · '.$item['role'] : '' }}</p>
                                @elseif($t === 'step')
                                    <p class="rich-item-title">{{ !empty($item['order']) ? $item['order'].'. ' : '' }}{{ $item['title'] ?? '' }}</p>
                                    <p class="rich-item-desc">{{ $item['description'] ?? '' }}</p>
                                @else
                                    <p class="rich-item-title">{{ $item['title'] ?? ($item['name'] ?? '') }}</p>
                                    <p class="rich-item-desc">{{ $item['description'] ?? '' }}</p>
                                @endif
                            </div>
                        @endforeach
                    </div>
                @elseif($t === 'whatsapp' && !$block->url)
                    {{-- WhatsApp sin URL configurada: usa el teléfono de contacto si existe --}}
                    @if($space->contact_phone)
                        <a href="https://wa.me/{{ preg_replace('/\D+/', '', $space->contact_phone) }}" target="_blank" class="block-item">
                            <span class="block-label">{{ $block->label }}</span>
                            <span class="block-arrow">➔</span>
                        </a>
                    @endif
                @else
                    <a href="{{ $block->url }}" target="_blank" class="block-item">
                        <span class="block-label">{{ $block->label }}</span>
                        <span class="block-arrow">➔</span>
                    </a>
                @endif
            @endforeach
        </div>

        <!-- Captura de Leads / Contacto de Vuelta -->
        <div class="lead-section">
            <h3 class="lead-title">Envíame un mensaje de vuelta</h3>
            <p class="lead-desc">Deja tus datos para ponernos en contacto de forma directa.</p>
            
            <div id="lead-success" class="alert-success" style="display: none;">
                ¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.
            </div>

            <form id="lead-form">
                @csrf
                <div class="form-group">
                    <input type="text" name="name" class="form-input" placeholder="Nombre completo" required>
                </div>
                <div class="form-group">
                    <input type="email" name="email" class="form-input" placeholder="Correo electrónico" required>
                </div>
                <div class="form-group">
                    <input type="tel" name="phone" class="form-input" placeholder="Teléfono (opcional)">
                </div>
                <div class="form-group">
                    <textarea name="note" class="form-input" placeholder="Mensaje / Nota" rows="3"></textarea>
                </div>
                <button type="submit" id="lead-submit-btn" class="btn-submit-lead">Enviar Datos</button>
            </form>
        </div>

        <!-- Branding Avaspace -->
        @if($space->show_branding)
            <a href="https://spacecard.avaspaceio.com" target="_blank" class="branding">
                Creado con <strong>SpaceCard</strong>
            </a>
        @endif
    </div>

    <!-- Script AJAX para envío de Lead -->
    <script>
        document.getElementById('lead-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const form = this;
            const submitBtn = document.getElementById('lead-submit-btn');
            const successAlert = document.getElementById('lead-success');
            
            submitBtn.disabled = true;
            submitBtn.innerText = 'Enviando...';
            
            const formData = new FormData(form);
            
            fetch("{{ route('spaces.lead.store', ['slug' => $space->slug]) }}", {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    successAlert.style.display = 'block';
                    form.reset();
                    submitBtn.disabled = false;
                    submitBtn.innerText = 'Enviar Datos';
                } else {
                    alert('Error: ' + (data.message || 'Datos incorrectos.'));
                    submitBtn.disabled = false;
                    submitBtn.innerText = 'Enviar Datos';
                }
            })
            .catch(err => {
                console.error(err);
                alert('Ocurrió un error al enviar el formulario.');
                submitBtn.disabled = false;
                submitBtn.innerText = 'Enviar Datos';
            });
        });
    </script>
</body>
</html>
