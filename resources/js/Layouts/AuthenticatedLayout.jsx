/**
 * Layout del área privada (panel, perfil, admin) con la identidad de la
 * landing: negro, acento rojo, navegación en píldora e iconos Material Symbols.
 */

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
        <div className="relative min-h-screen overflow-x-clip bg-[#070707] font-inter text-neutral-100">
            {/* Luz de fondo */}
            <div aria-hidden="true" className="sc-blob pointer-events-none absolute -right-40 -top-56 h-[560px] w-[560px] bg-[radial-gradient(closest-side,rgba(255,40,10,0.22),transparent)]" />

            <nav className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#070707]/95">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="group flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D42410] text-white transition duration-500 group-hover:rotate-[20deg] group-hover:scale-110">
                            <Icon name="bolt" fill className="text-xl" />
                        </span>
                        <span className="font-display text-lg font-semibold tracking-tight">SpaceCard</span>
                    </Link>

                    <div className="hidden items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.03] p-1 sm:flex">
                        {links.map((l) => (
                            <Link
                                key={l.label}
                                href={l.href}
                                aria-current={l.active ? 'page' : undefined}
                                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition duration-300 ${l.active ? 'bg-[#D42410] text-white shadow-[0_4px_14px_rgba(255,40,10,0.35)]' : 'text-neutral-300 hover:bg-white/5 hover:text-white'}`}
                            >
                                <Icon name={l.icon} className="text-[18px]" />
                                {l.label}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden sm:block">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button
                                    type="button"
                                    className="group flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-3 text-sm font-medium text-neutral-200 transition hover:border-white/20 hover:bg-white/[0.06]"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D42410]/15 font-display text-sm font-semibold text-[#FF5A3C]">{initial}</span>
                                    {user.name}
                                    <Icon name="expand_more" className="text-lg text-neutral-400 transition duration-300 group-hover:translate-y-0.5" />
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content contentClasses="py-1.5 bg-[#141414] border border-white/10 rounded-2xl" width="56">
                                <div className="border-b border-white/[0.07] px-4 pb-2.5 pt-1.5">
                                    <div className="truncate text-sm font-semibold text-white">{user.name}</div>
                                    <div className="truncate text-xs text-neutral-400">{user.email}</div>
                                </div>
                                <Dropdown.Link href={route('profile.edit')} className="!flex items-center gap-2 !text-neutral-200 hover:!bg-white/5">
                                    <Icon name="person" className="text-lg text-neutral-400" />
                                    Mi perfil
                                </Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button" className="!flex items-center gap-2 !text-[#FF8A73] hover:!bg-[#FF3B1F]/10">
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
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-neutral-300 transition hover:bg-white/5 sm:hidden"
                    >
                        <Icon name={menuOpen ? 'close' : 'menu'} className="text-2xl" />
                    </button>
                </div>

                {/* Menú móvil */}
                <div className={`grid transition-[grid-template-rows] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] sm:hidden ${menuOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                        <div className="space-y-1 border-t border-white/[0.07] px-4 py-3">
                            {links.map((l) => (
                                <Link
                                    key={l.label}
                                    href={l.href}
                                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium ${l.active ? 'bg-[#D42410]/15 text-white' : 'text-neutral-300 hover:bg-white/5'}`}
                                >
                                    <Icon name={l.icon} className={`text-xl ${l.active ? 'text-[#FF5A3C]' : 'text-neutral-500'}`} />
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                        <div className="border-t border-white/[0.07] px-4 py-3">
                            <div className="flex items-center gap-3 px-4 py-2">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D42410]/15 font-display font-semibold text-[#FF5A3C]">{initial}</span>
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold">{user.name}</div>
                                    <div className="truncate text-xs text-neutral-400">{user.email}</div>
                                </div>
                            </div>
                            <Link href={route('profile.edit')} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] text-neutral-300 hover:bg-white/5">
                                <Icon name="person" className="text-xl text-neutral-500" />
                                Mi perfil
                            </Link>
                            <Link href={route('logout')} method="post" as="button" className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[15px] text-[#FF8A73] hover:bg-[#FF3B1F]/10">
                                <Icon name="logout" className="text-xl" />
                                Cerrar sesión
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="relative">
                    <div className="sc-rise mx-auto max-w-7xl px-4 pb-2 pt-10 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            <main className="relative">{children}</main>
        </div>
    );
}
