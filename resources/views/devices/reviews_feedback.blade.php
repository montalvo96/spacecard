@extends('layouts.public')
/**
 * Vista intermedia para placas de reseñas de negocios con feedback privado activo.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

@section('title', 'Tu opinión importa - ' . $target->business_name)

@section('styles')
<style>
    .options-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
        margin-bottom: 30px;
    }
    
    .btn-google {
        background: #ffffff;
        color: #1f2937;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
        border: 1px solid #e5e7eb;
        font-family: var(--font-title);
    }
    
    .btn-google:hover {
        background: #f9fafb;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
    
    .btn-google img {
        width: 20px;
        height: 20px;
        margin-right: 10px;
    }
    
    .divider {
        display: flex;
        align-items: center;
        text-align: center;
        margin: 24px 0;
        color: var(--text-muted);
        font-size: 13px;
    }
    
    .divider::before, .divider::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .divider:not(:empty)::before {
        margin-right: .75em;
    }
    
    .divider:not(:empty)::after {
        margin-left: .75em;
    }
    
    .feedback-form {
        display: none;
        text-align: left;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 20px;
        margin-top: 20px;
        animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .feedback-toggle {
        cursor: pointer;
        color: var(--primary);
        font-weight: 600;
        font-size: 15px;
        text-decoration: underline;
        transition: color 0.2s;
    }
    
    .feedback-toggle:hover {
        color: var(--primary-hover);
    }
</style>
@endsection

@section('content')
    <span class="badge badge-info">{{ $target->business_name }}</span>
    <h1 class="title">¡Tu opinión nos ayuda a crecer!</h1>
    <p class="description">
        Queremos conocer tu experiencia en nuestro negocio. ¿Cómo prefieres compartir tus comentarios con nosotros hoy?
    </p>

    <!-- Éxito al enviar formulario -->
    <div id="success-alert" class="alert-success" style="display: none;">
        ¡Muchas gracias! Tu mensaje ha sido enviado directamente a la administración de forma privada.
    </div>
    
    <div class="options-grid">
        <!-- Enlace Directo a Google Reviews (Deep-link) -->
        <a href="{{ $target->review_url }}" target="_blank" class="btn btn-google">
            <!-- Icono simplificado de Google -->
            <svg style="width:20px;height:20px;margin-right:10px;vertical-align:middle;" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.927h6.6c-.29 1.5-.17 2.7-.1.4a8.1 8.1 0 0 1-3.5 5.3v2.85h5.6c3.27-3.02 5.15-7.46 5.15-12.4z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-5.6-2.85c-.99.66-2.23 1.06-3.83 1.06-3.13 0-5.78-2.11-6.73-4.96H1.1v3.01C3.1 21.39 7.24 24 12 24z"/>
                <path fill="#FBBC05" d="M5.27 14.34A7.16 7.16 0 0 1 4.9 12c0-.81.14-1.6.37-2.34V6.65H1.1A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.1 5.35l4.17-3.01z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.93 1.19 15.24 0 12 0 7.24 0 3.1 2.61 1.1 6.65l4.17 3.01c.95-2.85 3.6-4.96 6.73-4.96z"/>
            </svg>
            Dejar reseña en Google
        </a>
    </div>

    <div>
        <p class="description" style="margin-bottom: 10px;">
            ¿Tuviste algún inconveniente o prefieres enviarnos un comentario de forma directa?
        </p>
        <span class="feedback-toggle" onclick="toggleFeedbackForm()">Enviar comentario privado</span>
    </div>

    <!-- Formulario de Feedback Privado (AJAX) -->
    <div id="feedback-panel" class="feedback-form">
        <form id="ajax-feedback-form">
            @csrf
            <input type="hidden" name="review_target_id" value="{{ $target->id }}">
            
            <div class="form-group">
                <label class="form-label" for="name">Nombre</label>
                <input class="form-input" type="text" id="name" name="name" required placeholder="Tu nombre completo">
            </div>

            <div class="form-group">
                <label class="form-label" for="email">Correo electrónico</label>
                <input class="form-input" type="email" id="email" name="email" required placeholder="ejemplo@correo.com">
            </div>

            <div class="form-group">
                <label class="form-label" for="phone">Teléfono (opcional)</label>
                <input class="form-input" type="tel" id="phone" name="phone" placeholder="+52 1 123 456 7890">
            </div>

            <div class="form-group">
                <label class="form-label" for="note">Comentario o sugerencia</label>
                <textarea class="form-input" id="note" name="note" rows="4" required placeholder="Cuéntanos en detalle tu experiencia..."></textarea>
            </div>

            <button type="submit" id="submit-btn" class="btn">Enviar comentario</button>
        </form>
    </div>
@endsection

@section('scripts')
<script>
    function toggleFeedbackForm() {
        const panel = document.getElementById('feedback-panel');
        if (panel.style.display === 'block') {
            panel.style.display = 'none';
        } else {
            panel.style.display = 'block';
            panel.scrollIntoView({ behavior: 'smooth' });
        }
    }

    document.getElementById('ajax-feedback-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const form = this;
        const submitBtn = document.getElementById('submit-btn');
        const successAlert = document.getElementById('success-alert');
        const feedbackPanel = document.getElementById('feedback-panel');
        
        // Bloquear botón
        submitBtn.disabled = true;
        submitBtn.innerText = 'Enviando...';
        
        const formData = new FormData(form);
        
        // Enviar vía Fetch a la ruta POST
        fetch("{{ route('reviews.feedback.store', ['id' => $target->id]) }}", {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Mostrar alerta
                successAlert.style.display = 'block';
                // Ocultar formulario
                feedbackPanel.style.display = 'none';
                form.reset();
                successAlert.scrollIntoView({ behavior: 'smooth' });
            } else {
                alert('Ocurrió un error al enviar el comentario: ' + (data.message || 'Error desconocido'));
                submitBtn.disabled = false;
                submitBtn.innerText = 'Enviar comentario';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error de conexión al enviar el formulario.');
            submitBtn.disabled = false;
            submitBtn.innerText = 'Enviar comentario';
        });
    });
</script>
@endsection
