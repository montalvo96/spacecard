/**
 * Notificaciones con el estilo de la portada (blanco / negro / rojo #D42410).
 *
 *   const ok = await confirmDialog({ title, message, confirmText, tone: 'danger', icon: 'delete' });
 *   toast.success('Guardado'); toast.error('Algo salió mal'); toast.info('...');
 *
 * <NotifyHost /> se monta una sola vez en app.jsx y pinta el diálogo y los toasts.
 * Reemplaza los confirm()/alert() nativos del navegador.
 */

import { useEffect, useRef, useState } from 'react';

function Icon({ name, fill = false, className = '' }) {
    return <span aria-hidden="true" className={`ms ${fill ? 'ms-fill' : ''} ${className}`}>{name}</span>;
}

/* ---------- Store mínimo (sin dependencias) ---------- */

let state = { dialog: null, toasts: [] };
const listeners = new Set();
const emit = () => listeners.forEach((l) => l(state));
const set = (patch) => {
    state = { ...state, ...patch };
    emit();
};
let nextId = 1;

export function confirmDialog({
    title = '¿Estás seguro?',
    message = '',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    tone = 'primary', // 'danger' | 'primary'
    icon,
} = {}) {
    return new Promise((resolve) => {
        // Si ya había uno abierto, se cancela.
        state.dialog?.resolve(false);
        set({ dialog: { title, message, confirmText, cancelText, tone, icon, resolve } });
    });
}

const TOAST_MS = 4500;

function pushToast(type, message, opts = {}) {
    if (!message) return;
    const id = nextId++;
    set({ toasts: [...state.toasts, { id, type, message, title: opts.title }].slice(-4) });
    setTimeout(() => dismissToast(id), opts.duration ?? TOAST_MS);
    return id;
}

export function dismissToast(id) {
    set({ toasts: state.toasts.filter((t) => t.id !== id) });
}

export const toast = {
    success: (m, o) => pushToast('success', m, o),
    error: (m, o) => pushToast('error', m, o),
    info: (m, o) => pushToast('info', m, o),
};

/* ---------- Vista ---------- */

const TOAST_STYLE = {
    success: { icon: 'check_circle', ring: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-500', title: 'Listo' },
    error: { icon: 'error', ring: 'bg-[#FFF4F2] text-[#D42410]', bar: 'bg-[#D42410]', title: 'Algo salió mal' },
    info: { icon: 'info', ring: 'bg-neutral-100 text-neutral-800', bar: 'bg-neutral-900', title: 'Aviso' },
};

function Toasts({ toasts }) {
    return (
        <div
            aria-live="polite"
            className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-center gap-2.5 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
        >
            {toasts.map((t) => {
                const s = TOAST_STYLE[t.type] ?? TOAST_STYLE.info;
                return (
                    <div
                        key={t.id}
                        role={t.type === 'error' ? 'alert' : 'status'}
                        className="sc-toast pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-2xl border border-black/[0.07] bg-white py-3.5 pl-3.5 pr-10 shadow-[0_18px_40px_rgba(0,0,0,0.14)]"
                    >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${s.ring}`}>
                            <Icon name={s.icon} fill className="text-xl" />
                        </span>
                        <div className="min-w-0 pt-0.5">
                            <p className="font-display text-sm font-bold text-neutral-900">{t.title ?? s.title}</p>
                            <p className="mt-0.5 text-[13px] leading-snug text-neutral-600">{t.message}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => dismissToast(t.id)}
                            aria-label="Cerrar notificación"
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900"
                        >
                            <Icon name="close" className="text-lg" />
                        </button>
                        <span className={`sc-toast-bar absolute bottom-0 left-0 h-[3px] w-full ${s.bar}`} style={{ animationDuration: `${TOAST_MS}ms` }} />
                    </div>
                );
            })}
        </div>
    );
}

function Dialog({ dialog }) {
    const confirmRef = useRef(null);
    const close = (value) => {
        dialog.resolve(value);
        set({ dialog: null });
    };

    useEffect(() => {
        confirmRef.current?.focus();
        const onKey = (e) => {
            if (e.key === 'Escape') close(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [dialog]);

    const danger = dialog.tone === 'danger';
    const icon = dialog.icon ?? (danger ? 'delete' : 'help');

    return (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
            <div className="sc-fade absolute inset-0 bg-neutral-950/50 backdrop-blur-[2px]" onClick={() => close(false)} />
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="sc-dialog-title"
                aria-describedby="sc-dialog-msg"
                className="sc-pop relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-[0_30px_80px_rgba(0,0,0,0.3)] sm:p-7"
            >
                <span className={`absolute inset-x-0 top-0 h-1 ${danger ? 'bg-[#D42410]' : 'bg-neutral-900'}`} />
                <div className="flex items-start gap-4">
                    <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${danger ? 'bg-[#FFF4F2] text-[#D42410]' : 'bg-neutral-100 text-neutral-900'}`}
                    >
                        <Icon name={icon} className="text-2xl" />
                    </span>
                    <div className="min-w-0 pt-1">
                        <h2 id="sc-dialog-title" className="font-display text-lg font-bold leading-tight text-neutral-900">
                            {dialog.title}
                        </h2>
                        {dialog.message && (
                            <div id="sc-dialog-msg" className="mt-2 space-y-2 text-sm leading-relaxed text-neutral-600">
                                {[].concat(dialog.message).map((m, i) => (
                                    <p key={i}>{m}</p>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={() => close(false)}
                        className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900"
                    >
                        {dialog.cancelText}
                    </button>
                    <button
                        ref={confirmRef}
                        type="button"
                        onClick={() => close(true)}
                        className={`inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 ${danger ? 'bg-[#D42410] shadow-[0_8px_20px_rgba(212,36,16,0.3)] hover:bg-[#B81E0C]' : 'bg-neutral-900 hover:bg-black'}`}
                    >
                        <Icon name={icon} className="text-lg" />
                        {dialog.confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function NotifyHost() {
    const [s, setS] = useState(state);
    useEffect(() => {
        listeners.add(setS);
        return () => listeners.delete(setS);
    }, []);

    return (
        <>
            <style>{`
                @keyframes sc-toast-in { from { opacity: 0; transform: translateY(12px) scale(.97); } to { opacity: 1; transform: none; } }
                @keyframes sc-toast-bar { from { transform: scaleX(1); } to { transform: scaleX(0); } }
                @keyframes sc-fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes sc-pop-in { from { opacity: 0; transform: translateY(16px) scale(.96); } to { opacity: 1; transform: none; } }
                .sc-toast { animation: sc-toast-in .35s cubic-bezier(.22,1,.36,1); }
                .sc-toast-bar { transform-origin: left; animation: sc-toast-bar linear forwards; opacity: .55; }
                .sc-fade { animation: sc-fade-in .2s ease-out; }
                .sc-pop { animation: sc-pop-in .3s cubic-bezier(.22,1,.36,1); }
                @media (prefers-reduced-motion: reduce) { .sc-toast, .sc-fade, .sc-pop, .sc-toast-bar { animation: none !important; } }
            `}</style>
            {s.dialog && <Dialog dialog={s.dialog} />}
            <Toasts toasts={s.toasts} />
        </>
    );
}
