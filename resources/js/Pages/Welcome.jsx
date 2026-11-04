/**
 * Landing de SpaceCard — fondo negro con acento rojo, paneles translúcidos
 * y titulares grandes. Iconos: Material Symbols de Google Fonts (clase .ms).
 * Animaciones (sc-*) definidas en resources/css/app.css; respetan
 * prefers-reduced-motion.
 *
 * Autor: SpaceCard 2.0
 */

import { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';

const CARD_COLORS = [
    { id: 'negro', name: 'Negro', hex: '#1E1E26', src: '/img/products/card-black.png' },
    { id: 'rojo', name: 'Rojo', hex: '#D6283B', src: '/img/products/card-red.png' },
    { id: 'rosa', name: 'Rosa', hex: '#F29AB8', src: '/img/products/card-pink.png' },
    { id: 'purpura', name: 'Púrpura', hex: '#7A4FD6', src: '/img/products/card-purple.png' },
    { id: 'azul', name: 'Azul', hex: '#2F6FE0', src: '/img/products/card-blue.png' },
    { id: 'verde', name: 'Verde', hex: '#2FA36B', src: '/img/products/card-green.png' },
];

const HERO_STATS = [
    { label: 'Colores', value: 6, icon: 'palette' },
    { label: 'Caras a tu gusto', value: 2, icon: 'flip' },
    { label: 'Apps necesarias', value: 0, icon: 'block' },
];

const STEPS = [
    { icon: 'palette', title: 'Diseña tu tarjeta', desc: 'Elige color y personaliza sus dos caras.' },
    { icon: 'badge', title: 'Arma tu perfil', desc: 'Datos, enlaces y redes desde tu panel.' },
    { icon: 'contactless', title: 'Acerca y comparte', desc: 'Un toque al teléfono o escanean el QR.' },
];

const INCLUDES = [
    { icon: 'contact_page', label: 'Contacto vCard' },
    { icon: 'wallet', label: 'Apple Wallet' },
    { icon: 'account_balance_wallet', label: 'Google Wallet' },
    { icon: 'qr_code_2', label: 'Código QR' },
    { icon: 'monitoring', label: 'Analíticas' },
    { icon: 'star', label: 'Reseñas de Google' },
];

const PRODUCTS = [
    { id: 'card', icon: 'credit_card', name: 'SpaceCard', tag: 'Tarjeta NFC', price: '$29.99', img: '/img/products/card-black.png', desc: 'La tarjeta de presentación inteligente. Diseño premium de 2 caras, 6 colores.', chips: ['NFC + QR', '2 caras personalizables', '6 colores'] },
    { id: 'band', icon: 'watch', name: 'SpaceBand', tag: 'Pulsera NFC', price: '$19.99', img: '/img/products/bracelets.png', desc: 'Networking en tu muñeca. Silicona premium en rojo, negro y blanco.', chips: ['NFC', 'Silicona premium', 'Rojo · Negro · Blanco'] },
    { id: 'plate', icon: 'reviews', name: 'Placa Google', tag: 'Reseñas', price: '$39.99', img: '/img/products/card-blue.png', desc: 'Multiplica tus reseñas de Google. Los clientes escanean y califican al instante.', chips: ['Reseñas de Google', 'NFC + QR', 'Para tu negocio'] },
];

const FAQS = [
    { q: '¿Quien recibe mi tarjeta necesita una app?', a: 'No. Basta con acercar la tarjeta a su teléfono (NFC) o escanear el QR: tu perfil se abre en el navegador.' },
    { q: '¿Funciona con cualquier teléfono?', a: 'Sí. Los teléfonos con NFC lo abren con un toque y cualquier teléfono con cámara puede escanear el QR.' },
    { q: '¿Puedo cambiar mis datos después?', a: 'Cuando quieras, desde tu panel. La tarjeta sigue apuntando a tu perfil actualizado.' },
    { q: '¿Tengo que pagar una suscripción?', a: 'No es obligatoria. Compras tu dispositivo y tu perfil queda activo.' },
];

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Icon({ name, fill = false, className = '' }) {
    return <span aria-hidden="true" className={`ms ${fill ? 'ms-fill' : ''} ${className}`}>{name}</span>;
}

function Chip({ children }) {
    return (
        <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-900">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D42410]" />
            {children}
        </span>
    );
}

/** Marca con .is-in cada .sc-reveal cuando entra en pantalla. */
function useReveal() {
    useEffect(() => {
        const items = document.querySelectorAll('.sc-reveal');
        if (!('IntersectionObserver' in window)) {
            items.forEach((el) => el.classList.add('is-in'));
            return;
        }
        const io = new IntersectionObserver(
            (entries) => entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add('is-in');
                    io.unobserve(e.target);
                }
            }),
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
        );
        items.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);
}

