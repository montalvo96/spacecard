{{--
    Notificaciones tipo toast para las páginas Blade (mismo diseño que
    resources/js/Components/Notify.jsx). Sustituye a alert():
        scToast('Mensaje', 'error' | 'success' | 'info', 'Título opcional');
    Requiere partials.icon-font en la página.
--}}
<style>
    .sc-toasts { position: fixed; z-index: 9999; left: 16px; right: 16px; bottom: 16px; display: flex; flex-direction: column; align-items: center; gap: 10px; pointer-events: none; }
    @media (min-width: 640px) { .sc-toasts { left: auto; right: 24px; bottom: 24px; align-items: flex-end; } }
    .sc-t { pointer-events: auto; position: relative; overflow: hidden; display: flex; align-items: flex-start; gap: 12px; width: 100%; max-width: 384px; box-sizing: border-box;
        padding: 14px 40px 14px 14px; background: #fff; color: #171717; border: 1px solid rgba(0,0,0,.07); border-radius: 16px;
        box-shadow: 0 18px 40px rgba(0,0,0,.14); font-family: 'Inter', system-ui, -apple-system, sans-serif; text-align: left;
        animation: sc-t-in .35s cubic-bezier(.22,1,.36,1); }
    .sc-t .ms { font-family: 'Material Symbols Rounded'; font-weight: normal; font-style: normal; line-height: 1; letter-spacing: normal; text-transform: none; white-space: nowrap; direction: ltr; display: inline-block; font-feature-settings: 'liga'; -webkit-font-smoothing: antialiased; }
    .sc-t.out { opacity: 0; transform: translateY(8px); transition: opacity .25s, transform .25s; }
    .sc-t-ic { flex-shrink: 0; width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .sc-t-ic .ms { font-variation-settings: 'FILL' 1; }
    .sc-t-title { margin: 2px 0 0; font-size: 14px; font-weight: 700; color: #171717; }
    .sc-t-msg { margin: 2px 0 0; font-size: 13px; line-height: 1.4; color: #525252; }
    .sc-t-x { position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; border: 0; border-radius: 999px; background: transparent; color: #a3a3a3; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .sc-t-x:hover { background: #f5f5f5; color: #171717; }
    .sc-t-bar { position: absolute; left: 0; bottom: 0; height: 3px; width: 100%; opacity: .55; transform-origin: left; animation: sc-t-bar 4.5s linear forwards; }
    .sc-t--success .sc-t-ic { background: #ECFDF5; color: #059669; } .sc-t--success .sc-t-bar { background: #10B981; }
    .sc-t--error .sc-t-ic { background: #FFF4F2; color: #D42410; }   .sc-t--error .sc-t-bar { background: #D42410; }
    .sc-t--info .sc-t-ic { background: #F5F5F5; color: #171717; }    .sc-t--info .sc-t-bar { background: #171717; }
    @keyframes sc-t-in { from { opacity: 0; transform: translateY(12px) scale(.97); } to { opacity: 1; transform: none; } }
    @keyframes sc-t-bar { from { transform: scaleX(1); } to { transform: scaleX(0); } }
    @media (prefers-reduced-motion: reduce) { .sc-t, .sc-t-bar { animation: none !important; } }
</style>
<script>
    (function () {
        var KIND = {
            success: { icon: 'check_circle', title: 'Listo' },
            error:   { icon: 'error',        title: 'Algo salió mal' },
            info:    { icon: 'info',         title: 'Aviso' },
        };
        function box() {
            var b = document.getElementById('sc-toasts');
            if (!b) { b = document.createElement('div'); b.id = 'sc-toasts'; b.className = 'sc-toasts'; b.setAttribute('aria-live', 'polite'); document.body.appendChild(b); }
            return b;
        }
        function close(t) { if (!t.parentNode) return; t.classList.add('out'); setTimeout(function () { t.remove(); }, 250); }
        window.scToast = function (message, type, title) {
            var k = KIND[type] ? type : 'info', cfg = KIND[k];
            var t = document.createElement('div');
            t.className = 'sc-t sc-t--' + k;
            t.setAttribute('role', k === 'error' ? 'alert' : 'status');
            t.innerHTML = '<span class="sc-t-ic"><span class="ms" aria-hidden="true">' + cfg.icon + '</span></span>'
                + '<div><p class="sc-t-title"></p><p class="sc-t-msg"></p></div>'
                + '<button type="button" class="sc-t-x" aria-label="Cerrar notificación"><span class="ms" aria-hidden="true">close</span></button>'
                + '<span class="sc-t-bar"></span>';
            t.querySelector('.sc-t-title').textContent = title || cfg.title;
            t.querySelector('.sc-t-msg').textContent = message;
            t.querySelector('.sc-t-x').onclick = function () { close(t); };
            var b = box(); b.appendChild(t);
            while (b.children.length > 4) b.firstChild.remove();
            setTimeout(function () { close(t); }, 4500);
            return t;
        };
    })();
</script>
