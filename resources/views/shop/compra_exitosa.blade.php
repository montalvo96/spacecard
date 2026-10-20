<!DOCTYPE html>
<!--
  Vista de éxito del pedido de compras.
  Última modificación: 2026-08-06
  Autor: Antigravity
-->
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>¡Pedido Confirmado! | SpaceCard Shop</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- CSS Premium en Vanilla CSS -->
    <style>
        :root {
            --primary: #10b981;
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
            justify-content: center;
            align-items: center;
            padding: 24px;
        }

        .success-card {
            background-color: var(--card-dark);
            border: 1px solid var(--border-color);
            border-radius: 24px;
            padding: 40px;
            max-width: 550px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
            animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .success-icon {
            width: 64px;
            height: 64px;
            background-color: rgba(16, 185, 129, 0.1);
            border: 2px solid var(--primary);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
        }

        .success-icon svg {
            width: 32px;
            height: 32px;
            fill: var(--primary);
        }

        .success-title {
            font-family: var(--font-title);
            font-size: 28px;
            font-weight: 800;
            margin-bottom: 12px;
            color: #ffffff;
        }

        .success-desc {
            font-size: 15px;
            line-height: 1.6;
            color: var(--text-muted);
            margin-bottom: 30px;
        }

        .order-details-box {
            background-color: #09090b;
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 20px;
            text-align: left;
            margin-bottom: 30px;
        }

        .details-row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            padding-bottom: 10px;
            margin-bottom: 10px;
            border-bottom: 1px solid var(--border-color);
        }

        .details-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
            margin-bottom: 0;
        }

        .details-label {
            color: var(--text-muted);
            font-weight: 500;
        }

        .details-value {
            font-weight: 600;
            color: #ffffff;
        }

        .steps-box {
            background-color: rgba(139, 92, 246, 0.05);
            border: 1px solid rgba(139, 92, 246, 0.15);
            border-radius: 16px;
            padding: 20px;
            text-align: left;
            margin-bottom: 30px;
        }

        .steps-title {
            font-family: var(--font-title);
            font-size: 15px;
            font-weight: 700;
            color: #a78bfa;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .step-item {
            font-size: 13.5px;
            line-height: 1.6;
            color: #cbd5e1;
            margin-bottom: 10px;
            padding-left: 20px;
            position: relative;
        }

        .step-item:last-child {
            margin-bottom: 0;
        }

        .step-item::before {
            content: '✓';
            color: #10b981;
            position: absolute;
            left: 0;
            font-weight: bold;
        }

        .btn-continue {
            display: inline-block;
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
            color: #ffffff;
            font-family: var(--font-title);
            font-weight: 700;
            font-size: 15px;
            border: none;
            border-radius: 14px;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.25s;
            box-shadow: 0 10px 20px rgba(139, 92, 246, 0.25);
        }

        .btn-continue:hover {
            opacity: 0.95;
            box-shadow: 0 15px 25px rgba(139, 92, 246, 0.35);
        }
    </style>
</head>
<body>

    <div class="success-card">
        <div class="success-icon">
            <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        </div>

        <h1 class="success-title">¡Pedido Confirmado!</h1>
        <p class="success-desc">
            Gracias por comprar en SpaceCard. Hemos registrado tu pedido con éxito y el equipo de Avaspace ha comenzado el proceso de impresión física y grabado láser personalizado.
        </p>

        <div class="order-details-box">
            <div class="details-row">
                <span class="details-label">Número de Pedido:</span>
                <span class="details-value">#SPC-{{ 10000 + $order->id }}</span>
            </div>
            <div class="details-row">
                <span class="details-label">Cliente:</span>
                <span class="details-value">{{ $order->customer_name }}</span>
            </div>
            <div class="details-row">
                <span class="details-label">Destinatario / Correo:</span>
                <span class="details-value">{{ $order->customer_email }}</span>
            </div>
            <div class="details-row">
                <span class="details-label">Total del Pago (Simulado):</span>
                <span class="details-value">${{ number_format($order->total, 2) }}</span>
            </div>
        </div>

        <div class="steps-box">
            <h4 class="steps-title">¿Qué sigue ahora?</h4>
            <div class="step-item">
                <strong>Impresión y Fabricación:</strong> Grabaremos tu logotipo y colores en tu hardware NFC en las próximas 24 horas.
            </div>
            <div class="step-item">
                <strong>Envío Postal:</strong> Te enviaremos un correo con el número de guía de paquetería cuando salga de nuestro almacén.
            </div>
            <div class="step-item">
                <strong>Activación de Escaneo:</strong> Cuando recibas tu hardware, simplemente **escanéalo con tu celular**. Te guiará automáticamente para crear tu cuenta y configurar tu tarjeta digital o reviews.
            </div>
        </div>

        <a href="/" class="btn-continue">Volver al Inicio</a>
    </div>

</body>
</html>
