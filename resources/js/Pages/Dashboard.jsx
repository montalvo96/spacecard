/**
 * Vista del Dashboard principal del cliente (Inertia/React).
 * Integra los componentes de dispositivos, Spaces, Reviews y analíticas.
 * Estilo: el de la portada (blanco + rojo + negro), con el bloque rojo
 * inclinado en el saludo y una tarjeta negra con el plan.
 *
 * Autor: Antigravity
 */

import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import DeviceList from '@/Components/DeviceList';
import SpaceEditor from '@/Components/SpaceEditor';
import ReviewTargetConnector from '@/Components/ReviewTargetConnector';
import OnboardingBanner from '@/Components/OnboardingBanner';
import AnalyticsPanel from '@/Components/AnalyticsPanel';

function Icon({ name, fill = false, className = '' }) {
    return <span aria-hidden="true" className={`ms ${fill ? 'ms-fill' : ''} ${className}`}>{name}</span>;
}

function Kicker({ children, light = false }) {
    return <p className={`text-xs font-bold uppercase tracking-[0.18em] ${light ? 'text-[#FF5A3C]' : 'text-[#D42410]'}`}>{children}</p>;
}

/** Palabra resaltada en el bloque rojo inclinado, como en el titular de la portada. */
function Highlight({ children }) {
    return (
        <span className="relative mx-1 inline-block px-3 text-white">
            <span aria-hidden="true" className="sc-in-left absolute inset-0 -skew-x-12 rounded-md bg-[#D42410] shadow-[0_10px_24px_rgba(212,36,16,0.35)]" style={{ animationDelay: '300ms' }} />
            <span className="relative">{children}</span>
        </span>
    );
}

function Stat({ label, value, sub, icon, delay, locked }) {
    return (
        <div
            className="sc-rise group rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition duration-500 hover:-translate-y-1 hover:border-[#D42410]/30 hover:shadow-[0_16px_40px_rgba(212,36,16,0.1)]"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-neutral-500">{label}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D42410]/[0.08] text-[#D42410] transition duration-500 group-hover:bg-[#D42410] group-hover:text-white">
                    <Icon name={icon} className="text-xl" />
                </span>
            </div>
            <div className="mt-4 flex items-center gap-2 font-display text-[40px] font-bold leading-none tracking-[-0.04em] text-neutral-900">
                {value}
                {locked && <Icon name="lock" className="text-xl text-neutral-400" />}
            </div>
            {sub && <div className="mt-2 text-xs text-neutral-500">{sub}</div>}
        </div>
    );
}

