/**
 * Mis dispositivos (panel del cliente): tarjetas responsivas con el destino de cada
 * dispositivo, y modales para configurar a dónde lleva al escanearlo y ver su diseño
 * de fábrica. En móvil los modales salen desde abajo (hoja inferior).
 * Estilo de la landing: blanco, acento rojo #D42410, iconos Material Symbols.
 */

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { router } from '@inertiajs/react';

function Icon({ name, fill = false, className = '' }) {
    return <span aria-hidden="true" className={`ms ${fill ? 'ms-fill' : ''} ${className}`}>{name}</span>;
}

const PRODUCTS = {
    card: { label: 'SpaceCard', icon: 'credit_card' },
    bracelet: { label: 'Pulsera NFC', icon: 'watch' },
    review_plate: { label: 'Placa de reseñas', icon: 'rate_review' },
};

const DESTINATIONS = [
    { id: 'none', icon: 'block', title: 'Ninguno', desc: 'Muestra un aviso de que aún no está configurado.' },
    { id: 'external', icon: 'link', title: 'Enlace externo', desc: 'Abre cualquier página: LinkedIn, tu web, WhatsApp…' },
    { id: 'space', icon: 'badge', title: 'Mi Space', desc: 'Tu tarjeta digital con tus datos y redes.' },
    { id: 'review', icon: 'reviews', title: 'Reseñas de Google', desc: 'Lleva a dejar una reseña de tu negocio.' },
];

function destinationInfo(device) {
    switch (device.destination_type) {
        case 'external':
            return { icon: 'link', label: 'Enlace externo', detail: device.external_url, ok: true };
        case 'space':
            return { icon: 'badge', label: 'Space digital', detail: device.space ? `/s/${device.space.slug}` : '', ok: true };
        case 'review':
            return { icon: 'reviews', label: 'Reseñas de Google', detail: device.review_target?.business_name ?? '', ok: true };
        default:
            return { icon: 'error', label: 'Sin configurar', detail: 'Elige qué se abre al escanearlo', ok: false };
    }
}

/** Ventana modal: hoja inferior en móvil, centrada desde sm. Cierra con Esc o tocando fuera. */
function Modal({ title, subtitle, onClose, children }) {
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
    }, [onClose]);

    // Portal al body: el panel tiene una animación con transform y "fixed" quedaría atrapado dentro.
    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div role="dialog" aria-modal="true" aria-label={title} className="sc-swap max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:max-w-lg sm:rounded-[28px]">
                <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-neutral-200 sm:hidden" />
                <div className="flex items-start justify-between gap-3 px-5 pt-4 sm:px-7 sm:pt-6">
                    <div className="min-w-0">
                        <h4 className="font-display text-xl font-bold tracking-tight text-neutral-900">{title}</h4>
                        {subtitle && <p className="mt-0.5 text-sm text-neutral-500">{subtitle}</p>}
                    </div>
                    <button type="button" onClick={onClose} aria-label="Cerrar" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 ring-1 ring-black/10 transition hover:bg-neutral-50 hover:text-neutral-900">
                        <Icon name="close" className="text-xl" />
                    </button>
                </div>
                <div className="px-5 pb-6 pt-4 sm:px-7 sm:pb-7">{children}</div>
            </div>
        </div>,
        document.body
    );
}

function Field({ label, children }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-neutral-800">{label}</span>
            {children}
        </label>
    );
}

const inputCls = 'w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[15px] text-neutral-900 transition focus:border-[#D42410] focus:outline-none focus:ring-4 focus:ring-[#D42410]/10';

function Notice({ children }) {
    return (
        <p className="flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
            <Icon name="info" className="mt-px text-base" /> <span>{children}</span>
        </p>
    );
}

/** Fecha en que se reclamó (o se agregó) el dispositivo, como Date. */
function claimedDate(device) {
    const raw = device.claimed_at || device.created_at;
    if (!raw) return null;
    const d = new Date(String(raw).replace(' ', 'T'));
    return isNaN(d) ? null : d;
}

const fmtDate = (d) => d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
const toInput = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const SORTS = [
    { id: 'newest', label: 'Más recientes primero' },
    { id: 'oldest', label: 'Más antiguos primero' },
    { id: 'type', label: 'Por tipo de producto' },
];

const RANGES = [
    { id: 'all', label: 'Todas' },
    { id: '7d', label: 'Últimos 7 días' },
    { id: 'month', label: 'Este mes' },
    { id: 'custom', label: 'Elegir fechas' },
];

