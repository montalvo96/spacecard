import '../css/app.css';
import './bootstrap';

import NotifyHost, { toast } from '@/Components/Notify';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Los mensajes del servidor (redirect()->with('success'|'error', ...)) se
// muestran como toasts con el diseño de la app, en cualquier página.
// En recargas parciales (router.reload({ only: [...] })) Inertia conserva el
// `flash` anterior tal cual; se compara por referencia para no repetir un
// mensaje viejo (p. ej. «Lote eliminado» al marcar una tarjeta después).
let lastFlash = null;
function showFlash(page) {
    const flash = page?.props?.flash;
    if (!flash || flash === lastFlash) return;
    lastFlash = flash;
    if (flash.success) toast.success(flash.success);
    if (flash.error) toast.error(flash.error);
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <NotifyHost />
            </>,
        );

        showFlash(props.initialPage);
        router.on('success', (event) => showFlash(event.detail.page));
    },
    progress: {
        color: '#D42410',
    },
});
