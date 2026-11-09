<!DOCTYPE html>
<!--
  Vista pública de compras y personalización de hardware antes de registrarse.
  Última modificación: 2026-08-06
  Autor: Antigravity
-->
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>SpaceShop | Diseña y compra tu tarjeta NFC</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    
    <!-- Google Fonts: tipografía e iconos (Material Symbols) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    @include('partials.icon-font')

    <!-- Estilo alineado con la landing: negro, acento rojo, paneles translúcidos -->
    <style>
        :root {
            --primary: #D42410;
            --primary-hover: #B81E0C;
            --primary-text: #FF5A3C;
            --primary-glow: rgba(255, 40, 10, 0.35);
            --bg-dark: #070707;
            --card-dark: #111111;
            --border-color: rgba(255, 255, 255, 0.10);
            --text-light: #F5F5F5;
            --text-muted: #A3A3A3;
            --font-title: 'Inter Tight', sans-serif;
            --font-body: 'Inter', sans-serif;
            --ease: cubic-bezier(0.22, 1, 0.36, 1);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: var(--bg-dark);
            color: var(--text-light);
            font-family: var(--font-body);
            min-height: 100vh;
            overflow-x: hidden;
        }

        /* Iconos Material Symbols */
        .ms {
            font-family: 'Material Symbols Rounded';
            font-weight: normal;
            font-style: normal;
            line-height: 1;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            direction: ltr;
            font-feature-settings: 'liga';
            -webkit-font-smoothing: antialiased;
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }
        .ms-fill { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }

        /* ---- Animaciones orgánicas (ligeras: solo transform y opacity) ---- */
        @keyframes sc-rise {
            from { opacity: 0; transform: translate3d(0, 24px, 0); }
            to { opacity: 1; transform: none; }
        }
        @keyframes sc-swap {
            from { opacity: 0; transform: translate3d(0, 10px, 0) scale(0.98); }
            to { opacity: 1; transform: none; }
        }
        @keyframes sc-flip {
            from { opacity: 0.2; transform: perspective(900px) rotateY(80deg) scale(0.96); }
            to { opacity: 1; transform: perspective(900px) rotateY(0) scale(1); }
        }
        @keyframes sc-blob {
            0%, 100% { transform: translate3d(-50%, -50%, 0) scale(1); }
            33% { transform: translate3d(-46%, -54%, 0) scale(1.08); }
            66% { transform: translate3d(-54%, -47%, 0) scale(0.95); }
        }
        @keyframes sc-bob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        @keyframes sc-pop {
            0% { transform: scale(1); }
            40% { transform: scale(1.35); }
            100% { transform: scale(1); }
        }
        .sc-rise { animation: sc-rise 1s var(--ease) both; }
        .sc-swap { animation: sc-swap 0.7s var(--ease) both; }
        .sc-flip { animation: sc-flip 0.8s var(--ease) both; }
        .sc-bob { animation: sc-bob 6s ease-in-out infinite; }
        .sc-pop { animation: sc-pop 0.5s var(--ease); }

        @media (prefers-reduced-motion: reduce) {
            .sc-rise, .sc-swap, .sc-flip, .sc-bob, .sc-pop, .preview-glow { animation: none !important; }
        }

        /* Contenedor general, como la landing */
        .frame {
            max-width: 1360px;
            margin: 0 auto;
            min-height: 100vh;
        }

        header {
            padding: 18px 28px;
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.07);
            background-color: rgba(7, 7, 7, 0.95);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .logo {
            font-family: var(--font-title);
            font-size: 19px;
            font-weight: 600;
            letter-spacing: -0.02em;
            color: #ffffff;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .logo .accent {
            font-family: var(--font-title);
            font-size: 15px;
            font-weight: 600;
            color: var(--primary-text);
        }

        .header-meta {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 14px;
            border-radius: 999px;
            border: 1px solid var(--border-color);
            background: rgba(255, 255, 255, 0.03);
            font-size: 13px;
            color: var(--text-muted);
        }
        .header-meta a { color: var(--primary-text); text-decoration: none; font-weight: 600; }
        .header-meta a:hover { color: #fff; }

        .container {
            max-width: 1240px;
            margin: 32px auto 40px;
            padding: 0 24px;
            width: 100%;
            display: grid;
            grid-template-columns: 1fr;
            gap: 24px;
        }

        @media(min-width: 992px) {
            .container {
                grid-template-columns: 1.2fr 1fr;
                align-items: start;
            }
        }

        /* Vista previa (columna izquierda) */
        .preview-column {
            position: sticky;
            top: 96px;
            height: fit-content;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(180deg, #1A1A1A, #0E0E0E);
            border: 1px solid var(--border-color);
            border-radius: 26px;
            padding: 40px 28px;
            overflow: hidden;
            isolation: isolate;
        }
        @media (max-width: 991px) {
            .preview-column { position: relative; top: 0; }
        }

        /* Luz orgánica detrás del producto */
        .preview-glow {
            position: absolute;
            left: 50%;
            top: 52%;
            width: 520px;
            height: 520px;
            max-width: 120%;
            background: radial-gradient(closest-side, rgba(255, 40, 10, 0.40), rgba(255, 40, 10, 0.10) 55%, transparent);
            will-change: transform;
            z-index: -1;
            pointer-events: none;
            animation: sc-blob 18s ease-in-out infinite;
        }

        .preview-title {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 14px 6px 10px;
            border-radius: 999px;
            border: 1px solid var(--border-color);
            background: rgba(255, 255, 255, 0.05);
            font-size: 12px;
            font-weight: 500;
            color: #E5E5E5;
            margin-bottom: 28px;
        }
        .preview-title .ms { font-size: 16px; color: var(--primary-text); }

        /* Mockup Placa Reviews Google */
        .mockup-plate-view {
            display: none;
            width: 100%;
            max-width: 300px;
            aspect-ratio: 1/1.3;
            background: #ffffff;
            color: #1e293b;
            border-radius: 20px;
            padding: 24px;
            box-shadow: 0 30px 60px rgba(255, 40, 10, 0.18), 0 20px 45px rgba(0,0,0,0.5);
            border: 3px solid #f1f5f9;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            text-align: center;
        }

        .plate-header {
            display: flex;
            align-items: center;
            gap: 6px;
            font-family: var(--font-title);
            font-weight: 700;
            font-size: 14px;
            color: #475569;
        }

        .plate-header svg {
            width: 20px;
            height: 20px;
        }

        .plate-body {
            margin: 20px 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
        }

        .google-logo {
            font-family: var(--font-title);
            font-weight: 700;
            font-size: 24px;
            letter-spacing: -0.5px;
        }

        .google-logo span:nth-child(1) { color: #4285F4; }
        .google-logo span:nth-child(2) { color: #EA4335; }
        .google-logo span:nth-child(3) { color: #FBBC05; }
        .google-logo span:nth-child(4) { color: #4285F4; }
        .google-logo span:nth-child(5) { color: #34A853; }
        .google-logo span:nth-child(6) { color: #EA4335; }

        .plate-stars { color: #fbbf24; display: flex; gap: 2px; }
        .plate-stars .ms { font-size: 22px; }

        .plate-cta {
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #1e293b;
            margin-top: 4px;
        }

        .plate-qr-placeholder {
            width: 100px;
            height: 100px;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 12px 0;
            color: #94a3b8;
        }
        .plate-qr-placeholder .ms { font-size: 56px; }

        .plate-client-logo {
            max-width: 70px;
            max-height: 35px;
            object-fit: contain;
            opacity: 0.85;
            margin-top: 10px;
        }

        /* Formulario (columna derecha) */
        .form-column {
            background-color: var(--card-dark);
            border: 1px solid var(--border-color);
            border-radius: 26px;
            padding: 32px;
        }
        @media (max-width: 640px) {
            .form-column { padding: 22px; }
        }

        .form-kicker {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 5px 12px;
            border-radius: 999px;
            background: #ffffff;
            color: #141414;
            font-size: 12px;
            font-weight: 600;
        }
        .form-kicker::before {
            content: '';
            width: 6px;
            height: 6px;
            border-radius: 999px;
            background: var(--primary);
            animation: sc-pop 2s var(--ease) infinite;
        }

        .form-title {
            font-family: var(--font-title);
            font-size: clamp(32px, 3.4vw, 44px);
            line-height: 1;
            font-weight: 400;
            letter-spacing: -0.04em;
            margin: 18px 0 28px;
        }
        .form-title span { color: var(--primary-text); }

        .form-group {
            margin-bottom: 20px;
        }

        .form-label {
            display: block;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--text-muted);
            margin-bottom: 8px;
        }

        .form-input, select, textarea {
            width: 100%;
            padding: 13px 16px;
            background-color: #0A0A0A;
            border: 1px solid var(--border-color);
            border-radius: 14px;
            color: #ffffff;
            font-family: var(--font-body);
            font-size: 14px;
            transition: border-color 0.3s var(--ease), box-shadow 0.3s var(--ease), background-color 0.3s var(--ease);
        }

        .form-input:hover, select:hover, textarea:hover { border-color: rgba(255, 255, 255, 0.2); }

        .form-input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: var(--primary-text);
            box-shadow: 0 0 0 4px rgba(255, 59, 31, 0.15);
            background-color: #0E0E0E;
        }

        /* Selector de tipo de producto */
        .product-selector {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 10px;
            margin-bottom: 24px;
        }

        .product-option-card {
            border: 1px solid var(--border-color);
            background-color: #0A0A0A;
            color: var(--text-light);
            font-family: var(--font-body);
            border-radius: 18px;
            padding: 16px 10px;
            text-align: center;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            transition: border-color 0.4s var(--ease), background-color 0.4s var(--ease), transform 0.4s var(--ease);
        }
        .product-option-card .ms {
            font-size: 26px;
            color: var(--primary-text);
            transition: transform 0.5s var(--ease);
        }

        .product-option-card:hover {
            border-color: rgba(255, 255, 255, 0.22);
            transform: translateY(-2px);
        }
        .product-option-card:hover .ms { transform: rotate(-10deg) scale(1.1); }

        .product-option-card.active {
            border-color: rgba(255, 59, 31, 0.6);
            background-color: rgba(255, 59, 31, 0.10);
        }

        .product-opt-title {
            font-family: var(--font-title);
            font-size: 14px;
            font-weight: 600;
            color: #ffffff;
        }

        .product-opt-price {
            font-family: var(--font-title);
            font-size: 13px;
            color: var(--text-muted);
        }

        /* Secciones de configuración */
        .config-section {
            border-top: 1px solid rgba(255, 255, 255, 0.07);
            padding-top: 22px;
            margin-top: 22px;
        }

        .config-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: var(--font-title);
            font-size: 18px;
            font-weight: 500;
            letter-spacing: -0.01em;
            margin-bottom: 16px;
        }
        .config-title .ms { font-size: 22px; color: var(--primary-text); }

        /* Colores */
        .color-inputs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }

        .color-picker-wrapper {
            display: flex;
            align-items: center;
            gap: 10px;
            background-color: #0A0A0A;
            border: 1px solid var(--border-color);
            border-radius: 14px;
            padding: 8px 12px;
        }

        .color-picker {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            width: 28px;
            height: 28px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            background: none;
        }

        .color-picker::-webkit-color-swatch {
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 999px;
        }

        .color-picker-text {
            font-family: var(--font-body);
            font-size: 13px;
            text-transform: uppercase;
            font-weight: 600;
        }

        /* Carga de logo */
        .file-upload-zone {
            border: 1.5px dashed rgba(255, 255, 255, 0.16);
            border-radius: 16px;
            padding: 22px;
            text-align: center;
            cursor: pointer;
            background-color: #0A0A0A;
            transition: border-color 0.3s var(--ease), background-color 0.3s var(--ease);
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
        }
        .file-upload-zone > .ms {
            font-size: 28px;
            color: var(--primary-text);
            transition: transform 0.5s var(--ease);
        }

        .file-upload-zone:hover {
            border-color: var(--primary-text);
            background-color: rgba(255, 59, 31, 0.05);
        }
        .file-upload-zone:hover > .ms { transform: translateY(-4px); }

        .file-upload-text {
            font-size: 13px;
            color: var(--text-muted);
        }

        .file-upload-text strong {
            color: var(--primary-text);
        }

        .file-input {
            position: absolute;
            inset: 0;
            opacity: 0;
            cursor: pointer;
            width: 100%;
        }

        /* Colores de pulsera */
        .bracelet-color-selector {
            display: flex;
            gap: 14px;
            margin-bottom: 12px;
        }

        .bracelet-color-btn {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            cursor: pointer;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.4s var(--ease), box-shadow 0.4s var(--ease);
        }
        .bracelet-color-btn:hover { transform: scale(1.08); }

        .bracelet-color-btn.active {
            box-shadow: 0 0 0 3px var(--bg-dark), 0 0 0 5px #F5F5F5;
            transform: scale(1.08);
        }

        .btn-white { background-color: #ffffff; }
        .btn-red { background-color: #ef4444; }
        .btn-black { background-color: #18181b; }

        /* Botón de checkout */
        .btn-checkout {
            width: 100%;
            padding: 17px;
            background: var(--primary);
            color: #ffffff;
            font-family: var(--font-body);
            font-weight: 600;
            font-size: 15px;
            border: none;
            border-radius: 999px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: background-color 0.3s var(--ease), transform 0.3s var(--ease), box-shadow 0.3s var(--ease);
            margin-top: 10px;
            box-shadow: 0 10px 30px var(--primary-glow);
        }
        .btn-checkout .ms { transition: transform 0.3s var(--ease); }

        .btn-checkout:hover {
            background: var(--primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 16px 40px rgba(255, 40, 10, 0.5);
        }
        .btn-checkout:hover .ms { transform: translateX(4px); }

        /* ===================== DISEÑADOR DE TARJETA (2 CARAS) ===================== */
        .designer-stage { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .side-toggle { display: inline-flex; background: rgba(255,255,255,0.04); border: 1px solid var(--border-color); border-radius: 999px; padding: 4px; }
        .side-toggle.inline { margin-top: 6px; }
        .side-btn { border: none; background: transparent; color: var(--text-muted); font-family: var(--font-body); font-size: 12px; font-weight: 600; padding: 8px 18px; border-radius: 999px; cursor: pointer; transition: background-color .4s var(--ease), color .4s var(--ease); }
        .side-btn:hover { color: #fff; }
        .side-btn.active { background: var(--primary); color: #fff; box-shadow: 0 4px 14px var(--primary-glow); }

        .card-canvas {
            position: relative; width: 100%; max-width: 380px; aspect-ratio: 1.586 / 1;
            border-radius: 20px; overflow: hidden; user-select: none; touch-action: none;
            box-shadow: 0 30px 60px -12px rgba(255,40,10,.25), 0 25px 50px -12px rgba(0,0,0,.7), inset 0 0 0 1px rgba(255,255,255,.06);
            background: linear-gradient(135deg, #D42410, #070707);
        }
        .card-canvas::after { /* barniz sutil */ content:''; position:absolute; inset:0; background: radial-gradient(120% 120% at 0% 0%, rgba(255,255,255,.12), transparent 45%); pointer-events:none; }
        .card-chip { position:absolute; top:14px; right:14px; opacity:.8; color:#fff; transition: opacity .4s var(--ease); }
        .card-chip .ms { font-size: 24px; }
        .card-brand { position:absolute; bottom:12px; left:16px; font-size:9px; letter-spacing:1px; font-weight:700; color:rgba(255,255,255,.75); }

        .card-el { position:absolute; transform: translate(-50%,-50%); cursor: grab; }
        /* Hasta que el diseñador coloca los elementos, no se muestran (si no,
           el QR, el logo y la info aparecen amontonados en una esquina). */
        .card-canvas:not(.is-ready) .card-el { visibility: hidden; }
        .card-el:active { cursor: grabbing; }
        .card-el.selected { outline: 2px dashed rgba(255,255,255,.8); outline-offset: 4px; border-radius: 6px; }
        .card-el.hidden-el { display:none; }
        .el-logo-img { width:100%; height:100%; object-fit: contain; display:block; pointer-events:none; }
        .el-logo-dummy { display:flex; align-items:center; justify-content:center; width:100%; height:100%; border:1.5px dashed rgba(255,255,255,.35); border-radius:8px; color:rgba(255,255,255,.55); font-size:11px; font-weight:700; font-family:var(--font-title); text-align:center; }
        .qr-box { width:100%; height:100%; background:#fff; border-radius:8px; display:flex; align-items:center; justify-content:center; }
        .qr-box svg { width:82%; height:82%; }
        .info-block { display:flex; flex-direction:column; gap:1px; pointer-events:none; }
        .info-block .i-name { font-family:var(--font-title); font-weight:700; line-height:1.1; }
        .info-block .i-title { opacity:.9; }
        .info-block .i-line { opacity:.8; }
        .designer-hint { display:flex; align-items:center; justify-content:center; gap:6px; font-size:12px; color:var(--text-muted); text-align:center; margin:0; }
        .designer-hint .ms { font-size: 18px; color: var(--primary-text); }

        /* Controles del diseñador */
        .ctrl-group { margin-bottom: 18px; }
        .seg { display:inline-flex; background:rgba(255,255,255,.04); border:1px solid var(--border-color); border-radius:999px; padding:4px; margin-top:6px; }
        .seg-btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; border:none; background:transparent; color:var(--text-muted); font-family:var(--font-body); font-size:12px; font-weight:600; padding:8px 14px; border-radius:999px; cursor:pointer; transition: background-color .4s var(--ease), color .4s var(--ease); }
        .seg-btn .ms { font-size: 18px; }
        .seg-btn:hover { color:#fff; }
        .seg-btn.active { background:var(--primary); color:#fff; }
        .el-card { border:1px solid var(--border-color); border-radius:18px; padding:16px; margin-bottom:12px; background:rgba(255,255,255,.02); transition: border-color .4s var(--ease); }
        .el-card:hover { border-color: rgba(255,255,255,.18); }
        .el-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .el-head span { display:inline-flex; align-items:center; gap:8px; font-size:14px; font-weight:600; color:var(--text-light); }
        .el-head .ms { font-size: 20px; color: var(--primary-text); }
        .el-row { display:flex; align-items:center; gap:10px; margin-top:10px; font-size:12px; color:var(--text-muted); }
        .el-row select, .el-row input[type=range] { flex:1; }
        .el-select { background:#0A0A0A; border:1px solid var(--border-color); color:var(--text-light); border-radius:10px; padding:7px 10px; font-size:12px; }
        input[type=range] { accent-color: var(--primary); }
        .switch { position:relative; display:inline-block; width:40px; height:24px; }
        .switch input { opacity:0; width:0; height:0; }
        .switch .slider { position:absolute; inset:0; background:#2A2A2A; border-radius:999px; transition: background-color .4s var(--ease); cursor:pointer; }
        .switch .slider::before { content:''; position:absolute; height:18px; width:18px; left:3px; top:3px; background:#fff; border-radius:50%; transition: transform .5s var(--ease); }
        .switch input:checked + .slider { background: var(--primary); }
        .switch input:checked + .slider::before { transform: translateX(16px); }
        .switch input:focus-visible + .slider { box-shadow: 0 0 0 3px rgba(255,59,31,.35); }
        .mini-input { width:100%; background:#0A0A0A; border:1px solid var(--border-color); color:var(--text-light); border-radius:10px; padding:10px 12px; font-size:13px; margin-top:6px; transition: border-color .3s var(--ease); }
        .mini-input:focus { outline:none; border-color: var(--primary-text); }
        .mini-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }

        /* Diseños de catálogo */
        .preset-strip { display:flex; gap:8px; overflow-x:auto; padding:8px 2px; margin-top:6px; }
        .preset-thumb { flex:0 0 auto; width:64px; padding:0; border:2px solid transparent; border-radius:12px; background:transparent; cursor:pointer; overflow:hidden; transition: transform .4s var(--ease), border-color .4s var(--ease); }
        .preset-thumb img { width:100%; display:block; }
        .preset-thumb:hover { transform:translateY(-3px); }
        .preset-thumb.active { border-color: var(--primary-text); box-shadow:0 6px 18px var(--primary-glow); }
        .preset-note { display:flex; gap:8px; align-items:flex-start; margin-top:12px; padding:12px 14px; border-radius:14px; background:rgba(110,231,183,.07); border:1px solid rgba(110,231,183,.2); color:#A7F3D0; font-size:12px; line-height:1.5; }
        .preset-note .ms { font-size: 18px; color: #6EE7B7; }

        /* Carrito */
        .btn-add-cart { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:14px; border:1.5px dashed rgba(255,59,31,.55); background:rgba(255,59,31,.06); color:var(--primary-text); font-family:var(--font-body); font-weight:600; font-size:14px; border-radius:999px; cursor:pointer; margin:8px 0 18px; transition: background-color .3s var(--ease), border-color .3s var(--ease); }
        .btn-add-cart .ms { transition: transform .5s var(--ease); }
        .btn-add-cart:hover { background:rgba(255,59,31,.14); border-color: var(--primary-text); }
        .btn-add-cart:hover .ms { transform: rotate(90deg); }
        .cart-panel { border:1px solid var(--border-color); border-radius:18px; padding:18px; margin-bottom:22px; background:rgba(255,255,255,.02); transition: box-shadow .35s var(--ease); }
        .cart-count { background:var(--primary); color:#fff; font-size:12px; min-width:24px; height:24px; padding:0 7px; border-radius:999px; display:inline-flex; align-items:center; justify-content:center; }
        .cart-empty { font-size:13px; color:var(--text-muted); margin:6px 0 0; }
        .cart-item { display:flex; align-items:center; gap:12px; padding:12px 0; border-top:1px solid rgba(255,255,255,.07); animation: sc-swap .6s var(--ease) both; }
        .cart-item:first-child { border-top:none; }
        .cart-thumb { width:46px; height:30px; border-radius:7px; flex-shrink:0; background:linear-gradient(135deg,#D42410,#070707); display:flex; align-items:center; justify-content:center; overflow:hidden; color:#fff; }
        .cart-thumb .ms { font-size: 18px; }
        .cart-thumb img { width:100%; height:100%; object-fit:contain; }
        .cart-info { flex:1; min-width:0; }
        .cart-info .ci-name { font-size:13px; font-weight:600; color:var(--text-light); }
        .cart-info .ci-meta { font-size:11px; color:var(--text-muted); }
        .cart-price { font-family: var(--font-title); font-size:14px; font-weight:600; color:var(--text-light); }
        .cart-remove { width:36px; height:36px; display:inline-flex; align-items:center; justify-content:center; background:none; border:none; border-radius:999px; color:var(--text-muted); cursor:pointer; transition: background-color .3s var(--ease), color .3s var(--ease); }
        .cart-remove:hover { background: rgba(255,59,31,.12); color: var(--primary-text); }
        .cart-remove .ms { font-size: 20px; }
        .cart-total-row { display:flex; justify-content:space-between; align-items:center; margin-top:12px; padding-top:12px; border-top:1px solid rgba(255,255,255,.07); font-family: var(--font-title); font-weight:600; font-size:18px; color:var(--text-light); }
        .btn-checkout:disabled { opacity:.5; cursor:not-allowed; }

        /* =====================================================================
           Tema claro, como la portada: página blanca, formulario en tarjeta
           blanca y la vista previa en un panel negro (la "franja negra").
           Las variables se redefinen: claras en la página, oscuras dentro del
           panel de vista previa, así cada lado conserva su contraste.
           ===================================================================== */
        :root {
            --primary-text: #D42410;
            --bg-dark: #F6F6F7;
            --card-dark: #FFFFFF;
            --border-color: rgba(0, 0, 0, 0.09);
            --text-light: #171717;
            --text-muted: #6B6B6B;
        }
        .preview-column {
            --primary-text: #FF5A3C;
            --bg-dark: #0B0B0B;
            --border-color: rgba(255, 255, 255, 0.10);
            --text-light: #F5F5F5;
            --text-muted: #A3A3A3;
            color: var(--text-light);
            background: #0B0B0B;
            border: none;
            box-shadow: 0 30px 70px rgba(0, 0, 0, 0.18);
        }
        /* Esquina roja del panel negro, como en la portada */
        .preview-column::before {
            content: '';
            position: absolute;
            right: -24px;
            top: 0;
            width: 200px;
            height: 96px;
            background: var(--primary);
            clip-path: polygon(30% 0, 100% 0, 100% 100%);
            z-index: -1;
        }
        .preview-column .side-btn:hover, .preview-column .seg-btn:hover { color: #fff; }

        body { background: linear-gradient(90deg, #FFFFFF 40%, #F4F4F5); }

        header {
            background-color: rgba(255, 255, 255, 0.96);
            border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }
        .logo { color: #171717; }
        .header-meta { background: #fff; }
        .header-meta a:hover { color: #171717; }

        .form-column {
            border: 1px solid rgba(0, 0, 0, 0.07);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }
        /* Etiqueta en rojo y mayúsculas, como los "kickers" de la portada */
        .form-kicker {
            padding: 0;
            background: none;
            color: var(--primary);
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.18em;
            text-transform: uppercase;
        }
        /* Titular en negrita con la palabra clave en el bloque rojo inclinado */
        .form-title { font-weight: 700; line-height: 1.05; letter-spacing: -0.035em; color: #171717; }
        .form-title span {
            position: relative;
            display: inline-block;
            margin-top: 6px;
            padding: 0 12px;
            color: #fff;
            isolation: isolate;
        }
        .form-title span::before {
            content: '';
            position: absolute;
            inset: 0;
            z-index: -1;
            border-radius: 6px;
            background: var(--primary);
            transform: skewX(-12deg);
            box-shadow: 0 10px 24px rgba(212, 36, 16, 0.35);
        }
        .config-title { font-weight: 700; color: #171717; }
        .config-section { border-top-color: rgba(0, 0, 0, 0.07); }

        .form-input, select, textarea, .el-select, .mini-input, .color-picker-wrapper {
            background-color: #FAFAFA;
            color: #171717;
        }
        .form-input:hover, select:hover, textarea:hover { border-color: rgba(0, 0, 0, 0.25); }
        .form-input:focus, select:focus, textarea:focus {
            background-color: #FFFFFF;
            box-shadow: 0 0 0 4px rgba(212, 36, 16, 0.12);
        }

        .product-option-card { background-color: #FFFFFF; }
        .product-option-card:hover { border-color: rgba(0, 0, 0, 0.25); }
        .product-option-card.active {
            border-color: var(--primary);
            background-color: #FFF4F2;
            box-shadow: 0 10px 24px rgba(212, 36, 16, 0.12);
        }
        .product-opt-title { color: #171717; }

        .file-upload-zone { background-color: #FAFAFA; border-color: rgba(0, 0, 0, 0.16); }
        .file-upload-zone:hover { background-color: #FFF4F2; }

        .bracelet-color-btn { border-color: rgba(0, 0, 0, 0.15); }
        .bracelet-color-btn.active { box-shadow: 0 0 0 3px #fff, 0 0 0 5px #171717; }

        .seg { background: #F2F2F3; }
        .seg-btn:hover { color: #171717; }
        .seg-btn.active { box-shadow: 0 6px 16px rgba(212, 36, 16, 0.3); }
        .el-card { background: #FFFFFF; }
        .el-card:hover { border-color: rgba(0, 0, 0, 0.2); }
        .switch .slider { background: #E5E5E5; }
        .color-picker::-webkit-color-swatch { border-color: rgba(0, 0, 0, 0.15); }

        .preset-note { background: #ECFDF5; border-color: rgba(5, 150, 105, 0.2); color: #065F46; }
        .preset-note .ms { color: #059669; }

        .btn-add-cart { background: #FFF4F2; border-color: rgba(212, 36, 16, 0.45); }
        .btn-add-cart:hover { background: #FFE8E3; }
        .cart-panel { background: #FFFFFF; }
        .cart-item, .cart-total-row { border-top-color: rgba(0, 0, 0, 0.07); }
        .cart-remove:hover { background: rgba(212, 36, 16, 0.08); }

        .shop-alert { display: flex; gap: 10px; align-items: flex-start; margin: -8px 0 22px; padding: 14px 16px; border-radius: 16px; background: #FFF4F2; border: 1px solid rgba(212, 36, 16, 0.25); color: #B81E0C; font-size: 13px; line-height: 1.5; animation: sc-swap .6s var(--ease) both; }
        .shop-alert .ms { font-size: 20px; color: var(--primary); }
        .shop-alert strong { display: block; color: #8F1809; }
        .logo-note { display: block; margin-top: 6px; font-size: 12px; color: var(--text-muted); }
    </style>
</head>
<body>

    <div class="frame">
    <header class="sc-rise">
        <a href="/" class="logo">
            <img src="/img/spacecard-logo.svg" alt="SpaceCard" width="748" height="176" style="height:34px;width:auto;display:block;">
            <span class="accent">Shop</span>
        </a>
        <div class="header-meta">
            @auth
                <span class="ms" aria-hidden="true" style="font-size:18px;color:var(--primary-text);">verified_user</span>
                <span>Comprando como <strong style="color:var(--text-light);">{{ auth()->user()->name }}</strong> · se vinculará a tu cuenta</span>
            @else
                <span class="ms" aria-hidden="true" style="font-size:18px;color:var(--primary-text);">login</span>
                <span><a href="{{ route('login') }}">Inicia sesión</a> para vincular la compra a tu cuenta (opcional)</span>
            @endauth
        </div>
    </header>

    <div class="container">

        <!-- Vista previa Mockup (Columna izquierda) -->
        <div class="preview-column sc-rise" style="animation-delay:120ms;">
            <div class="preview-glow" aria-hidden="true"></div>
            <h4 class="preview-title"><span class="ms" aria-hidden="true">visibility</span>Vista previa de impresión</h4>
            
            <!-- Diseñador de Tarjeta (SpaceCard) - 2 caras -->
            <div id="mockup-card-view" class="designer-stage">
                <div class="side-toggle">
                    <button type="button" id="side-front" class="side-btn active" onclick="setSide('front')">Frente</button>
                    <button type="button" id="side-back" class="side-btn" onclick="setSide('back')">Reverso</button>
                </div>

                <div id="card-canvas" class="card-canvas">
                    <div id="card-chip" class="card-chip"><span class="ms" aria-hidden="true">contactless</span></div>

                    <!-- Elemento: Logo -->
                    <div id="el-logo" class="card-el" data-el="logo">
                        <img id="el-logo-img" class="el-logo-img" style="display:none" alt="logo" />
                        <div id="el-logo-dummy" class="el-logo-dummy">TU<br>LOGO</div>
                    </div>

                    <!-- Elemento: QR -->
                    <div id="el-qr" class="card-el" data-el="qr">
                        <div class="qr-box">
                            <svg viewBox="0 0 29 29" shape-rendering="crispEdges"><path fill="#0c0b14" d="M0 0h7v7H0zM8 0h1v1H8zM11 0h2v1h-2zM14 0h1v3h-1zM16 0h1v1h-1zM22 0h7v7h-7zM2 2h3v3H2zM24 2h3v3h-3zM9 3h2v1H9zM12 3h1v2h-1zM18 4h2v2h-2zM8 6h1v2H8zM10 6h1v1h-1zM16 6h1v1h-1zM0 8h1v1H0zM4 8h2v1H4zM11 8h1v1h-1zM20 8h1v1h-1zM26 8h1v1h-1zM28 8h1v1h-1zM2 10h1v1H2zM6 10h3v1H6zM13 10h3v2h-3zM17 10h1v1h-1zM22 10h2v1h-2zM0 12h2v1H0zM9 12h1v2H9zM19 12h2v1h-2zM24 12h5v1h-5zM4 14h3v1H4zM11 14h1v1h-1zM16 14h2v2h-2zM26 14h1v3h-1zM0 16h1v1H0zM7 16h2v1H7zM13 16h2v1h-2zM21 16h2v1h-2zM8 18h1v2H8zM12 18h3v1h-3zM18 18h2v1h-2zM24 18h1v1h-1zM0 20h7v7H0zM10 20h1v1h-1zM16 20h1v3h-1zM20 20h2v1h-2zM24 20h4v1h-4zM2 22h3v3H2zM9 22h1v1H9zM12 22h2v2h-2zM19 22h1v2h-1zM22 22h1v1h-1zM26 22h2v2h-2zM15 24h1v3h-1zM24 24h1v1h-1zM9 26h2v1H9zM18 26h1v2h-1zM21 26h3v1h-3zM26 26h1v1h-1z"/></svg>
                        </div>
                    </div>

                    <!-- Elemento: Información de negocio -->
                    <div id="el-info" class="card-el" data-el="info">
                        <div id="info-block" class="info-block"></div>
                    </div>

                    <div id="card-brand" class="card-brand">SPACECARD® NFC</div>
                </div>

                <p class="designer-hint"><span class="ms" aria-hidden="true">drag_pan</span>Arrastra el logo, la info y el QR para colocarlos · cambia de cara arriba</p>

                <!-- Vista previa del diseño de catálogo (modo prediseñada) -->
                <img id="preset-preview" class="sc-bob" src="/img/products/card-black.png" alt="Diseño AVASPACE" style="display:none; width:100%; max-width:440px; filter: drop-shadow(0 30px 50px rgba(255,40,10,.3));">
                <p id="preset-preview-note" class="designer-hint" style="display:none;">Diseño de catálogo AVASPACE · frente y reverso · se imprime tal cual con tu QR único</p>
            </div>

            <!-- Pulsera SpaceBand (imagen real de producto) -->
            <div id="mockup-bracelet-view" class="bracelet-real" style="display:none; flex-direction:column; align-items:center; gap:14px; width:100%;">
                <img class="sc-bob" loading="lazy" decoding="async" src="/img/products/bracelets.png" alt="SpaceBand NFC" style="width:100%; max-width:420px; filter: drop-shadow(0 30px 50px rgba(255,40,10,.3));">
                <p style="font-size:12px; color:var(--text-muted); text-align:center;">
                    SpaceBand® NFC · disponible en <strong style="color:#ef4444;">rojo</strong>, <strong style="color:var(--text-light);">negro</strong> y <strong style="color:#e5e7eb;">blanco</strong><br>
                    Color seleccionado: <strong id="bracelet-color-label" style="color:var(--text-light);">Blanco</strong>
                </p>
            </div>

            <!-- Mockup de Placa Reviews Google -->
            <div id="mockup-plate-view" class="mockup-plate-view">
                <div class="plate-header">
                    <svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FBBC05" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.5z"/><path fill="#EA4335" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#34A853" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#4285F4" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.5z"/></svg>
                    <span>Valóranos en Google</span>
                </div>
                
                <div class="plate-body">
                    <div class="google-logo">
                        <span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span>
                    </div>
                    <div class="plate-stars" aria-label="5 estrellas">
                        <span class="ms ms-fill" aria-hidden="true">star</span><span class="ms ms-fill" aria-hidden="true">star</span><span class="ms ms-fill" aria-hidden="true">star</span><span class="ms ms-fill" aria-hidden="true">star</span><span class="ms ms-fill" aria-hidden="true">star</span>
                    </div>
                    <div class="plate-cta">¡Escanea y escribe tu reseña!</div>
                    <div class="plate-qr-placeholder"><span class="ms" aria-hidden="true">qr_code_2</span></div>
                    
                    <img id="mockup-plate-logo-img" src="" class="plate-client-logo" style="display: none;" alt="Logo Cliente" />
                    <div id="mockup-plate-logo-dummy" class="plate-client-logo" style="font-family: var(--font-title); font-size:10px; font-weight:700; color:#94a3b8; opacity:0.6;">
                        [ Logo de tu Empresa ]
                    </div>
                </div>
            </div>

        </div>

        <!-- Formulario (Columna derecha) -->
        <div class="form-column sc-rise" style="animation-delay:240ms;">
            <span class="form-kicker">SpaceShop</span>
            <h2 class="form-title">Configura tu<br><span>dispositivo</span></h2>

            {{-- Si la compra no se pudo guardar, se dice por qué (antes regresaba sin avisar). --}}
            @if (session('error') || $errors->any())
                <div class="shop-alert" role="alert">
                    <span class="ms" aria-hidden="true">error</span>
                    <div>
                        <strong>No pudimos guardar tu pedido.</strong>
                        @if (session('error'))<p>{{ session('error') }}</p>@endif
                        @foreach ($errors->all() as $message)<p>{{ $message }}</p>@endforeach
                    </div>
                </div>
            @endif

            <form action="{{ route('shop.checkout') }}" method="POST" id="checkout-form" onsubmit="return prepareCheckout()">
                @csrf
                <input type="hidden" name="product_type" id="product_type" value="card">
                <input type="hidden" id="color_primary" value="#D42410">
                <input type="hidden" id="color_secondary" value="#070707">
                <input type="hidden" id="design_config" value="">
                <input type="hidden" name="cart" id="cart_input" value="">

                <!-- Selector de producto -->
                <div class="form-group">
                    <label class="form-label">Elige tu Producto</label>
                    <div class="product-selector">
                        <button type="button" class="product-option-card active" aria-pressed="true" onclick="selectProduct('card')">
                            <span class="ms" aria-hidden="true">credit_card</span>
                            <span class="product-opt-title">SpaceCard</span>
                            <span class="product-opt-price">${{ $prices['card'] }}</span>
                        </button>
                        <button type="button" class="product-option-card" aria-pressed="false" onclick="selectProduct('bracelet')">
                            <span class="ms" aria-hidden="true">watch</span>
                            <span class="product-opt-title">Pulsera NFC</span>
                            <span class="product-opt-price">${{ $prices['bracelet'] }}</span>
                        </button>
                        <button type="button" class="product-option-card" aria-pressed="false" onclick="selectProduct('review_plate')">
                            <span class="ms" aria-hidden="true">reviews</span>
                            <span class="product-opt-title">Placa Google</span>
                            <span class="product-opt-price">${{ $prices['review_plate'] }}</span>
                        </button>
                    </div>
                </div>

                <!-- Cantidad -->
                <div class="form-group">
                    <label class="form-label" for="quantity">Cantidad de unidades</label>
                    <input type="number" name="quantity" id="quantity" class="form-input" min="1" max="100" value="1" oninput="if(!cart.length) renderCart()" required>
                </div>

                <!-- Configuración dinámica de la Tarjeta (SpaceCard) - Diseñador 2 caras -->
                <div id="config-card-section" class="config-section">
                    <h4 class="config-title"><span class="ms" aria-hidden="true">style</span>Tu tarjeta</h4>

                    <!-- Modo de diseño -->
                    <div class="seg" id="card-mode-seg" style="width:100%; display:flex;">
                        <button type="button" id="mode-preset" class="seg-btn" style="flex:1;" onclick="setCardMode('preset')"><span class="ms" aria-hidden="true">auto_awesome_mosaic</span>Prediseñada</button>
                        <button type="button" id="mode-custom" class="seg-btn active" style="flex:1;" onclick="setCardMode('custom')"><span class="ms" aria-hidden="true">palette</span>Personalizada</button>
                    </div>

                    <!-- MODO PREDISEÑADA (catálogo AVASPACE) -->
                    <div id="card-preset-mode" style="display:none; margin-top:22px;">
                        <label class="form-label">Elige un diseño de catálogo</label>
                        <div class="preset-strip">
                            <button type="button" class="preset-thumb active" data-preset="black"  onclick="pickPreset('black','Negro','#0c0b14')"><img loading="lazy" decoding="async" src="/img/products/thumbs/card-black.png" alt="Negro"></button>
                            <button type="button" class="preset-thumb" data-preset="red"    onclick="pickPreset('red','Rojo','#e11d2a')"><img loading="lazy" decoding="async" src="/img/products/thumbs/card-red.png" alt="Rojo"></button>
                            <button type="button" class="preset-thumb" data-preset="pink"   onclick="pickPreset('pink','Rosa','#d81f8f')"><img loading="lazy" decoding="async" src="/img/products/thumbs/card-pink.png" alt="Rosa"></button>
                            <button type="button" class="preset-thumb" data-preset="purple" onclick="pickPreset('purple','Púrpura','#7c3aed')"><img loading="lazy" decoding="async" src="/img/products/thumbs/card-purple.png" alt="Púrpura"></button>
                            <button type="button" class="preset-thumb" data-preset="blue"   onclick="pickPreset('blue','Azul','#1e40af')"><img loading="lazy" decoding="async" src="/img/products/thumbs/card-blue.png" alt="Azul"></button>
                            <button type="button" class="preset-thumb" data-preset="green"  onclick="pickPreset('green','Verde','#16a34a')"><img loading="lazy" decoding="async" src="/img/products/thumbs/card-green.png" alt="Verde"></button>
                        </div>
                        <div class="preset-note">
                            <span class="ms" aria-hidden="true">check_circle</span>
                            <span>Se imprime <strong>tal cual</strong> el diseño AVASPACE, con tu <strong>código QR único</strong> ya integrado. No requiere edición.</span>
                        </div>
                    </div>

                    <!-- MODO PERSONALIZADA (diseñador 2 caras) -->
                    <div id="card-custom-mode" style="margin-top:22px;">

                    <!-- Cara activa -->
                    <div class="ctrl-group">
                        <label class="form-label">Editando la cara: <strong id="active-side-label" style="color:var(--primary-text);">Frente</strong></label>
                        <div class="side-toggle inline">
                            <button type="button" id="side-front-2" class="side-btn active" onclick="setSide('front')">Frente</button>
                            <button type="button" id="side-back-2" class="side-btn" onclick="setSide('back')">Reverso</button>
                        </div>
                    </div>

                    <!-- Fondo de la cara activa -->
                    <div class="ctrl-group">
                        <label class="form-label">Fondo de esta cara</label>
                        <div class="seg">
                            <button type="button" id="bg-solid" class="seg-btn" onclick="setBgType('solid')">Sólido</button>
                            <button type="button" id="bg-grad" class="seg-btn active" onclick="setBgType('gradient')">Degradado</button>
                        </div>
                        <div class="color-inputs" style="margin-top:10px;">
                            <div class="color-picker-wrapper">
                                <input type="color" id="bgC1" class="color-picker" value="#d42410" oninput="onBgColor()">
                                <span id="bgC1_label" class="color-picker-text">#D42410</span>
                            </div>
                            <div id="bgC2-wrap" class="color-picker-wrapper">
                                <input type="color" id="bgC2" class="color-picker" value="#070707" oninput="onBgColor()">
                                <span id="bgC2_label" class="color-picker-text">#070707</span>
                            </div>
                        </div>
                        <div id="angle-wrap" class="el-row">
                            <span>Ángulo</span>
                            <input type="range" id="bgAngle" min="0" max="360" value="135" oninput="onBgColor()">
                        </div>
                    </div>

                    <!-- Elemento: Logo -->
                    <div class="el-card">
                        <div class="el-head">
                            <span><span class="ms" aria-hidden="true">image</span>Logo</span>
                            <label class="switch"><input type="checkbox" id="logo-on" aria-label="Mostrar logo" checked onchange="toggleEl('logo', this.checked)"><span class="slider"></span></label>
                        </div>
                        <div class="file-upload-zone">
                            <span class="ms" aria-hidden="true">cloud_upload</span>
                            <span class="file-upload-text">Sube tu logo · <strong>clic para buscar</strong></span>
                            <input type="file" id="logo_input" class="file-input" accept="image/*" onchange="previewLogo(this)">
                        </div>
                        <div class="el-row"><span>Cara</span>
                            <select id="logo-side" class="el-select" onchange="setElSide('logo', this.value)">
                                <option value="front">Frente</option><option value="back">Reverso</option>
                            </select>
                        </div>
                        <div class="el-row"><span>Tamaño</span><input type="range" id="logo-size" min="10" max="70" value="30" oninput="setElSize('logo', this.value)"></div>
                        <p class="file-upload-text" style="margin-top:8px;">Arrástralo sobre la tarjeta para colocarlo donde quieras.</p>
                    </div>

                    <!-- Elemento: Información de negocio -->
                    <div class="el-card">
                        <div class="el-head">
                            <span><span class="ms" aria-hidden="true">business_center</span>Información de negocio</span>
                            <label class="switch"><input type="checkbox" id="info-on" aria-label="Mostrar información" checked onchange="toggleEl('info', this.checked)"><span class="slider"></span></label>
                        </div>
                        <input type="text" class="mini-input" id="info-name" placeholder="Nombre" oninput="updateInfo()">
                        <input type="text" class="mini-input" id="info-title" placeholder="Puesto / profesión" oninput="updateInfo()">
                        <input type="text" class="mini-input" id="info-company" placeholder="Empresa" oninput="updateInfo()">
                        <div class="mini-grid">
                            <input type="text" class="mini-input" id="info-phone" placeholder="Teléfono" oninput="updateInfo()">
                            <input type="text" class="mini-input" id="info-website" placeholder="Sitio web" oninput="updateInfo()">
                        </div>
                        <div class="el-row"><span>Cara</span>
                            <select id="info-side" class="el-select" onchange="setElSide('info', this.value)">
                                <option value="front">Frente</option><option value="back">Reverso</option>
                            </select>
                        </div>
                        <div class="el-row"><span>Tamaño</span><input type="range" id="info-size" min="60" max="160" value="100" oninput="setElSize('info', this.value)"></div>
                        <div class="el-row"><span>Alineación</span>
                            <div class="seg" style="margin:0;">
                                <button type="button" class="seg-btn" data-align="left" aria-label="Alinear a la izquierda" onclick="setInfoAlign('left')"><span class="ms" aria-hidden="true">format_align_left</span></button>
                                <button type="button" class="seg-btn active" data-align="center" aria-label="Centrar" onclick="setInfoAlign('center')"><span class="ms" aria-hidden="true">format_align_center</span></button>
                                <button type="button" class="seg-btn" data-align="right" aria-label="Alinear a la derecha" onclick="setInfoAlign('right')"><span class="ms" aria-hidden="true">format_align_right</span></button>
                            </div>
                        </div>
                    </div>

                    <!-- Elemento: QR -->
                    <div class="el-card">
                        <div class="el-head">
                            <span><span class="ms" aria-hidden="true">qr_code_2</span>Código QR</span>
                            <label class="switch"><input type="checkbox" id="qr-on" aria-label="Mostrar código QR" checked onchange="toggleEl('qr', this.checked)"><span class="slider"></span></label>
                        </div>
                        <div class="el-row"><span>Cara</span>
                            <select id="qr-side" class="el-select" onchange="setElSide('qr', this.value)">
                                <option value="front">Frente</option><option value="back" selected>Reverso</option>
                            </select>
                        </div>
                        <div class="el-row"><span>Tamaño</span><input type="range" id="qr-size" min="15" max="55" value="34" oninput="setElSize('qr', this.value)"></div>
                        <p class="file-upload-text" style="margin-top:8px;">El QR real (único por tarjeta) se genera automáticamente al imprimir. Aquí eliges dónde va.</p>
                    </div>

                    </div><!-- /card-custom-mode -->
                </div>

                <!-- Configuración dinámica de la Pulsera (Bracelet) -->
                <div id="config-bracelet-section" class="config-section" style="display: none;">
                    <h4 class="config-title"><span class="ms" aria-hidden="true">watch</span>Color de la pulsera</h4>
                    <input type="hidden" name="color_primary_bracelet" id="color_primary_bracelet" value="white">
                    <div class="form-group">
                        <label class="form-label">Elige un color físico</label>
                        <div class="bracelet-color-selector">
                            <button type="button" id="btn-white" class="bracelet-color-btn btn-white active" aria-label="Blanco" onclick="selectBraceletColor('white')"></button>
                            <button type="button" id="btn-red" class="bracelet-color-btn btn-red" aria-label="Rojo" onclick="selectBraceletColor('red')"></button>
                            <button type="button" id="btn-black" class="bracelet-color-btn btn-black" aria-label="Negro" onclick="selectBraceletColor('black')"></button>
                        </div>
                        <span class="file-upload-text" style="display:block; margin-top:8px;">Las pulseras de fábrica se ofrecen en colores lisos de silicona.</span>
                    </div>
                </div>

                <!-- Configuración dinámica de la Placa Google -->
                <div id="config-plate-section" class="config-section" style="display: none;">
                    <h4 class="config-title"><span class="ms" aria-hidden="true">reviews</span>Personalización de la placa</h4>
                    <div class="form-group">
                        <label class="form-label">Tu logotipo en la placa</label>
                        <div class="file-upload-zone">
                            <span class="ms" aria-hidden="true">cloud_upload</span>
                            <span class="file-upload-text">Sube tu logo para grabarlo al pie de la placa <strong>haz clic aquí</strong></span>
                            <input type="file" id="logo_plate_input" class="file-input" accept="image/*" onchange="previewLogo(this, 'plate')">
                        </div>
                    </div>
                </div>

                <!-- Agregar al carrito -->
                <button type="button" class="btn-add-cart" onclick="addToCart()"><span class="ms" aria-hidden="true">add</span>Agregar al carrito</button>

                <!-- Carrito -->
                <div class="cart-panel" id="cart-panel">
                    <h4 class="config-title" style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="display:inline-flex;align-items:center;gap:8px;"><span class="ms" aria-hidden="true">shopping_bag</span>Tu carrito</span>
                        <span id="cart-count" class="cart-count">0</span>
                    </h4>
                    <div id="cart-items">
                        <p class="cart-empty" id="cart-empty">Aún no has agregado productos. Diseña y pulsa “Agregar al carrito”.</p>
                    </div>
                    <div id="cart-total-row" class="cart-total-row" style="display:none;">
                        <span>Total</span>
                        <span id="cart-total">$0.00</span>
                    </div>
                </div>

                <!-- Información de Envío y Cliente -->
                <div class="config-section">
                    <h4 class="config-title"><span class="ms" aria-hidden="true">local_shipping</span>Datos de entrega y facturación</h4>
                    
                    <div class="form-group">
                        <label class="form-label" for="customer_name">Nombre completo</label>
                        <input type="text" name="customer_name" id="customer_name" class="form-input" placeholder="Nombre completo" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="customer_email">Correo electrónico</label>
                        <input type="email" name="customer_email" id="customer_email" class="form-input" placeholder="correo@ejemplo.com" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="shipping_address">Dirección completa de entrega</label>
                        <textarea name="shipping_address" id="shipping_address" rows="3" class="form-input" placeholder="Calle, Número, Colonia, Código Postal, Ciudad y Estado" required></textarea>
                    </div>
                </div>

                <button type="submit" class="btn-checkout" id="btn-checkout">Finalizar compra · <span id="checkout-total">$29.99</span><span class="ms" aria-hidden="true">arrow_forward</span></button>
            </form>
        </div>

    </div>
    </div><!-- /frame -->

    <!-- Scripts interactivos de Mockups -->
    <script>
        /* ==================== ESTADO DEL DISEÑADOR (2 CARAS) ==================== */
        const D = {
            mode: 'custom',                                   // 'custom' | 'preset'
            preset: { name: 'black', label: 'Negro', color: '#0c0b14' },
            side: 'front',
            bg: {
                front: { type: 'gradient', c1: '#d42410', c2: '#070707', angle: 135 },
                back:  { type: 'solid',    c1: '#070707', c2: '#070707', angle: 135 },
            },
            el: {
                logo: { on: true, side: 'front', x: 50, y: 30, size: 30, hasImg: false },
                info: { on: true, side: 'front', x: 50, y: 74, size: 100, align: 'center',
                        name: '', title: '', company: '', phone: '', website: '' },
                qr:   { on: true, side: 'back',  x: 50, y: 50, size: 34 },
            },
        };

        function $(id) { return document.getElementById(id); }

        // Reinicia una animación CSS (para transiciones al cambiar de producto o cara).
        function replay(el, cls) {
            if (!el) return;
            el.classList.remove(cls);
            void el.offsetWidth;
            el.classList.add(cls);
            el.addEventListener('animationend', () => el.classList.remove(cls), { once: true });
        }

        /* ---- Producto ---- */
        function selectProduct(type) {
            $('product_type').value = type;
            document.querySelectorAll('.product-option-card').forEach(c => {
                c.classList.remove('active');
                c.setAttribute('aria-pressed', 'false');
            });
            event.currentTarget.classList.add('active');
            event.currentTarget.setAttribute('aria-pressed', 'true');

            ['config-card-section','config-bracelet-section','config-plate-section',
             'mockup-card-view','mockup-bracelet-view','mockup-plate-view'].forEach(id => $(id).style.display = 'none');

            if (type === 'card') {
                $('config-card-section').style.display = 'block';
                $('mockup-card-view').style.display = 'flex';
                initDesigner();
            } else if (type === 'bracelet') {
                $('config-bracelet-section').style.display = 'block';
                $('mockup-bracelet-view').style.display = 'flex';
                selectBraceletColor($('color_primary_bracelet').value);
            } else if (type === 'review_plate') {
                $('config-plate-section').style.display = 'block';
                $('mockup-plate-view').style.display = 'flex';
            }
            const views = { card: 'mockup-card-view', bracelet: 'mockup-bracelet-view', review_plate: 'mockup-plate-view' };
            const sections = { card: 'config-card-section', bracelet: 'config-bracelet-section', review_plate: 'config-plate-section' };
            replay($(views[type]), 'sc-swap');
            replay($(sections[type]), 'sc-swap');
            renderCart();
        }

        /* ---- Utilidades de color ---- */
        function bgCss(b) {
            return b.type === 'solid' ? b.c1 : `linear-gradient(${b.angle}deg, ${b.c1} 0%, ${b.c2} 100%)`;
        }
        function contrast(hex) {
            const c = hex.replace('#',''); const r=parseInt(c.substr(0,2),16), g=parseInt(c.substr(2,2),16), b=parseInt(c.substr(4,2),16);
            const L = (0.299*r + 0.587*g + 0.114*b) / 255;
            return L > 0.6 ? '#111827' : '#ffffff';
        }

        /* ---- Render ---- */
        function render() {
            const canvas = $('card-canvas');
            const cw = canvas.clientWidth, side = D.side;
            const b = D.bg[side];
            canvas.style.background = bgCss(b);
            const ink = contrast(b.c1);

            // Decoración por cara
            $('card-chip').style.opacity = side === 'front' ? '0.8' : '0.25';
            $('card-brand').style.color = ink === '#ffffff' ? 'rgba(255,255,255,.75)' : 'rgba(0,0,0,.55)';

            // Logo
            const L = D.el.logo, logoEl = $('el-logo');
            place(logoEl, L, L.on && L.side === side);
            const lw = L.size/100*cw;
            logoEl.style.width = lw+'px'; logoEl.style.height = (lw*0.62)+'px';
            $('el-logo-dummy').style.color = ink === '#ffffff' ? 'rgba(255,255,255,.55)' : 'rgba(0,0,0,.45)';
            $('el-logo-dummy').style.borderColor = ink === '#ffffff' ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.3)';

            // QR
            const Q = D.el.qr, qrEl = $('el-qr');
            place(qrEl, Q, Q.on && Q.side === side);
            const qs = Q.size/100*cw; qrEl.style.width = qs+'px'; qrEl.style.height = qs+'px';

            // Info
            const I = D.el.info, infoEl = $('el-info');
            place(infoEl, I, I.on && I.side === side);
            const fs = Math.max(7, cw*0.052*(I.size/100));
            const block = $('info-block');
            block.style.color = ink; block.style.textAlign = I.align;
            block.style.alignItems = I.align === 'center' ? 'center' : (I.align === 'right' ? 'flex-end' : 'flex-start');
            block.style.fontSize = fs+'px';
            const lines = [];
            if (I.name)    lines.push(`<div class="i-name" style="font-size:${fs*1.25}px">${esc(I.name)}</div>`);
            if (I.title)   lines.push(`<div class="i-title">${esc(I.title)}</div>`);
            if (I.company) lines.push(`<div class="i-line" style="font-weight:600">${esc(I.company)}</div>`);
            if (I.phone)   lines.push(`<div class="i-line">${esc(I.phone)}</div>`);
            if (I.website) lines.push(`<div class="i-line">${esc(I.website)}</div>`);
            block.innerHTML = lines.length ? lines.join('') : `<div class="i-line" style="opacity:.5">Tu información aquí</div>`;
        }
        function place(elDom, st, visible) {
            elDom.classList.toggle('hidden-el', !visible);
            elDom.style.left = st.x + '%';
            elDom.style.top  = st.y + '%';
        }
        function esc(s){ return String(s).replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }

        /* ---- Cara activa ---- */
        function setSide(s) {
            if (D.side !== s) replay($('card-canvas'), 'sc-flip');
            D.side = s;
            $('active-side-label').innerText = s === 'front' ? 'Frente' : 'Reverso';
            $('side-front').classList.toggle('active', s==='front');   $('side-back').classList.toggle('active', s==='back');
            $('side-front-2').classList.toggle('active', s==='front'); $('side-back-2').classList.toggle('active', s==='back');
            loadBgControls();
            render();
        }
        function loadBgControls() {
            const b = D.bg[D.side];
            $('bgC1').value = b.c1; $('bgC1_label').innerText = b.c1.toUpperCase();
            $('bgC2').value = b.c2; $('bgC2_label').innerText = b.c2.toUpperCase();
            $('bgAngle').value = b.angle;
            $('bg-solid').classList.toggle('active', b.type==='solid');
            $('bg-grad').classList.toggle('active', b.type==='gradient');
            $('bgC2-wrap').style.display = b.type==='solid' ? 'none' : 'flex';
            $('angle-wrap').style.display = b.type==='solid' ? 'none' : 'flex';
        }
        function setBgType(t){ D.bg[D.side].type = t; loadBgControls(); render(); }

        /* ---- Modo de tarjeta: prediseñada (catálogo) vs personalizada ---- */
        function setCardMode(m) {
            D.mode = m;
            $('mode-preset').classList.toggle('active', m === 'preset');
            $('mode-custom').classList.toggle('active', m === 'custom');
            $('card-preset-mode').style.display = m === 'preset' ? 'block' : 'none';
            $('card-custom-mode').style.display = m === 'preset' ? 'none' : 'block';

            const preset = m === 'preset';
            // En la vista: prediseñada muestra la imagen de catálogo; personalizada, el diseñador.
            document.querySelector('#mockup-card-view .side-toggle').style.display = preset ? 'none' : 'inline-flex';
            $('card-canvas').style.display = preset ? 'none' : 'block';
            document.querySelector('#mockup-card-view .designer-hint').style.display = preset ? 'none' : 'block';
            $('preset-preview').style.display = preset ? 'block' : 'none';
            $('preset-preview-note').style.display = preset ? 'block' : 'none';
            if (preset) pickPreset(D.preset.name, D.preset.label, D.preset.color);
            else render();
        }

        // Elegir un diseño de catálogo (modo prediseñada).
        function pickPreset(name, label, color) {
            D.preset = { name: name, label: label, color: color };
            document.querySelectorAll('.preset-thumb').forEach(t => t.classList.toggle('active', t.dataset.preset === name));
            $('preset-preview').src = `/img/products/card-${name}.png`;
            replay($('preset-preview'), 'sc-swap');
        }

        function onBgColor(){
            const b = D.bg[D.side];
            b.c1 = $('bgC1').value; b.c2 = $('bgC2').value; b.angle = +$('bgAngle').value;
            $('bgC1_label').innerText = b.c1.toUpperCase(); $('bgC2_label').innerText = b.c2.toUpperCase();
            render();
        }

        /* ---- Elementos ---- */
        function toggleEl(k, on){ D.el[k].on = on; render(); }
        function setElSide(k, side){ D.el[k].side = side; if (D.side !== side) setSide(side); else render(); }
        function setElSize(k, v){ D.el[k].size = +v; render(); }
        function updateInfo(){
            const I = D.el.info;
            I.name=$('info-name').value; I.title=$('info-title').value; I.company=$('info-company').value;
            I.phone=$('info-phone').value; I.website=$('info-website').value;
            render();
        }
        function setInfoAlign(a){
            D.el.info.align = a;
            document.querySelectorAll('[data-align]').forEach(x => x.classList.toggle('active', x.dataset.align===a));
            render();
        }
        /* El logo se optimiza aquí antes de guardarlo: fotos de varios MB o SVG
           se convierten a un PNG de máximo 1200 px (con transparencia), que pesa
           poco y se imprime nítido en una tarjeta. Antes un logo pesado hacía
           que el pedido no se guardara o que el logo se perdiera sin avisar. */
        const LOGO_MAX = 1200;
        function optimizeLogo(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onerror = () => reject(new Error('read'));
                reader.onload = e => {
                    const img = new Image();
                    img.onerror = () => reject(new Error('decode'));
                    img.onload = () => {
                        // SVG sin tamaño propio: se toma 1200 px de ancho.
                        let w = img.naturalWidth || LOGO_MAX, h = img.naturalHeight || Math.round(LOGO_MAX * 0.62);
                        const scale = Math.min(1, LOGO_MAX / Math.max(w, h));
                        w = Math.max(1, Math.round(w * scale)); h = Math.max(1, Math.round(h * scale));
                        const c = document.createElement('canvas'); c.width = w; c.height = h;
                        c.getContext('2d').drawImage(img, 0, 0, w, h);
                        let out = c.toDataURL('image/png');
                        // Fotos muy detalladas: si el PNG sigue pesado, JPG de alta calidad
                        // sobre blanco (una foto no tiene transparencia que perder).
                        if (out.length > 2.5 * 1024 * 1024) {
                            const j = document.createElement('canvas'); j.width = w; j.height = h;
                            const jc = j.getContext('2d'); jc.fillStyle = '#fff'; jc.fillRect(0, 0, w, h); jc.drawImage(c, 0, 0);
                            out = j.toDataURL('image/jpeg', 0.9);
                        }
                        resolve(out);
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            });
        }

        async function previewLogo(input, type){
            const file = input.files[0]; if (!file) return;
            let dataUrl;
            try {
                dataUrl = await optimizeLogo(file);
            } catch (err) {
                alert('No pudimos leer esa imagen. Prueba con un PNG, JPG o SVG.');
                input.value = '';
                return;
            }
            if (type === 'plate') {
                const img = $('mockup-plate-logo-img');
                img.src = dataUrl; img.style.display = 'block';
                $('mockup-plate-logo-dummy').style.display = 'none';
            } else {
                const img = $('el-logo-img');
                img.src = dataUrl; img.style.display = 'block';
                $('el-logo-dummy').style.display = 'none';
                D.el.logo.hasImg = true;
                render();
            }
        }

        /* ---- Arrastrar elementos ---- */
        let drag = null;
        function startDrag(e){
            const elDom = e.currentTarget; const k = elDom.dataset.el;
            if (D.el[k].side !== D.side || !D.el[k].on) return;
            e.preventDefault();
            document.querySelectorAll('.card-el').forEach(x=>x.classList.remove('selected'));
            elDom.classList.add('selected');
            drag = { k, elDom };
            elDom.setPointerCapture(e.pointerId);
        }
        function moveDrag(e){
            if (!drag) return;
            const canvas = $('card-canvas'); const r = canvas.getBoundingClientRect();
            let x = (e.clientX - r.left) / r.width * 100;
            let y = (e.clientY - r.top) / r.height * 100;
            x = Math.max(6, Math.min(94, x)); y = Math.max(8, Math.min(92, y));
            D.el[drag.k].x = Math.round(x); D.el[drag.k].y = Math.round(y);
            drag.elDom.style.left = x+'%'; drag.elDom.style.top = y+'%';
        }
        function endDrag(){ drag = null; }

        /* ---- Selección de color de pulsera (sin cambios de lógica) ---- */
        function selectBraceletColor(color) {
            $('color_primary_bracelet').value = color;
            document.querySelectorAll('.bracelet-color-btn').forEach(b => b.classList.remove('active'));
            $(`btn-${color}`).classList.add('active');
            const names = { white: 'Blanco', red: 'Rojo', black: 'Negro' };
            const lbl = $('bracelet-color-label'); if (lbl) lbl.innerText = names[color] || color;
            $('color_primary').value = color === 'white' ? '#ffffff' : (color === 'red' ? '#ef4444' : '#18181b');
        }

        /* ==================== CARRITO (varios productos) ==================== */
        const PRICES = {!! json_encode($prices) !!};
        const PNAMES = { card: 'SpaceCard', bracelet: 'Pulsera NFC', review_plate: 'Placa Google' };
        let cart = [];

        // Construye el item según el producto configurado actualmente.
        function currentItem() {
            const type = $('product_type').value;
            const qty = Math.max(1, Math.min(100, parseInt($('quantity').value) || 1));

            if (type === 'card') {
                // Prediseñada: se guarda el diseño de catálogo elegido (se imprime tal cual).
                if (D.mode === 'preset') {
                    const p = D.preset;
                    return {
                        product_type: 'card', quantity: qty,
                        color_primary: p.color, color_secondary: p.color,
                        logo_data: null,
                        design: { mode: 'preset', preset: p.name, preset_name: p.label },
                        _thumb: `/img/products/thumbs/card-${p.name}.png`, _bg: p.color,
                    };
                }
                // Personalizada: se guarda el layout exacto del diseñador (WYSIWYG).
                const design = JSON.parse(JSON.stringify(D));
                design.mode = 'custom';
                return {
                    product_type: 'card', quantity: qty,
                    color_primary: D.bg.front.c1, color_secondary: D.bg.front.c2,
                    logo_data: D.el.logo.hasImg ? $('el-logo-img').src : null,
                    design: design,
                    _thumb: D.el.logo.hasImg ? $('el-logo-img').src : null,
                    _bg: bgCss(D.bg.front),
                };
            }
            if (type === 'bracelet') {
                return {
                    product_type: 'bracelet', quantity: qty,
                    color_primary: $('color_primary').value, color_secondary: null,
                    logo_data: null, design: null, _thumb: null, _bg: $('color_primary').value,
                };
            }
            // review_plate
            const plateImg = $('mockup-plate-logo-img');
            const hasPlateLogo = plateImg && plateImg.style.display !== 'none' && plateImg.src;
            return {
                product_type: 'review_plate', quantity: qty,
                color_primary: null, color_secondary: null,
                logo_data: hasPlateLogo ? plateImg.src : null, design: null,
                _thumb: hasPlateLogo ? plateImg.src : null, _bg: '#ffffff',
            };
        }

        function addToCart() {
            cart.push(currentItem());
            renderCart();
            // feedback y reseteo de cantidad
            $('quantity').value = 1;
            const panel = $('cart-panel');
            panel.style.boxShadow = '0 0 0 2px #FF5A3C, 0 10px 40px rgba(255,40,10,.25)';
            setTimeout(() => panel.style.boxShadow = 'none', 450);
            replay($('cart-count'), 'sc-pop');
        }

        function removeCartItem(i) { cart.splice(i, 1); renderCart(); }

        function renderCart() {
            const wrap = $('cart-items');
            const totalVal = cart.reduce((s, it) => s + PRICES[it.product_type] * it.quantity, 0);
            $('cart-count').innerText = cart.reduce((s, it) => s + it.quantity, 0);

            // El botón SIEMPRE está habilitado: si no hay carrito, al finalizar se
            // agrega automáticamente el producto que se está configurando.
            $('btn-checkout').disabled = false;

            if (cart.length === 0) {
                wrap.innerHTML = '<p class="cart-empty" id="cart-empty">Puedes <strong>Finalizar compra</strong> directo con el producto que diseñaste. ¿Quieres varios? Pulsa “Agregar al carrito”.</p>';
                $('cart-total-row').style.display = 'none';
                // Muestra el precio del producto actual en el botón.
                const type = $('product_type').value;
                const qty = Math.max(1, Math.min(100, parseInt($('quantity').value) || 1));
                $('checkout-total').innerText = '$' + (PRICES[type] * qty).toFixed(2);
            } else {
                wrap.innerHTML = cart.map((it, i) => {
                    const line = PRICES[it.product_type] * it.quantity;
                    const thumb = it._thumb
                        ? `<img src="${it._thumb}">`
                        : `<span class="ms" aria-hidden="true">${it.product_type === 'bracelet' ? 'watch' : (it.product_type === 'review_plate' ? 'star' : 'contactless')}</span>`;
                    return `<div class="cart-item">
                        <div class="cart-thumb" style="background:${it._bg}">${thumb}</div>
                        <div class="cart-info">
                            <div class="ci-name">${PNAMES[it.product_type]}</div>
                            <div class="ci-meta">Cantidad: ${it.quantity} · $${PRICES[it.product_type].toFixed(2)} c/u</div>
                        </div>
                        <span class="cart-price">$${line.toFixed(2)}</span>
                        <button type="button" class="cart-remove" onclick="removeCartItem(${i})" title="Quitar" aria-label="Quitar del carrito"><span class="ms" aria-hidden="true">close</span></button>
                    </div>`;
                }).join('');
                $('cart-total-row').style.display = 'flex';
                $('cart-total').innerText = '$' + totalVal.toFixed(2);
                $('checkout-total').innerText = '$' + totalVal.toFixed(2);
            }
        }

        // Antes de enviar: auto-agrega el producto actual si el carrito está vacío,
        // valida los datos de entrega y empaqueta el carrito.
        function prepareCheckout() {
            if (cart.length === 0) addToCart();

            const req = ['customer_name', 'customer_email', 'shipping_address'];
            for (const id of req) {
                const el = $(id);
                if (!el.value.trim()) {
                    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
                    el.focus();
                    el.style.borderColor = '#f43f5e';
                    return false; // native + visual feedback
                }
                el.style.borderColor = '';
            }

            const payload = cart.map(({ _thumb, _bg, ...rest }) => rest);
            $('cart_input').value = JSON.stringify(payload);
            return true;
        }

        /* ---- Init ---- */
        function initDesigner(){
            setSide('front');
            document.querySelectorAll('.card-el').forEach(elDom => {
                elDom.onpointerdown = startDrag;
                elDom.onpointermove = moveDrag;
                elDom.onpointerup = endDrag;
                elDom.onpointercancel = endDrag;
            });
            render();
            $('card-canvas').classList.add('is-ready');
        }
        window.addEventListener('resize', () => { if ($('product_type').value === 'card') render(); });

        // Se inicializa en cuanto existe el HTML, sin esperar a que terminen de
        // descargar imágenes y fuentes (window.onload hacía que el diseñador
        // apareciera desordenado durante varios segundos).
        function initPage(){ initDesigner(); renderCart(); }
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPage);
        else initPage();
    </script>
</body>
</html>
