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
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- CSS Premium en Vanilla CSS -->
    <style>
        :root {
            --primary: #8b5cf6;
            --primary-hover: #7c3aed;
            --bg-dark: #09090b;
            --card-dark: #18181b;
            --border-color: #27272a;
            --text-light: #f4f4f5;
            --text-muted: #a1a1aa;
            --font-title: 'Outfit', sans-serif;
            --font-body: 'Inter', sans-serif;
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
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
        }

        header {
            padding: 24px 5%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border-color);
            background-color: rgba(9, 9, 11, 0.8);
            backdrop-filter: blur(12px);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .logo {
            font-family: var(--font-title);
            font-size: 22px;
            font-weight: 800;
            color: #ffffff;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .logo span {
            background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .container {
            max-width: 1200px;
            margin: 40px auto;
            padding: 0 24px;
            width: 100%;
            display: grid;
            grid-template-columns: 1fr;
            gap: 40px;
            flex-grow: 1;
        }

        @media(min-width: 992px) {
            .container {
                grid-template-columns: 1.2fr 1fr;
            }
        }

        /* Mockup en vivo (Columna izquierda) */
        .preview-column {
            position: sticky;
            top: 100px;
            height: fit-content;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: var(--card-dark);
            border: 1px solid var(--border-color);
            border-radius: 24px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .preview-title {
            font-family: var(--font-title);
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: var(--text-muted);
            margin-bottom: 30px;
        }

        /* Diseños físicos Mockups */
        .mockup-container {
            width: 100%;
            max-width: 380px;
            aspect-ratio: 1.586/1; /* Tarjeta proporción */
            border-radius: 20px;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            background: linear-gradient(135deg, #18181b 0%, #09090b 100%);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Mockup Tarjeta */
        .mockup-card {
            background-size: cover;
            background-position: center;
        }

        .mockup-nfc-chip {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            align-self: flex-start;
        }

        .mockup-nfc-chip svg {
            width: 16px;
            height: 16px;
            fill: #ffffff;
        }

        .mockup-logo-placeholder {
            max-width: 90px;
            max-height: 45px;
            object-fit: contain;
            align-self: center;
            opacity: 0.9;
        }

        .mockup-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            font-family: var(--font-title);
            font-size: 11px;
            font-weight: 500;
            letter-spacing: 0.5px;
            opacity: 0.7;
        }

        /* Mockup Pulsera (Bracelet) */
        .mockup-bracelet-view {
            display: none;
            width: 160px;
            height: 160px;
            border-radius: 50%;
            border: 18px solid #ffffff;
            box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.2), 0 10px 20px rgba(0,0,0,0.3);
            position: relative;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .mockup-bracelet-chip {
            width: 34px;
            height: 34px;
            background-color: #1e1b4b;
            border-radius: 50%;
            position: absolute;
            top: -16px;
            left: calc(50% - 17px);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #ffffff;
        }

        .mockup-bracelet-chip svg {
            width: 15px;
            height: 15px;
            fill: #ffffff;
        }

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
            box-shadow: 0 20px 45px rgba(0,0,0,0.4);
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

        .plate-stars {
            color: #fbbf24;
            font-size: 20px;
            letter-spacing: 2px;
        }

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
            position: relative;
        }

        .plate-qr-placeholder::after {
            content: 'QR';
            font-weight: 700;
            font-size: 12px;
            color: #94a3b8;
        }

        .plate-client-logo {
            max-width: 70px;
            max-height: 35px;
            object-fit: contain;
            opacity: 0.85;
            margin-top: 10px;
        }

        /* Formulario de Compra (Columna derecha) */
        .form-column {
            background-color: var(--card-dark);
            border: 1px solid var(--border-color);
            border-radius: 24px;
            padding: 32px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .form-title {
            font-family: var(--font-title);
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 24px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-label {
            display: block;
            text-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: var(--text-muted);
            margin-bottom: 8px;
        }

        .form-input, select, textarea {
            width: 100%;
            padding: 12px 16px;
            background-color: #09090b;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            color: #ffffff;
            font-family: var(--font-body);
            font-size: 14px;
            transition: all 0.2s;
        }

        .form-input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.15);
        }

        /* Selector de Tipo de Producto */
        .product-selector {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 24px;
        }

        .product-option-card {
            border: 2px solid var(--border-color);
            background-color: #09090b;
            border-radius: 16px;
            padding: 16px;
            text-align: center;
            cursor: pointer;
            transition: all 0.25s ease;
        }

        .product-option-card:hover {
            border-color: #4b5563;
        }

        .product-option-card.active {
            border-color: var(--primary);
            background-color: rgba(139, 92, 246, 0.05);
        }

        .product-opt-title {
            font-family: var(--font-title);
            font-size: 13px;
            font-weight: 700;
            margin-bottom: 4px;
            color: #ffffff;
        }

        .product-opt-price {
            font-size: 12px;
            color: var(--text-muted);
            font-weight: 500;
        }

        /* Secciones dinámicas de configuración */
        .config-section {
            border-top: 1px solid var(--border-color);
            padding-top: 20px;
            margin-top: 20px;
        }

        .config-title {
            font-family: var(--font-title);
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 16px;
        }

        /* Paleta de Colores Hex */
        .color-inputs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        .color-picker-wrapper {
            display: flex;
            align-items: center;
            gap: 10px;
            background-color: #09090b;
            border: 1px solid var(--border-color);
            border-radius: 12px;
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
            border-radius: 6px;
        }

        .color-picker-text {
            font-family: var(--font-body);
            font-size: 13px;
            text-transform: uppercase;
            font-weight: 600;
        }

        /* Zona de Carga de Logo */
        .file-upload-zone {
            border: 2px dashed var(--border-color);
            border-radius: 16px;
            padding: 24px;
            text-align: center;
            cursor: pointer;
            background-color: #09090b;
            transition: all 0.2s;
            position: relative;
        }

        .file-upload-zone:hover {
            border-color: var(--primary);
            background-color: rgba(139, 92, 246, 0.02);
        }

        .file-upload-text {
            font-size: 13px;
            color: var(--text-muted);
        }

        .file-upload-text strong {
            color: var(--primary);
        }

        .file-input {
            position: absolute;
            inset: 0;
            opacity: 0;
            cursor: pointer;
            width: 100%;
        }

        /* Selector de colores fijos de pulsera */
        .bracelet-color-selector {
            display: flex;
            gap: 16px;
            margin-bottom: 12px;
        }

        .bracelet-color-btn {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            cursor: pointer;
            border: 3px solid transparent;
            transition: all 0.2s;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .bracelet-color-btn.active {
            border-color: var(--primary);
            transform: scale(1.08);
        }

        .btn-white { background-color: #ffffff; }
        .btn-red { background-color: #ef4444; }
        .btn-black { background-color: #18181b; }

        /* Botón de Checkout */
        .btn-checkout {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
            color: #ffffff;
            font-family: var(--font-title);
            font-weight: 700;
            font-size: 16px;
            border: none;
            border-radius: 14px;
            cursor: pointer;
            transition: all 0.25s;
            margin-top: 10px;
            box-shadow: 0 10px 20px rgba(139, 92, 246, 0.25);
        }

        .btn-checkout:hover {
            opacity: 0.95;
            transform: translateY(-1px);
            box-shadow: 0 15px 25px rgba(139, 92, 246, 0.35);
        }
        /* ===================== DISEÑADOR DE TARJETA (2 CARAS) ===================== */
        .designer-stage { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .side-toggle { display: inline-flex; background: rgba(255,255,255,0.04); border: 1px solid var(--border-color); border-radius: 999px; padding: 4px; }
        .side-toggle.inline { margin-top: 6px; }
        .side-btn { border: none; background: transparent; color: var(--text-muted); font-size: 12px; font-weight: 600; padding: 7px 18px; border-radius: 999px; cursor: pointer; transition: all .2s; }
        .side-btn.active { background: #8b5cf6; color: #fff; box-shadow: 0 4px 14px rgba(139,92,246,.35); }

        .card-canvas {
            position: relative; width: 100%; max-width: 380px; aspect-ratio: 1.586 / 1;
            border-radius: 20px; overflow: hidden; user-select: none; touch-action: none;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,.06);
            background: linear-gradient(135deg, #8b5cf6, #0c0b14);
        }
        .card-canvas::after { /* barniz sutil */ content:''; position:absolute; inset:0; background: radial-gradient(120% 120% at 0% 0%, rgba(255,255,255,.12), transparent 45%); pointer-events:none; }
        .card-chip { position:absolute; top:16px; right:16px; width:26px; height:26px; opacity:.8; }
        .card-chip svg { width:100%; height:100%; fill:#fff; }
        .card-brand { position:absolute; bottom:12px; left:16px; font-size:9px; letter-spacing:1px; font-weight:700; color:rgba(255,255,255,.75); }

        .card-el { position:absolute; transform: translate(-50%,-50%); cursor: grab; }
        .card-el:active { cursor: grabbing; }
        .card-el.selected { outline: 2px dashed rgba(255,255,255,.8); outline-offset: 4px; border-radius: 6px; }
        .card-el.hidden-el { display:none; }
        .el-logo-img { width:100%; height:100%; object-fit: contain; display:block; pointer-events:none; }
        .el-logo-dummy { display:flex; align-items:center; justify-content:center; width:100%; height:100%; border:1.5px dashed rgba(255,255,255,.35); border-radius:8px; color:rgba(255,255,255,.55); font-size:11px; font-weight:700; font-family:var(--font-title); text-align:center; }
        .qr-box { width:100%; height:100%; background:#fff; border-radius:8px; display:flex; align-items:center; justify-content:center; }
        .qr-box svg { width:82%; height:82%; }
        .info-block { display:flex; flex-direction:column; gap:1px; pointer-events:none; }
        .info-block .i-name { font-family:var(--font-title); font-weight:800; line-height:1.1; }
        .info-block .i-title { opacity:.9; }
        .info-block .i-line { opacity:.8; }
        .designer-hint { font-size:11px; color:var(--text-muted); text-align:center; margin:0; }

        /* Controles del diseñador */
        .ctrl-group { margin-bottom: 18px; }
        .seg { display:inline-flex; background:rgba(255,255,255,.04); border:1px solid var(--border-color); border-radius:10px; padding:3px; margin-top:6px; }
        .seg-btn { border:none; background:transparent; color:var(--text-muted); font-size:11px; font-weight:600; padding:6px 14px; border-radius:8px; cursor:pointer; }
        .seg-btn.active { background:#8b5cf6; color:#fff; }
        .el-card { border:1px solid var(--border-color); border-radius:14px; padding:14px; margin-bottom:14px; background:rgba(255,255,255,.02); }
        .el-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
        .el-head span { font-size:13px; font-weight:700; color:var(--text-light); }
        .el-row { display:flex; align-items:center; gap:10px; margin-top:10px; font-size:11px; color:var(--text-muted); }
        .el-row select, .el-row input[type=range] { flex:1; }
        .el-select { background:var(--card-dark); border:1px solid var(--border-color); color:var(--text-light); border-radius:8px; padding:6px 8px; font-size:12px; }
        input[type=range] { accent-color:#8b5cf6; }
        .switch { position:relative; display:inline-block; width:38px; height:22px; }
        .switch input { opacity:0; width:0; height:0; }
        .switch .slider { position:absolute; inset:0; background:#3f3f46; border-radius:999px; transition:.2s; }
        .switch .slider::before { content:''; position:absolute; height:16px; width:16px; left:3px; top:3px; background:#fff; border-radius:50%; transition:.2s; }
        .switch input:checked + .slider { background:#8b5cf6; }
        .switch input:checked + .slider::before { transform: translateX(16px); }
        .mini-input { width:100%; background:var(--card-dark); border:1px solid var(--border-color); color:var(--text-light); border-radius:8px; padding:8px 10px; font-size:12px; margin-top:6px; }
        .mini-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }

        /* Diseños predeterminados */
        .preset-strip { display:flex; gap:8px; overflow-x:auto; padding:8px 2px; margin-top:6px; }
        .preset-thumb { flex:0 0 auto; width:64px; padding:0; border:2px solid transparent; border-radius:12px; background:transparent; cursor:pointer; overflow:hidden; transition:.15s; }
        .preset-thumb img { width:100%; display:block; }
        .preset-thumb:hover { transform:translateY(-2px); }
        .preset-thumb.active { border-color:#8b5cf6; box-shadow:0 4px 14px rgba(139,92,246,.35); }
        .preset-note { margin-top:10px; padding:10px 12px; border-radius:10px; background:rgba(34,197,94,.08); border:1px solid rgba(34,197,94,.2); color:#86efac; font-size:12px; line-height:1.5; }

        /* Carrito */
        .btn-add-cart { width:100%; padding:13px; border:1.5px dashed #8b5cf6; background:rgba(139,92,246,.08); color:#a78bfa; font-weight:700; font-size:14px; border-radius:12px; cursor:pointer; margin:8px 0 18px; transition:.2s; }
        .btn-add-cart:hover { background:rgba(139,92,246,.16); }
        .cart-panel { border:1px solid var(--border-color); border-radius:14px; padding:16px; margin-bottom:22px; background:rgba(255,255,255,.02); }
        .cart-count { background:#8b5cf6; color:#fff; font-size:12px; min-width:22px; height:22px; padding:0 6px; border-radius:999px; display:inline-flex; align-items:center; justify-content:center; }
        .cart-empty { font-size:12px; color:var(--text-muted); margin:6px 0 0; }
        .cart-item { display:flex; align-items:center; gap:12px; padding:10px 0; border-top:1px solid var(--border-color); }
        .cart-item:first-child { border-top:none; }
        .cart-thumb { width:44px; height:28px; border-radius:6px; flex-shrink:0; background:linear-gradient(135deg,#8b5cf6,#0c0b14); display:flex; align-items:center; justify-content:center; overflow:hidden; }
        .cart-thumb img { width:100%; height:100%; object-fit:contain; }
        .cart-info { flex:1; min-width:0; }
        .cart-info .ci-name { font-size:13px; font-weight:600; color:var(--text-light); }
        .cart-info .ci-meta { font-size:11px; color:var(--text-muted); }
        .cart-price { font-size:13px; font-weight:700; color:var(--text-light); }
        .cart-remove { background:none; border:none; color:#f43f5e; cursor:pointer; font-size:16px; line-height:1; padding:4px; }
        .cart-total-row { display:flex; justify-content:space-between; align-items:center; margin-top:12px; padding-top:12px; border-top:1px solid var(--border-color); font-weight:800; font-size:15px; color:var(--text-light); }
        .btn-checkout:disabled { opacity:.5; cursor:not-allowed; }
    </style>
</head>
<body>

    <header style="display:flex;align-items:center;justify-content:space-between;">
        <a href="/" class="logo" style="display:flex;align-items:center;gap:10px;">
            <svg width="26" height="26" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs><linearGradient id="scMarkShop" x1="20" y1="8" x2="80" y2="92" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#ff3b3b"/><stop offset="1" stop-color="#c40d1a"/></linearGradient></defs>
                <path d="M58 8 L22 50 H44 L38 92 L78 46 H54 L58 8 Z" fill="url(#scMarkShop)"/>
            </svg>
            <span style="font-weight:800;">Space</span><span style="font-weight:800;color:var(--text-light)">Shop</span>
        </a>
        <div style="font-size:13px;color:var(--text-muted);">
            @auth
                Comprando como <strong style="color:var(--text-light);">{{ auth()->user()->name }}</strong> · la tarjeta se vinculará a tu cuenta
            @else
                <a href="{{ route('login') }}" style="color:#8b5cf6;text-decoration:none;">Inicia sesión</a> para vincular la compra a tu cuenta (opcional)
            @endauth
        </div>
    </header>

    <div class="container">
        
        <!-- Vista previa Mockup (Columna izquierda) -->
        <div class="preview-column">
            <h4 class="preview-title">Vista Previa Impresión</h4>
            
            <!-- Diseñador de Tarjeta (SpaceCard) - 2 caras -->
            <div id="mockup-card-view" class="designer-stage">
                <div class="side-toggle">
                    <button type="button" id="side-front" class="side-btn active" onclick="setSide('front')">Frente</button>
                    <button type="button" id="side-back" class="side-btn" onclick="setSide('back')">Reverso</button>
                </div>

                <div id="card-canvas" class="card-canvas">
                    <div id="card-chip" class="card-chip">
                        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                    </div>

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

                <p class="designer-hint">✋ Arrastra el logo, la info y el QR para colocarlos · cambia de cara arriba</p>

                <!-- Vista previa del diseño de catálogo (modo prediseñada) -->
                <img id="preset-preview" src="/img/products/card-black.png" alt="Diseño AVASPACE" style="display:none; width:100%; max-width:440px; filter: drop-shadow(0 20px 40px rgba(0,0,0,.6));">
                <p id="preset-preview-note" class="designer-hint" style="display:none;">Diseño de catálogo AVASPACE · frente y reverso · se imprime tal cual con tu QR único</p>
            </div>

            <!-- Pulsera SpaceBand (imagen real de producto) -->
            <div id="mockup-bracelet-view" class="bracelet-real" style="display:none; flex-direction:column; align-items:center; gap:14px; width:100%;">
                <img src="/img/products/bracelets.png" alt="SpaceBand NFC" style="width:100%; max-width:420px; filter: drop-shadow(0 20px 40px rgba(0,0,0,.6));">
                <p style="font-size:12px; color:var(--text-muted); text-align:center;">
                    SpaceBand® NFC · disponible en <strong style="color:#ef4444;">rojo</strong>, <strong style="color:var(--text-light);">negro</strong> y <strong style="color:#e5e7eb;">blanco</strong><br>
                    Color seleccionado: <strong id="bracelet-color-label" style="color:var(--text-light);">Blanco</strong>
                </p>
            </div>

            <!-- Mockup de Placa Reviews Google -->
            <div id="mockup-plate-view" class="mockup-plate-view">
                <div class="plate-header">
                    <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M21.35 11.1H12v2.7h5.38c-.23 1.28-1 2.37-2.08 3.1v2.58h3.36c1.96-1.8 3.09-4.47 3.09-7.58c0-.62-.05-1.21-.1-1.8z"/><path fill="#34A853" d="M12 21c2.43 0 4.47-.8 5.96-2.22l-3.36-2.58c-.93.62-2.11 1-3.6 1c-2.77 0-5.11-1.86-5.95-4.38H1.57v2.66C3.06 18.25 7.2 21 12 21z"/><path fill="#FBBC05" d="M6.05 12.82a5.4 5.4 0 0 1 0-3.64V6.52H1.57a8.96 8.96 0 0 0 0 10.96l4.48-2.66z"/><path fill="#EA4335" d="M12 8.38c1.32 0 2.5.45 3.44 1.35l2.58-2.58C16.46 5.68 14.43 5 12 5C7.2 5 3.06 7.75 1.57 10.74l4.48 2.66c.84-2.52 3.18-4.38 5.95-4.38z"/></svg>
                    <span>Valóranos en Google</span>
                </div>
                
                <div class="plate-body">
                    <div class="google-logo">
                        <span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span>
                    </div>
                    <div class="plate-stars">★★★★★</div>
                    <div class="plate-cta">¡Escanea y escribe tu reseña!</div>
                    <div class="plate-qr-placeholder"></div>
                    
                    <img id="mockup-plate-logo-img" src="" class="plate-client-logo" style="display: none;" alt="Logo Cliente" />
                    <div id="mockup-plate-logo-dummy" class="plate-client-logo" style="font-family: var(--font-title); font-size:10px; font-weight:700; color:#94a3b8; opacity:0.6;">
                        [ Logo de tu Empresa ]
                    </div>
                </div>
            </div>

        </div>

        <!-- Formulario (Columna derecha) -->
        <div class="form-column">
            <h2 class="form-title">Configura tu Dispositivo</h2>
            
            <form action="{{ route('shop.checkout') }}" method="POST" enctype="multipart/form-data" id="checkout-form" onsubmit="return prepareCheckout()">
                @csrf
                <input type="hidden" name="product_type" id="product_type" value="card">
                <input type="hidden" id="color_primary" value="#8b5cf6">
                <input type="hidden" id="color_secondary" value="#0c0b14">
                <input type="hidden" id="design_config" value="">
                <input type="hidden" name="cart" id="cart_input" value="">

                <!-- Selector de producto -->
                <div class="form-group">
                    <label class="form-label">Elige tu Producto</label>
                    <div class="product-selector">
                        <div class="product-option-card active" onclick="selectProduct('card')">
                            <div class="product-opt-title">SpaceCard</div>
                            <div class="product-opt-price">${{ $prices['card'] }}</div>
                        </div>
                        <div class="product-option-card" onclick="selectProduct('bracelet')">
                            <div class="product-opt-title">Pulsera NFC</div>
                            <div class="product-opt-price">${{ $prices['bracelet'] }}</div>
                        </div>
                        <div class="product-option-card" onclick="selectProduct('review_plate')">
                            <div class="product-opt-title">Placa Google</div>
                            <div class="product-opt-price">${{ $prices['review_plate'] }}</div>
                        </div>
                    </div>
                </div>

                <!-- Cantidad -->
                <div class="form-group">
                    <label class="form-label" for="quantity">Cantidad de unidades</label>
                    <input type="number" name="quantity" id="quantity" class="form-input" min="1" max="100" value="1" oninput="if(!cart.length) renderCart()" required>
                </div>

                <!-- Configuración dinámica de la Tarjeta (SpaceCard) - Diseñador 2 caras -->
                <div id="config-card-section" class="config-section">
                    <h4 class="config-title">Tu tarjeta</h4>

                    <!-- Modo de diseño -->
                    <div class="seg" id="card-mode-seg" style="width:100%; display:flex;">
                        <button type="button" id="mode-preset" class="seg-btn" style="flex:1;" onclick="setCardMode('preset')">🎴 Prediseñada</button>
                        <button type="button" id="mode-custom" class="seg-btn active" style="flex:1;" onclick="setCardMode('custom')">🎨 Personalizada</button>
                    </div>

                    <!-- MODO PREDISEÑADA (catálogo AVASPACE) -->
                    <div id="card-preset-mode" style="display:none; margin-top:16px;">
                        <label class="form-label">Elige un diseño de catálogo</label>
                        <div class="preset-strip">
                            <button type="button" class="preset-thumb active" data-preset="black"  onclick="pickPreset('black','Negro','#0c0b14')"><img src="/img/products/thumbs/card-black.png" alt="Negro"></button>
                            <button type="button" class="preset-thumb" data-preset="red"    onclick="pickPreset('red','Rojo','#e11d2a')"><img src="/img/products/thumbs/card-red.png" alt="Rojo"></button>
                            <button type="button" class="preset-thumb" data-preset="pink"   onclick="pickPreset('pink','Rosa','#d81f8f')"><img src="/img/products/thumbs/card-pink.png" alt="Rosa"></button>
                            <button type="button" class="preset-thumb" data-preset="purple" onclick="pickPreset('purple','Púrpura','#7c3aed')"><img src="/img/products/thumbs/card-purple.png" alt="Púrpura"></button>
                            <button type="button" class="preset-thumb" data-preset="blue"   onclick="pickPreset('blue','Azul','#1e40af')"><img src="/img/products/thumbs/card-blue.png" alt="Azul"></button>
                            <button type="button" class="preset-thumb" data-preset="green"  onclick="pickPreset('green','Verde','#16a34a')"><img src="/img/products/thumbs/card-green.png" alt="Verde"></button>
                        </div>
                        <div class="preset-note">
                            ✓ Se imprime <strong>tal cual</strong> el diseño AVASPACE, con tu <strong>código QR único</strong> ya integrado. No requiere edición.
                        </div>
                    </div>

                    <!-- MODO PERSONALIZADA (diseñador 2 caras) -->
                    <div id="card-custom-mode">

                    <!-- Cara activa -->
                    <div class="ctrl-group">
                        <label class="form-label">Editando la cara: <strong id="active-side-label" style="color:#8b5cf6;">Frente</strong></label>
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
                                <input type="color" id="bgC1" class="color-picker" value="#8b5cf6" oninput="onBgColor()">
                                <span id="bgC1_label" class="color-picker-text">#8B5CF6</span>
                            </div>
                            <div id="bgC2-wrap" class="color-picker-wrapper">
                                <input type="color" id="bgC2" class="color-picker" value="#0c0b14" oninput="onBgColor()">
                                <span id="bgC2_label" class="color-picker-text">#0C0B14</span>
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
                            <span>🖼️ Logo</span>
                            <label class="switch"><input type="checkbox" id="logo-on" checked onchange="toggleEl('logo', this.checked)"><span class="slider"></span></label>
                        </div>
                        <div class="file-upload-zone">
                            <span class="file-upload-text">Sube tu logo · <strong>clic para buscar</strong></span>
                            <input type="file" name="logo" id="logo_input" class="file-input" accept="image/*" onchange="previewLogo(this)">
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
                            <span>💼 Información de negocio</span>
                            <label class="switch"><input type="checkbox" id="info-on" checked onchange="toggleEl('info', this.checked)"><span class="slider"></span></label>
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
                                <button type="button" class="seg-btn" data-align="left" onclick="setInfoAlign('left')">◧</button>
                                <button type="button" class="seg-btn active" data-align="center" onclick="setInfoAlign('center')">▣</button>
                                <button type="button" class="seg-btn" data-align="right" onclick="setInfoAlign('right')">◨</button>
                            </div>
                        </div>
                    </div>

                    <!-- Elemento: QR -->
                    <div class="el-card">
                        <div class="el-head">
                            <span>▦ Código QR</span>
                            <label class="switch"><input type="checkbox" id="qr-on" checked onchange="toggleEl('qr', this.checked)"><span class="slider"></span></label>
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
                    <h4 class="config-title">Color de la Pulsera</h4>
                    <input type="hidden" name="color_primary_bracelet" id="color_primary_bracelet" value="white">
                    <div class="form-group">
                        <label class="form-label">Elige un color físico</label>
                        <div class="bracelet-color-selector">
                            <div id="btn-white" class="bracelet-color-btn btn-white active" onclick="selectBraceletColor('white')"></div>
                            <div id="btn-red" class="bracelet-color-btn btn-red" onclick="selectBraceletColor('red')"></div>
                            <div id="btn-black" class="bracelet-color-btn btn-black" onclick="selectBraceletColor('black')"></div>
                        </div>
                        <span class="file-upload-text" style="display:block; margin-top:8px;">Las pulseras de fábrica se ofrecen en colores lisos de silicona.</span>
                    </div>
                </div>

                <!-- Configuración dinámica de la Placa Google -->
                <div id="config-plate-section" class="config-section" style="display: none;">
                    <h4 class="config-title">Personalización de la Placa</h4>
                    <div class="form-group">
                        <label class="form-label">Tu logotipo en la Placa</label>
                        <div class="file-upload-zone">
                            <span class="file-upload-text">Sube tu logo para grabarlo al pie de la placa <strong>haz clic aquí</strong></span>
                            <input type="file" name="logo_plate" id="logo_plate_input" class="file-input" accept="image/*" onchange="previewLogo(this, 'plate')">
                        </div>
                    </div>
                </div>

                <!-- Agregar al carrito -->
                <button type="button" class="btn-add-cart" onclick="addToCart()">＋ Agregar al carrito</button>

                <!-- Carrito -->
                <div class="cart-panel" id="cart-panel">
                    <h4 class="config-title" style="display:flex;justify-content:space-between;align-items:center;">
                        <span>🛒 Tu carrito</span>
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
                    <h4 class="config-title">Datos de Entrega y Facturación</h4>
                    
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

                <button type="submit" class="btn-checkout" id="btn-checkout">Finalizar compra · <span id="checkout-total">$29.99</span></button>
            </form>
        </div>

    </div>

    <!-- Scripts interactivos de Mockups -->
    <script>
        /* ==================== ESTADO DEL DISEÑADOR (2 CARAS) ==================== */
        const D = {
            mode: 'custom',                                   // 'custom' | 'preset'
            preset: { name: 'black', label: 'Negro', color: '#0c0b14' },
            side: 'front',
            bg: {
                front: { type: 'gradient', c1: '#8b5cf6', c2: '#0c0b14', angle: 135 },
                back:  { type: 'solid',    c1: '#0c0b14', c2: '#0c0b14', angle: 135 },
            },
            el: {
                logo: { on: true, side: 'front', x: 50, y: 30, size: 30, hasImg: false },
                info: { on: true, side: 'front', x: 50, y: 74, size: 100, align: 'center',
                        name: '', title: '', company: '', phone: '', website: '' },
                qr:   { on: true, side: 'back',  x: 50, y: 50, size: 34 },
            },
        };

        function $(id) { return document.getElementById(id); }

        /* ---- Producto ---- */
        function selectProduct(type) {
            $('product_type').value = type;
            document.querySelectorAll('.product-option-card').forEach(c => c.classList.remove('active'));
            event.currentTarget.classList.add('active');

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
        function previewLogo(input, type){
            const file = input.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = e => {
                if (type === 'plate') {
                    const img = $('mockup-plate-logo-img');
                    img.src = e.target.result; img.style.display = 'block';
                    $('mockup-plate-logo-dummy').style.display = 'none';
                } else {
                    const img = $('el-logo-img');
                    img.src = e.target.result; img.style.display = 'block';
                    $('el-logo-dummy').style.display = 'none';
                    D.el.logo.hasImg = true;
                    render();
                }
            };
            reader.readAsDataURL(file);
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
            panel.style.boxShadow = '0 0 0 2px #8b5cf6';
            setTimeout(() => panel.style.boxShadow = 'none', 350);
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
                        : `<span style="font-size:9px;color:#fff;opacity:.8">${it.product_type === 'bracelet' ? '⌚' : (it.product_type === 'review_plate' ? '★' : 'NFC')}</span>`;
                    return `<div class="cart-item">
                        <div class="cart-thumb" style="background:${it._bg}">${thumb}</div>
                        <div class="cart-info">
                            <div class="ci-name">${PNAMES[it.product_type]}</div>
                            <div class="ci-meta">Cantidad: ${it.quantity} · $${PRICES[it.product_type].toFixed(2)} c/u</div>
                        </div>
                        <span class="cart-price">$${line.toFixed(2)}</span>
                        <button type="button" class="cart-remove" onclick="removeCartItem(${i})" title="Quitar">✕</button>
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
        }
        window.addEventListener('resize', () => { if ($('product_type').value === 'card') render(); });
        window.onload = function(){ initDesigner(); renderCart(); };
    </script>
</body>
</html>
