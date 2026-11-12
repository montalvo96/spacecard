/**
 * Pestaña Analíticas del panel, con el estilo de la portada (blanco / negro / rojo).
 *
 * 1. Bandeja de mensajes (todos los planes): lo que dejan los visitantes en el
 *    formulario «¿Hablamos?» del Space o en la página de reseñas. Se abre cada
 *    mensaje, se marca como leído / no leído (checklist) y se puede eliminar.
 * 2. Métricas de escaneo (Pro): actividad por día, dispositivos, países y
 *    últimos escaneos.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { confirmDialog, toast } from '@/Components/Notify';

function Icon({ name, fill = false, className = '' }) {
    return <span aria-hidden="true" className={`ms ${fill ? 'ms-fill' : ''} ${className}`}>{name}</span>;
}

const card = 'rounded-[24px] border border-black/[0.07] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]';

const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
function timeAgo(iso) {
    if (!iso) return '';
    const s = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
    const abs = Math.abs(s);
    if (abs < 60) return 'justo ahora';
    if (abs < 3600) return rtf.format(Math.round(s / 60), 'minute');
    if (abs < 86400) return rtf.format(Math.round(s / 3600), 'hour');
    if (abs < 86400 * 7) return rtf.format(Math.round(s / 86400), 'day');
    return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}
const fullDate = (iso) =>
    iso ? new Date(iso).toLocaleString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : '';

const initials = (name) =>
    (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

/* ---------------- Bandeja de mensajes ---------------- */