/** Barra de orden y filtro por fecha de reclamo. */
function DeviceToolbar({ sort, setSort, range, setRange, from, setFrom, to, setTo, shown, total }) {
    const chip = (active) => `rounded-full px-3 py-1.5 text-xs font-semibold transition ${active ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 ring-1 ring-black/10 hover:ring-black/25'}`;
    return (
        <div className="mb-5 flex flex-col gap-3 rounded-3xl bg-neutral-50 p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por fecha de reclamo">
                    <Icon name="calendar_month" className="text-lg text-neutral-400" />
                    {RANGES.map((r) => (
                        <button key={r.id} type="button" onClick={() => setRange(r.id)} aria-pressed={range === r.id} className={chip(range === r.id)}>{r.label}</button>
                    ))}
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
                    <Icon name="sort" className="text-lg text-neutral-400" />
                    <span className="sr-only">Ordenar</span>
                    <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full border-black/10 py-1.5 pl-3 pr-8 text-xs font-semibold text-neutral-800 focus:border-[#D42410] focus:ring-[#D42410]/20">
                        {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                </label>
            </div>
            {range === 'custom' && (
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-600">
                    <span>Reclamadas del</span>
                    <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} aria-label="Desde" className="rounded-full border-black/10 px-3 py-1.5 text-xs focus:border-[#D42410] focus:ring-[#D42410]/20" />
                    <span>al</span>
                    <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} aria-label="Hasta" className="rounded-full border-black/10 px-3 py-1.5 text-xs focus:border-[#D42410] focus:ring-[#D42410]/20" />
                </div>
            )}
            {shown !== total && <p className="text-xs text-neutral-500">Mostrando {shown} de {total} dispositivo(s).</p>}
        </div>
    );
}

