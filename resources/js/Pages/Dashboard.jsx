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
        <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">{label}</span>
                <span className={`flex h-8 w-8 items-center justify-center rounded-md ${accent}`}>{ICONS[icon]}</span>
            </div>
            <div className="mt-4 text-3xl font-semibold leading-none text-gray-900 dark:text-gray-100">{value}</div>
            {sub && <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{sub}</div>}
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
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Mi Panel</h2>
                    <div className="flex items-center gap-2">
                        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-widest ${
                            userPlan.is_pro
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
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

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">

                    {/* Saludo */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            Hola, {firstName}. Este es el resumen de tu presencia inteligente.
                        </div>
                    </div>

                    {/* Flash */}
                    {flash.success && (
                        <div className="bg-green-50 p-4 text-sm font-medium text-green-700 shadow-sm sm:rounded-lg dark:bg-green-900/20 dark:text-green-400">
                            {flash.success}
                        </div>
                    )}
                    {flash.error && (
                        <div className="bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm sm:rounded-lg dark:bg-red-900/20 dark:text-red-400">
                            {flash.error}
                        </div>
                    )}

                    {/* KPIs */}
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <Stat label="Dispositivos" value={deviceCount} sub={`${activeDevices} activos`} icon="card" accent="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300" />
                        <Stat label="Spaces" value={spaceCount} sub={`${userPlan.max_spaces ?? 1} máx.`} icon="globe" accent="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300" />
                        <Stat label="Reseñas" value={reviewCount} sub="Negocios conectados" icon="star" accent="bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300" />
                        <Stat label="Escaneos" value={userPlan.is_pro ? scanTotal : '—'} sub={userPlan.is_pro ? 'Últimos 30 días' : 'Solo Pro'} icon="chart" accent="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300" />
                    </div>

                    {/* Onboarding */}
                    <OnboardingBanner devices={devices} setActiveTab={setActiveTab} />

                    {/* Tabs estilo NavLink de Breeze */}
                    <div className="flex flex-wrap gap-x-8 overflow-x-auto bg-white px-6 shadow-sm sm:rounded-lg dark:bg-gray-800">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`inline-flex items-center border-b-2 px-1 py-4 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ${
                                    activeTab === tab.id
                                        ? 'border-indigo-400 text-gray-900 dark:border-indigo-600 dark:text-gray-100'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300'
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
