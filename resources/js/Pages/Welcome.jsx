/**
 * Landing de SpaceCard — theme-aware (claro / oscuro), paleta índigo/violeta amigable.
 * Estética premium inspirada en dashboards cripto/tech modernos.
 *
 * Autor: SpaceCard 2.0
 */

import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import ThemeToggle from '@/Components/ThemeToggle';

const CARD_COLORS = [
    { name: 'Negro', src: '/img/products/thumbs/card-black.png' },
    { name: 'Rojo', src: '/img/products/thumbs/card-red.png' },
    { name: 'Rosa', src: '/img/products/thumbs/card-pink.png' },
    { name: 'Púrpura', src: '/img/products/thumbs/card-purple.png' },
    { name: 'Azul', src: '/img/products/thumbs/card-blue.png' },
    { name: 'Verde', src: '/img/products/thumbs/card-green.png' },
];

const FEATURES = [
    { icon: '⚡', title: 'Comparte con un toque', desc: 'Acerca tu SpaceCard a cualquier teléfono (NFC) o deja que escaneen el QR. Sin apps, sin fricción.' },
    { icon: '✏️', title: 'Edítala cuando quieras', desc: 'Cambia tu perfil, enlaces y contenido en segundos. Tu tarjeta física nunca queda obsoleta.' },
    { icon: '🎯', title: 'Captura contactos', desc: 'Convierte cada saludo en un lead: recibe los datos de quien te conoce, directo a tu panel.' },
    { icon: '📊', title: 'Analíticas en vivo', desc: 'Mide escaneos, ubicaciones y dispositivos. Entiende el alcance real de tu networking.' },
];

const PRODUCTS = [
    { name: 'SpaceCard', tag: 'Tarjeta NFC', price: '$29.99', img: '/img/products/card-black.png', desc: 'La tarjeta de presentación inteligente. Diseño premium de 2 caras, 6 colores.' },
    { name: 'SpaceBand', tag: 'Pulsera NFC', price: '$19.99', img: '/img/products/bracelets.png', desc: 'Networking en tu muñeca. Silicona premium en rojo, negro y blanco.', wide: true },
    { name: 'Placa Google', tag: 'Reseñas', price: '$39.99', img: '/img/products/card-blue.png', desc: 'Multiplica tus reseñas de Google. Los clientes escanean y califican al instante.' },
];