function ReadToggle({ read, onToggle, busy }) {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onToggle();
            }}
            disabled={busy}
            role="checkbox"
            aria-checked={read}
            aria-label={read ? 'Marcar como no leído' : 'Marcar como leído'}
            title={read ? 'Leído · clic para marcar como no leído' : 'Marcar como leído'}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition duration-300 disabled:opacity-50 ${
                read ? 'text-emerald-600 hover:bg-emerald-50' : 'text-neutral-300 hover:bg-[#D42410]/[0.07] hover:text-[#D42410]'
            }`}
        >
            <Icon name={read ? 'check_circle' : 'radio_button_unchecked'} fill={read} className="text-[24px]" />
        </button>
    );
}

function MessageRow({ lead, open, onOpen, onToggleRead, onDelete, busy }) {
    const read = !!lead.read_at;
    const digits = (lead.phone || '').replace(/\D+/g, '');
    const firstName = (lead.name || '').split(' ')[0];

    return (
        <li className={`transition-colors ${open ? 'bg-neutral-50/80' : read ? 'bg-white' : 'bg-[#FFF7F5]'}`}>
            <div
                role="button"
                tabIndex={0}
                aria-expanded={open}
                onClick={onOpen}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onOpen();
                    }
                }}
                className="group flex cursor-pointer items-center gap-2 py-3 pl-2 pr-4 sm:gap-3 sm:pl-3"
            >
                <ReadToggle read={read} busy={busy} onToggle={onToggleRead} />

                <span className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold sm:flex ${read ? 'bg-neutral-100 text-neutral-500' : 'bg-[#D42410] text-white'}`}>
                    {initials(lead.name)}
                </span>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        {!read && <span className="h-2 w-2 shrink-0 rounded-full bg-[#D42410]" aria-hidden="true" />}
                        <span className={`truncate text-sm ${read ? 'font-medium text-neutral-600' : 'font-bold text-neutral-900'}`}>{lead.name}</span>
                        <span className="hidden shrink-0 items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500 md:inline-flex">
                            <Icon name={lead.source?.type === 'review' ? 'reviews' : 'language'} className="text-[13px]" />
                            {lead.source?.label}
                        </span>
                    </div>
                    <p className={`mt-0.5 truncate text-[13px] ${read ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        {lead.note || <span className="italic">Sin mensaje · dejó sus datos de contacto</span>}
                    </p>
                </div>

                <span className={`shrink-0 text-xs ${read ? 'text-neutral-400' : 'font-semibold text-neutral-700'}`}>{timeAgo(lead.created_at)}</span>
                <Icon name="expand_more" className={`shrink-0 text-xl text-neutral-400 transition duration-300 ${open ? 'rotate-180' : ''}`} />
            </div>

            {/* Detalle */}
            <div className={`grid transition-[grid-template-rows] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <div className="px-4 pb-5 sm:pl-[104px] sm:pr-6">
                        <p className="text-xs text-neutral-500">
                            Llegó el {fullDate(lead.created_at)} desde{' '}
                            {lead.source?.type === 'space' ? (
                                <a href={`/s/${lead.source.slug}`} target="_blank" rel="noreferrer" className="font-semibold text-neutral-700 underline-offset-2 hover:underline">
                                    tu Space «{lead.source.label}»
                                </a>
                            ) : (
                                <span className="font-semibold text-neutral-700">tu página de reseñas «{lead.source?.label}»</span>
                            )}
                        </p>

                        <div className="mt-3 whitespace-pre-line rounded-2xl border border-black/[0.06] bg-white p-4 text-[15px] leading-relaxed text-neutral-800">
                            {lead.note || <span className="italic text-neutral-400">No escribió un mensaje, solo dejó sus datos.</span>}
                        </div>

                        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                            <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-black/[0.06]">
                                <Icon name="mail" className="text-lg text-neutral-400" />
                                <dt className="sr-only">Correo</dt>
                                <dd className="truncate font-medium text-neutral-800">{lead.email}</dd>
                            </div>
                            {lead.phone && (
                                <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-black/[0.06]">
                                    <Icon name="call" className="text-lg text-neutral-400" />
                                    <dt className="sr-only">Teléfono</dt>
                                    <dd className="truncate font-medium text-neutral-800">{lead.phone}</dd>
                                </div>
                            )}
                        </dl>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <a
                                href={`mailto:${lead.email}?subject=${encodeURIComponent(`Hola ${firstName}`)}`}
                                className="inline-flex items-center gap-1.5 rounded-full bg-[#D42410] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(212,36,16,0.25)] transition hover:-translate-y-0.5 hover:bg-[#B81E0C]"
                            >
                                <Icon name="reply" className="text-base" />
                                Responder por correo
                            </a>
                            {digits && (
                                <a
                                    href={`https://wa.me/${digits}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-4 py-2 text-[13px] font-semibold text-neutral-900 transition hover:border-neutral-900"
                                >
                                    <Icon name="chat" className="text-base" />
                                    WhatsApp
                                </a>
                            )}
                            {digits && (
                                <a
                                    href={`tel:${lead.phone.replace(/[^\d+]/g, '')}`}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-4 py-2 text-[13px] font-semibold text-neutral-900 transition hover:border-neutral-900"
                                >
                                    <Icon name="call" className="text-base" />
                                    Llamar
                                </a>
                            )}

                            <span className="flex-1" />

                            <button
                                type="button"
                                onClick={onToggleRead}
                                disabled={busy}
                                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition disabled:opacity-50 ${
                                    read ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-black'
                                }`}
                            >
                                <Icon name={read ? 'mark_email_unread' : 'mark_email_read'} className="text-base" />
                                {read ? 'Marcar como no leído' : 'Marcar como leído'}
                            </button>
                            <button
                                type="button"
                                onClick={onDelete}
                                disabled={busy}
                                aria-label="Eliminar mensaje"
                                title="Eliminar mensaje"
                                className="flex h-9 w-9 items-center justify-center rounded-full text-[#D42410] transition hover:bg-[#FFF4F2] disabled:opacity-50"
                            >
                                <Icon name="delete" className="text-lg" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
}

function Inbox({ leads }) {
    const [items, setItems] = useState(leads || []);
    const [filter, setFilter] = useState('unread');
    const [openId, setOpenId] = useState(null);
    const [busyId, setBusyId] = useState(null);

    // Cuando llegan datos nuevos del servidor (sondeo o después de guardar) se toman tal cual.
    useEffect(() => setItems(leads || []), [leads]);

    const unread = items.filter((l) => !l.read_at).length;
    const effectiveFilter = filter === 'unread' && unread === 0 && items.length > 0 ? 'all' : filter;
    const shown = useMemo(
        () => items.filter((l) => (effectiveFilter === 'unread' ? !l.read_at : effectiveFilter === 'read' ? !!l.read_at : true)),
        [items, effectiveFilter],
    );

    const setRead = (lead, read) => {
        const prev = items;
        setItems((list) => list.map((l) => (l.id === lead.id ? { ...l, read_at: read ? new Date().toISOString() : null } : l)));
        setBusyId(lead.id);
        router.post(`/leads/${lead.id}/read`, { read }, {
            preserveScroll: true,
            preserveState: true,
            only: ['leads', 'unreadLeads'],
            onError: () => {
                setItems(prev);
                toast.error('Inténtalo de nuevo.', { title: 'No se pudo actualizar' });
            },
            onFinish: () => setBusyId(null),
        });
    };

    const markAll = () => {
        router.post('/leads/read-all', {}, { preserveScroll: true, preserveState: true });
    };

    const remove = async (lead) => {
        const ok = await confirmDialog({
            title: '¿Eliminar este mensaje?',
            message: `Se borrará el mensaje de ${lead.name}. Esta acción no se puede deshacer.`,
            confirmText: 'Eliminar',
            tone: 'danger',
            icon: 'delete',
        });
        if (!ok) return;
        setBusyId(lead.id);
        router.delete(`/leads/${lead.id}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => setOpenId(null),
            onFinish: () => setBusyId(null),
        });
    };

    const filters = [
        { id: 'unread', label: 'Sin leer', count: unread },
        { id: 'all', label: 'Todos', count: items.length },
        { id: 'read', label: 'Leídos', count: items.length - unread },
    ];

    return (
        <section id="mensajes" className={`${card} overflow-hidden`}>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/[0.06] p-5 sm:p-7">
                <div className="flex items-start gap-3.5">
                    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D42410]/[0.08] text-[#D42410]">
                        <Icon name="inbox" className="text-[22px]" />
                        {unread > 0 && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-[#D42410] ring-2 ring-white" />}
                    </span>
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#D42410]">Mensajes</p>
                        <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-neutral-900">Bandeja de entrada</h3>
                        <p className="mt-0.5 text-sm text-neutral-500">
                            {unread > 0
                                ? `Tienes ${unread} ${unread === 1 ? 'mensaje sin leer' : 'mensajes sin leer'}.`
                                : items.length > 0
                                  ? 'Estás al día: todos tus mensajes están leídos.'
                                  : 'Aquí llega lo que te escriben desde tu Space.'}
                        </p>
                    </div>
                </div>

                {items.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        <div role="tablist" aria-label="Filtrar mensajes" className="flex gap-1 rounded-full border border-black/[0.06] bg-neutral-50 p-1">
                            {filters.map((f) => {
                                const active = effectiveFilter === f.id;
                                return (
                                    <button
                                        key={f.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => setFilter(f.id)}
                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition ${active ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                                    >
                                        {f.label}
                                        <span className={`text-[11px] ${active ? 'text-[#D42410]' : 'text-neutral-400'}`}>{f.count}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {unread > 0 && (
                            <button
                                type="button"
                                onClick={markAll}
                                className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-3.5 py-2 text-[12.5px] font-semibold text-neutral-900 transition hover:border-neutral-900"
                            >
                                <Icon name="done_all" className="text-base" />
                                Marcar todos como leídos
                            </button>
                        )}
                    </div>
                )}
            </div>

            {items.length === 0 ? (
                <div className="px-6 py-14 text-center">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
                        <Icon name="forum" className="text-3xl" />
                    </span>
                    <p className="mt-4 font-display text-lg font-bold text-neutral-900">Aún no te han escrito</p>
                    <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">
                        Cuando alguien deje sus datos en el formulario «¿Hablamos?» de tu Space, lo verás aquí y te avisaremos con la campanita.
                    </p>
                </div>
            ) : shown.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm text-neutral-500">No hay mensajes en este filtro.</p>
            ) : (
                <ul className="divide-y divide-black/[0.06]">
                    {shown.map((lead) => (
                        <MessageRow
                            key={lead.id}
                            lead={lead}
                            open={openId === lead.id}
                            busy={busyId === lead.id}
                            onOpen={() => setOpenId((id) => (id === lead.id ? null : lead.id))}
                            onToggleRead={() => setRead(lead, !lead.read_at)}
                            onDelete={() => remove(lead)}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
}

/* ---------------- Métricas de escaneo (Pro) ---------------- */

function Metric({ label, value, icon }) {
    return (
        <div className={`${card} p-5`}>
            <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-neutral-500">{label}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D42410]/[0.08] text-[#D42410]">
                    <Icon name={icon} className="text-lg" />
                </span>
            </div>
            <div className="mt-3 font-display text-[34px] font-bold leading-none tracking-[-0.04em] text-neutral-900">{value}</div>
        </div>
    );
}

function Breakdown({ title, rows, labelOf, empty }) {
    const max = Math.max(1, ...rows.map((r) => Number(r.count) || 0));
    return (
        <div className={`${card} p-5 sm:p-6`}>
            <h4 className="font-display text-base font-bold text-neutral-900">{title}</h4>
            {rows.length === 0 ? (
                <p className="py-8 text-center text-sm text-neutral-400">{empty}</p>
            ) : (
                <ul className="mt-4 space-y-3">
                    {rows.map((r, i) => (
                        <li key={i}>
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium capitalize text-neutral-700">{labelOf(r)}</span>
                                <span className="font-semibold text-neutral-900">{r.count}</span>
                            </div>
                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                                <div className="h-full rounded-full bg-[#D42410]" style={{ width: `${((Number(r.count) || 0) / max) * 100}%` }} />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function ScanAnalytics({ analytics, totalLeads }) {
    const scansByDate = analytics?.scans_by_date || [];
    const deviceFamilies = analytics?.device_families || [];
    const countries = analytics?.countries || [];
    const recentScans = analytics?.recent_scans || [];
    const totalScans = scansByDate.reduce((sum, r) => sum + (Number(r.count) || 0), 0);
    const max = Math.max(1, ...scansByDate.map((r) => Number(r.count) || 0));

    return (
        <>
            <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Escaneos (30 días)" value={totalScans} icon="contactless" />
                <Metric label="Mensajes recibidos" value={totalLeads} icon="forum" />
                <Metric label="Conversión" value={`${totalScans > 0 ? ((totalLeads / totalScans) * 100).toFixed(1) : '0.0'}%`} icon="monitoring" />
            </div>

            <div className={`${card} p-5 sm:p-6`}>
                <h4 className="font-display text-base font-bold text-neutral-900">Escaneos por día</h4>
                <p className="text-xs text-neutral-500">Últimos 30 días</p>
                {scansByDate.length === 0 ? (
                    <p className="py-12 text-center text-sm text-neutral-400">Todavía no hay escaneos en los últimos 30 días.</p>
                ) : (
                    <div className="mt-6 flex h-44 items-end gap-1.5">
                        {scansByDate.map((r) => (
                            <div key={r.date} className="group relative flex h-full flex-1 flex-col justify-end">
                                <div
                                    className="min-h-[4px] rounded-t-md bg-[#D42410]/80 transition group-hover:bg-[#D42410]"
                                    style={{ height: `${((Number(r.count) || 0) / max) * 100}%` }}
                                />
                                <span className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-900 px-2 py-1 text-[11px] font-semibold text-white group-hover:block">
                                    {r.count} · {new Date(`${r.date}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                <Breakdown title="Tipo de dispositivo" rows={deviceFamilies} labelOf={(r) => r.device_family || 'Otro'} empty="Sin datos todavía." />
                <Breakdown title="Países principales" rows={countries} labelOf={(r) => r.country || 'Desconocido'} empty="Sin datos de ubicación." />
            </div>

            <div className={`${card} p-5 sm:p-6`}>
                <h4 className="font-display text-base font-bold text-neutral-900">Últimos escaneos</h4>
                {recentScans.length === 0 ? (
                    <p className="py-8 text-center text-sm text-neutral-400">Sin registros.</p>
                ) : (
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-black/[0.06] text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-400">
                                    <th className="py-2 pr-3">Dispositivo</th>
                                    <th className="py-2 pr-3">Ubicación</th>
                                    <th className="py-2 pr-3">Plataforma</th>
                                    <th className="py-2 text-right">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/[0.05] text-neutral-700">
                                {recentScans.map((s) => (
                                    <tr key={s.id}>
                                        <td className="py-3 pr-3 font-mono text-xs">{s.device?.code}</td>
                                        <td className="py-3 pr-3">{s.city ? `${s.city}, ${s.country}` : s.country || 'Desconocida'}</td>
                                        <td className="py-3 pr-3 capitalize">{s.device_family}</td>
                                        <td className="py-3 text-right text-xs text-neutral-500">{new Date(s.scanned_at).toLocaleString('es-MX')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

export default function AnalyticsPanel({ userPlan, analytics, leads }) {
    // La raíz es <section> para que las clases de tarjeta del tabpanel del Dashboard no la envuelvan.
    return (
        <section className="space-y-6">
            <Inbox leads={leads} />

            {userPlan.is_pro ? (
                <ScanAnalytics analytics={analytics} totalLeads={leads?.length || 0} />
            ) : (
                <div className="relative overflow-hidden rounded-[24px] bg-[#0B0B0B] p-7 text-white shadow-[0_30px_70px_rgba(0,0,0,0.18)] sm:p-9">
                    <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 bg-[radial-gradient(closest-side,rgba(255,40,10,0.35),transparent)]" />
                    <div className="relative flex flex-wrap items-center justify-between gap-6">
                        <div className="max-w-lg">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">Plan Pro</p>
                            <h3 className="mt-2 font-display text-2xl font-bold tracking-[-0.03em]">Métricas de escaneo</h3>
                            <p className="mt-2 text-sm text-neutral-400">
                                Cuántas personas escanean tus tarjetas, desde qué dispositivos y países. Se activa solo al comprar cualquier producto en SpaceShop.
                            </p>
                        </div>
                        <Link
                            href={route('shop.comprar')}
                            className="inline-flex items-center gap-2 rounded-full bg-[#D42410] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(212,36,16,0.35)] transition hover:-translate-y-0.5 hover:bg-[#B81E0C]"
                        >
                            <Icon name="storefront" className="text-lg" />
                            Ir a SpaceShop
                        </Link>
                    </div>
                </div>
            )}
        </section>
    );
}
