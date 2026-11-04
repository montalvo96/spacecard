<!DOCTYPE html>
<!--
  Vista de éxito del pedido de compras.
  Estilo alineado con la landing: negro, acento rojo, iconos Material Symbols.
  Autor: Antigravity
-->
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>¡Pedido Confirmado! | SpaceCard Shop</title>

    <!-- Google Fonts: tipografía e iconos (Material Symbols) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300..600,0..1,0&display=block" rel="stylesheet">

    <style>
        :root {
            --primary: #D42410;
            --primary-hover: #B81E0C;
            --primary-text: #FF5A3C;
            --success: #6EE7B7;
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
        }

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
        }
        .ms-fill { font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24; }

        @keyframes sc-rise {
            from { opacity: 0; transform: translate3d(0, 24px, 0); }
            to { opacity: 1; transform: none; }
        }
        @keyframes sc-blob {
            0%, 100% { transform: translate3d(-50%, -50%, 0) scale(1); }
            33% { transform: translate3d(-46%, -54%, 0) scale(1.08); }
            66% { transform: translate3d(-54%, -47%, 0) scale(0.95); }
        }
        @keyframes sc-check {
            0% { transform: scale(0) rotate(-45deg); opacity: 0; }
            60% { transform: scale(1.2) rotate(8deg); opacity: 1; }
            100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        @keyframes sc-ripple {
            from { transform: scale(0.8); opacity: 0.6; }
            to { transform: scale(1.9); opacity: 0; }
        }
        .sc-rise { animation: sc-rise 1s var(--ease) both; }

        @media (prefers-reduced-motion: reduce) {
            .sc-rise, .glow, .success-icon .ms, .success-icon::before, .success-icon::after { animation: none !important; }
        }

        .frame {
            position: relative;
            max-width: 1360px;
            min-height: 100vh;
            margin: 0 auto;
            overflow: hidden;
            isolation: isolate;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 16px;
        }

        .glow {
            position: absolute;
            left: 50%;
            top: 40%;
            width: 620px;
            height: 620px;
            max-width: 130%;
            background: radial-gradient(closest-side, rgba(255, 40, 10, 0.35), rgba(255, 40, 10, 0.08) 55%, transparent);
            will-change: transform;
            z-index: -1;
            pointer-events: none;
            animation: sc-blob 18s ease-in-out infinite;
        }

        .success-card {
            background-color: rgba(17, 17, 17, 0.92);
            border: 1px solid var(--border-color);
            border-radius: 28px;
            padding: 40px;
            max-width: 560px;
            width: 100%;
            text-align: center;
        }
        @media (max-width: 560px) {
            .success-card { padding: 28px 20px; }
        }

        .success-icon {
            position: relative;
            width: 72px;
            height: 72px;
            background-color: rgba(110, 231, 183, 0.10);
            border: 1px solid rgba(110, 231, 183, 0.45);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
            color: var(--success);
        }
        .success-icon::before,
        .success-icon::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 50%;
            border: 1px solid rgba(110, 231, 183, 0.5);
            animation: sc-ripple 2.4s var(--ease) infinite;
        }
        .success-icon::after { animation-delay: 1.2s; }
        .success-icon .ms {
            font-size: 38px;
            animation: sc-check 0.8s var(--ease) 0.35s both;
        }

        .kicker {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 5px 12px;
            border-radius: 999px;
            background: #ffffff;
            color: #141414;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 14px;
        }
        .kicker::before {
            content: '';
            width: 6px;
            height: 6px;
            border-radius: 999px;
            background: var(--primary);
        }

        .success-title {
            font-family: var(--font-title);
            font-size: clamp(32px, 5vw, 44px);
            line-height: 1;
            font-weight: 400;
            letter-spacing: -0.04em;
            margin-bottom: 14px;
            color: #ffffff;
        }
        .success-title span { color: var(--primary-text); }

        .success-desc {
            font-size: 15px;
            line-height: 1.6;
            color: var(--text-muted);
            margin-bottom: 28px;
        }

        .order-details-box {
            background-color: #0A0A0A;
            border: 1px solid var(--border-color);
            border-radius: 18px;
            padding: 6px 20px;
            text-align: left;
            margin-bottom: 20px;
        }

        .details-row {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            gap: 4px 12px;
            font-size: 14px;
            padding: 14px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .details-row:last-child {
            border-bottom: none;
        }

        .details-label {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: var(--text-muted);
            font-weight: 500;
        }
        .details-label .ms { font-size: 18px; color: var(--primary-text); }

        .details-value {
            font-weight: 600;
            color: #ffffff;
            word-break: break-word;
        }
        .details-value.total {
            font-family: var(--font-title);
            font-size: 18px;
        }

        .steps-box {
            background-color: rgba(255, 59, 31, 0.06);
            border: 1px solid rgba(255, 59, 31, 0.25);
            border-radius: 18px;
            padding: 20px;
            text-align: left;
            margin-bottom: 28px;
        }

        .steps-title {
            font-family: var(--font-title);
            font-size: 17px;
            font-weight: 500;
            color: #ffffff;
            margin-bottom: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .steps-title .ms { font-size: 22px; color: var(--primary-text); }

        .step-item {
            display: flex;
            gap: 12px;
            font-size: 13.5px;
            line-height: 1.6;
            color: #D4D4D4;
            margin-bottom: 14px;
        }
        .step-item:last-child { margin-bottom: 0; }
        .step-item > .ms {
            flex-shrink: 0;
            width: 34px;
            height: 34px;
            border-radius: 12px;
            background: rgba(255, 59, 31, 0.12);
            color: var(--primary-text);
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .step-item strong { color: #ffffff; }

        .btn-continue {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            padding: 16px;
            background: var(--primary);
            color: #ffffff;
            font-family: var(--font-body);
            font-weight: 600;
            font-size: 15px;
            border: none;
            border-radius: 999px;
            cursor: pointer;
            text-decoration: none;
            transition: background-color 0.3s var(--ease), transform 0.3s var(--ease), box-shadow 0.3s var(--ease);
            box-shadow: 0 10px 30px rgba(255, 40, 10, 0.35);
        }
        .btn-continue .ms { transition: transform 0.3s var(--ease); }

        .btn-continue:hover {
            background: var(--primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 16px 40px rgba(255, 40, 10, 0.5);
        }
        .btn-continue:hover .ms { transform: translateX(4px); }
    </style>
</head>
<body>

    <div class="frame">
        <div class="glow" aria-hidden="true"></div>

        <div class="success-card sc-rise">
            <div class="success-icon">
                <span class="ms ms-fill" aria-hidden="true">check</span>
            </div>

            <div><span class="kicker">SpaceShop</span></div>
            <h1 class="success-title">¡Pedido <span>confirmado!</span></h1>
            <p class="success-desc">
                Gracias por comprar en SpaceCard. Hemos registrado tu pedido con éxito y el equipo de Avaspace ha comenzado el proceso de impresión física y grabado láser personalizado.
            </p>

            <div class="order-details-box sc-rise" style="animation-delay: 150ms;">
                <div class="details-row">
                    <span class="details-label"><span class="ms" aria-hidden="true">receipt_long</span>Número de pedido</span>
                    <span class="details-value">#SPC-{{ 10000 + $order->id }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label"><span class="ms" aria-hidden="true">person</span>Cliente</span>
                    <span class="details-value">{{ $order->customer_name }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label"><span class="ms" aria-hidden="true">mail</span>Destinatario / correo</span>
                    <span class="details-value">{{ $order->customer_email }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label"><span class="ms" aria-hidden="true">payments</span>Total del pago (simulado)</span>
                    <span class="details-value total">${{ number_format($order->total, 2) }}</span>
                </div>
            </div>

            <div class="steps-box sc-rise" style="animation-delay: 280ms;">
                <h4 class="steps-title"><span class="ms" aria-hidden="true">route</span>¿Qué sigue ahora?</h4>
                <div class="step-item">
                    <span class="ms" aria-hidden="true">print</span>
                    <span><strong>Impresión y fabricación:</strong> Grabaremos tu logotipo y colores en tu hardware NFC en las próximas 24 horas.</span>
                </div>
                <div class="step-item">
                    <span class="ms" aria-hidden="true">local_shipping</span>
                    <span><strong>Envío postal:</strong> Te enviaremos un correo con el número de guía de paquetería cuando salga de nuestro almacén.</span>
                </div>
                <div class="step-item">
                    <span class="ms" aria-hidden="true">contactless</span>
                    <span><strong>Activación de escaneo:</strong> Cuando recibas tu hardware, simplemente <strong>escanéalo con tu celular</strong>. Te guiará automáticamente para crear tu cuenta y configurar tu tarjeta digital o reviews.</span>
                </div>
            </div>

            <a href="/" class="btn-continue sc-rise" style="animation-delay: 400ms;">Volver al inicio<span class="ms" aria-hidden="true">arrow_forward</span></a>
        </div>
    </div>

</body>
</html>
