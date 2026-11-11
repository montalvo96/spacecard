/**
 * Dashboard de ventas de SpaceShop dentro del panel de Admin: KPIs del mes,
 * gráfica de ingresos por día, desglose por tipo de producto y lista de
 * pedidos cobrados. Los datos vienen de /admin/reportes/ventas/datos?mes=AAAA-MM.
 * Las gráficas son SVG propias (sin librerías) en el rojo de la marca.
 */

import React, { useEffect, useMemo, useState } from 'react';

const RED = '#D42410';

const currentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const money = (n) => '$' + Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const moneyShort = (n) => (n >= 1000 ? '$' + (n / 1000).toLocaleString('es-MX', { maximumFractionDigits: 1 }) + 'k' : '$' + Math.round(n));

/** Escala "bonita" para el eje Y: máximo redondeado y 4 marcas. */
const niceMax = (max) => {
    if (max <= 0) return 100;
    const pow = 10 ** Math.floor(Math.log10(max));
    const step = [1, 2, 2.5, 5, 10].find((s) => s * pow * 4 >= max) * pow;
    return step * 4;
};

/** Barra con las esquinas superiores redondeadas (4px) y la base recta. */
const barPath = (x, y, w, h, r = 4) => {
    if (h <= 0) return '';
    const rr = Math.min(r, w / 2, h);
    return `M${x},${y + h} V${y + rr} Q${x},${y} ${x + rr},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${y + h} Z`;
};

