<!DOCTYPE html>
{{--
    Plantilla de las páginas públicas que se abren al escanear un dispositivo
    (activar, reclamar, sin destino, desactivado, reseñas).
    Mismo estilo que la landing: fondo blanco, franja negra, acento rojo #D42410,
    tipografía Inter / Inter Tight e iconos Material Symbols.
    Secciones: title, icon (nombre de icono Material), content, styles, scripts.
--}}
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'SpaceCard')</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@500;600;700&display=swap" rel="stylesheet">
    @include('partials.icon-font')
    <style>
        :root {
            --primary: #D42410;
            --primary-hover: #B81E0C;
            --primary-soft: #FFF4F2;
            --ink: #171717;
            --text-muted: #525252;
            --line: rgba(0, 0, 0, 0.07);
            --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            --font-title: 'Inter Tight', 'Inter', sans-serif;
            --ease: cubic-bezier(0.22, 1, 0.36, 1);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            background: linear-gradient(90deg, #ffffff 45%, #F4F4F5);
            color: var(--ink);
            font-family: var(--font-sans);
            font-size: 15px;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            overflow-x: hidden;
        }
        .ms {
            font-family: 'Material Symbols Rounded';
            font-weight: normal; font-style: normal; line-height: 1;
            letter-spacing: normal; text-transform: none; display: inline-block;
            white-space: nowrap; direction: ltr; font-feature-settings: 'liga';
            -webkit-font-smoothing: antialiased; vertical-align: middle;
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .ms-fill { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }

        @keyframes sc-rise { from { opacity: 0; transform: translate3d(0, 20px, 0); } to { opacity: 1; transform: none; } }
        .sc-rise { animation: sc-rise .9s var(--ease) both; }
        @media (prefers-reduced-motion: reduce) { .sc-rise { animation: none; } }

        /* Barra superior, como la landing */
        .topbar { border-bottom: 1px solid var(--line); background: rgba(255,255,255,.95); }
        .topbar-in { max-width: 1120px; margin: 0 auto; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .topbar img { height: 28px; width: auto; display: block; }
        .topbar-link { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 999px; background: var(--primary); color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; box-shadow: 0 8px 20px rgba(212,36,16,.28); transition: transform .2s var(--ease), background .2s; }
        .topbar-link:hover { background: var(--primary-hover); transform: translateY(-1px); }

        main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 16px; position: relative; overflow: hidden; }
        main::before { content: ''; position: absolute; width: min(520px, 100%); aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle, rgba(212,36,16,.10), transparent 65%); top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; }

        .container {
            position: relative;
            width: 100%;
            max-width: 480px;
            background: #fff;
            border: 1px solid var(--line);
            border-radius: 28px;
            padding: 40px 32px 32px;
            text-align: center;
            box-shadow: 0 30px 60px -20px rgba(0,0,0,.18);
            overflow: hidden;
        }
        .container::before { content: ''; position: absolute; inset: 0 0 auto 0; height: 5px; background: var(--primary); }

        .icon-hero { width: 64px; height: 64px; margin: 0 auto 20px; border-radius: 20px; background: var(--primary-soft); color: var(--primary); display: flex; align-items: center; justify-content: center; }
        .icon-hero .ms { font-size: 34px; }
        .icon-hero.muted { background: #F4F4F5; color: #525252; }
        .icon-hero.ok { background: #ECFDF5; color: #047857; }

        .badge, .kicker { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--primary); margin-bottom: 10px; }
        .badge-info { color: var(--primary); }
        .badge.muted { color: #737373; }

        .title { font-family: var(--font-title); font-size: 30px; font-weight: 700; line-height: 1.08; letter-spacing: -0.03em; margin-bottom: 12px; color: var(--ink); }
        .title .hl { color: var(--primary); }
        .description { color: var(--text-muted); font-size: 15px; margin-bottom: 24px; }
        .description strong { color: var(--ink); }

        .code-chip { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 24px; padding: 8px 14px; border-radius: 999px; background: #F5F5F5; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; font-weight: 700; color: var(--ink); }
        .code-chip .ms { font-size: 18px; color: var(--primary); }

        .steps { list-style: none; text-align: left; display: grid; gap: 10px; margin: 0 0 26px; }
        .steps li { display: flex; gap: 12px; align-items: flex-start; padding: 12px 14px; border-radius: 16px; background: #FAFAFA; border: 1px solid var(--line); font-size: 14px; color: var(--text-muted); }
        .steps li strong { color: var(--ink); display: block; font-size: 14px; }
        .steps .n { flex: none; width: 26px; height: 26px; border-radius: 50%; background: var(--primary); color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; }

        .actions { display: flex; flex-direction: column; gap: 10px; width: 100%; }
        .btn {
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            width: 100%; padding: 15px 22px; border: 0; border-radius: 999px; cursor: pointer;
            background: var(--primary); color: #fff; font-family: var(--font-sans); font-size: 15px; font-weight: 600;
            text-decoration: none; box-shadow: 0 10px 24px rgba(212,36,16,.28);
            transition: transform .2s var(--ease), background .2s, box-shadow .2s;
        }
        .btn:hover { background: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 14px 30px rgba(212,36,16,.34); }
        .btn:active { transform: translateY(0); }
        .btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }
        .btn .ms { font-size: 20px; }
        .btn-secondary { background: #fff; color: var(--ink); box-shadow: none; border: 1px solid rgba(0,0,0,.12); }
        .btn-secondary:hover { background: #FAFAFA; border-color: rgba(0,0,0,.25); box-shadow: none; }

        .note { display: flex; gap: 8px; align-items: flex-start; text-align: left; margin-top: 18px; font-size: 12px; color: #737373; }
        .note .ms { font-size: 16px; color: #A3A3A3; }

        /* Formularios */
        .form-group { text-align: left; margin-bottom: 16px; }
        .form-label { display: block; font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 6px; }
        .form-input, .form-textarea {
            width: 100%; padding: 13px 15px; border-radius: 14px; border: 1px solid rgba(0,0,0,.12);
            background: #fff; color: var(--ink); font-family: var(--font-sans); font-size: 15px; transition: border-color .2s, box-shadow .2s;
        }
        .form-input:focus, .form-textarea:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 4px rgba(212,36,16,.12); }
        .alert-success { display: flex; gap: 8px; align-items: flex-start; text-align: left; background: #ECFDF5; border: 1px solid #A7F3D0; color: #047857; padding: 14px; border-radius: 16px; font-size: 14px; margin-bottom: 20px; }

        /* Franja negra inferior, como la landing */
        .footer { background: #0B0B0B; color: rgba(255,255,255,.6); font-size: 12px; }
        .footer-in { max-width: 1120px; margin: 0 auto; padding: 22px 20px; display: flex; flex-wrap: wrap; gap: 8px 20px; justify-content: space-between; }
        .footer a { color: #fff; text-decoration: none; font-weight: 600; }
        .footer a:hover { color: #FF5A3C; }

        @media (max-width: 480px) {
            .container { padding: 36px 22px 26px; border-radius: 24px; }
            .title { font-size: 26px; }
        }
    </style>
    @yield('styles')
</head>
<body>
    <header class="topbar">
        <div class="topbar-in">
            <a href="/" aria-label="SpaceCard, ir al inicio"><img src="/img/spacecard-logo.svg" alt="SpaceCard" width="748" height="176"></a>
            @auth
                <a href="{{ route('dashboard') }}" class="topbar-link">Mi panel <span class="ms" aria-hidden="true">arrow_forward</span></a>
            @else
                <a href="{{ route('login') }}" class="topbar-link">Entrar <span class="ms" aria-hidden="true">arrow_forward</span></a>
            @endauth
        </div>
    </header>

    <main>
        <div class="container sc-rise">
            @hasSection('icon')
                <div class="icon-hero @yield('icon_tone')"><span class="ms" aria-hidden="true">@yield('icon')</span></div>
            @endif
            @yield('content')
        </div>
    </main>

    <footer class="footer">
        <div class="footer-in">
            <span>© {{ date('Y') }} SpaceCard · AVASPACE®</span>
            <span>Desarrollado por <a href="https://avaspaceio.com" target="_blank" rel="noopener">Avaspace</a></span>
        </div>
    </footer>
    @yield('scripts')
    @include('partials.notify')
</body>
</html>
