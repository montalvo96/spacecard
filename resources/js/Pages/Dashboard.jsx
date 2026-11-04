/**
 * Vista del Dashboard principal del cliente (Inertia/React).
 * Integra los componentes de dispositivos, Spaces, Reviews y analíticas.
 * Estilo: negro + rojo como la landing; iconos Material Symbols.
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

function Stat({ label, value, sub, icon, delay, locked }) {
    return (
        <div
            className="sc-rise group rounded-[22px] border border-white/10 bg-white/[0.03] p-5 transition duration-500 hover:-translate-y-1 hover:border-[#FF3B1F]/40 hover:bg-white/[0.05]"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-center justify-between">
                <span className="text-[13px] text-neutral-400">{label}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF3B1F]/10 text-[#FF5A3C] transition duration-500 group-hover:-rotate-6 group-hover:scale-110">
                    <Icon name={icon} className="text-xl" />
                </span>
            </div>
            <div className="mt-5 flex items-center gap-2 font-display text-[40px] font-normal leading-none tracking-[-0.04em]">
                {value}
                {locked && <Icon name="lock" className="text-xl text-neutral-500" />}
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
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${userPlan.is_pro ? 'bg-[#D42410] text-white' : 'border border-white/10 bg-white/5 text-neutral-300'}`}>
                            <Icon name={userPlan.is_pro ? 'bolt' : 'workspace_premium'} fill={userPlan.is_pro} className="text-base" />
                            Plan {userPlan.plan}
                            {userPlan.expires_at && <span className="font-normal opacity-80">· vence {userPlan.expires_at}</span>}
                        </span>
                        <h1 className="mt-4 font-display text-[clamp(34px,4.4vw,52px)] font-normal leading-none tracking-[-0.04em]">
                            Hola, <span className="text-[#FF5A3C]">{firstName}</span>
                        </h1>
                        <p className="mt-3 text-sm text-neutral-400">Este es el resumen de tu presencia inteligente.</p>
                    </div>
                    <Link
                        href={route('shop.comprar')}
                        className="group inline-flex items-center gap-2 rounded-full bg-[#D42410] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(255,40,10,0.3)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#B81E0C]"
                    >
                        <Icon name="add" className="text-lg transition duration-500 group-hover:rotate-90" />
                        Comprar dispositivo
                    </Link>
                </div>
            }
        >
            <Head title="Mi Panel - SpaceCard" />

            <div className="pb-16 pt-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Flash */}
                    {flash.success && (
                        <div className="sc-swap flex items-center gap-2.5 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.07] px-5 py-4 text-sm font-medium text-emerald-200">
                            <Icon name="check_circle" className="text-xl text-emerald-300" />
                            {flash.success}
                        </div>
                    )}
                    {flash.error && (
                        <div className="sc-swap flex items-center gap-2.5 rounded-2xl border border-[#FF3B1F]/30 bg-[#FF3B1F]/10 px-5 py-4 text-sm font-medium text-[#FFB3A3]">
                            <Icon name="error" className="text-xl text-[#FF5A3C]" />
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

                    {/* Pestañas */}
                    <div className="sc-rise" style={{ animationDelay: '400ms' }}>
                        <div role="tablist" aria-label="Secciones del panel" className="flex gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/[0.03] p-1 sm:inline-flex">
                            {tabs.map((tab) => {
                                const active = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold transition duration-500 ${active ? 'bg-[#D42410] text-white shadow-[0_4px_14px_rgba(255,40,10,0.35)]' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        <Icon name={tab.icon} className="text-lg" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contenido: se re-monta con transición al cambiar de pestaña */}
                    <div key={activeTab} role="tabpanel" className="sc-swap">
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