function DeviceCard({ device, onDestination, onDesign, onQr }) {
    const p = PRODUCTS[device.type] ?? { label: device.type, icon: 'contactless' };
    const d = destinationInfo(device);
    const when = claimedDate(device);
    return (
        <article className={`flex min-w-0 flex-col rounded-3xl border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.07)] ${d.ok ? 'border-black/[0.07]' : 'border-amber-200'}`}>
            <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4F2] text-[#D42410]">
                    <Icon name={p.icon} className="text-2xl" />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-neutral-900">{p.label}</p>
                    <p className="font-mono text-xs font-semibold text-neutral-500">{device.code}</p>
                    {when && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                            <Icon name="schedule" className="text-sm" /> {device.claimed_at ? 'Reclamada' : 'Agregada'} el {fmtDate(when)}
                        </p>
                    )}
                </div>
                <a
                    href={route('devices.resolve', device.code)}
                    target="_blank"
                    rel="noreferrer"
                    title="Probar: abre lo mismo que verá quien lo escanee"
                    aria-label="Probar dispositivo"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 ring-1 ring-black/10 transition hover:text-[#D42410] hover:ring-[#D42410]/40"
                >
                    <Icon name="open_in_new" className="text-lg" />
                </a>
            </div>

            <div className={`mt-4 flex items-start gap-2.5 rounded-2xl p-3 ${d.ok ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                <Icon name={d.icon} fill={!d.ok} className={`mt-px text-lg ${d.ok ? 'text-emerald-600' : 'text-amber-600'}`} />
                <div className="min-w-0">
                    <p className={`text-xs font-bold uppercase tracking-wider ${d.ok ? 'text-emerald-700' : 'text-amber-700'}`}>{d.ok ? 'Al escanear abre' : d.label}</p>
                    <p className="truncate text-sm text-neutral-700" title={d.detail}>{d.ok ? `${d.label}${d.detail ? ` · ${d.detail}` : ''}` : d.detail}</p>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-2">
                <button
                    type="button"
                    onClick={() => onDestination(device)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#D42410] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(212,36,16,0.25)] transition hover:bg-[#B81E0C]"
                >
                    <Icon name="tune" className="text-lg" /> {d.ok ? 'Cambiar' : 'Configurar'}
                </button>
                <button
                    type="button"
                    onClick={() => onDesign(device)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 ring-1 ring-black/10 transition hover:ring-black/25"
                >
                    <Icon name="palette" className="text-lg" /> Diseño
                </button>
                <button
                    type="button"
                    onClick={() => onQr(device)}
                    title="Ver y descargar el código QR"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 ring-1 ring-black/10 transition hover:ring-black/25"
                >
                    <Icon name="qr_code_2" className="text-lg" /> QR
                </button>
            </div>
        </article>
    );
}

export default function DeviceList({ devices, spaces, reviewTargets }) {
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [activeModal, setActiveModal] = useState(null); // 'destination' | 'design' | 'qr' | null
    const [saving, setSaving] = useState(false);

    const [destinationType, setDestinationType] = useState('none');
    const [externalUrl, setExternalUrl] = useState('');
    const [spaceId, setSpaceId] = useState('');
    const [reviewTargetId, setReviewTargetId] = useState('');

    const close = () => setActiveModal(null);

    const openDestinationModal = (device) => {
        setSelectedDevice(device);
        setDestinationType(device.destination_type || 'none');
        setExternalUrl(device.external_url || '');
        setSpaceId(device.space_id || '');
        setReviewTargetId(device.review_target_id || '');
        setActiveModal('destination');
    };

    const openDesignModal = (device) => {
        setSelectedDevice(device);
        setActiveModal('design');
    };

    const openQrModal = (device) => {
        setSelectedDevice(device);
        setActiveModal('qr');
    };

    const submitDestination = (e) => {
        e.preventDefault();
        setSaving(true);
        router.post(`/devices/${selectedDevice.id}/destination`, {
            destination_type: destinationType,
            external_url: destinationType === 'external' ? externalUrl : null,
            space_id: destinationType === 'space' ? spaceId : null,
            review_target_id: destinationType === 'review' ? reviewTargetId : null,
        }, {
            preserveScroll: true,
            onSuccess: close,
            onFinish: () => setSaving(false),
        });
    };

    // Orden y filtro por fecha de reclamo (solo en pantalla).
    const [sort, setSort] = useState('newest');
    const [range, setRange] = useState('all');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    const visible = useMemo(() => {
        const now = new Date();
        let start = null, end = null;
        if (range === '7d') start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        if (range === 'month') start = new Date(now.getFullYear(), now.getMonth(), 1);
        if (range === 'custom') {
            if (from) start = new Date(`${from}T00:00:00`);
            if (to) end = new Date(`${to}T23:59:59.999`);
        }
        const list = devices.filter((d) => {
            if (!start && !end) return true;
            const when = claimedDate(d);
            return when && (!start || when >= start) && (!end || when <= end);
        });
        const time = (d) => claimedDate(d)?.getTime() ?? 0;
        return [...list].sort((a, b) => {
            if (sort === 'oldest') return time(a) - time(b);
            if (sort === 'type') return (PRODUCTS[a.type]?.label ?? a.type).localeCompare(PRODUCTS[b.type]?.label ?? b.type) || time(b) - time(a);
            return time(b) - time(a);
        });
    }, [devices, sort, range, from, to]);

    const chooseRange = (id) => {
        setRange(id);
        if (id === 'custom' && !from && !to) {
            const now = new Date();
            setFrom(toInput(new Date(now.getFullYear(), now.getMonth(), 1)));
            setTo(toInput(now));
        }
    };

    const pending = devices.filter((d) => !d.destination_type || d.destination_type === 'none').length;
    const options = DESTINATIONS.filter((o) => !(o.id === 'space' && selectedDevice?.type === 'review_plate'));

    return (
        <div className="bg-white p-5 sm:p-7">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D42410]">Mis dispositivos</p>
                    <h3 className="mt-1 font-display text-2xl font-bold tracking-tight text-neutral-900">Tus tarjetas, pulseras y placas</h3>
                    <p className="mt-1 max-w-xl text-sm text-neutral-500">Elige qué se abre cuando alguien escanea cada uno. Puedes cambiarlo cuando quieras.</p>
                </div>
                {devices.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-neutral-900 px-3 py-1.5 text-white">{devices.length} dispositivo(s)</span>
                        {pending > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700 ring-1 ring-amber-200">
                                <Icon name="error" fill className="text-sm" /> {pending} sin configurar
                            </span>
                        )}
                    </div>
                )}
            </div>

            {devices.length === 0 ? (
                <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-black/10 bg-neutral-50 px-6 py-12 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF4F2] text-[#D42410]">
                        <Icon name="contactless" className="text-3xl" />
                    </span>
                    <p className="mt-4 font-semibold text-neutral-900">Aún no tienes dispositivos</p>
                    <p className="mt-1 max-w-sm text-sm text-neutral-500">Escanea tu SpaceCard con el celular para vincularla, o diseña una nueva en SpaceShop.</p>
                    <a href={route('shop.comprar')} className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#D42410] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(212,36,16,0.25)] transition hover:bg-[#B81E0C]">
                        <Icon name="storefront" className="text-lg" /> Ir a SpaceShop
                    </a>
                </div>
            ) : (
                <>
                    <DeviceToolbar
                        sort={sort} setSort={setSort}
                        range={range} setRange={chooseRange}
                        from={from} setFrom={setFrom} to={to} setTo={setTo}
                        shown={visible.length} total={devices.length}
                    />
                    {visible.length === 0 ? (
                        <div className="rounded-3xl border-2 border-dashed border-black/10 px-6 py-10 text-center">
                            <p className="font-semibold text-neutral-900">No hay dispositivos reclamados en esas fechas</p>
                            <button type="button" onClick={() => setRange('all')} className="mt-3 text-sm font-semibold text-[#D42410] hover:underline">Ver todos</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {visible.map((device) => (
                                <DeviceCard key={device.id} device={device} onDestination={openDestinationModal} onDesign={openDesignModal} onQr={openQrModal} />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Modal: a dónde lleva al escanear */}
            {activeModal === 'destination' && selectedDevice && (
                <Modal title="¿Qué se abre al escanearlo?" subtitle={`${PRODUCTS[selectedDevice.type]?.label ?? 'Dispositivo'} · ${selectedDevice.code}`} onClose={close}>
                    <form onSubmit={submitDestination} className="space-y-5">
                        <fieldset>
                            <legend className="sr-only">Tipo de destino</legend>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {options.map((o) => {
                                    const on = destinationType === o.id;
                                    return (
                                        <label key={o.id} className={`relative flex cursor-pointer gap-3 rounded-2xl border p-3.5 transition ${on ? 'border-[#D42410] bg-[#FFF4F2] shadow-[0_0_0_3px_rgba(212,36,16,0.10)]' : 'border-black/10 hover:border-black/25'}`}>
                                            <input type="radio" name="destination" value={o.id} checked={on} onChange={() => setDestinationType(o.id)} className="sr-only" />
                                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${on ? 'bg-[#D42410] text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                                                <Icon name={o.icon} className="text-xl" />
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block text-sm font-semibold text-neutral-900">{o.title}</span>
                                                <span className="block text-xs leading-snug text-neutral-500">{o.desc}</span>
                                            </span>
                                            {on && <Icon name="check_circle" fill className="absolute right-2.5 top-2.5 text-lg text-[#D42410]" />}
                                        </label>
                                    );
                                })}
                            </div>
                        </fieldset>

                        {destinationType === 'external' && (
                            <Field label="Enlace">
                                <input type="url" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://linkedin.com/in/tu-perfil" className={inputCls} required autoFocus />
                            </Field>
                        )}

                        {destinationType === 'space' && (
                            spaces.length === 0 ? (
                                <Notice>No tienes Spaces todavía. Créalo en la pestaña «Spaces» y vuelve aquí.</Notice>
                            ) : (
                                <Field label="¿Cuál Space?">
                                    <select value={spaceId} onChange={(e) => setSpaceId(e.target.value)} className={inputCls} required>
                                        <option value="">Selecciona un Space…</option>
                                        {spaces.map((s) => <option key={s.id} value={s.id}>{s.display_name} (/s/{s.slug})</option>)}
                                    </select>
                                </Field>
                            )
                        )}

                        {destinationType === 'review' && (
                            reviewTargets.length === 0 ? (
                                <Notice>No tienes negocios conectados. Conéctalo en la pestaña «Reviews» y vuelve aquí.</Notice>
                            ) : (
                                <Field label="¿Qué negocio?">
                                    <select value={reviewTargetId} onChange={(e) => setReviewTargetId(e.target.value)} className={inputCls} required>
                                        <option value="">Selecciona un negocio…</option>
                                        {reviewTargets.map((t) => <option key={t.id} value={t.id}>{t.business_name}</option>)}
                                    </select>
                                </Field>
                            )
                        )}

                        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row">
                            <button type="button" onClick={close} className="w-full rounded-full bg-white py-3 text-sm font-semibold text-neutral-800 ring-1 ring-black/10 transition hover:ring-black/25 sm:w-1/2">
                                Cancelar
                            </button>
                            <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#D42410] py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(212,36,16,0.3)] transition hover:bg-[#B81E0C] disabled:opacity-60 sm:w-1/2">
                                <Icon name={saving ? 'progress_activity' : 'check'} className={`text-lg ${saving ? 'animate-spin' : ''}`} /> Guardar
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Modal: diseño de fábrica (solo lectura) */}
            {activeModal === 'design' && selectedDevice && (
                <Modal title="Diseño de fábrica" subtitle={`${PRODUCTS[selectedDevice.type]?.label ?? 'Dispositivo'} · ${selectedDevice.code}`} onClose={close}>
                    <p className="mb-4 flex items-start gap-2 text-sm text-neutral-500">
                        <Icon name="info" className="mt-px text-base text-neutral-400" />
                        Es el diseño con el que se imprimió. Al ser físico, ya no se puede cambiar.
                    </p>

                    {!selectedDevice.design_color_primary && !selectedDevice.design_logo_url ? (
                        <div className="flex flex-col items-center rounded-2xl bg-neutral-50 px-4 py-8 text-center">
                            <Icon name="style" className="text-3xl text-neutral-300" />
                            <p className="mt-2 text-sm text-neutral-500">Dispositivo de stock, sin personalización impresa.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {selectedDevice.design_color_primary && (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {[['Color principal', selectedDevice.design_color_primary], ['Color secundario', selectedDevice.design_color_secondary]]
                                        .filter(([, c]) => c)
                                        .map(([label, c]) => (
                                            <div key={label} className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-3">
                                                <span className="h-10 w-10 rounded-xl ring-1 ring-black/10" style={{ backgroundColor: c }} />
                                                <span>
                                                    <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">{label}</span>
                                                    <span className="font-mono text-sm font-semibold text-neutral-800">{c.toUpperCase()}</span>
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            )}
                            {selectedDevice.design_logo_url && (
                                <div className="rounded-2xl bg-neutral-50 p-3">
                                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-neutral-400">Logo grabado</span>
                                    <div className="flex justify-center rounded-xl bg-white p-4 ring-1 ring-black/[0.06]">
                                        <img src={selectedDevice.design_logo_url} alt="Logo de fábrica" className="max-h-24 max-w-full object-contain" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <button type="button" onClick={close} className="mt-5 w-full rounded-full bg-white py-3 text-sm font-semibold text-neutral-800 ring-1 ring-black/10 transition hover:ring-black/25">
                        Cerrar
                    </button>
                </Modal>
            )}

            {/* Modal: código QR del dispositivo, descargable en PNG */}
            {activeModal === 'qr' && selectedDevice && (() => {
                const dest = destinationInfo(selectedDevice);
                const qrUrl = `/devices/${selectedDevice.id}/qr.png`;
                return (
                    <Modal title="Tu código QR" subtitle={`${PRODUCTS[selectedDevice.type]?.label ?? 'Dispositivo'} · ${selectedDevice.code}`} onClose={close}>
                        <div className="relative mx-auto w-full max-w-[260px] rounded-3xl bg-white p-3 ring-1 ring-black/[0.08]">
                            <img src={qrUrl} alt={`Código QR de ${selectedDevice.code}`} width="1000" height="1000" className="h-auto w-full" />
                            <a
                                href={`${qrUrl}?descargar=1`}
                                download={`qr-${selectedDevice.code}.png`}
                                title="Descargar PNG"
                                aria-label="Descargar el QR en PNG"
                                className="absolute -right-3 -top-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#D42410] text-white shadow-[0_8px_20px_rgba(212,36,16,0.35)] transition hover:bg-[#B81E0C]"
                            >
                                <Icon name="download" className="text-xl" />
                            </a>
                        </div>

                        <div className={`mt-5 flex items-start gap-2.5 rounded-2xl p-3 ${dest.ok ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                            <Icon name={dest.icon} fill={!dest.ok} className={`mt-px text-lg ${dest.ok ? 'text-emerald-600' : 'text-amber-600'}`} />
                            <div className="min-w-0">
                                <p className={`text-xs font-bold uppercase tracking-wider ${dest.ok ? 'text-emerald-700' : 'text-amber-700'}`}>{dest.ok ? 'Al escanearlo abre' : 'Aún sin configurar'}</p>
                                <p className="truncate text-sm text-neutral-700" title={dest.detail}>{dest.ok ? `${dest.label}${dest.detail ? ` · ${dest.detail}` : ''}` : 'Configura a dónde lleva para que el QR abra algo.'}</p>
                            </div>
                        </div>

                        <p className="mt-3 flex items-start gap-2 text-sm text-neutral-500">
                            <Icon name="info" className="mt-px text-base text-neutral-400" />
                            Si cambias a dónde lleva tu dispositivo, este mismo QR sigue funcionando: no necesitas descargarlo de nuevo.
                        </p>

                        <a
                            href={`${qrUrl}?descargar=1`}
                            download={`qr-${selectedDevice.code}.png`}
                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#D42410] py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(212,36,16,0.25)] transition hover:bg-[#B81E0C]"
                        >
                            <Icon name="download" className="text-lg" /> Descargar PNG
                        </a>
                    </Modal>
                );
            })()}
        </div>
    );
}
