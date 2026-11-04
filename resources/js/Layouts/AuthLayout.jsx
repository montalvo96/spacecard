/**
 * Layout de acceso (login / registro) con el estilo de la landing:
 * fondo negro, acento rojo, panel de formulario + panel visual con la
 * tarjeta flotando. Iconos: Material Symbols (clase .ms).
 */

import { useRef, useState } from 'react';
import { Link } from '@inertiajs/react';

export function Icon({ name, fill = false, className = '' }) {
    return <span aria-hidden="true" className={`ms ${fill ? 'ms-fill' : ''} ${className}`}>{name}</span>;
}

/** Campo con icono, etiqueta, error y (para contraseñas) botón de mostrar/ocultar. */
export function Field({ id, label, icon, type = 'text', error, autoFocus = false, ...props }) {
    const [visible, setVisible] = useState(false);
    const isPassword = type === 'password';

    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-neutral-300">{label}</label>
            <div
                className={`group flex items-center gap-2.5 rounded-2xl border bg-[#161616] px-4 transition duration-300 focus-within:border-[#FF5A3C] focus-within:shadow-[0_0_0_4px_rgba(255,59,31,0.15)] ${error ? 'border-[#FF5A3C]/70' : 'border-white/10 hover:border-white/20'}`}
            >
                <Icon name={icon} className="text-xl text-neutral-500 transition group-focus-within:text-[#FF5A3C]" />
                <input
                    id={id}
                    name={id}
                    type={isPassword && visible ? 'text' : type}
                    autoFocus={autoFocus}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className="sc-input h-12 min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-white placeholder:text-neutral-600 focus:outline-none focus:ring-0"
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setVisible((v) => !v)}
                        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 transition hover:bg-white/5 hover:text-white"
                    >
                        <Icon name={visible ? 'visibility_off' : 'visibility'} className="text-xl" />
                    </button>
                )}
            </div>
            {error && (
                <p id={`${id}-error`} className="sc-swap mt-1.5 flex items-center gap-1 text-[13px] text-[#FF8A73]">
                    <Icon name="error" className="text-base" />
                    {error}
                </p>
            )}
        </div>
    );
}

export function SubmitButton({ children, processing }) {
    return (
        <button
            type="submit"
            disabled={processing}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#D42410] text-[15px] font-semibold text-white shadow-[0_10px_30px_rgba(255,40,10,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#B81E0C] hover:shadow-[0_16px_40px_rgba(255,40,10,0.5)] disabled:translate-y-0 disabled:opacity-60"
        >
            {processing ? <Icon name="progress_activity" className="animate-spin text-xl" /> : children}
            {!processing && <Icon name="arrow_forward" className="text-lg transition duration-300 group-hover:translate-x-1" />}
        </button>
    );
}

