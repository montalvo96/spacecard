/**
 * Layout de acceso (login / registro) con el estilo de la landing: formulario
 * en blanco con acentos rojos y, al lado, un panel negro como la franja de la
 * portada, con la roseta de tarjetas (CardFan) y etiquetas rojas flotando.
 * Iconos: Material Symbols (clase .ms).
 */

import { useState } from 'react';
import { Link } from '@inertiajs/react';
import BrandLogo from '@/Components/BrandLogo';
import CardFan from '@/Components/CardFan';

export function Icon({ name, fill = false, className = '' }) {
    return <span aria-hidden="true" className={`ms ${fill ? 'ms-fill' : ''} ${className}`}>{name}</span>;
}

/** Palabra resaltada en el bloque rojo inclinado, como en el titular de la portada. */
export function Highlight({ children }) {
    return (
        <span className="relative mx-1 inline-block px-2 text-white">
            <span aria-hidden="true" className="sc-in-left absolute inset-0 -skew-x-12 rounded-md bg-[#D42410] shadow-[0_10px_24px_rgba(212,36,16,0.35)]" style={{ animationDelay: '350ms' }} />
            <span className="relative">{children}</span>
        </span>
    );
}

/** Campo con icono, etiqueta, error y (para contraseñas) botón de mostrar/ocultar. */
export function Field({ id, label, icon, type = 'text', error, autoFocus = false, ...props }) {
    const [visible, setVisible] = useState(false);
    const isPassword = type === 'password';

    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-neutral-800">{label}</label>
            <div
                className={`group flex items-center gap-2.5 rounded-2xl border bg-neutral-50 px-4 transition duration-300 focus-within:border-[#D42410] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(212,36,16,0.12)] ${error ? 'border-[#D42410]/60' : 'border-black/10 hover:border-black/25'}`}
            >
                <Icon name={icon} className="text-xl text-neutral-400 transition group-focus-within:text-[#D42410]" />
                <input
                    id={id}
                    name={id}
                    type={isPassword && visible ? 'text' : type}
                    autoFocus={autoFocus}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className="sc-input h-12 min-w-0 flex-1 border-0 bg-transparent p-0 text-base text-neutral-900 sm:text-[15px] placeholder:text-neutral-400 focus:outline-none focus:ring-0"
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setVisible((v) => !v)}
                        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-neutral-400 transition hover:bg-black/5 hover:text-neutral-900"
                    >
                        <Icon name={visible ? 'visibility_off' : 'visibility'} className="text-xl" />
                    </button>
                )}
            </div>
            {error && (
                <p id={`${id}-error`} className="sc-swap mt-1.5 flex items-center gap-1 text-[13px] font-medium text-[#B81E0C]">
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
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#D42410] text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(212,36,16,0.3)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#B81E0C] hover:shadow-[0_16px_34px_rgba(212,36,16,0.4)] disabled:translate-y-0 disabled:opacity-60"
        >
            {processing ? <Icon name="progress_activity" className="animate-spin text-xl" /> : children}
            {!processing && <Icon name="arrow_forward" className="text-lg transition duration-300 group-hover:translate-x-1" />}
        </button>
    );
}

// Etiquetas rojas que flotan alrededor de la roseta (mismo estilo que en la portada).
const TAGS = [
    // Sobre los bordes de las tarjetas (montan un poco encima) para que no se vean sueltas
    { icon: 'contactless', label: 'NFC', pos: 'left-[13%] top-[27%]', d: '0s' },
    { icon: 'qr_code_2', label: 'Código QR', pos: 'right-[9%] top-[27%]', d: '0s' },
    { icon: 'block', label: 'Sin apps', pos: 'inset-x-0 bottom-[24%] flex justify-center', d: '-3.2s' },
];

