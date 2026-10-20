/**
 * Vista del Dashboard principal del cliente (Inertia/React).
 * Integra los componentes de dispositivos, Spaces, Reviews y analíticas.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import DeviceList from '@/Components/DeviceList';
import SpaceEditor from '@/Components/SpaceEditor';
import ReviewTargetConnector from '@/Components/ReviewTargetConnector';
import OnboardingBanner from '@/Components/OnboardingBanner';
import AnalyticsPanel from '@/Components/AnalyticsPanel';

const ICONS = {
    card: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4">
            <rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 10h20M6 15h4" />
        </svg>
    ),
    globe: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
            <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
        </svg>
    ),
    star: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className="h-4 w-4">
            <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
        </svg>
    ),
    chart: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M4 19V5M4 15l4-4 4 3 8-8M20 6v5h-5" />
        </svg>
    ),
};

function Stat({ label, value, sub, icon, accent }) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-gray-300 dark:border-white/[0.08] dark:bg-white/[0.03] dark:shadow-none dark:hover:border-white/[0.14]">
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-gray-500">{label}</span>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent}`}>{ICONS[icon]}</span>
            </div>
            <div className="mt-4 text-[2rem] font-bold leading-none tracking-tight text-gray-900 dark:text-white">{value}</div>
            {sub && <div className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">{sub}</div>}
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
        { id: 'devices', label: 'Mis Dispositivos' },
        { id: 'spaces', label: 'Spaces' },
        { id: 'reviews', label: 'Google Reviews' },
        { id: 'analytics', label: 'Analytics' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex w-full items-center justify-between">
                    <h2 className="text-lg font-bold leading-tight text-gray-900 dark:text-gray-100">Mi Panel</h2>
                    <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${
                            userPlan.is_pro
                                ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm shadow-violet-500/30'
                                : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300'
                        }`}>
                            {userPlan.plan} {userPlan.is_pro && '⚡'}
                        </span>
                        {userPlan.expires_at && (
                            <span className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">Vence: {userPlan.expires_at}</span>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Mi Panel - SpaceCard" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">

                    {/* Saludo */}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-[2.5rem]">
                            Hola, <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">{firstName}</span>
                        </h1>
                        <p className="mt-2 text-[15px] text-gray-500 dark:text-gray-400">Este es el resumen de tu presencia inteligente.</p>
                    </div>

                    {/* Flash */}
                    {flash.success && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-300">
                            {flash.success}
                        </div>
                    )}
                    {flash.error && (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-300">
                            {flash.error}
                        </div>
                    )}

                    {/* KPIs */}
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <Stat label="Dispositivos" value={deviceCount} sub={`${activeDevices} activos`} icon="card" accent="bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300" />
                        <Stat label="Spaces" value={spaceCount} sub={`${userPlan.max_spaces ?? 1} máx.`} icon="globe" accent="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300" />
                        <Stat label="Reseñas" value={reviewCount} sub="Negocios conectados" icon="star" accent="bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300" />
                        <Stat label="Escaneos" value={userPlan.is_pro ? scanTotal : '—'} sub={userPlan.is_pro ? 'Últimos 30 días' : 'Solo Pro'} icon="chart" accent="bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-300" />
                    </div>

                    {/* Onboarding */}
                    <OnboardingBanner devices={devices} setActiveTab={setActiveTab} />

                    {/* Tabs tipo pill */}
                    <div className="inline-flex max-w-full flex-wrap gap-1 rounded-2xl border border-gray-200 bg-white/70 p-1.5 backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-violet-500/25'
                                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Contenido */}
                    <div className="transition-all duration-300">
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