function Kpi({ icon, label, value, hint, hintTone = 'muted' }) {
    const tones = { up: 'text-emerald-700', down: 'text-[#B81E0C]', muted: 'text-neutral-500' };
    return (
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/[0.06] dark:bg-gray-800">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                <span aria-hidden="true" className="ms text-base text-[#D42410]">{icon}</span> {label}
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">{value}</p>
            {hint && <p className={`mt-1 text-xs font-medium ${tones[hintTone]}`}>{hint}</p>}
        </div>
    );
}

function DailyRevenueChart({ days }) {
    const [hover, setHover] = useState(null);
    const W = 720, H = 260, padL = 52, padR = 12, padT = 16, padB = 28;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const max = niceMax(Math.max(...days.map((d) => d.revenue)));
    const slot = plotW / days.length;
    const barW = Math.max(4, Math.min(18, slot - 4));
    const y = (v) => padT + plotH - (v / max) * plotH;
    const ticks = [0, 1, 2, 3, 4].map((i) => (max / 4) * i);
    const active = hover != null ? days[hover] : null;

    return (
        <div className="relative">
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Ingresos por día del mes" onMouseLeave={() => setHover(null)}>
                {ticks.map((t) => (
                    <g key={t}>
                        <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="currentColor" className="text-neutral-200 dark:text-gray-700" strokeWidth="1" />
                        <text x={padL - 8} y={y(t) + 4} textAnchor="end" className="fill-neutral-400 text-[11px]">{moneyShort(t)}</text>
                    </g>
                ))}
                {days.map((d, i) => {
                    const x = padL + i * slot + (slot - barW) / 2;
                    const h = (d.revenue / max) * plotH;
                    return (
                        <g key={d.day}>
                            <path d={barPath(x, y(d.revenue), barW, h)} fill={RED} opacity={hover == null || hover === i ? 1 : 0.35} />
                            {(d.day === 1 || d.day % 5 === 0) && (
                                <text x={padL + i * slot + slot / 2} y={H - 8} textAnchor="middle" className="fill-neutral-400 text-[11px]">{d.day}</text>
                            )}
                            {/* zona de hover: toda la columna, más grande que la barra */}
                            <rect x={padL + i * slot} y={padT} width={slot} height={plotH} fill="transparent" onMouseEnter={() => setHover(i)} />
                        </g>
                    );
                })}
            </svg>
            {active && (
                <div
                    className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-xl bg-neutral-900 px-3 py-2 text-xs text-white shadow-lg"
                    style={{ left: `${((padL + hover * slot + slot / 2) / W) * 100}%` }}
                >
                    <p className="font-semibold">Día {active.day}</p>
                    <p>{money(active.revenue)}</p>
                    <p className="text-neutral-300">{active.orders} pedido(s)</p>
                </div>
            )}
        </div>
    );
}

function ProductBreakdown({ products }) {
    const max = Math.max(1, ...products.map((p) => p.revenue));
    const total = products.reduce((s, p) => s + p.revenue, 0);
    return (
        <ul className="space-y-5">
            {products.map((p) => (
                <li key={p.type}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                        <span className="font-semibold text-neutral-900 dark:text-white">{p.label}</span>
                        <span className="text-neutral-500">
                            <span className="font-semibold text-neutral-900 dark:text-white">{money(p.revenue)}</span> · {p.units} u.
                            {total > 0 && ` · ${Math.round((p.revenue / total) * 100)}%`}
                        </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-gray-700" title={`${p.label}: ${money(p.revenue)} (${p.units} unidades)`}>
                        <div className="h-full rounded-full" style={{ width: `${(p.revenue / max) * 100}%`, backgroundColor: RED }} />
                    </div>
                </li>
            ))}
        </ul>
    );
}

export default function SalesDashboard() {
    const [month, setMonth] = useState(currentMonth());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const valid = /^\d{4}-\d{2}$/.test(month);

    useEffect(() => {
        if (!valid) return;
        let cancelled = false;
        setLoading(true);
        setError(false);
        fetch(`/admin/reportes/ventas/datos?mes=${month}`, { headers: { Accept: 'application/json' } })
            .then((r) => (r.ok ? r.json() : Promise.reject(r)))
            .then((json) => !cancelled && setData(json))
            .catch(() => !cancelled && setError(true))
            .finally(() => !cancelled && setLoading(false));
        return () => { cancelled = true; };
    }, [month, valid]);

    const delta = useMemo(() => {
        if (!data) return null;
        const { revenue, prev_revenue } = data.kpis;
        if (!prev_revenue) return revenue > 0 ? { text: 'Sin ventas el mes anterior', tone: 'muted' } : null;
        const pct = ((revenue - prev_revenue) / prev_revenue) * 100;
        return { text: `${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct).toFixed(0)}% vs. mes anterior`, tone: pct >= 0 ? 'up' : 'down' };
    }, [data]);

    const k = data?.kpis;
    const empty = data && k.orders === 0;

    return (
        <div className={`space-y-6 transition-opacity ${loading && data ? 'opacity-60' : ''}`}>
            {/* Encabezado: mes y descarga */}
            <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/[0.06] sm:flex-row sm:items-center sm:justify-between dark:bg-gray-800">
                <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Ventas de SpaceShop{data ? ` · ${data.label}` : ''}</h3>
                    <p className="text-sm text-neutral-500">Solo pedidos cobrados (pagados o completados).</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <label className="sr-only" htmlFor="sales-month">Mes</label>
                    <input
                        id="sales-month"
                        type="month"
                        value={month}
                        max={currentMonth()}
                        onChange={(e) => setMonth(e.target.value)}
                        className="rounded-full border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-800 focus:border-[#D42410] focus:ring-[#D42410]"
                    />
                    <a
                        href={valid ? `/admin/reportes/ventas?mes=${month}` : undefined}
                        aria-disabled={!valid}
                        className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition ${valid ? 'bg-[#D42410] hover:bg-[#B81E0C]' : 'pointer-events-none bg-neutral-300'}`}
                    >
                        <span aria-hidden="true" className="ms text-lg">download</span>
                        Descargar Excel
                    </a>
                </div>
            </div>

            {error && (
                <p className="flex items-center gap-2 rounded-2xl bg-[#FFF4F2] p-4 text-sm font-medium text-[#B81E0C]">
                    <span aria-hidden="true" className="ms text-lg">error</span> No se pudieron cargar las ventas de este mes. Intenta de nuevo.
                </p>
            )}

            {!data && loading && (
                <p className="flex items-center gap-2 p-6 text-sm text-neutral-500">
                    <span aria-hidden="true" className="ms animate-spin text-lg">progress_activity</span> Cargando ventas…
                </p>
            )}

            {data && (
                <>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <Kpi icon="payments" label="Ingresos" value={money(k.revenue)} hint={delta?.text} hintTone={delta?.tone} />
                        <Kpi icon="receipt_long" label="Pedidos cobrados" value={k.orders} hint={k.unpaid ? `${k.unpaid} sin cobrar` : 'Ninguno sin cobrar'} />
                        <Kpi icon="shopping_bag" label="Ticket promedio" value={money(k.average)} />
                        <Kpi icon="inventory_2" label="Unidades vendidas" value={k.units} />
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/[0.06] lg:col-span-2 dark:bg-gray-800">
                            <h4 className="mb-4 text-sm font-bold text-neutral-900 dark:text-white">Ingresos por día</h4>
                            {empty
                                ? <p className="py-16 text-center text-sm text-neutral-500">No hubo ventas cobradas en este mes.</p>
                                : <DailyRevenueChart days={data.days} />}
                        </div>
                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/[0.06] dark:bg-gray-800">
                            <h4 className="mb-5 text-sm font-bold text-neutral-900 dark:text-white">Ingresos por tipo de producto</h4>
                            <ProductBreakdown products={data.products} />
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/[0.06] dark:bg-gray-800">
                        <h4 className="px-6 pt-6 text-sm font-bold text-neutral-900 dark:text-white">Pedidos cobrados del mes</h4>
                        {empty ? (
                            <p className="p-6 text-sm text-neutral-500">Sin pedidos cobrados.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="mt-3 w-full min-w-[640px] text-left text-sm">
                                    <thead className="border-b border-neutral-100 text-xs text-neutral-500 dark:border-gray-700">
                                        <tr>
                                            <th className="px-6 py-2 font-semibold">Folio</th>
                                            <th className="px-3 py-2 font-semibold">Fecha</th>
                                            <th className="px-3 py-2 font-semibold">Cliente</th>
                                            <th className="px-3 py-2 font-semibold">Artículos</th>
                                            <th className="px-3 py-2 font-semibold">Estado</th>
                                            <th className="px-6 py-2 text-right font-semibold">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-gray-700">
                                        {data.orders.map((o) => (
                                            <tr key={o.id} className="text-neutral-700 dark:text-gray-300">
                                                <td className="px-6 py-3 font-semibold text-neutral-900 dark:text-white">{o.folio}</td>
                                                <td className="whitespace-nowrap px-3 py-3">{o.date}</td>
                                                <td className="px-3 py-3">
                                                    <p className="font-medium text-neutral-900 dark:text-white">{o.customer}</p>
                                                    <p className="text-xs text-neutral-500">{o.email}</p>
                                                </td>
                                                <td className="px-3 py-3">{o.items}</td>
                                                <td className="px-3 py-3">
                                                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-700 dark:bg-gray-700 dark:text-gray-200">{o.status}</span>
                                                </td>
                                                <td className="px-6 py-3 text-right font-semibold text-neutral-900 dark:text-white">{money(o.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