export default function AuthLayout({ mode, kicker, title, subtitle, children }) {
    const tab = (active) =>
        `flex h-10 flex-1 items-center justify-center rounded-full text-[13px] font-semibold transition duration-500 ${active ? 'bg-[#D42410] text-white shadow-[0_6px_16px_rgba(212,36,16,0.3)]' : 'text-neutral-500 hover:text-neutral-900'}`;

    return (
        <div className="relative flex min-h-screen min-h-[100dvh] items-center justify-center overflow-hidden bg-gradient-to-br from-white via-[#F6F6F7] to-[#ECECEE] px-3 py-4 font-inter text-neutral-900 antialiased sm:px-6 sm:py-10">
            {/* Formas de la marca en las esquinas de la página (más pequeñas en móvil para no tapar la tarjeta) */}
            <div aria-hidden="true" className="absolute -left-12 top-0 h-full w-16 sm:w-24 lg:w-32">
                <div className="sc-in-left h-full w-full bg-[#D42410] [clip-path:polygon(0_0,100%_0,30%_100%,0_100%)]" />
            </div>
            <div aria-hidden="true" className="sc-in-right absolute -right-6 bottom-0 h-16 w-32 sm:h-28 sm:w-56">
                <div className="sc-drift h-full w-full bg-neutral-900 [clip-path:polygon(30%_100%,100%_0,100%_100%)]" />
            </div>

            {/* Una columna (ancho cómodo) en móvil y tablet; dos columnas en escritorio */}
            <div className="sc-rise relative grid w-full max-w-[560px] overflow-hidden rounded-3xl bg-white shadow-[0_40px_100px_rgba(0,0,0,0.12)] ring-1 ring-black/5 grid-cols-[minmax(0,1fr)] sm:rounded-[32px] lg:max-w-[1120px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
                {/* Formulario */}
                <div className="flex min-w-0 flex-col px-5 py-6 sm:px-12 sm:py-10">
                    <Link href="/" className="self-start">
                        <BrandLogo className="h-7" />
                    </Link>

                    <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-7 sm:py-10">
                        <p className="sc-rise text-xs font-bold uppercase tracking-[0.18em] text-[#D42410]" style={{ animationDelay: '80ms' }}>{kicker}</p>
                        <h1 className="sc-rise mt-3 font-display text-[clamp(30px,8vw,44px)] lg:text-[clamp(34px,3.6vw,44px)] font-bold leading-[1.05] tracking-[-0.035em]" style={{ animationDelay: '150ms' }}>
                            {title}
                        </h1>
                        <p className="sc-rise mt-3 text-sm text-neutral-600" style={{ animationDelay: '220ms' }}>{subtitle}</p>

                        <nav aria-label="Acceso" className="sc-rise mt-6 flex rounded-full sm:mt-7 bg-neutral-100 p-1" style={{ animationDelay: '290ms' }}>
                            <Link href={route('login')} className={tab(mode === 'login')} aria-current={mode === 'login' ? 'page' : undefined}>Entrar</Link>
                            <Link href={route('register')} className={tab(mode === 'register')} aria-current={mode === 'register' ? 'page' : undefined}>Crear cuenta</Link>
                        </nav>

                        <div className="sc-rise mt-6 sm:mt-7" style={{ animationDelay: '360ms' }}>{children}</div>
                    </div>

                    <Link href="/" className="group inline-flex items-center gap-1.5 self-start text-[13px] font-medium text-neutral-500 transition hover:text-neutral-900">
                        <Icon name="arrow_back" className="text-lg transition duration-300 group-hover:-translate-x-1" />
                        Volver al inicio
                    </Link>
                </div>

                {/* Panel negro con la roseta, como la franja de la portada */}
                <div className="relative hidden min-h-[660px] flex-col overflow-hidden bg-[#0B0B0B] text-white lg:flex">
                    <div aria-hidden="true" className="absolute -right-6 top-0 h-28 w-56">
                        <div className="sc-in-right h-full w-full bg-[#D42410] [clip-path:polygon(30%_0,100%_0,100%_100%)]" style={{ animationDelay: '200ms' }} />
                    </div>
                    {/* Roseta centrada en el espacio libre del panel */}
                    <div className="relative flex flex-1 items-center px-10 pt-10">
                        <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2">
                            <div className="sc-blob h-full w-full bg-[radial-gradient(closest-side,rgba(255,40,10,0.38),transparent)]" />
                        </div>
                        <div className="relative mx-auto w-full max-w-[440px]">
                            <CardFan />
                            {TAGS.map((t, i) => (
                                <span key={t.label} className={`sc-rise pointer-events-none absolute z-20 ${t.pos}`} style={{ animationDelay: `${900 + i * 160}ms` }}>
                                    <span className="sc-bob inline-flex items-center gap-2 rounded-full bg-[#D42410] py-1.5 pl-1.5 pr-4 text-sm font-bold text-white shadow-[0_14px_34px_rgba(212,36,16,0.5)]" style={{ animationDelay: t.d }}>
                                        <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                                            <span aria-hidden="true" className="sc-ripple absolute inset-0 rounded-full border-2 border-white/70" />
                                            <Icon name={t.icon} className="relative text-lg" />
                                        </span>
                                        {t.label}
                                    </span>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Mensaje */}
                    <div className="relative p-10 pt-0">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">SpaceCard</p>
                        <p className="mt-3 max-w-sm font-display text-[30px] font-bold leading-[1.05] tracking-[-0.035em]">
                            La tarjeta que <span className="text-[#FF5A3C]">trabaja por ti</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