/** Cuenta desde 0 hasta `to` con desaceleración suave. */
function CountUp({ to, delay = 0 }) {
    const [n, setN] = useState(reducedMotion() ? to : 0);
    useEffect(() => {
        if (reducedMotion() || to === 0) return;
        let raf;
        const timer = setTimeout(() => {
            const start = performance.now();
            const tick = (t) => {
                const p = Math.min((t - start) / 1200, 1);
                setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
                if (p < 1) raf = requestAnimationFrame(tick);
            };
            raf = requestAnimationFrame(tick);
        }, delay);
        return () => {
            clearTimeout(timer);
            cancelAnimationFrame(raf);
        };
    }, [to, delay]);
    return n;
}

export default function Welcome({ auth, canLogin, canRegister }) {
    const user = auth?.user;
    const [colorId, setColorId] = useState('rojo');
    const [productId, setProductId] = useState('card');
    const [openFaq, setOpenFaq] = useState(null);
    const heroRef = useRef(null);
    const frame = useRef(0);

    useReveal();

    // Posición del cursor en el hero (-0.5…0.5) como variables CSS: inclina la
    // tarjeta y arrastra la luz con retardo, sin re-renderizar. Como mucho una
    // actualización por cuadro.
    const onHeroMove = (e) => {
        if (reducedMotion() || frame.current) return;
        const { clientX, clientY } = e;
        frame.current = requestAnimationFrame(() => {
            frame.current = 0;
            const r = heroRef.current.getBoundingClientRect();
            heroRef.current.style.setProperty('--mx', ((clientX - r.left) / r.width - 0.5).toFixed(3));
            heroRef.current.style.setProperty('--my', ((clientY - r.top) / r.height - 0.5).toFixed(3));
        });
    };
    const onHeroLeave = () => {
        cancelAnimationFrame(frame.current);
        frame.current = 0;
        heroRef.current.style.setProperty('--mx', 0);
        heroRef.current.style.setProperty('--my', 0);
    };

    const color = CARD_COLORS.find((c) => c.id === colorId);
    const product = PRODUCTS.find((p) => p.id === productId);
    const accountHref = user ? route('dashboard') : route('register');
    const accountLabel = user ? 'Mi panel' : 'Crear cuenta';
    const ease = 'cubic-bezier(0.22,1,0.36,1)';

    return (
        <>
            <Head title="SpaceCard · Tu tarjeta de presentación inteligente" />

            <div className="min-h-screen overflow-x-clip bg-[#070707] font-inter text-[15px] leading-relaxed text-neutral-100 antialiased">
                <div className="mx-auto max-w-[1360px]">
                    {/* NAV */}
                    <header className="sc-rise flex flex-wrap items-center justify-between gap-3.5 px-5 py-4 sm:px-7">
                        <Link href="/" className="group flex items-center gap-2.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D42410] text-white transition duration-500 group-hover:rotate-[20deg] group-hover:scale-110">
                                <Icon name="bolt" fill className="text-xl" />
                            </span>
                            <span className="font-display text-lg font-semibold tracking-tight">SpaceCard</span>
                        </Link>
                        <nav aria-label="Principal" className="order-last flex w-full flex-wrap justify-center gap-0.5 rounded-full border border-white/10 bg-white/[0.03] p-1 md:order-none md:w-auto">
                            <a href="#inicio" className="rounded-full bg-[#D42410] px-4 py-2 text-[13px] font-semibold text-white">Inicio</a>
                            <a href="#como" className="rounded-full px-4 py-2 text-[13px] font-medium text-neutral-300 transition hover:bg-white/5 hover:text-white">Cómo funciona</a>
                            <a href="#productos" className="rounded-full px-4 py-2 text-[13px] font-medium text-neutral-300 transition hover:bg-white/5 hover:text-white">Tienda</a>
                            <a href="#preguntas" className="rounded-full px-4 py-2 text-[13px] font-medium text-neutral-300 transition hover:bg-white/5 hover:text-white">Preguntas</a>
                        </nav>
                        <div className="flex items-center gap-2">
                            {!user && canLogin && (
                                <Link href={route('login')} className="px-3.5 py-2.5 text-[13px] font-medium text-neutral-300 transition hover:text-white">Entrar</Link>
                            )}
                            {(user || canRegister) && (
                                <Link href={accountHref} className="group inline-flex items-center gap-1.5 rounded-full bg-[#D42410] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#B81E0C]">
                                    {accountLabel}
                                    <Icon name="north_east" className="text-lg transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                </Link>
                            )}
                        </div>
                    </header>

                    {/* HERO */}
                    <section
                        id="inicio"
                        ref={heroRef}
                        onMouseMove={onHeroMove}
                        onMouseLeave={onHeroLeave}
                        className="relative px-5 pb-16 pt-10 [--mx:0] [--my:0] sm:px-7"
                    >
                        {/* Luz orgánica: sigue al cursor con retardo y cambia de forma */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute left-1/2 top-10 h-[640px] w-[640px] max-w-full"
                            style={{
                                transform: 'translate(calc(-35% + var(--mx) * 140px), calc(var(--my) * 90px))',
                                transition: `transform 1.6s ${ease}`,
                            }}
                        >
                            <div className="sc-blob h-full w-full bg-[radial-gradient(closest-side,rgba(255,40,10,0.45),rgba(255,40,10,0.12)_55%,transparent)]" />
                        </div>

                        <div className="relative flex flex-wrap items-start gap-8">
                            {/* Texto */}
                            <div className="min-w-0 flex-[1_1_440px]">
                                <span className="sc-rise inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-2.5 pr-3.5 text-xs font-medium text-neutral-200" style={{ animationDelay: '100ms' }}>
                                    <span className="relative flex h-4 w-4 items-center justify-center">
                                        <span className="sc-ripple absolute inset-0 rounded-full border border-[#FF5A3C]" />
                                        <span className="sc-ripple absolute inset-0 rounded-full border border-[#FF5A3C]" style={{ animationDelay: '1.2s' }} />
                                        <Icon name="contactless" className="relative text-base text-[#FF5A3C]" />
                                    </span>
                                    NFC · QR · Sin apps
                                </span>
                                <h1 className="mt-5 font-display text-[clamp(48px,6.4vw,92px)] font-normal leading-[0.95] tracking-[-0.045em]">
                                    <span className="sc-rise block" style={{ animationDelay: '200ms' }}>Tu tarjeta,</span>
                                    <span className="sc-rise block" style={{ animationDelay: '330ms' }}>tu perfil,</span>
                                    <span className="sc-rise block text-[#FF5A3C]" style={{ animationDelay: '460ms' }}>reinventados</span>
                                </h1>
                                <p className="sc-rise mt-6 max-w-[420px] text-neutral-400" style={{ animationDelay: '600ms' }}>
                                    Una tarjeta física premium conectada a un perfil digital que editas cuando quieras. Comparte todo sobre ti con un solo toque.
                                </p>
                                <div className="sc-rise mt-7 flex flex-wrap gap-2.5" style={{ animationDelay: '720ms' }}>
                                    <Link href={route('shop.comprar')} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium transition duration-300 hover:-translate-y-0.5 hover:bg-white/10">
                                        Ver tienda
                                    </Link>
                                    <Link href={route('shop.comprar')} className="group inline-flex items-center gap-1.5 rounded-full bg-[#D42410] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(255,40,10,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#B81E0C] hover:shadow-[0_16px_40px_rgba(255,40,10,0.5)]">
                                        Diseña la tuya
                                        <Icon name="arrow_forward" className="text-lg transition duration-300 group-hover:translate-x-1" />
                                    </Link>
                                </div>
                                <div className="mt-9 grid max-w-[520px] grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2.5">
                                    {HERO_STATS.map((s, i) => (
                                        <div
                                            key={s.label}
                                            className="sc-rise rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3.5 transition duration-500 hover:-translate-y-1 hover:border-[#FF3B1F]/40 hover:bg-white/[0.06]"
                                            style={{ animationDelay: `${850 + i * 110}ms` }}
                                        >
                                            <div className="flex items-center justify-between text-[11px] text-neutral-400">
                                                {s.label}
                                                <Icon name={s.icon} className="text-lg text-[#FF5A3C]" />
                                            </div>
                                            <div className="mt-4 font-display text-4xl tabular-nums tracking-tight">
                                                <CountUp to={s.value} delay={900 + i * 110} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tarjeta: se inclina hacia el cursor, flota y cambia de color con transición */}
                            <div className="sc-rise flex min-w-0 flex-[1_1_380px] flex-col items-center gap-5 pt-10" style={{ animationDelay: '400ms' }}>
                                <div
                                    className="w-full max-w-[460px] [perspective:1000px]"
                                    style={{
                                        transform: 'rotateY(calc(var(--mx) * 22deg)) rotateX(calc(var(--my) * -16deg))',
                                        transition: `transform 0.9s ${ease}`,
                                    }}
                                >
                                    <div className="sc-float">
                                        <img
                                            key={color.id}
                                            src={color.src}
                                            alt={`SpaceCard color ${color.name}`}
                                            className="sc-swap h-auto w-full drop-shadow-[0_40px_60px_rgba(255,40,10,0.35)]"
                                        />
                                    </div>
                                </div>
                                <div role="group" aria-label="Elige el color de tu tarjeta" className="flex flex-wrap justify-center gap-1 rounded-full border border-white/10 bg-black/50 p-1">
                                    {CARD_COLORS.map((c) => {
                                        const active = c.id === colorId;
                                        return (
                                            <button
                                                key={c.id}
                                                type="button"
                                                aria-label={c.name}
                                                aria-pressed={active}
                                                onClick={() => setColorId(c.id)}
                                                className="group flex h-11 w-11 items-center justify-center rounded-full"
                                            >
                                                <span
                                                    className={`h-[26px] w-[26px] rounded-full transition duration-500 group-hover:scale-110 ${active ? 'scale-110 ring-2 ring-neutral-100 ring-offset-[3px] ring-offset-black' : 'ring-1 ring-inset ring-white/20'}`}
                                                    style={{ background: c.hex, transitionTimingFunction: ease }}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="text-xs text-neutral-400">
                                    Color: <strong key={color.id} className="sc-swap inline-block font-semibold text-neutral-100">{color.name}</strong>
                                </div>
                            </div>

                            {/* Tarjetas flotantes */}
                            <div className="flex min-w-[220px] flex-[0_1_250px] flex-col gap-3">
                                <div className="sc-rise" style={{ animationDelay: '650ms' }}>
                                    <div className="sc-bob rounded-[22px] border border-white/10 bg-neutral-900/75 p-4">
                                        <div className="flex items-center justify-between text-[11px] text-neutral-400">
                                            Tu perfil
                                            <Icon name="open_in_new" className="text-lg" />
                                        </div>
                                        <div className="mt-3 flex flex-col items-center rounded-[14px] bg-[#F5F3F2] p-3.5 text-center text-neutral-900">
                                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D42410] text-white">
                                                <Icon name="person" fill className="text-[26px]" />
                                            </span>
                                            <span className="mt-1.5 font-display text-sm font-semibold">[Tu nombre]</span>
                                            <span className="text-[11px] text-neutral-600">[Tu cargo · Empresa]</span>
                                            <span className="mt-2.5 flex gap-1.5">
                                                {['call', 'mail', 'language', 'location_on'].map((i) => (
                                                    <Icon key={i} name={i} className="rounded-lg bg-[#E9E5E3] p-1.5 text-lg transition duration-300 hover:-translate-y-0.5 hover:bg-[#D42410] hover:text-white" />
                                                ))}
                                            </span>
                                        </div>
                                        <p className="mt-3 text-xs text-neutral-400">Lo que ven al acercar tu tarjeta. Lo editas desde tu panel.</p>
                                    </div>
                                </div>
                                <div className="sc-rise" style={{ animationDelay: '800ms' }}>
                                    <div className="sc-bob rounded-[22px] border border-white/10 bg-neutral-900/75 p-4" style={{ animationDelay: '-3s' }}>
                                        <div className="text-[11px] text-neutral-400">Compatible con</div>
                                        <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs text-neutral-200">
                                            {[['phone_iphone', 'iPhone'], ['phone_android', 'Android'], ['nfc', 'NFC'], ['qr_code_2', 'QR']].map(([i, l]) => (
                                                <span key={l} className="flex items-center gap-1.5">
                                                    <Icon name={i} className="text-lg text-[#FF5A3C]" />
                                                    {l}
                                                </span>
                                            ))}
                                        </div>
                                        <Link href={accountHref} className="mt-3.5 flex items-center justify-center rounded-full bg-[#D42410] py-2.5 text-xs font-semibold text-white transition hover:bg-[#B81E0C]">
                                            {user ? 'Ir a mi panel' : 'Crear cuenta gratis'}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Declaración */}
                        <div className="relative mt-[72px] flex flex-wrap items-start justify-between gap-6">
                            <span className="sc-reveal inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-1.5 text-xs text-neutral-300">
                                <Icon name="add" className="text-base" />
                                Sobre SpaceCard
                            </span>
                            <p className="sc-reveal min-w-0 flex-[0_1_760px] font-display text-[clamp(26px,3.2vw,42px)] leading-[1.15] tracking-[-0.025em]" style={{ '--d': '120ms' }}>
                                Creamos <span className="text-[#FF5A3C]">tarjetas inteligentes</span> que conectan a las personas, con un{' '}
                                <span className="text-[#FF5A3C]">perfil digital</span> que siempre está al día y te ayuda a{' '}
                                <span className="text-[#FF5A3C]">convertir saludos</span> en contactos reales.
                            </p>
                        </div>
                    </section>

                    {/* CÓMO FUNCIONA */}
                    <section id="como" className="flex flex-wrap gap-3.5 px-5 pb-[72px] sm:px-7">
                        <div className="sc-reveal flex min-w-0 flex-[999_1_520px] flex-col items-center rounded-[26px] border border-white/10 bg-gradient-to-b from-[#1A1A1A] to-[#0E0E0E] p-7 text-center">
                            <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF5A3C]" />
                                Así de fácil
                            </span>
                            <h2 className="mt-2 font-display text-3xl tracking-tight">
                                Acerca, <span className="text-[#FF5A3C]">comparte</span>, conecta
                            </h2>
                            <div className="mt-5 grid w-full grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-2.5 text-left">
                                {STEPS.map((s, i) => (
                                    <div
                                        key={s.title}
                                        className="sc-reveal group rounded-[18px] border border-[#FF3B1F]/30 bg-[#FF3B1F]/10 p-[18px] transition-[border-color,background-color,translate] duration-500 hover:-translate-y-1 hover:border-[#FF3B1F]/60 hover:bg-[#FF3B1F]/15"
                                        style={{ '--d': `${200 + i * 140}ms` }}
                                    >
                                        <Icon name={s.icon} className="text-[28px] text-[#FF5A3C] transition duration-500 group-hover:-rotate-12 group-hover:scale-110" />
                                        <div className="mt-4 text-[11px] text-neutral-400">0{i + 1}</div>
                                        <h3 className="mt-0.5 text-base font-semibold">{s.title}</h3>
                                        <p className="mt-1.5 text-[13px] text-neutral-400">{s.desc}</p>
                                    </div>
                                ))}
                            </div>
                            <Link href={route('shop.comprar')} className="group mt-5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#1F1F1F] px-5 py-2.5 text-[13px] font-semibold transition duration-300 hover:-translate-y-0.5 hover:bg-[#2A2A2A]">
                                Empezar ahora
                                <Icon name="arrow_forward" className="text-lg transition duration-300 group-hover:translate-x-1" />
                            </Link>
                        </div>
                        <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-3.5">
                            <div className="sc-reveal rounded-[26px] border border-white/10 bg-[#111111] p-6 transition-[border-color] duration-500 hover:border-white/20" style={{ '--d': '150ms' }}>
                                <p className="text-[13px] text-neutral-400">Tarjeta, pulsera o placa de reseñas. Todos apuntan a tu mismo perfil inteligente.</p>
                                <div className="mt-4 flex items-end justify-between gap-2.5">
                                    <span className="text-xs text-neutral-400">Desde</span>
                                    <span className="font-display text-[64px] font-light leading-none tracking-[-0.05em]">$19.99</span>
                                </div>
                            </div>
                            <div className="sc-reveal flex flex-col gap-3.5 rounded-[26px] border border-white/10 bg-[#111111] p-6 transition-[border-color] duration-500 hover:border-white/20" style={{ '--d': '280ms' }}>
                                <div className="flex items-center justify-between">
                                    <span className="text-[13px] font-semibold">Nuevo contacto</span>
                                    <Icon name="group_add" className="text-[22px] text-[#FF5A3C]" />
                                </div>
                                <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                                    <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#2A2A2A] text-neutral-300">
                                        <Icon name="person" className="text-[22px]" />
                                        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-ping rounded-full bg-[#FF5A3C]/70" />
                                        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#111111] bg-[#FF5A3C]" />
                                    </span>
                                    <span className="flex flex-col text-[13px]">
                                        <strong className="font-semibold">[Nombre del contacto]</strong>
                                        <span className="text-neutral-400">Te dejó sus datos al escanear</span>
                                    </span>
                                </div>
                                <p className="text-[13px] text-neutral-400">Cada saludo se convierte en un lead, directo a tu panel.</p>
                            </div>
                        </div>
                    </section>

                    {/* INCLUYE: cinta continua */}
                    <section className="flex items-center gap-8 border-y border-white/[0.07] py-5 pl-5 sm:pl-7">
                        <span className="shrink-0 text-xs leading-tight text-neutral-400">Todo lo que<br />incluye tu perfil</span>
                        <div className="min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
                            <div className="sc-marquee flex w-max gap-10 pr-10">
                                {[...INCLUDES, ...INCLUDES].map((f, i) => (
                                    <span key={i} aria-hidden={i >= INCLUDES.length} className="inline-flex shrink-0 items-center gap-2 font-display text-[17px] text-neutral-400 transition hover:text-white">
                                        <Icon name={f.icon} className="text-[22px]" />
                                        {f.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* PRODUCTOS */}
                    <section id="productos" className="px-5 py-14 sm:px-7">
                        <div className="sc-reveal flex flex-wrap gap-10 rounded-[30px] border border-white/[0.08] bg-[#121212] p-6 sm:p-10">
                            <div className="flex min-w-0 flex-[1_1_360px] flex-col">
                                <Chip>Productos</Chip>
                                <h2 className="mt-6 font-display text-[clamp(36px,4.4vw,60px)] leading-none tracking-[-0.04em]">
                                    Un ecosistema,<br />muchas formas
                                </h2>
                                <p className="mt-4 max-w-[380px] text-sm text-neutral-400">
                                    Elige el dispositivo que mejor va contigo. Todos apuntan a tu mismo perfil inteligente.
                                </p>
                                <div role="tablist" aria-label="Productos" className="mt-7 flex flex-col gap-2">
                                    {PRODUCTS.map((p) => {
                                        const active = p.id === productId;
                                        return (
                                            <button
                                                key={p.id}
                                                type="button"
                                                role="tab"
                                                aria-selected={active}
                                                onClick={() => setProductId(p.id)}
                                                className={`group relative flex min-h-14 items-center justify-between gap-3 overflow-hidden rounded-2xl border px-[18px] py-3 text-left font-medium transition-all duration-500 ${active ? 'border-white/20 bg-white/[0.08] pl-6' : 'border-white/[0.08] hover:bg-white/[0.04] hover:pl-6'}`}
                                            >
                                                <span className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#D42410] transition-all duration-500 ${active ? 'opacity-100' : 'h-0 opacity-0'}`} />
                                                <span className="flex items-center gap-2.5">
                                                    <Icon name={p.icon} className="text-[22px] text-[#FF5A3C]" />
                                                    {p.name}
                                                </span>
                                                <span className="font-display text-neutral-400">{p.price}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div role="tabpanel" className="flex min-w-0 flex-[1_1_420px] flex-col rounded-[26px] border border-white/10 bg-gradient-to-b from-[#202020] to-[#141414] p-7">
                                <div key={product.id} className="sc-swap flex flex-1 flex-col">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="font-display text-[32px] leading-[1.05] tracking-[-0.03em]">
                                            {product.name}<br /><span className="text-neutral-400">{product.tag}</span>
                                        </h3>
                                        <span className="text-xs text-neutral-400">0{PRODUCTS.indexOf(product) + 1}</span>
                                    </div>
                                    <div className="relative mt-4 flex h-[220px] items-center justify-center">
                                        <div aria-hidden="true" className="sc-blob absolute inset-6 bg-[radial-gradient(closest-side,rgba(255,40,10,0.35),transparent)]" />
                                        <img src={product.img} alt={product.name} className="sc-bob relative max-h-full max-w-[90%] object-contain" />
                                    </div>
                                    <p className="mt-4 text-sm text-neutral-300">{product.desc}</p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {product.chips.map((chip, i) => (
                                            <span key={chip} className="sc-swap rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs text-neutral-200" style={{ animationDelay: `${150 + i * 80}ms` }}>
                                                {chip}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
                                        <span className="font-display text-4xl font-light tracking-tight">{product.price}</span>
                                        <Link href={route('shop.comprar')} className="group inline-flex items-center gap-1.5 rounded-full bg-[#D42410] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#B81E0C]">
                                            Personalizar
                                            <Icon name="tune" className="text-lg transition duration-500 group-hover:rotate-180" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* PREGUNTAS */}
                    <section id="preguntas" className="flex flex-wrap gap-8 px-5 pb-16 pt-6 sm:px-7">
                        <div className="min-w-0 flex-[1_1_300px]">
                            <Chip>Preguntas</Chip>
                            <h2 className="mt-5 font-display text-[clamp(32px,3.6vw,48px)] leading-[1.02] tracking-[-0.04em]">
                                Lo que todos<br /><span className="text-[#FF5A3C]">nos preguntan</span>
                            </h2>
                        </div>
                        <div className="flex min-w-0 flex-[2_1_520px] flex-col gap-2.5">
                            {FAQS.map((f, i) => {
                                const open = openFaq === i;
                                return (
                                    <div
                                        key={f.q}
                                        className={`rounded-[18px] border bg-[#111111] transition-colors duration-500 ${open ? 'border-[#FF3B1F]/40' : 'border-white/[0.09] hover:border-white/20'}`}
                                    >
                                        <button
                                            type="button"
                                            aria-expanded={open}
                                            onClick={() => setOpenFaq(open ? null : i)}
                                            className="flex w-full items-center justify-between gap-4 px-[22px] py-5 text-left text-base font-medium"
                                        >
                                            {f.q}
                                            <Icon name="add" className={`text-[22px] text-[#FF5A3C] transition duration-500 ${open ? 'rotate-45' : ''}`} />
                                        </button>
                                        <div
                                            className={`grid transition-[grid-template-rows,opacity] duration-500 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                                            style={{ transitionTimingFunction: ease }}
                                        >
                                            <div className="overflow-hidden">
                                                <p className="px-[22px] pb-5 text-neutral-400">{f.a}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* CTA */}
                    <section className="px-5 pb-7 sm:px-7">
                        <div className="sc-reveal relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-[26px] bg-[#D42410] px-6 py-14 sm:px-10">
                            <div aria-hidden="true" className="sc-blob pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] bg-[#FF6A4D]/40" />
                            <h2 className="relative flex-[1_1_420px] font-display text-[clamp(34px,4.4vw,60px)] leading-none tracking-[-0.04em] text-white">
                                Empieza a destacar<br />en tu próxima reunión
                            </h2>
                            <Link href={route('shop.comprar')} className="group relative inline-flex items-center gap-2 rounded-full bg-black px-6 py-4 text-[15px] font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-neutral-900">
                                Crear mi SpaceCard
                                <Icon name="north_east" className="text-xl transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                            </Link>
                        </div>
                    </section>

                    {/* FOOTER */}
                    <footer className="flex flex-wrap items-center justify-between gap-3 px-5 pb-7 pt-5 text-[13px] text-neutral-400 sm:px-7">
                        <span className="flex items-center gap-2">
                            <Icon name="bolt" fill className="text-xl text-[#FF5A3C]" />
                            <span className="font-semibold text-neutral-100">SpaceCard</span>
                            · AVASPACE®
                        </span>
                        <span className="flex flex-wrap gap-x-5 gap-y-1">
                            <Link href={route('shop.comprar')} className="py-2.5 text-neutral-300 transition hover:text-white">Tienda</Link>
                            {canLogin && !user && <Link href={route('login')} className="py-2.5 text-neutral-300 transition hover:text-white">Entrar</Link>}
                            {canRegister && !user && <Link href={route('register')} className="py-2.5 text-neutral-300 transition hover:text-white">Crear cuenta</Link>}
                            {user && <Link href={route('dashboard')} className="py-2.5 text-neutral-300 transition hover:text-white">Mi panel</Link>}
                        </span>
                    </footer>
                </div>
            </div>
        </>
    );
}