export default function AuthLayout({ mode, title, subtitle, children }) {
    const visualRef = useRef(null);
    const frame = useRef(0);

    // Inclina la tarjeta hacia el cursor (variables CSS, sin re-renderizar;
    // como mucho una actualización por cuadro).
    const onMove = (e) => {
        if (frame.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const { clientX, clientY } = e;
        frame.current = requestAnimationFrame(() => {
            frame.current = 0;
            const r = visualRef.current.getBoundingClientRect();
            visualRef.current.style.setProperty('--mx', ((clientX - r.left) / r.width - 0.5).toFixed(3));
            visualRef.current.style.setProperty('--my', ((clientY - r.top) / r.height - 0.5).toFixed(3));
        });
    };
    const onLeave = () => {
        cancelAnimationFrame(frame.current);
        frame.current = 0;
        visualRef.current.style.setProperty('--mx', 0);
        visualRef.current.style.setProperty('--my', 0);
    };

    const tab = (active) =>
        `flex h-10 flex-1 items-center justify-center rounded-full text-[13px] font-semibold transition duration-500 ${active ? 'bg-[#D42410] text-white shadow-[0_4px_14px_rgba(255,40,10,0.35)]' : 'text-neutral-400 hover:text-white'}`;

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070707] px-4 py-10 font-inter text-neutral-100 antialiased">
            {/* Luces de fondo */}
            <div aria-hidden="true" className="sc-blob pointer-events-none absolute -bottom-40 -left-40 h-[520px] w-[520px] bg-[radial-gradient(closest-side,rgba(255,40,10,0.35),transparent)]" />
            <div aria-hidden="true" className="sc-blob pointer-events-none absolute -right-32 -top-40 h-[420px] w-[420px] bg-[radial-gradient(closest-side,rgba(255,90,60,0.22),transparent)] [animation-delay:-9s]" />

            <div className="sc-rise relative grid w-full max-w-[1100px] overflow-hidden rounded-[32px] border border-white/10 bg-[#0E0E0E]/90 shadow-[0_40px_120px_rgba(0,0,0,0.6)] lg:grid-cols-[1fr_1.05fr]">
                {/* Formulario */}
                <div className="flex flex-col px-6 py-8 sm:px-12 sm:py-10">
                    <Link href="/" className="group flex items-center gap-2.5 self-start">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D42410] text-white transition duration-500 group-hover:rotate-[20deg] group-hover:scale-110">
                            <Icon name="bolt" fill className="text-xl" />
                        </span>
                        <span className="font-display text-lg font-semibold tracking-tight">SpaceCard</span>
                    </Link>

                    <div className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center py-10">
                        <h1 className="sc-rise font-display text-[40px] font-normal leading-none tracking-[-0.04em]" style={{ animationDelay: '120ms' }}>
                            {title}
                        </h1>
                        <p className="sc-rise mt-3 text-sm text-neutral-400" style={{ animationDelay: '200ms' }}>{subtitle}</p>

                        <nav aria-label="Acceso" className="sc-rise mt-7 flex rounded-full border border-white/10 bg-white/[0.03] p-1" style={{ animationDelay: '280ms' }}>
                            <Link href={route('login')} className={tab(mode === 'login')} aria-current={mode === 'login' ? 'page' : undefined}>Entrar</Link>
                            <Link href={route('register')} className={tab(mode === 'register')} aria-current={mode === 'register' ? 'page' : undefined}>Crear cuenta</Link>
                        </nav>

                        <div className="sc-rise mt-7" style={{ animationDelay: '360ms' }}>{children}</div>
                    </div>

                    <Link href="/" className="group inline-flex items-center gap-1.5 self-start text-[13px] text-neutral-500 transition hover:text-white">
                        <Icon name="arrow_back" className="text-lg transition duration-300 group-hover:-translate-x-1" />
                        Volver al inicio
                    </Link>
                </div>

                {/* Visual */}
                <div
                    ref={visualRef}
                    onMouseMove={onMove}
                    onMouseLeave={onLeave}
                    className="relative hidden min-h-[640px] overflow-hidden border-l border-white/[0.06] bg-[#0A0A0A] [--mx:0] [--my:0] lg:block"
                >
                    {/* Retícula sutil */}
                    <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]" />
                    {/* Luz orgánica que sigue al cursor */}
                    <div
                        aria-hidden="true"
                        className="absolute left-1/2 top-1/2 h-[520px] w-[520px]"
                        style={{
                            transform: 'translate(calc(-50% + var(--mx) * 120px), calc(-50% + var(--my) * 90px))',
                            transition: 'transform 1.6s cubic-bezier(0.22,1,0.36,1)',
                        }}
                    >
                        <div className="sc-blob h-full w-full bg-[radial-gradient(closest-side,rgba(255,40,10,0.5),rgba(255,40,10,0.12)_55%,transparent)]" />
                    </div>

                    {/* Tarjetas flotando */}
                    <div
                        className="absolute inset-0 flex items-center justify-center [perspective:1000px]"
                        style={{
                            transform: 'rotateY(calc(var(--mx) * 18deg)) rotateX(calc(var(--my) * -14deg))',
                            transition: 'transform 0.9s cubic-bezier(0.22,1,0.36,1)',
                        }}
                    >
                        <div className="sc-bob absolute left-[8%] top-[14%] w-[46%] opacity-70 [animation-delay:-2s]">
                            <img src="/img/products/card-black.png" alt="" className="w-full rotate-[14deg] drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]" />
                        </div>
                        <div className="sc-float relative w-[72%]">
                            <img src="/img/products/card-red.png" alt="SpaceCard roja" className="w-full drop-shadow-[0_40px_60px_rgba(255,40,10,0.35)]" />
                        </div>
                    </div>

                    {/* Mensaje */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent p-10 pt-24">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-2.5 pr-3.5 text-xs font-medium text-neutral-200">
                            <Icon name="contactless" className="text-base text-[#FF5A3C]" />
                            NFC · QR · Sin apps
                        </span>
                        <p className="mt-4 max-w-sm font-display text-[28px] leading-[1.1] tracking-[-0.03em]">
                            Tu tarjeta, tu perfil, <span className="text-[#FF5A3C]">siempre al día.</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