export default function Dashboard({ devices, spaces, reviewTargets, userPlan, flash, analytics, leads }) {
    const [activeTab, setActiveTab] = useState('devices');
    const user = usePage().props.auth.user;
    const firstName = (user?.name || 'Hola').split(' ')[0];

    // KPIs
    const deviceCount = devices?.length || 0;
    const activeDevices = (devices || []).filter((d) => d.status === 'claimed').length;
    const spaceCount = spaces?.length || 0;
    const reviewCount = reviewTargets?.length || 0;
    const scanTotal = (analytics?.scans_by_date || []).reduce((s, r) => s + (Number(r.count) || 0), 0);

    const tabs = [
        { id: 'devices', label: 'Mis dispositivos', icon: 'contactless' },
        { id: 'spaces', label: 'Spaces', icon: 'language' },
        { id: 'reviews', label: 'Google Reviews', icon: 'reviews' },
        { id: 'analytics', label: 'Analíticas', icon: 'monitoring' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="grid items-center gap-8 lg:grid-cols-[1fr_380px]">
                    <div>
                        <div className="sc-rise"><Kicker>Mi panel</Kicker></div>
                        <h1 className="sc-rise mt-3 font-display text-[clamp(38px,5vw,64px)] font-bold leading-[1.02] tracking-[-0.04em]" style={{ animationDelay: '80ms' }}>
                            Hola, <Highlight>{firstName}</Highlight>
                        </h1>
                        <p className="sc-rise mt-4 max-w-md text-neutral-600" style={{ animationDelay: '160ms' }}>
                            Este es el resumen de tu presencia inteligente: tus tarjetas, tus Spaces y tus reseñas en un solo lugar.
                        </p>
                        <div className="sc-rise mt-7 flex flex-wrap items-center gap-3" style={{ animationDelay: '240ms' }}>
                            <Link
                                href={route('shop.comprar')}
                                className="group inline-flex items-center gap-2 rounded-full bg-[#D42410] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(212,36,16,0.3)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#B81E0C]"
                            >
                                <Icon name="add" className="text-lg transition duration-500 group-hover:rotate-90" />
                                Comprar dispositivo
                            </Link>
                            <button
                                type="button"
                                onClick={() => setActiveTab('spaces')}
                                className="group inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition duration-300 hover:-translate-y-0.5 hover:border-neutral-900"
                            >
                                Mis Spaces
                                <Icon name="arrow_forward" className="text-lg transition duration-300 group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>

                    {/* Tarjeta negra con el plan, como la franja negra de la portada */}
                    <div className="sc-rise relative overflow-hidden rounded-[28px] bg-[#0B0B0B] p-7 text-white shadow-[0_30px_70px_rgba(0,0,0,0.22)]" style={{ animationDelay: '200ms' }}>
                        <div aria-hidden="true" className="sc-blob pointer-events-none absolute -right-24 -top-24 h-72 w-72 bg-[radial-gradient(closest-side,rgba(255,40,10,0.4),transparent)]" />
                        {/* Tarjeta real asomando por la esquina */}
                        <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -right-6 w-32 rotate-[18deg]">
                            <div className="sc-bob">
                                <img src="/img/products/fronts/card-red.png" alt="" className="w-full rounded-[7%/4.4%] shadow-[0_24px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10" />
                            </div>
                        </div>
                        <div className="relative">
                            <Kicker light>Tu plan</Kicker>
                            <div className="mt-3 flex items-center gap-3">
                                <span className="font-display text-[44px] font-bold capitalize leading-none tracking-[-0.04em]">{userPlan.plan}</span>
                                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${userPlan.is_pro ? 'bg-[#D42410] text-white' : 'bg-white/10 text-neutral-300'}`}>
                                    <Icon name={userPlan.is_pro ? 'bolt' : 'workspace_premium'} fill={userPlan.is_pro} className="text-sm" />
                                    {userPlan.is_pro ? 'Activo' : 'Básico'}
                                </span>
                            </div>
                            <ul className="mt-5 max-w-[210px] space-y-2 text-sm text-neutral-300">
                                <li className="flex items-center gap-2">
                                    <Icon name="check_circle" fill className="text-base text-[#FF5A3C]" />
                                    Hasta {userPlan.max_spaces ?? 1} {(userPlan.max_spaces ?? 1) === 1 ? 'Space' : 'Spaces'}
                                </li>
                                <li className="flex items-center gap-2">
                                    <Icon name={userPlan.is_pro ? 'check_circle' : 'lock'} fill={userPlan.is_pro} className={`text-base ${userPlan.is_pro ? 'text-[#FF5A3C]' : 'text-neutral-500'}`} />
                                    Analíticas de escaneos
                                </li>
                            </ul>
                            {userPlan.expires_at && <p className="mt-4 text-xs text-neutral-500">Vence el {userPlan.expires_at}</p>}
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Mi Panel - SpaceCard" />

            <div className="pb-20 pt-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Flash */}
                    {flash.success && (
                        <div className="sc-swap flex items-center gap-2.5 rounded-2xl border border-emerald-600/20 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
                            <Icon name="check_circle" className="text-xl text-emerald-600" />
                            {flash.success}
                        </div>
                    )}
                    {flash.error && (
                        <div className="sc-swap flex items-center gap-2.5 rounded-2xl border border-[#D42410]/25 bg-[#FFF4F2] px-5 py-4 text-sm font-medium text-[#B81E0C]">
                            <Icon name="error" className="text-xl text-[#D42410]" />
                            {flash.error}
                        </div>
                    )}

                    {/* KPIs */}
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <Stat label="Dispositivos" value={deviceCount} sub={`${activeDevices} activos`} icon="credit_card" delay={80} />
                        <Stat label="Spaces" value={spaceCount} sub={`${userPlan.max_spaces ?? 1} máx. en tu plan`} icon="language" delay={160} />
                        <Stat label="Reseñas" value={reviewCount} sub="Negocios conectados" icon="star" delay={240} />
                        <Stat
                            label="Escaneos"
                            value={userPlan.is_pro ? scanTotal : '—'}
                            sub={userPlan.is_pro ? 'Últimos 30 días' : 'Disponible en Pro'}
                            icon="monitoring"
                            locked={!userPlan.is_pro}
                            delay={320}
                        />
                    </div>

                    {/* Onboarding */}
                    <OnboardingBanner devices={devices} setActiveTab={setActiveTab} />

                    {/* Pestañas: control segmentado como el de acceso */}
                    <div className="sc-rise" style={{ animationDelay: '400ms' }}>
                        <div role="tablist" aria-label="Secciones del panel" className="flex gap-1 overflow-x-auto rounded-full border border-black/[0.06] bg-white p-1 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:inline-flex">
                            {tabs.map((tab) => {
                                const active = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold transition duration-500 ${active ? 'bg-[#D42410] text-white shadow-[0_6px_16px_rgba(212,36,16,0.3)]' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'}`}
                                    >
                                        <Icon name={tab.icon} className="text-lg" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contenido: se re-monta con transición al cambiar de pestaña */}
                    <div key={activeTab} role="tabpanel" className="sc-swap [&>div:first-child]:rounded-[24px] [&>div:first-child]:border [&>div:first-child]:border-black/[0.07] [&>div:first-child]:shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                        {activeTab === 'devices' && (
                            <DeviceList devices={devices} spaces={spaces} reviewTargets={reviewTargets} />
                        )}
                        {activeTab === 'spaces' && (
                            <SpaceEditor spaces={spaces} userPlan={userPlan} />
                        )}
                        {activeTab === 'reviews' && (
                            <ReviewTargetConnector reviewTargets={reviewTargets} flash={flash} />
                        )}
                        {activeTab === 'analytics' && (
                            <AnalyticsPanel userPlan={userPlan} analytics={analytics} leads={leads} />
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
