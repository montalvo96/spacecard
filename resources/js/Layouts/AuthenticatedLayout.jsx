/**
 * Layout del área privada (panel, perfil, admin) con la identidad de la
 * portada: fondo blanco, navegación blanca con subrayado rojo, botones en
 * píldora roja e iconos Material Symbols.
 */

import BrandLogo from '@/Components/BrandLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

function Icon({ name, fill = false, className = '' }) {
    return <span aria-hidden="true" className={`ms ${fill ? 'ms-fill' : ''} ${className}`}>{name}</span>;
}

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [menuOpen, setMenuOpen] = useState(false);

    const links = [
        { href: route('dashboard'), label: 'Mi panel', icon: 'space_dashboard', active: route().current('dashboard') },
        { href: route('shop.comprar'), label: 'SpaceShop', icon: 'storefront', active: route().current('shop.comprar') },
        ...(user?.is_admin ? [{ href: route('admin.dashboard'), label: 'Admin', icon: 'admin_panel_settings', active: route().current('admin.dashboard') }] : []),
    ];
    const initial = (user?.name || '?').trim().charAt(0).toUpperCase();

    return (
        <div className="relative min-h-screen overflow-x-clip bg-[#F6F6F7] font-inter text-neutral-900 antialiased">
            <nav className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/95">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <Link href="/">
                        <BrandLogo className="h-7" />
                    </Link>

                    {/* Enlaces con el subrayado rojo de la portada */}
                    <div className="hidden items-center gap-7 sm:flex">
                        {links.map((l) => (
                            <Link
                                key={l.label}
                                href={l.href}
                                aria-current={l.active ? 'page' : undefined}
                                className={`relative inline-flex items-center gap-1.5 py-2 text-sm font-semibold transition after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-full after:origin-left after:rounded-full after:bg-[#D42410] after:transition after:duration-300 ${l.active ? 'text-neutral-900 after:scale-x-100' : 'text-neutral-500 after:scale-x-0 hover:text-neutral-900 hover:after:scale-x-100'}`}
                            >
                                <Icon name={l.icon} className={`text-[19px] ${l.active ? 'text-[#D42410]' : ''}`} />
                                {l.label}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden sm:block">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button
                                    type="button"
                                    className="group flex items-center gap-2.5 rounded-full border border-black/10 bg-white py-1 pl-1 pr-3 text-sm font-semibold text-neutral-800 transition hover:border-black/25"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D42410] font-display text-sm font-bold text-white">{initial}</span>
                                    {user.name}
                                    <Icon name="expand_more" className="text-lg text-neutral-400 transition duration-300 group-hover:translate-y-0.5" />
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content contentClasses="py-1.5 bg-white rounded-2xl ring-1 ring-black/5" width="56">
                                <div className="border-b border-black/[0.06] px-4 pb-2.5 pt-1.5">
                                    <div className="truncate text-sm font-semibold text-neutral-900">{user.name}</div>
                                    <div className="truncate text-xs text-neutral-500">{user.email}</div>
                                </div>
                                <Dropdown.Link href={route('profile.edit')} className="!flex items-center gap-2 !text-neutral-700 hover:!bg-neutral-100">
                                    <Icon name="person" className="text-lg text-neutral-400" />
                                    Mi perfil
                                </Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button" className="!flex items-center gap-2 !text-[#B81E0C] hover:!bg-[#D42410]/[0.07]">
                                    <Icon name="logout" className="text-lg" />
                                    Cerrar sesión
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>

                    <button
                        type="button"
                        onClick={() => setMenuOpen((o) => !o)}
                        aria-expanded={menuOpen}
                        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-neutral-700 transition hover:bg-neutral-100 sm:hidden"
                    >
                        <Icon name={menuOpen ? 'close' : 'menu'} className="text-2xl" />
                    </button>
                </div>

                {/* Menú móvil */}
                <div className={`grid transition-[grid-template-rows] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] sm:hidden ${menuOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                        <div className="space-y-1 border-t border-black/[0.06] px-4 py-3">
                            {links.map((l) => (
                                <Link
                                    key={l.label}
                                    href={l.href}
                                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-semibold ${l.active ? 'bg-[#D42410] text-white' : 'text-neutral-700 hover:bg-neutral-100'}`}
                                >
                                    <Icon name={l.icon} className={`text-xl ${l.active ? 'text-white' : 'text-neutral-400'}`} />
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                        <div className="border-t border-black/[0.06] px-4 py-3">
                            <div className="flex items-center gap-3 px-4 py-2">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D42410] font-display font-bold text-white">{initial}</span>
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold">{user.name}</div>
                                    <div className="truncate text-xs text-neutral-500">{user.email}</div>
                                </div>
                            </div>
                            <Link href={route('profile.edit')} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] text-neutral-700 hover:bg-neutral-100">
                                <Icon name="person" className="text-xl text-neutral-400" />
                                Mi perfil
                            </Link>
                            <Link href={route('logout')} method="post" as="button" className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[15px] text-[#B81E0C] hover:bg-[#D42410]/[0.07]">
                                <Icon name="logout" className="text-xl" />
                                Cerrar sesión
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="relative overflow-hidden border-b border-black/[0.06] bg-gradient-to-r from-white from-45% to-[#F4F4F5]">
                    {/* Formas de la marca, como en la portada y el acceso */}
                    <div aria-hidden="true" className="absolute -right-6 top-0 h-24 w-48">
                        <div className="sc-in-right h-full w-full bg-[#D42410] [clip-path:polygon(30%_0,100%_0,100%_100%)]" />
                    </div>
                    <div aria-hidden="true" className="absolute -left-10 bottom-0 h-20 w-40">
                        <div className="sc-in-left h-full w-full bg-neutral-900 [clip-path:polygon(0_0,70%_100%,0_100%)]" />
                    </div>
                    <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            <main className="relative">{children}</main>
        </div>
    );
}
