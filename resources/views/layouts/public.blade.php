<!DOCTYPE html>
<!--
  Plantilla base para páginas públicas de SpaceCard (Blade).
  Última modificación: 2026-08-06
  Autor: Antigravity
-->
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>@yield('title', 'SpaceCard')</title>
    
    <!-- Fuentes modernas desde Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;600;700&display=swap" rel="stylesheet">
    
    <!-- Estilos base premium en Vanilla CSS -->
    <style>
        :root {
            --bg-color: #0c0b14;
            --text-color: #f3f4f6;
            --text-muted: #9ca3af;
            --primary: #8b5cf6;
            --primary-hover: #7c3aed;
            --primary-glow: rgba(139, 92, 246, 0.35);
            --card-bg: rgba(255, 255, 255, 0.04);
            --card-border: rgba(255, 255, 255, 0.08);
            --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            --font-title: 'Outfit', sans-serif;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-color);
            font-family: var(--font-sans);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 20px;
            overflow-x: hidden;
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 40%);
        }

        .container {
            width: 100%;
            max-width: 480px;
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 24px;
            padding: 40px 30px;
            text-align: center;
            backdrop-filter: blur(20px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .logo {
            font-family: var(--font-title);
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 30px;
            letter-spacing: -0.5px;
            background: linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: inline-block;
        }

        .title {
            font-family: var(--font-title);
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #ffffff;
        }

        .description {
            font-size: 15px;
            line-height: 1.6;
            color: var(--text-muted);
            margin-bottom: 30px;
        }

        .btn {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            padding: 16px 24px;
            background: var(--primary);
            color: #ffffff;
            border: none;
            border-radius: 14px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.25s ease;
            box-shadow: 0 4px 14px var(--primary-glow);
        }

        .btn:hover {
            background: var(--primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px var(--primary-glow);
        }

        .btn:active {
            transform: translateY(0);
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #ffffff;
            box-shadow: none;
            margin-top: 12px;
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.15);
            box-shadow: none;
        }

        .badge {
            display: inline-block;
            padding: 6px 12px;
            background: rgba(239, 68, 68, 0.1);
            color: #f87171;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 500;
            margin-bottom: 20px;
            border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .badge-info {
            background: rgba(59, 130, 246, 0.1);
            color: #60a5fa;
            border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .footer {
            margin-top: 40px;
            font-size: 12px;
            color: var(--text-muted);
        }

        .footer a {
            color: var(--text-color);
            text-decoration: none;
            font-weight: 500;
        }

        /* Utilidades de formulario */
        .form-group {
            text-align: left;
            margin-bottom: 20px;
        }

        .form-label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: #e5e7eb;
            margin-bottom: 8px;
        }

        .form-input, .form-textarea {
            width: 100%;
            padding: 14px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: #ffffff;
            font-family: var(--font-sans);
            font-size: 15px;
            transition: all 0.25s ease;
        }

        .form-input:focus, .form-textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px var(--primary-glow);
            background: rgba(255, 255, 255, 0.08);
        }
        
        .alert-success {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.2);
            color: #34d399;
            padding: 14px;
            border-radius: 12px;
            font-size: 14px;
            margin-bottom: 20px;
            text-align: center;
        }
    </style>
    @yield('styles')
</head>
<body>
    <div class="container">
        <div class="logo">SpaceCard</div>
        @yield('content')
    </div>
    
    <div class="footer">
        Desarrollado por <a href="https://avaspaceio.com" target="_blank">Avaspace</a>
    </div>
    @yield('scripts')
</body>
</html>
