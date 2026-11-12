/**
 * Pestaña de órdenes de compra (SpaceShop) en el panel admin.
 * Cada pedido muestra su avance (Pago → Fabricar → Surtido), quién compró, a dónde
 * se envía y qué hay que fabricar. Filtros por estado arriba.
 * Solo iconos Material Symbols (nunca emojis).
 */

import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { confirmDialog } from '@/Components/Notify';

function Icon({ name, fill = false, className = '' }) {
    return <span aria-hidden="true" className={`ms ${fill ? 'ms-fill' : ''} ${className}`}>{name}</span>;
}

const STATUS = {
    pending:   { label: 'Esperando pago', icon: 'hourglass_top', cls: 'bg-neutral-100 text-neutral-600' },
    paid:      { label: 'Por fabricar', icon: 'precision_manufacturing', cls: 'bg-amber-100 text-amber-800' },
    completed: { label: 'Surtido', icon: 'task_alt', cls: 'bg-emerald-100 text-emerald-800' },
    cancelled: { label: 'Sin pagar / cancelado', icon: 'block', cls: 'bg-neutral-100 text-neutral-500' },
};

const PRODUCTS = {
    card: { label: 'SpaceCard', icon: 'credit_card' },
    bracelet: { label: 'Pulsera NFC', icon: 'watch' },
    review_plate: { label: 'Placa de reseñas', icon: 'rate_review' },
};

const FILTERS = [
    { id: 'all', label: 'Todos' },
    { id: 'paid', label: 'Por fabricar' },
    { id: 'completed', label: 'Surtidos' },
    { id: 'pending', label: 'Esperando pago' },
    { id: 'cancelled', label: 'Cancelados' },
];

const money = (n) => `$${Number(n ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (s) => (s ? new Date(s).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

function Swatch({ color, label }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-50 px-2 py-1 text-[11px] text-neutral-600 ring-1 ring-black/[0.06]">
            <span className="h-3.5 w-3.5 rounded-full ring-1 ring-black/15" style={{ backgroundColor: color }} />
            {label} <span className="font-mono text-neutral-400">{color}</span>
        </span>
    );
}

/** Avance del pedido en tres pasos. */
function Progress({ status }) {
    const reached = { pending: 0, cancelled: 0, paid: 1, completed: 3 }[status] ?? 0;
    const steps = [
        { icon: 'payments', label: 'Pagado' },
        { icon: 'precision_manufacturing', label: 'Fabricado' },
        { icon: 'local_shipping', label: 'Surtido' },
    ];
    return (
        <ol className="flex items-center gap-1.5">
            {steps.map((s, i) => {
                const done = i < reached || (status === 'completed');
                const current = !done && i === reached && status !== 'cancelled';
                return (
                    <li key={s.label} className="flex items-center gap-1.5">
                        {i > 0 && <span className={`h-px w-4 sm:w-6 ${done ? 'bg-emerald-400' : 'bg-neutral-200'}`} />}
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${done ? 'bg-emerald-50 text-emerald-700' : current ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' : 'bg-neutral-100 text-neutral-400'}`}>
                            <Icon name={done ? 'check_circle' : s.icon} fill={done} className="text-sm" /> {s.label}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}

function OrderItem({ item }) {
    const p = PRODUCTS[item.product_type] ?? { label: item.product_type, icon: 'inventory_2' };
    const preset = item.design_config?.mode === 'preset';
    return (
        <li className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-white p-3 ring-1 ring-black/[0.06]">
            <span className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF4F2] text-[#D42410]">
                    <Icon name={p.icon} className="text-xl" />
                </span>
                {p.label}
                <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[11px] font-bold text-white">×{item.quantity}</span>
            </span>

            {item.product_type === 'card' && (
                preset ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                        <Icon name="style" className="text-sm" /> Prediseñada · {item.design_config.preset_name}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF4F2] px-2.5 py-1 text-[11px] font-semibold text-[#B81E0C]">
                        <Icon name="palette" className="text-sm" /> Diseño personalizado (2 caras)
                    </span>
                )
            )}

            {item.color_primary && <Swatch color={item.color_primary} label="Principal" />}
            {item.color_secondary && <Swatch color={item.color_secondary} label="Secundario" />}

            {item.logo_url && (
                <a href={item.logo_url} target="_blank" rel="noreferrer" title="Ver logo" className="ml-auto flex items-center gap-1.5 rounded-full bg-neutral-50 py-1 pl-1 pr-2.5 text-[11px] font-semibold text-neutral-600 ring-1 ring-black/[0.06] hover:ring-black/20">
                    <img src={item.logo_url} alt="" className="h-6 w-6 rounded-full bg-white object-contain" /> Logo
                </a>
            )}
        </li>
    );
}

/** Etiqueta de los pedidos de prueba de administradores (sin cobro). */
export function TestBadge() {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white" title="Pedido de prueba de un administrador: no se cobró y no cuenta en Ventas">
            <Icon name="science" className="text-sm" /> Prueba
        </span>
    );
}

