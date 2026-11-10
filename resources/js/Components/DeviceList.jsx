/**
 * Mis dispositivos (panel del cliente): tarjetas responsivas con el destino de cada
 * dispositivo, y modales para configurar a dónde lleva al escanearlo y ver su diseño
 * de fábrica. En móvil los modales salen desde abajo (hoja inferior).
 * Estilo de la landing: blanco, acento rojo #D42410, iconos Material Symbols.
 */

import { useEffect, useState } from 'react';
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

function DeviceCard({ device, onDestination, onDesign }) {
    const p = PRODUCTS[device.type] ?? { label: device.type, icon: 'contactless' };
    const d = destinationInfo(device);
    return (
        <article className={`flex min-w-0 flex-col rounded-3xl border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.07)] ${d.ok ? 'border-black/[0.07]' : 'border-amber-200'}`}>
            <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4F2] text-[#D42410]">
                    <Icon name={p.icon} className="text-2xl" />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-neutral-900">{p.label}</p>
                    <p className="font-mono text-xs font-semibold text-neutral-500">{device.code}</p>
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

            <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
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
            </div>
        </article>
    );
}

export default function DeviceList({ devices, spaces, reviewTargets }) {
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [activeModal, setActiveModal] = useState(null); // 'destination' | 'design' | null
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {devices.map((device) => (
                        <DeviceCard key={device.id} device={device} onDestination={openDestinationModal} onDesign={openDesignModal} />
                    ))}
                </div>
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
        </div>
    );
}