export default function Welcome({ auth, canLogin, canRegister }) {
    const user = auth?.user;

    return (
        <>
            <Head title="SpaceCard · Tu tarjeta de presentación inteligente" />

            <div className="min-h-screen bg-white text-gray-900 antialiased transition-colors dark:bg-[#0b0b13] dark:text-white">
                {/* NAV */}
                <header className="sticky top-0 z-50 border-b border-gray-200/70 bg-white/80 backdrop-blur dark:border-white/5 dark:bg-[#0b0b13]/80">
                    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <Link href="/" className="flex items-center gap-2.5">
                            <ApplicationLogo className="h-7 w-7" />
                            <span className="text-lg font-extrabold tracking-tight">Space<span className="text-violet-600 dark:text-violet-400">Card</span></span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Link href={route('shop.comprar')} className="hidden rounded-full px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white sm:block">
                                Comprar
                            </Link>
                            <ThemeToggle />
                            {user ? (
                                <Link href={route('dashboard')} className="rounded-full bg-gray-900 px-5 py-2 text-sm font-bold text-white hover:bg-gray-700 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                                    Mi panel
                                </Link>
                            ) : (
                                <>
                                    {canLogin && (
                                        <Link href={route('login')} className="rounded-full px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                                            Entrar
                                        </Link>
                                    )}
                                    {canRegister && (
                                        <Link href={route('register')} className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-violet-500/30 hover:opacity-90">
                                            Crear cuenta
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                {/* HERO */}
                <section className="relative overflow-hidden">
                    <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-500/20 blur-[120px]" />
                    <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
                        <div className="relative">
                            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-violet-500" /> NFC · QR · Sin apps
                            </span>
                            <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
                                Tu tarjeta de<br />presentación,<br /><span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">reinventada.</span>
                            </h1>
                            <p className="mt-6 max-w-md text-lg text-gray-500 dark:text-gray-400">
                                Comparte todo sobre ti con un solo toque. Una tarjeta física premium conectada a un perfil digital que editas cuando quieras.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link href={route('shop.comprar')} className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition hover:opacity-90">
                                    Diseña la tuya →
                                </Link>
                                <Link href={user ? route('dashboard') : route('register')} className="rounded-full border border-gray-200 bg-white px-7 py-3.5 text-sm font-bold text-gray-900 transition hover:bg-gray-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
                                    {user ? 'Ir a mi panel' : 'Crear cuenta gratis'}
                                </Link>
                            </div>
                            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-400 dark:text-gray-500">
                                <span>✓ Perfil editable</span>
                                <span>✓ Compatible con todo teléfono</span>
                                <span>✓ Sin suscripción obligatoria</span>
                            </div>
                        </div>

                        <div className="relative flex justify-center">
                            <div className="absolute inset-0 -z-10 m-auto h-72 w-72 rounded-full bg-violet-500/25 blur-[100px]" />
                            <img src="/img/products/card-black.png" alt="SpaceCard" className="w-full max-w-lg drop-shadow-2xl [transform:perspective(1200px)_rotateY(-8deg)]" />
                        </div>
                    </div>

                    {/* Colores */}
                    <div className="mx-auto max-w-7xl px-6 pb-16">
                        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Elige tu color</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            {CARD_COLORS.map((c) => (
                                <div key={c.name} className="group text-center">
                                    <img src={c.src} alt={c.name} className="h-20 w-auto rounded-lg opacity-90 transition group-hover:scale-105 group-hover:opacity-100" />
                                    <span className="mt-1 block text-[11px] text-gray-400 dark:text-gray-500">{c.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* PRODUCTOS */}
                <section className="border-t border-gray-100 bg-gray-50 py-20 dark:border-white/5 dark:bg-[#0e0e18]">
                    <div className="mx-auto max-w-7xl px-6">
                        <h2 className="text-center text-3xl font-black tracking-tight sm:text-4xl">Un ecosistema, muchas formas</h2>
                        <p className="mx-auto mt-3 max-w-xl text-center text-gray-500 dark:text-gray-400">Elige el dispositivo que mejor va contigo. Todos apuntan a tu mismo perfil inteligente.</p>
                        <div className="mt-12 grid gap-6 md:grid-cols-3">
                            {PRODUCTS.map((p) => (
                                <div key={p.name} className="group flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-violet-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-violet-500/40">
                                    <div className="flex h-44 items-center justify-center">
                                        <img src={p.img} alt={p.name} className={`${p.wide ? 'w-full' : 'h-full'} object-contain transition group-hover:scale-105`} />
                                    </div>
                                    <div className="mt-4">
                                        <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">{p.tag}</span>
                                        <div className="mt-1 flex items-center justify-between">
                                            <h3 className="text-xl font-bold">{p.name}</h3>
                                            <span className="text-lg font-black">{p.price}</span>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{p.desc}</p>
                                    </div>
                                    <Link href={route('shop.comprar')} className="mt-5 rounded-xl bg-gray-100 py-2.5 text-center text-sm font-semibold text-gray-900 transition hover:bg-violet-600 hover:text-white dark:bg-white/10 dark:text-white dark:hover:bg-violet-600">
                                        Personalizar
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FEATURES */}
                <section className="py-20">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {FEATURES.map((f) => (
                                <div key={f.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
                                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-xl dark:bg-violet-500/15">{f.icon}</div>
                                    <h3 className="font-bold">{f.title}</h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="px-6 pb-24">
                    <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-violet-200 bg-gradient-to-br from-indigo-500 to-violet-600 p-12 text-center text-white dark:border-white/10">
                        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-[100px]" />
                        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Empieza a destacar hoy</h2>
                        <p className="mx-auto mt-3 max-w-lg text-white/80">Diseña tu SpaceCard en minutos y llévala a tu próxima reunión.</p>
                        <Link href={route('shop.comprar')} className="mt-8 inline-block rounded-full bg-white px-8 py-3.5 text-sm font-bold text-violet-700 transition hover:bg-gray-100">
                            Crear mi SpaceCard →
                        </Link>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="border-t border-gray-100 py-10 dark:border-white/5">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-gray-400 dark:text-gray-500 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <ApplicationLogo className="h-5 w-5" />
                            <span className="font-bold text-gray-600 dark:text-gray-300">SpaceCard</span>
                            <span>· AVASPACE®</span>
                        </div>
                        <div className="flex gap-6">
                            <Link href={route('shop.comprar')} className="hover:text-gray-900 dark:hover:text-white">Tienda</Link>
                            {canLogin && <Link href={route('login')} className="hover:text-gray-900 dark:hover:text-white">Entrar</Link>}
                            {canRegister && <Link href={route('register')} className="hover:text-gray-900 dark:hover:text-white">Crear cuenta</Link>}
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