function OrderCard({ order }) {
    const st = STATUS[order.status] ?? { label: order.status, icon: 'help', cls: 'bg-neutral-100 text-neutral-600' };
    const units = order.items.reduce((n, i) => n + Number(i.quantity || 0), 0);

    const process = async () => {
        const ok = await confirmDialog({
            icon: 'precision_manufacturing',
            title: `¿Fabricar el pedido #SPC-${10000 + order.id}?`,
            message: `Se generarán ${units} dispositivo(s) con su código y QR, y el pedido pasará a «Surtido».`,
            confirmText: 'Fabricar',
        });
        if (ok) router.post(`/admin/orders/${order.id}/generate`, {}, { preserveScroll: true });
    };

    const removeTest = async () => {
        const ok = await confirmDialog({
            tone: 'danger',
            icon: 'delete',
            title: `¿Borrar el pedido de prueba #SPC-${10000 + order.id}?`,
            message: 'También se borran las tarjetas que se generaron para él. No se puede deshacer.',
            confirmText: 'Borrar',
        });
        if (ok) router.delete(`/admin/pedidos-prueba/${order.id}`, { preserveScroll: true });
    };

    return (
        <article className={`overflow-hidden rounded-2xl border bg-white ${order.status === 'paid' ? 'border-amber-300 shadow-[0_0_0_4px_rgba(245,158,11,0.08)]' : 'border-black/[0.07]'}`}>
            {/* Encabezado */}
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-4">
                <div className="flex flex-wrap items-center gap-3">
                    <h4 className="font-display text-lg font-bold tracking-tight text-neutral-900">#SPC-{10000 + order.id}</h4>
                    {order.is_test && <TestBadge />}
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${st.cls}`}>
                        <Icon name={st.icon} className="text-sm" /> {st.label}
                    </span>
                </div>
                <div className="text-right">
                    <p className="font-display text-lg font-bold text-neutral-900">{money(order.total)}</p>
                    <p className="text-[11px] text-neutral-500">{units} unidad(es)</p>
                </div>
            </header>

            <div className="grid gap-5 px-5 py-4 lg:grid-cols-[1fr_1.6fr]">
                {/* Cliente y envío */}
                <dl className="space-y-2.5 text-sm">
                    {[
                        ['person', 'Cliente', order.customer_name],
                        ['mail', 'Correo', order.customer_email],
                        ['local_shipping', 'Envío', order.shipping_address],
                        ['schedule', 'Fecha', date(order.created_at)],
                    ].map(([icon, label, value]) => (
                        <div key={label} className="flex items-start gap-2.5">
                            <Icon name={icon} className="mt-0.5 text-lg text-neutral-400" />
                            <div className="min-w-0">
                                <dt className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{label}</dt>
                                <dd className="break-words text-neutral-800">{value}</dd>
                            </div>
                        </div>
                    ))}
                    <div className="flex items-start gap-2.5">
                        <Icon name={order.user ? 'link' : 'person_off'} className="mt-0.5 text-lg text-neutral-400" />
                        <div>
                            <dt className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Cuenta</dt>
                            <dd>
                                {order.user ? (
                                    <span className="inline-flex items-center gap-1.5 text-neutral-800">
                                        {order.user.name}
                                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Vinculada</span>
                                    </span>
                                ) : (
                                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-500">Compró como invitado</span>
                                )}
                            </dd>
                        </div>
                    </div>
                </dl>

                {/* Qué fabricar */}
                <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Qué fabricar</p>
                    <ul className="space-y-2 rounded-2xl bg-neutral-50 p-2">
                        {order.items.map((item) => <OrderItem key={item.id} item={item} />)}
                    </ul>
                </div>
            </div>

            {/* Pie: avance + acción */}
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] bg-neutral-50/60 px-5 py-3">
                <Progress status={order.status} />
                {order.status === 'paid' && (
                    <button
                        type="button"
                        onClick={process}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#D42410] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(212,36,16,0.25)] transition hover:-translate-y-0.5 hover:bg-[#B81E0C]"
                    >
                        <Icon name="precision_manufacturing" className="text-base" /> Fabricar y generar dispositivos
                    </button>
                )}
                {order.status === 'completed' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <Icon name="task_alt" className="text-base" /> Dispositivos generados: revísalos en Lotes y Producción
                    </span>
                )}
                {order.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                        <Icon name="info" className="text-base" /> Se podrá fabricar cuando Stripe confirme el pago
                    </span>
                )}
                {order.is_test && (
                    <button
                        type="button"
                        onClick={removeTest}
                        className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-[#B81E0C] ring-1 ring-[#D42410]/30 transition hover:bg-[#FFF4F2]"
                    >
                        <Icon name="delete" className="text-base" /> Borrar pedido de prueba
                    </button>
                )}
            </footer>
        </article>
    );
}

export default function OrdersPanel({ orders }) {
    const [filter, setFilter] = useState(() => (orders.some((o) => o.status === 'paid') ? 'paid' : 'all'));
    const count = (id) => (id === 'all' ? orders.length : orders.filter((o) => o.status === id).length);
    const shown = useMemo(() => (filter === 'all' ? orders : orders.filter((o) => o.status === filter)), [orders, filter]);

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D42410]">SpaceShop</p>
                    <h3 className="font-display text-xl font-bold tracking-tight text-gray-900 dark:text-white">Órdenes de compra</h3>
                    <p className="mt-1 text-sm text-neutral-500">Cuando un pedido está pagado, fabrícalo para generar sus dispositivos.</p>
                </div>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
                {FILTERS.map((f) => (
                    <button
                        key={f.id}
                        type="button"
                        onClick={() => setFilter(f.id)}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${filter === f.id ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 ring-1 ring-black/10 hover:ring-black/25'}`}
                    >
                        {f.label} <span className="ml-1 opacity-60">{count(f.id)}</span>
                    </button>
                ))}
            </div>

            {shown.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-2xl bg-neutral-50 py-12 text-center text-sm text-neutral-500">
                    <Icon name="receipt_long" className="text-4xl text-neutral-300" />
                    {orders.length === 0 ? 'Todavía no hay pedidos de SpaceShop.' : 'No hay pedidos con este estado.'}
                </div>
            ) : (
                <div className="space-y-4">
                    {shown.map((o) => <OrderCard key={o.id} order={o} />)}
                </div>
            )}
        </div>
    );
}
