/**
 * Componente React AnalyticsPanel para visualizar analíticas de escaneo de dispositivos y leads (Pro).
 * Muestra gráficos de barras CSS, tablas detalladas y lista de comentarios recibidos.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

import React from 'react';

export default function AnalyticsPanel({ userPlan, analytics, leads }) {
    const isPro = userPlan.is_pro;

    if (!isPro) {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 text-center">
                <span className="text-3xl">📊</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-4 mb-2">
                    Métricas de Escaneos y Leads Avanzados
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                    Descubre cuántas personas escanean tus dispositivos físicos, qué bloques reciben más clics, y desde qué países te visitan en tiempo real.
                </p>
                <button className="py-2.5 px-6 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-500/20">
                    Actualizar a Pro
                </button>
            </div>
        );
    }

    const scansByDate = analytics?.scans_by_date || [];
    const deviceFamilies = analytics?.device_families || [];
    const countries = analytics?.countries || [];
    const recentScans = analytics?.recent_scans || [];

    // Calcular totales
    const totalScans = scansByDate.reduce((sum, item) => sum + item.count, 0);
    const totalLeads = leads?.length || 0;
    
    // Obtener el valor máximo para escalar el gráfico de barras
    const maxScanCount = scansByDate.length > 0 
        ? Math.max(...scansByDate.map(item => item.count)) 
        : 1;

    return (
        <div className="space-y-6">
            
            {/* Tarjetas de Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-none">
                    <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider block mb-1">
                        Escaneos Totales (30d)
                    </span>
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        {totalScans}
                    </span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-none">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                        Leads / Mensajes Recibidos
                    </span>
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        {totalLeads}
                    </span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-none md:col-span-2 lg:col-span-1">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
                        Tasa de Conversión (Leads/Taps)
                    </span>
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        {totalScans > 0 ? ((totalLeads / totalScans) * 100).toFixed(1) : '0.0'}%
                    </span>
                </div>
            </div>

            {/* Gráfico de Barras CSS Nativo para Escaneos */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-none">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-6">
                    Actividad de Escaneo por Día (Últimos 30 días)
                </h4>
                {scansByDate.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 text-sm">
                        Sin datos de escaneo en los últimos 30 días.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {scansByDate.map((item, idx) => {
                            const percentage = (item.count / maxScanCount) * 100;
                            return (
                                <div key={idx} className="flex items-center gap-4 text-xs">
                                    <span className="w-24 text-gray-500 font-mono">{item.date}</span>
                                    <div className="flex-grow bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                                        <div 
                                            className="bg-violet-600 h-full rounded-full transition-all duration-500" 
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="w-8 font-bold text-right text-gray-900 dark:text-white">{item.count}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Distribución por Dispositivo y País */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Dispositivos */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-none">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                        Familia de Dispositivos (Taps)
                    </h4>
                    {deviceFamilies.length === 0 ? (
                        <div className="py-8 text-center text-gray-400 text-sm">Sin datos.</div>
                    ) : (
                        <div className="space-y-4">
                            {deviceFamilies.map((d, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 dark:border-gray-700 pb-2 last:border-0">
                                    <span className="capitalize font-medium text-gray-600 dark:text-gray-400">{d.device_family}</span>
                                    <span className="font-bold text-gray-950 dark:text-white">{d.count} taps</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Países */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-none">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                        Países Principales
                    </h4>
                    {countries.length === 0 ? (
                        <div className="py-8 text-center text-gray-400 text-sm">Sin datos de geolocalización.</div>
                    ) : (
                        <div className="space-y-4">
                            {countries.map((c, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 dark:border-gray-700 pb-2 last:border-0">
                                    <span className="font-medium text-gray-600 dark:text-gray-400">{c.country || 'Desconocido'}</span>
                                    <span className="font-bold text-gray-950 dark:text-white">{c.count} taps</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Buzón de leads y feedback privado */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-none">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                    Buzón de Leads y Feedback Privado
                </h4>
                {leads.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 text-sm">
                        No has recibido ningún mensaje o contacto todavía.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {leads.map((lead) => (
                            <div key={lead.id} className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-gray-900 dark:text-white">{lead.name}</span>
                                        <span className="text-xs text-gray-400 font-mono">({lead.email})</span>
                                    </div>
                                    {lead.phone && <div className="text-xs text-gray-500">Tel: {lead.phone}</div>}
                                    {lead.note && (
                                        <p className="text-xs text-gray-600 dark:text-gray-300 italic pt-1">
                                            "{lead.note}"
                                        </p>
                                    )}
                                </div>
                                <span className="text-[10px] text-gray-400 font-mono shrink-0">
                                    {new Date(lead.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Listado de escaneos detallados */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-none">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                    Últimos 20 Escaneos
                </h4>
                {recentScans.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-sm">Sin registros.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 font-semibold uppercase">
                                    <th className="py-2 px-1">Dispositivo</th>
                                    <th className="py-2 px-1">IP</th>
                                    <th className="py-2 px-1">Ubicación</th>
                                    <th className="py-2 px-1">Plataforma</th>
                                    <th className="py-2 px-1 text-right">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-700 dark:text-gray-300 font-mono">
                                {recentScans.map((s) => (
                                    <tr key={s.id}>
                                        <td className="py-3 px-1 font-sans">{s.device?.code}</td>
                                        <td className="py-3 px-1">{s.ip}</td>
                                        <td className="py-3 px-1 font-sans">
                                            {s.city ? `${s.city}, ${s.country}` : s.country || 'Desconocida'}
                                        </td>
                                        <td className="py-3 px-1 capitalize font-sans">{s.device_family}</td>
                                        <td className="py-3 px-1 text-right">
                                            {new Date(s.scanned_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
        </div>
    );
}
