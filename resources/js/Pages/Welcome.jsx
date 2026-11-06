/**
 * Landing de SpaceCard: secciones blancas, franjas negras y acentos rojos,
 * con las fotos reales de producto y la roseta de tarjetas (CardFan).
 * Iconos: Material Symbols (clase .ms). Animaciones sc-* en app.css; respetan
 * prefers-reduced-motion.
 */

import { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import BrandLogo from '@/Components/BrandLogo';
import CardFan from '@/Components/CardFan';

const FEATURES = [
    { icon: 'contactless', title: 'Comparte con un toque', desc: 'Acerca tu tarjeta a cualquier teléfono o deja que escaneen el QR.' },
    { icon: 'edit_square', title: 'Perfil editable', desc: 'Cambia tus datos, enlaces y redes cuando quieras desde tu panel.' },
    { icon: 'group_add', title: 'Captura contactos', desc: 'Quien te conoce te deja sus datos, directo a tu panel.' },
    { icon: 'monitoring', title: 'Analíticas', desc: 'Mide escaneos, ubicaciones y dispositivos de tu networking.' },
    { icon: 'wallet', title: 'Apple y Google Wallet', desc: 'Tu contacto, guardado en la cartera digital del teléfono.' },
    { icon: 'reviews', title: 'Reseñas de Google', desc: 'Con la placa, tus clientes califican tu negocio al instante.' },
];

const STATS = [
    { icon: 'palette', value: '6', label: 'Colores' },
    { icon: 'flip', value: '2', label: 'Caras personalizables' },
    { icon: 'block', value: '0', label: 'Apps necesarias' },
];

const PRODUCTS = [
    { name: 'SpaceCard', tag: 'Tarjeta NFC', price: '$29.99', img: '/img/products/card-black.png' },
    { name: 'SpaceBand', tag: 'Pulsera NFC', price: '$19.99', img: '/img/products/bracelets.png' },
    { name: 'Placa Google', tag: 'Reseñas', price: '$39.99', img: '/img/products/card-blue.png' },
];

const STEPS = [
    { title: 'Diseña tu tarjeta', desc: 'Elige color y personaliza sus dos caras en SpaceShop.' },
    { title: 'Arma tu perfil', desc: 'Agrega tus datos, enlaces y redes desde tu panel.' },
    { title: 'Acerca y comparte', desc: 'Un toque al teléfono o escanean el QR. Sin apps.' },
];

const FAQS = [
    { q: '¿Quien recibe mi tarjeta necesita una app?', a: 'No. Basta con acercar la tarjeta a su teléfono (NFC) o escanear el QR: tu perfil se abre en el navegador.' },
    { q: '¿Funciona con cualquier teléfono?', a: 'Sí. Los teléfonos con NFC lo abren con un toque y cualquier teléfono con cámara puede escanear el QR.' },
    { q: '¿Puedo cambiar mis datos después?', a: 'Cuando quieras, desde tu panel. La tarjeta sigue apuntando a tu perfil actualizado.' },
    { q: '¿Tengo que pagar una suscripción?', a: 'No es obligatoria. Compras tu dispositivo y tu perfil queda activo.' },
];

function Icon({ name, className = '' }) {
    return <span aria-hidden="true" className={`ms ${className}`}>{name}</span>;
}

/**
 * Cinta de texto infinita: dos mitades idénticas, cada una con las palabras
 * repetidas varias veces (más ancha que cualquier pantalla). La animación
 * desplaza exactamente una mitad y vuelve a empezar, así nunca queda hueco.
 */
function Marquee({ words, icon, className = '', reverse = false, repeat = 4 }) {
    const half = Array.from({ length: repeat }).flatMap(() => words);
    const group = (hidden) => (
        <div className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={hidden || undefined}>
            {half.map((w, i) => (
                <span key={i} className={`flex shrink-0 items-center gap-10 ${className}`}>
                    {w}{icon}
                </span>
            ))}
        </div>
    );
    return (
        // La duración crece con las repeticiones para que la velocidad sea la misma de antes.
        <div className={`sc-marquee flex w-max ${reverse ? '[animation-direction:reverse]' : ''}`} style={{ animationDuration: `${repeat * 32}s` }}>
            {group(false)}
            {group(true)}
        </div>
    );
}

function Kicker({ children, light = false }) {
    return <p className={`text-xs font-bold uppercase tracking-[0.18em] ${light ? 'text-[#FF5A3C]' : 'text-[#D42410]'}`}>{children}</p>;
}

/** Marca con .is-in cada .sc-reveal cuando entra en pantalla. */
function useReveal() {
    useEffect(() => {
        const items = document.querySelectorAll('.sc-reveal');
        if (!('IntersectionObserver' in window)) {
            items.forEach((el) => el.classList.add('is-in'));
            return undefined;
        }
        const io = new IntersectionObserver(
            (entries) => entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add('is-in');
                    io.unobserve(e.target);
                }
            }),
            { threshold: 0.15 },
        );
        items.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);
}

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Cuenta desde 0 hasta `to` con desaceleración suave. */
function CountUp({ to, delay = 0 }) {
    const [n, setN] = useState(reducedMotion() ? to : 0);
    useEffect(() => {
        if (reducedMotion() || to === 0) return undefined;
        let raf;
        const timer = setTimeout(() => {
            const start = performance.now();
            const tick = (t) => {
                const p = Math.min((t - start) / 1100, 1);
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
    const [openFaq, setOpenFaq] = useState(null);
    const heroRef = useRef(null);
    const progressRef = useRef(null);
    const frame = useRef(0);
    useReveal();

    // Scroll: --hp (salida del hero, para el parallax) y la barra de progreso.
    // Un listener, como mucho un cálculo por cuadro; solo transform.
    useEffect(() => {
        if (reducedMotion()) return undefined;
        let raf = 0;
        const update = () => {
            raf = 0;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            progressRef.current?.style.setProperty('transform', `scaleX(${max > 0 ? (window.scrollY / max).toFixed(4) : 0})`);
            const hero = heroRef.current;
            if (hero) {
                const p = Math.min(Math.max(window.scrollY / hero.offsetHeight, 0), 1);
                hero.style.setProperty('--hp', p.toFixed(3));
            }
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };
        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, []);

    // Cursor en el hero (-0.5…0.5): inclina la tarjeta y mueve las formas.
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
    const ease = 'cubic-bezier(0.22,1,0.36,1)';

    const accountHref = user ? route('dashboard') : route('register');

    return (
        <>
            <Head title="SpaceCard · Tu tarjeta de presentación inteligente" />

            <div className="min-h-screen overflow-x-clip bg-white font-inter text-[15px] leading-relaxed text-neutral-900 antialiased">
                {/* NAV */}
                <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/95">
                    <nav aria-label="Principal" className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
                        <Link href="/"><BrandLogo className="h-7" /></Link>
                        <div className="hidden items-center gap-7 text-sm font-medium text-neutral-600 md:flex">
                            <a href="#inicio" className="relative text-neutral-900 after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[#D42410]">Inicio</a>
                            <a href="#incluye" className="transition hover:text-neutral-900">Qué incluye</a>
                            <a href="#productos" className="transition hover:text-neutral-900">Productos</a>
                            <a href="#preguntas" className="transition hover:text-neutral-900">Preguntas</a>
                        </div>
                        <div className="flex items-center gap-2">
                            {!user && canLogin && <Link href={route('login')} className="px-3 py-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-900">Entrar</Link>}
                            {(user || canRegister) && (
                                <Link href={accountHref} className="group inline-flex items-center gap-1.5 rounded-full bg-[#D42410] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(212,36,16,0.3)] transition hover:-translate-y-0.5 hover:bg-[#B81E0C]">
                                    {user ? 'Mi panel' : 'Comenzar'}
                                    <Icon name="arrow_forward" className="text-lg transition group-hover:translate-x-0.5" />
                                </Link>
                            )}
                        </div>
                    </nav>
                    {/* Progreso de lectura */}
                    <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px]">
                        <div ref={progressRef} className="h-full origin-left bg-[#D42410]" style={{ transform: 'scaleX(0)' }} />
                    </div>
                </header>

                {/* HERO */}
                <section
                    id="inicio"
                    ref={heroRef}
                    onMouseMove={onHeroMove}
                    onMouseLeave={onHeroLeave}
                    className="relative overflow-hidden bg-gradient-to-r from-white from-45% to-[#F4F4F5] [--hp:0] [--mx:0] [--my:0]"
                >
                    <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:py-20">
                        <div style={{ transform: 'translate3d(0, calc(var(--hp) * 60px), 0)' }}>
                            <div className="sc-rise"><Kicker>Bienvenido a SpaceCard</Kicker></div>
                            <h1 className="mt-4 font-display text-[clamp(44px,6vw,84px)] font-bold leading-[0.98] tracking-[-0.04em]">
                                <span className="sc-rise block" style={{ animationDelay: '80ms' }}>Tu tarjeta de</span>
                                <span className="sc-rise block" style={{ animationDelay: '180ms' }}>presentación,</span>
                                {/* Palabra clave resaltada en un bloque rojo inclinado, como la etiqueta del logo */}
                                <span className="sc-rise my-1 block" style={{ animationDelay: '280ms' }}>
                                    <span className="relative inline-block px-3 text-white">
                                        <span aria-hidden="true" className="sc-in-left absolute inset-0 -skew-x-12 rounded-md bg-[#D42410] shadow-[0_14px_30px_rgba(212,36,16,0.35)]" style={{ animationDelay: '380ms' }} />
                                        <span className="relative">reinventada</span>
                                    </span>
                                </span>
                                <span className="sc-rise block" style={{ animationDelay: '380ms' }}>en un toque</span>
                            </h1>
                            <p className="sc-rise mt-5 max-w-md text-neutral-600" style={{ animationDelay: '480ms' }}>
                                Una tarjeta física premium conectada a un perfil digital que editas cuando quieras. Sin apps, sin fricción.
                            </p>
                            <div className="sc-rise mt-7 flex flex-wrap gap-3" style={{ animationDelay: '580ms' }}>
                                <Link href={route('shop.comprar')} className="group inline-flex items-center gap-2 rounded-full bg-[#D42410] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(212,36,16,0.3)] transition hover:-translate-y-0.5 hover:bg-[#B81E0C]">
                                    Diseña la tuya
                                    <Icon name="arrow_forward" className="text-lg transition group-hover:translate-x-1" />
                                </Link>
                                <a href="#como" className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-6 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-black/30">
                                    <Icon name="contactless" className="text-lg text-[#D42410]" />
                                    Ver cómo funciona
                                </a>
                            </div>
                            <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
                                {STATS.map((s, i) => (
                                    <li key={s.label} className={`sc-rise group flex items-center gap-3 ${i ? 'sm:border-l sm:border-black/10 sm:pl-8' : ''}`} style={{ animationDelay: `${680 + i * 110}ms` }}>
                                        <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#D42410]/25 text-[#D42410] transition duration-500 group-hover:rotate-12 group-hover:border-[#D42410] group-hover:bg-[#D42410] group-hover:text-white">
                                            <Icon name={s.icon} className="text-xl" />
                                        </span>
                                        <span className="leading-tight">
                                            <span className="block font-display text-2xl font-bold tabular-nums"><CountUp to={Number(s.value)} delay={750 + i * 110} /></span>
                                            <span className="text-xs text-neutral-500">{s.label}</span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Visual: tarjeta real flotando, con sus etiquetas pegadas */}
                        <div className="relative mx-auto w-full max-w-[560px]">
                            {/* Brillo rojo detrás de la tarjeta */}
                            <div aria-hidden="true" className="absolute inset-[8%]">
                                <div className="sc-blob h-full w-full bg-[radial-gradient(closest-side,rgba(255,40,10,0.28),transparent)]" />
                            </div>
                            {/* Tarjeta: se inclina hacia el cursor; tarjeta y etiquetas flotan juntas */}
                            <div className="sc-rise relative [perspective:1000px]" style={{ animationDelay: '250ms' }}>
                                <div
                                    style={{
                                        transform: 'rotateY(calc(var(--mx) * 20deg)) rotateX(calc(var(--my) * -14deg)) translate3d(0, calc(var(--hp) * -40px), 0)',
                                        transition: `transform 0.9s ${ease}`,
                                    }}
                                >
                                    <div className="sc-hover-card relative">
                                        <img src="/img/products/card-black.png" alt="SpaceCard negra, frente y reverso" className="relative w-full drop-shadow-[0_34px_44px_rgba(0,0,0,0.3)]" />

                                        {/* Etiquetas sobre los bordes de las tarjetas: viajan con ellas y además se mecen solas */}
                                        {[
                                            { icon: 'contactless', label: 'NFC', pos: 'left-[10%] top-[30%]', box: 'bg-[#D42410] text-white shadow-[0_14px_34px_rgba(212,36,16,0.5)]', dot: 'bg-white/20 text-white', ripple: true, d: '0s' },
                                            { icon: 'qr_code_2', label: 'Código QR', pos: 'right-[4%] top-[30%]', box: 'bg-[#D42410] text-white shadow-[0_14px_34px_rgba(212,36,16,0.5)]', dot: 'bg-white/20 text-white', ripple: true, d: '0s' },
                                            // Centrada con flex (no con translate) para no chocar con la animación de entrada
                                            { icon: 'block', label: 'Sin apps', pos: 'inset-x-0 bottom-[0.5%] flex justify-center', box: 'bg-[#D42410] text-white shadow-[0_14px_34px_rgba(212,36,16,0.5)]', dot: 'bg-white/20 text-white', ripple: true, d: '-3.2s' },
                                        ].map((t, i) => (
                                            <span key={t.label} className={`sc-rise absolute z-20 ${t.pos}`} style={{ animationDelay: `${800 + i * 160}ms` }}>
                                                <span className={`sc-bob inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-bold ${t.box}`} style={{ animationDelay: t.d }}>
                                                    <span className={`relative flex h-8 w-8 items-center justify-center rounded-full ${t.dot}`}>
                                                        {t.ripple && <span aria-hidden="true" className="sc-ripple absolute inset-0 rounded-full border-2 border-white/70" />}
                                                        <Icon name={t.icon} className="relative text-lg" />
                                                    </span>
                                                    {t.label}
                                                </span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CINTAS CRUZADAS: mensaje en movimiento */}
                <section aria-hidden="true" className="relative -my-6 h-36 overflow-hidden">
                    <div className="absolute inset-x-[-5%] top-1/2 -translate-y-1/2 rotate-[2deg] bg-neutral-900 py-3">
                        <Marquee
                            reverse
                            words={['Un toque', 'Sin apps', 'NFC + QR', 'Perfil editable', 'Seis colores']}
                            className="font-display text-lg font-bold uppercase tracking-wide text-white/80"
                            icon={<Icon name="contactless" className="text-xl text-[#FF5A3C]" />}
                        />
                    </div>
                    <div className="absolute inset-x-[-5%] top-1/2 -translate-y-1/2 -rotate-[2deg] bg-[#D42410] py-3 shadow-[0_14px_30px_rgba(212,36,16,0.3)]">
                        <Marquee
                            words={['Tu tarjeta', 'Tu perfil', 'Tu red', 'Tu marca', 'SpaceCard']}
                            className="font-display text-2xl font-bold uppercase tracking-wide text-white"
                            icon={<Icon name="bolt" className="text-2xl text-white/70" />}
                        />
                    </div>
                </section>

                {/* QUÉ INCLUYE */}
                <section id="incluye" className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.6fr]">
                    <div className="sc-reveal">
                        <Kicker>Qué incluye</Kicker>
                        <h2 className="mt-3 font-display text-[clamp(30px,3.4vw,44px)] font-bold leading-[1.08] tracking-[-0.03em]">Todo lo que necesitas en una sola tarjeta</h2>
                        <p className="mt-4 max-w-sm text-neutral-600">Tu tarjeta física y tu perfil digital trabajan juntos para que cada saludo cuente.</p>
                        <a href="#productos" className="group mt-7 inline-flex items-center gap-2 rounded-full bg-[#D42410] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#B81E0C]">
                            Ver productos
                            <Icon name="arrow_forward" className="text-lg transition group-hover:translate-x-1" />
                        </a>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {FEATURES.map((f, i) => (
                            <div key={f.title} className="sc-reveal group rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition duration-500 hover:-translate-y-1 hover:border-[#D42410]/30 hover:shadow-[0_16px_40px_rgba(212,36,16,0.1)]" style={{ '--d': `${i * 70}ms` }}>
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D42410]/[0.08] text-[#D42410] transition duration-500 group-hover:bg-[#D42410] group-hover:text-white">
                                    <Icon name={f.icon} className="text-2xl" />
                                </span>
                                <h3 className="mt-5 font-semibold">{f.title}</h3>
                                <p className="mt-1.5 text-sm text-neutral-500">{f.desc}</p>
                                <Icon name="arrow_forward" className="mt-4 block text-right text-lg text-[#D42410] transition duration-300 group-hover:translate-x-1" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* FRANJA NEGRA */}
                <section className="relative overflow-hidden bg-[#0B0B0B] text-white">
                    <div aria-hidden="true" className="sc-reveal sc-from-left absolute -left-10 top-0 h-full w-40">
                        <div className="h-full w-full bg-[#D42410] opacity-90 [clip-path:polygon(0_0,100%_0,30%_100%,0_100%)]" />
                    </div>
                    <div aria-hidden="true" className="sc-reveal sc-from-right absolute -right-6 top-0 h-28 w-56" style={{ '--d': '150ms' }}>
                        <div className="sc-drift h-full w-full bg-[#D42410] [clip-path:polygon(30%_0,100%_0,100%_100%)]" />
                    </div>
                    {/* Al estilo Cash App: titular, roseta de tarjetas y ventajas */}
                    <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1.3fr_1fr] lg:py-24">
                        <div className="sc-reveal sc-from-left text-center lg:pl-10 lg:text-left">
                            <Kicker light>SpaceCard</Kicker>
                            <h2 className="mt-3 font-display text-[clamp(34px,4vw,56px)] font-bold leading-[1.02] tracking-[-0.04em]">
                                La tarjeta que <span className="text-[#FF5A3C]">trabaja por ti</span>
                            </h2>
                        </div>
                        <div className="relative">
                            <div aria-hidden="true" className="absolute inset-[6%]">
                                <div className="sc-blob h-full w-full bg-[radial-gradient(closest-side,rgba(255,40,10,0.35),transparent)]" />
                            </div>
                            <CardFan className="relative mx-auto max-w-[520px]" />
                        </div>
                        <div className="sc-reveal sc-from-right" style={{ '--d': '150ms' }}>
                            <ul className="mx-auto max-w-sm space-y-3 lg:mx-0">
                                {['NFC y QR: funciona con cualquier teléfono', 'Sin apps para quien la recibe', 'Diseño premium de 2 caras', 'Seis colores para elegir', 'Perfil editable cuando quieras'].map((t) => (
                                    <li key={t} className="flex items-center gap-3 text-[17px] font-medium">
                                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#FF5A3C]" />
                                        {t}
                                    </li>
                                ))}
                            </ul>
                            <Link href={route('shop.comprar')} className="group mt-8 inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-neutral-900">
                                Conoce SpaceCard
                                <Icon name="arrow_forward" className="text-lg transition group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* PRODUCTOS */}
                <section id="productos" className="bg-[#FAFAFA]">
                    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
                        <div className="sc-reveal flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <Kicker>Nuestros productos</Kicker>
                                <h2 className="mt-3 font-display text-[clamp(30px,3.4vw,44px)] font-bold leading-[1.08] tracking-[-0.03em]">Elige tu dispositivo</h2>
                                <p className="mt-2 text-neutral-600">Todos apuntan a tu mismo perfil inteligente.</p>
                            </div>
                            <Link href={route('shop.comprar')} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#D42410]">
                                Ir a la tienda
                                <Icon name="arrow_forward" className="text-lg transition group-hover:translate-x-1" />
                            </Link>
                        </div>
                        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {PRODUCTS.map((p, i) => (
                                <Link key={p.name} href={route('shop.comprar')} className="sc-reveal group overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.1)]" style={{ '--d': `${i * 90}ms` }}>
                                    <div className="relative flex h-56 items-center justify-center overflow-hidden bg-[#111111] p-6">
                                        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(closest-side,rgba(255,40,10,0.28),transparent)]" />
                                        <img src={p.img} alt={p.name} loading="lazy" className="relative max-h-full object-contain transition duration-700 group-hover:scale-105" />
                                    </div>
                                    <div className="flex items-center justify-between gap-3 p-5">
                                        <div>
                                            <h3 className="font-semibold">{p.name}</h3>
                                            <p className="text-sm text-neutral-500">{p.tag} · <span className="font-semibold text-neutral-900">{p.price}</span></p>
                                        </div>
                                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D42410]/[0.08] text-[#D42410] transition group-hover:bg-[#D42410] group-hover:text-white">
                                            <Icon name="arrow_forward" className="text-lg" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CÓMO FUNCIONA */}
                <section id="como" className="bg-[#FFF4F2]">
                    <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.6fr]">
                        <div className="sc-reveal">
                            <Kicker>Cómo funciona</Kicker>
                            <h2 className="mt-3 font-display text-[clamp(30px,3.4vw,44px)] font-bold leading-[1.08] tracking-[-0.03em]">Tres pasos y listo</h2>
                            <p className="mt-3 max-w-sm text-neutral-600">De la tienda a tu primera conexión en minutos.</p>
                        </div>
                        <ol className="grid gap-4 md:grid-cols-3">
                            {STEPS.map((s, i) => (
                                <li key={s.title} className="sc-reveal group rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(212,36,16,0.06)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(212,36,16,0.12)]" style={{ '--d': `${i * 120}ms` }}>
                                    <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#D42410] font-display font-bold text-white">
                                        <span aria-hidden="true" className="sc-ripple absolute inset-0 rounded-full border-2 border-[#D42410]" style={{ animationDelay: `${i * 0.5}s` }} />
                                        {i + 1}
                                    </span>
                                    <h3 className="mt-5 font-semibold">{s.title}</h3>
                                    <p className="mt-1.5 text-sm text-neutral-500">{s.desc}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* PREGUNTAS (franja negra) */}
                <section id="preguntas" className="bg-[#0B0B0B] text-white">
                    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.6fr]">
                        <div className="sc-reveal">
                            <Kicker light>Preguntas frecuentes</Kicker>
                            <h2 className="mt-3 font-display text-[clamp(30px,3.4vw,44px)] font-bold leading-[1.08] tracking-[-0.03em]">Resolvemos tus dudas</h2>
                        </div>
                        <div className="flex flex-col gap-3">
                            {FAQS.map((f, i) => {
                                const open = openFaq === i;
                                return (
                                    <div key={f.q} className={`rounded-2xl border transition-colors duration-500 ${open ? 'border-[#D42410] bg-white text-neutral-900' : 'border-white/10 bg-white/[0.03] hover:border-white/25'}`}>
                                        <button type="button" aria-expanded={open} onClick={() => setOpenFaq(open ? null : i)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-medium">
                                            {f.q}
                                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition duration-500 ${open ? 'rotate-45 bg-[#D42410] text-white' : 'bg-white/10 text-[#FF5A3C]'}`}>
                                                <Icon name="add" className="text-xl" />
                                            </span>
                                        </button>
                                        <div className={`grid transition-[grid-template-rows,opacity] duration-500 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                            <div className="overflow-hidden"><p className="px-6 pb-5 text-neutral-600">{f.a}</p></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA ROJO */}
                <section className="relative overflow-hidden bg-[#D42410] text-white">
                    <div aria-hidden="true" className="sc-reveal sc-from-right absolute -right-10 top-0 h-full w-[45%]">
                        <div className="sc-drift h-full w-full bg-[#B81E0C] [clip-path:polygon(30%_0,100%_0,100%_100%,0_100%)]" />
                    </div>
                    <div aria-hidden="true" className="sc-reveal sc-from-right absolute right-[30%] top-0 h-full w-24" style={{ '--d': '150ms' }}>
                        <div className="sc-drift h-full w-full bg-[#E8361D] [clip-path:polygon(60%_0,100%_0,40%_100%,0_100%)]" style={{ animationDelay: '-4s' }} />
                    </div>
                    <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-12 sm:px-8">
                        <div className="sc-reveal sc-from-left">
                            <h2 className="font-display text-[clamp(26px,3vw,38px)] font-bold tracking-[-0.03em]">¿Listo para destacar?</h2>
                            <p className="mt-1 text-white/85">Diseña tu SpaceCard en minutos y llévala a tu próxima reunión.</p>
                        </div>
                        <Link href={route('shop.comprar')} className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#D42410] transition hover:-translate-y-0.5">
                            Crear mi SpaceCard
                            <Icon name="arrow_forward" className="text-lg transition group-hover:translate-x-1" />
                        </Link>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="bg-[#0B0B0B] text-neutral-400">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-10 text-sm sm:px-8">
                        <BrandLogo className="h-7" />
                        <nav aria-label="Pie de página" className="flex flex-wrap gap-x-6 gap-y-2">
                            <a href="#inicio" className="transition hover:text-white">Inicio</a>
                            <a href="#incluye" className="transition hover:text-white">Qué incluye</a>
                            <Link href={route('shop.comprar')} className="transition hover:text-white">Tienda</Link>
                            <a href="#preguntas" className="transition hover:text-white">Preguntas</a>
                        </nav>
                        <span>© 2026 SpaceCard · AVASPACE®</span>
                    </div>
                </footer>
            </div>
        </>
    );
}
