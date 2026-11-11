/**
 * Producción (admin): registro de clientes y de los diseños de SpaceCard que
 * dejan en SpaceShop. Desde aquí se descarga cada diseño (ZIP con hoja de
 * impresión, datos, logo y QRs), se exporta todo a CSV/Excel y se manda a la
 * impresora (hoja a tamaño real CR80 por el diálogo de impresión del navegador).
 * Estilo: el de la portada (blanco + rojo + negro).
 */

import { useMemo, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { TestBadge } from '@/Components/OrdersPanel';

function Icon({ name, fill = false, className = '' }) {
    return <span aria-hidden="true" className={`ms ${fill ? 'ms-fill' : ''} ${className}`}>{name}</span>;
}

function Highlight({ children }) {
    return (
        <span className="relative mx-1 inline-block px-3 text-white">
            <span aria-hidden="true" className="sc-in-left absolute inset-0 -skew-x-12 rounded-md bg-[#D42410] shadow-[0_10px_24px_rgba(212,36,16,0.35)]" style={{ animationDelay: '300ms' }} />
            <span className="relative">{children}</span>
        </span>
    );
}

const STAGES = {
    pending: { label: 'Sin QR', hint: 'Falta generar dispositivos', cls: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
    ready: { label: 'Listo para imprimir', hint: 'Con QR real', cls: 'bg-[#FFF4F2] text-[#B81E0C] ring-[#D42410]/25' },
    printed: { label: 'Impreso', hint: 'Falta enviar', cls: 'bg-neutral-900 text-white ring-black' },
    shipped: { label: 'Enviado', hint: 'Completado', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
};

const FILTERS = [
    { id: 'all', label: 'Todos' },
    { id: 'pending', label: 'Sin QR' },
    { id: 'ready', label: 'Listos' },
    { id: 'printed', label: 'Impresos' },
    { id: 'shipped', label: 'Enviados' },
];

function Stat({ label, value, icon, dark = false }) {
    return (
        <div className={`rounded-2xl p-5 ${dark ? 'bg-[#0B0B0B] text-white' : 'border border-black/[0.07] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]'}`}>
            <div className="flex items-center justify-between">
                <span className={`text-[13px] font-semibold ${dark ? 'text-neutral-400' : 'text-neutral-500'}`}>{label}</span>
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${dark ? 'bg-[#D42410] text-white' : 'bg-[#D42410]/[0.08] text-[#D42410]'}`}>
                    <Icon name={icon} className="text-xl" />
                </span>
            </div>
            <div className="mt-4 font-display text-[36px] font-bold leading-none tracking-[-0.04em]">{value}</div>
        </div>
    );
}

/** Miniatura de una cara, renderizada por la misma hoja que se imprime. */
function FacePreview({ id, side, preset }) {
    return (
        <div className="min-w-0 flex-1">
            <div className={`overflow-hidden rounded-xl bg-neutral-100 ${preset ? 'mx-auto aspect-[54/85.6] max-w-[120px]' : 'aspect-[85.6/54]'}`}>
                <iframe
                    title={`${side === 'front' ? 'Frente' : 'Reverso'} del diseño ${id}`}
                    src={route('admin.designs.print', { id, preview: side })}
                    loading="lazy"
                    className="pointer-events-none h-full w-full border-0"
                />
            </div>
            <p className="mt-1.5 text-center text-[11px] font-semibold text-neutral-400">{side === 'front' ? 'Frente' : 'Reverso'}</p>
        </div>
    );
}

/** Código de la tarjeta + enlace que se graba en su chip NFC, con botón de copiar. */
function NfcLink({ device }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(device.nfc_url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            window.prompt('Copia el enlace NFC:', device.nfc_url);
        }
    };

    return (
        <li className="flex items-center gap-2 rounded-xl bg-[#F6F6F7] py-1.5 pl-3 pr-1.5">
            <span className="shrink-0 font-mono text-[11px] font-bold text-neutral-900">{device.code}</span>
            <a href={device.nfc_url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate font-mono text-[11px] text-neutral-500 hover:text-[#D42410]">
                {device.nfc_url}
            </a>
            {device.printed && <span className="shrink-0 rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-bold text-white">Impresa</span>}
            <button
                type="button"
                onClick={copy}
                aria-label={`Copiar enlace NFC de ${device.code}`}
                className={`flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold transition ${copied ? 'bg-emerald-600 text-white' : 'bg-white text-neutral-700 ring-1 ring-black/10 hover:ring-black/25'}`}
            >
                <Icon name={copied ? 'check' : 'content_copy'} className="text-sm" />
                {copied ? 'Copiado' : 'Copiar'}
            </button>
        </li>
    );
}

function DesignRow({ item }) {
    const stage = STAGES[item.stage];
    const info = item.info || {};
    const fields = [
        ['badge', info.name],
        ['business_center', [info.title, info.company].filter(Boolean).join(' · ')],
        ['call', info.phone],
        ['language', info.website],
    ].filter(([, v]) => v);
    const btn = 'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold transition duration-300 hover:-translate-y-0.5';

    return (
        <article className="sc-swap grid gap-6 rounded-[24px] border border-black/[0.07] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-6 lg:grid-cols-[340px_1fr]">
            {/* Las dos caras tal como se imprimirán */}
            <div className="flex gap-3 self-start rounded-2xl bg-[#F6F6F7] p-3">
                <FacePreview id={item.id} side="front" preset={item.mode === 'preset'} />
                <FacePreview id={item.id} side="back" preset={item.mode === 'preset'} />
            </div>

            <div className="flex min-w-0 flex-col">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-lg font-bold tracking-[-0.02em]">Pedido #{item.order_code}</span>
                    {item.is_test && <TestBadge />}
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset ${stage.cls}`} title={stage.hint}>{stage.label}</span>
                    <span className="text-xs text-neutral-400">{new Date(item.created_at).toLocaleString('es-MX')}</span>
                </div>

                <div className="mt-3 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#D42410]">Cliente</p>
                        <p className="mt-1.5 font-semibold">{item.customer.name}</p>
                        <p className="text-neutral-500">{item.customer.email}</p>
                        <p className="mt-1 flex items-start gap-1.5 text-neutral-500">
                            <Icon name="location_on" className="mt-0.5 text-base text-neutral-400" />
                            <span className="min-w-0">{item.customer.address}</span>
                        </p>
                        <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${item.customer.user ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                            <Icon name={item.customer.user ? 'verified_user' : 'person'} className="text-sm" />
                            {item.customer.user ? 'Cuenta vinculada' : 'Invitado'}
                        </span>
                    </div>

                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#D42410]">Datos de la tarjeta</p>
                        <p className="mt-1.5 text-neutral-600">
                            {item.quantity} tarjeta(s) · {item.mode === 'preset' ? `Catálogo · ${item.preset_name}` : 'Diseño personalizado'}
                        </p>
                        {fields.length > 0 ? (
                            <ul className="mt-1.5 space-y-1">
                                {fields.map(([icon, v]) => (
                                    <li key={icon} className="flex items-center gap-1.5 text-neutral-700">
                                        <Icon name={icon} className="text-base text-neutral-400" />
                                        <span className="truncate">{v}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            item.mode !== 'preset' && <p className="mt-1.5 text-neutral-400">Sin datos de contacto en la tarjeta</p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            {item.colors.map((c, i) => (
                                <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 py-0.5 pl-0.5 pr-2 font-mono text-[11px] text-neutral-600">
                                    <span className="h-4 w-4 rounded-full ring-1 ring-black/10" style={{ background: c }} />
                                    {c}
                                </span>
                            ))}
                            {item.logo_url && (
                                <a href={item.logo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-600 hover:bg-neutral-200">
                                    <Icon name="image" className="text-sm" /> Ver logo
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {item.devices.length > 0 ? (
                    <div className="mt-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#D42410]">Enlaces NFC (uno por tarjeta)</p>
                        <ul className="mt-2 space-y-1.5">
                            {item.devices.map((d) => <NfcLink key={d.code} device={d} />)}
                        </ul>
                    </div>
                ) : (
                    <p className="mt-4 flex items-center gap-1.5 text-xs text-neutral-500">
                        <Icon name="nfc" className="text-base text-neutral-400" />
                        Los enlaces NFC aparecen al generar los QR reales.
                    </p>
                )}

                {/* Acciones */}
                <div className="mt-5 flex flex-wrap gap-2 border-t border-black/[0.06] pt-4 lg:mt-auto">
                    <a
                        href={route('admin.designs.print', { id: item.id, auto: 1 })}
                        target="_blank"
                        rel="noreferrer"
                        className={`${btn} bg-[#D42410] text-white shadow-[0_8px_20px_rgba(212,36,16,0.28)] hover:bg-[#B81E0C]`}
                    >
                        <Icon name="print" className="text-lg" /> Imprimir
                    </a>
                    <a href={route('admin.designs.download', item.id)} className={`${btn} border border-black/15 bg-white text-neutral-900 hover:border-neutral-900`}>
                        <Icon name="download" className="text-lg" /> Descargar ZIP
                    </a>
                    {item.stage === 'pending' && item.order_status === 'paid' && (
                        <button
                            type="button"
                            onClick={() => confirm('¿Generar los dispositivos de este pedido? Cada tarjeta recibe su código y QR únicos.') && router.post(route('admin.orders.generate', item.order_id), {}, { preserveScroll: true })}
                            className={`${btn} bg-neutral-900 text-white hover:bg-black`}
                        >
                            <Icon name="qr_code_2" className="text-lg" /> Generar QR reales
                        </button>
                    )}
                    {item.stage === 'ready' && (
                        <button
                            type="button"
                            onClick={() => router.post(route('admin.designs.printed', item.id), {}, { preserveScroll: true })}
                            className={`${btn} bg-neutral-900 text-white hover:bg-black`}
                        >
                            <Icon name="check_circle" className="text-lg" /> Marcar como impreso
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

export default function Designs({ items, users }) {
    const { flash } = usePage().props;
    const [tab, setTab] = useState('designs');
    const [filter, setFilter] = useState('all');
    const [q, setQ] = useState('');

    const count = (s) => items.filter((i) => i.stage === s).length;
    const needle = q.trim().toLowerCase();

    const shown = useMemo(() => items.filter((i) => {
        if (filter !== 'all' && i.stage !== filter) return false;
        if (!needle) return true;
        return [i.order_code, i.customer.name, i.customer.email, i.info?.name, i.info?.company]
            .some((v) => v && String(v).toLowerCase().includes(needle));
    }), [items, filter, needle]);

    // Registro de clientes: usuarios con cuenta + compradores invitados.
    const guests = useMemo(() => {
        const map = new Map();
        items.filter((i) => !i.customer.user).forEach((i) => {
            const k = i.customer.email.toLowerCase();
            const g = map.get(k) || { name: i.customer.name, email: i.customer.email, designs: 0, last: i.created_at };
            g.designs += 1;
            map.set(k, g);
        });
        return [...map.values()];
    }, [items]);

    const clients = useMemo(() => {
        const rows = [
            ...users.map((u) => ({ key: `u${u.id}`, name: u.name, email: u.email, kind: 'Cuenta', plan: u.plan, devices: u.devices_count, spaces: u.spaces_count, designs: u.designs_count, since: u.created_at })),
            ...guests.map((g) => ({ key: `g${g.email}`, name: g.name, email: g.email, kind: 'Invitado', plan: '—', devices: '—', spaces: '—', designs: g.designs, since: g.last?.slice(0, 10) })),
        ];
        return needle ? rows.filter((r) => `${r.name} ${r.email}`.toLowerCase().includes(needle)) : rows;
    }, [users, guests, needle]);

    const tabCls = (on) => `inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold transition duration-500 ${on ? 'bg-[#D42410] text-white shadow-[0_6px_16px_rgba(212,36,16,0.3)]' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'}`;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <p className="sc-rise text-xs font-bold uppercase tracking-[0.18em] text-[#D42410]">Admin · Producción</p>
                        <h1 className="sc-rise mt-3 font-display text-[clamp(34px,4.6vw,56px)] font-bold leading-[1.04] tracking-[-0.04em]" style={{ animationDelay: '80ms' }}>
                            Diseños para <Highlight>imprimir</Highlight>
                        </h1>
                        <p className="sc-rise mt-4 max-w-xl text-neutral-600" style={{ animationDelay: '160ms' }}>
                            Todo lo que tus clientes dejaron en SpaceShop: sus datos, el diseño de cada cara y los QR. Descárgalo o mándalo directo a la impresora.
                        </p>
                    </div>
                    <div className="sc-rise flex flex-wrap gap-2" style={{ animationDelay: '240ms' }}>
                        <a href={route('admin.designs.export')} className="group inline-flex items-center gap-2 rounded-full bg-[#D42410] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(212,36,16,0.3)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#B81E0C]">
                            <Icon name="download" className="text-lg" /> Exportar todo (Excel)
                        </a>
                        <Link href={route('admin.dashboard')} className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 transition duration-300 hover:-translate-y-0.5 hover:border-neutral-900">
                            <Icon name="admin_panel_settings" className="text-lg" /> Consola admin
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Producción - SpaceCard" />

            <div className="pb-20 pt-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="sc-swap flex items-center gap-2.5 rounded-2xl border border-emerald-600/20 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
                            <Icon name="check_circle" className="text-xl text-emerald-600" /> {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="sc-swap flex items-center gap-2.5 rounded-2xl border border-[#D42410]/25 bg-[#FFF4F2] px-5 py-4 text-sm font-medium text-[#B81E0C]">
                            <Icon name="error" className="text-xl text-[#D42410]" /> {flash.error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <Stat label="Sin QR (por generar)" value={count('pending')} icon="qr_code_2" />
                        <Stat label="Listos para imprimir" value={count('ready')} icon="print" dark />
                        <Stat label="Impresos" value={count('printed') + count('shipped')} icon="check_circle" />
                        <Stat label="Clientes" value={users.length + guests.length} icon="group_add" />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div role="tablist" className="inline-flex gap-1 rounded-full border border-black/[0.06] bg-white p-1 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                            <button type="button" role="tab" aria-selected={tab === 'designs'} onClick={() => setTab('designs')} className={tabCls(tab === 'designs')}>
                                <Icon name="palette" className="text-lg" /> Diseños
                            </button>
                            <button type="button" role="tab" aria-selected={tab === 'clients'} onClick={() => setTab('clients')} className={tabCls(tab === 'clients')}>
                                <Icon name="person" className="text-lg" /> Clientes
                            </button>
                        </div>
                        <label className="flex w-full items-center gap-2 rounded-full border border-black/10 bg-white px-4 transition focus-within:border-[#D42410] focus-within:shadow-[0_0_0_4px_rgba(212,36,16,0.12)] sm:w-80">
                            <Icon name="search" className="text-xl text-neutral-400" />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder={tab === 'designs' ? 'Buscar pedido, cliente, empresa…' : 'Buscar cliente o correo…'}
                                className="h-11 min-w-0 flex-1 border-0 bg-transparent p-0 text-sm focus:outline-none focus:ring-0"
                            />
                        </label>
                    </div>

                    {tab === 'designs' ? (
                        <div key="designs" className="sc-swap space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {FILTERS.map((f) => (
                                    <button
                                        key={f.id}
                                        type="button"
                                        onClick={() => setFilter(f.id)}
                                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${filter === f.id ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 ring-1 ring-black/10 hover:ring-black/25'}`}
                                    >
                                        {f.label}
                                        <span className="ml-1.5 opacity-60">{f.id === 'all' ? items.length : count(f.id)}</span>
                                    </button>
                                ))}
                            </div>

                            {shown.length === 0 ? (
                                <div className="rounded-[24px] border-2 border-dashed border-black/10 bg-white px-6 py-16 text-center">
                                    <Icon name="palette" className="text-4xl text-neutral-300" />
                                    <p className="mt-3 font-semibold text-neutral-700">{items.length ? 'Ningún diseño coincide con el filtro' : 'Aún no hay diseños de tarjetas'}</p>
                                    <p className="mt-1 text-sm text-neutral-500">Cuando un cliente compre una SpaceCard en SpaceShop, su diseño aparecerá aquí.</p>
                                </div>
                            ) : (
                                shown.map((item) => <DesignRow key={item.id} item={item} />)
                            )}
                        </div>
                    ) : (
                        <div key="clients" className="sc-swap overflow-hidden rounded-[24px] border border-black/[0.07] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[720px] text-left text-sm">
                                    <thead className="bg-[#0B0B0B] text-[11px] uppercase tracking-[0.12em] text-neutral-400">
                                        <tr>
                                            <th className="px-5 py-3.5 font-semibold">Cliente</th>
                                            <th className="px-5 py-3.5 font-semibold">Tipo</th>
                                            <th className="px-5 py-3.5 font-semibold">Plan</th>
                                            <th className="px-5 py-3.5 text-center font-semibold">Diseños</th>
                                            <th className="px-5 py-3.5 text-center font-semibold">Dispositivos</th>
                                            <th className="px-5 py-3.5 text-center font-semibold">Spaces</th>
                                            <th className="px-5 py-3.5 font-semibold">Desde</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/[0.06]">
                                        {clients.map((c) => (
                                            <tr key={c.key} className="transition hover:bg-[#FFF4F2]/60">
                                                <td className="px-5 py-3.5">
                                                    <div className="font-semibold text-neutral-900">{c.name}</div>
                                                    <div className="text-xs text-neutral-500">{c.email}</div>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${c.kind === 'Cuenta' ? 'bg-[#FFF4F2] text-[#B81E0C]' : 'bg-neutral-100 text-neutral-500'}`}>{c.kind}</span>
                                                </td>
                                                <td className="px-5 py-3.5 capitalize text-neutral-600">{c.plan}</td>
                                                <td className="px-5 py-3.5 text-center font-semibold">{c.designs}</td>
                                                <td className="px-5 py-3.5 text-center text-neutral-600">{c.devices}</td>
                                                <td className="px-5 py-3.5 text-center text-neutral-600">{c.spaces}</td>
                                                <td className="px-5 py-3.5 text-neutral-500">{c.since}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {clients.length === 0 && <p className="px-6 py-12 text-center text-sm text-neutral-500">Sin clientes que coincidan.</p>}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
