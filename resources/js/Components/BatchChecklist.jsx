/**
 * Checklist de un lote. Cada tarjeta tiene sus tres pasos como botones:
 * 1 Impresa → 2 Enviada → 3 Sellada (o Reclamada, si el cliente ya la vinculó).
 * Se marcan una por una desde la propia tarjeta, o varias a la vez seleccionándolas
 * (la acción en grupo solo es para imprimir, enviar y sellar).
 * El sello es definitivo, como un sello de autenticidad.
 */

import { useEffect, useMemo, useState } from 'react';

function Icon({ name, fill = false, className = '' }) {
    return <span aria-hidden="true" className={`ms ${fill ? 'ms-fill' : ''} ${className}`}>{name}</span>;
}

function CopyButton({ text }) {
    const [ok, setOk] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setOk(true);
            setTimeout(() => setOk(false), 1400);
        } catch {
            window.prompt('Copia el enlace NFC:', text);
        }
    };
    return (
        <button
            type="button"
            onClick={copy}
            title="Copiar enlace NFC"
            aria-label="Copiar enlace NFC"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${ok ? 'bg-emerald-600 text-white' : 'bg-white text-neutral-600 ring-1 ring-black/10 hover:ring-black/25'}`}
        >
            <Icon name={ok ? 'check' : 'content_copy'} className="text-base" />
        </button>
    );
}

/**
 * Un paso de la tarjeta. Hecho: verde con palomita. Disponible: botón para marcarlo.
 * Bloqueado: gris, con el motivo al pasar el mouse.
 */
function StepButton({ n, icon, label, doneLabel, done, blocked, busy, onClick, tone = 'dark' }) {
    if (done) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                <Icon name="check_circle" fill className="text-base" /> {doneLabel}
            </span>
        );
    }
    const tones = {
        dark: 'bg-neutral-900 text-white hover:bg-black',
        blue: 'bg-blue-600 text-white hover:bg-blue-700',
        red: 'bg-[#D42410] text-white hover:bg-[#B81E0C]',
    };
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!!blocked || busy}
            title={blocked || `Marcar como ${label.toLowerCase()}`}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed ${blocked ? 'bg-neutral-100 text-neutral-400' : tones[tone]}`}
        >
            <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${blocked ? 'bg-neutral-200 text-neutral-500' : 'bg-white/25'}`}>{n}</span>
            <Icon name={icon} className="text-base" /> {label}
        </button>
    );
}

function Row({ device, selected, onSelect, onAction }) {
    const [sealing, setSealing] = useState(false);
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState(false);

    const act = async (action, extra) => {
        setBusy(true);
        const ok = await onAction(action, [device.id], extra);
        setBusy(false);
        if (ok) { setSealing(false); setNote(''); }
    };

    const sealedLabel = device.claimed ? `Reclamada${device.owner ? ` · ${device.owner}` : ''}` : 'Sellada';

    return (
        <li className={`rounded-2xl border p-3 transition ${selected ? 'border-[#D42410]/50 bg-[#FFF4F2]/50' : 'border-black/[0.07] bg-white'}`}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <label className="flex cursor-pointer items-center gap-2.5" title="Seleccionar para una acción en grupo">
                    <input
                        type="checkbox"
                        checked={selected}
                        onChange={(e) => onSelect(device.id, e.target.checked)}
                        className="h-5 w-5 rounded-md border-black/25 text-[#D42410] focus:ring-[#D42410]"
                    />
                    <span className="font-mono text-[13px] font-bold text-neutral-900">{device.code}</span>
                </label>

                <div className="ml-auto flex items-center gap-1.5">
                    <CopyButton text={device.nfc_url} />
                    {device.has_qr && (
                        <a
                            href={route('admin.devices.qr', device.id)}
                            title="Descargar QR en PNG"
                            aria-label="Descargar QR en PNG"
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-600 ring-1 ring-black/10 transition hover:ring-black/25"
                        >
                            <Icon name="qr_code_2" className="text-base" />
                        </a>
                    )}
                </div>
            </div>

            {/* Los tres pasos de esta tarjeta */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pl-[30px]">
                <StepButton
                    n={1} icon="print" label="Impresa" doneLabel="Impresa"
                    done={device.printed} busy={busy} onClick={() => act('printed')}
                />
                <Icon name="chevron_right" className="text-base text-neutral-300" />
                <StepButton
                    n={2} icon="local_shipping" label="Enviada" doneLabel="Enviada" tone="blue"
                    done={device.shipped} busy={busy}
                    blocked={!device.printed ? 'Primero márcala como impresa' : null}
                    onClick={() => act('shipped')}
                />
                <Icon name="chevron_right" className="text-base text-neutral-300" />
                <StepButton
                    n={3} icon="lock" label="Sellar" doneLabel={sealedLabel} tone="red"
                    done={device.used} busy={busy}
                    onClick={() => setSealing(true)}
                />
                {device.status === 'disabled' && <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-bold text-white">Desactivada</span>}
            </div>

            {device.used && device.used_note && (
                <p className="mt-2 ml-[30px] flex items-center gap-1.5 text-xs text-neutral-600">
                    <Icon name="edit_square" className="text-sm text-neutral-400" /> {device.used_note}
                    {device.used_at && <span className="text-neutral-400">· {device.used_at}</span>}
                </p>
            )}

            {sealing && !device.used && (
                <div className="sc-swap mt-3 ml-[30px] space-y-2 rounded-xl bg-[#FFF4F2] p-3">
                    <p className="flex items-start gap-1.5 text-xs font-semibold text-[#B81E0C]">
                        <Icon name="lock" className="mt-px text-sm" />
                        Al sellarla queda marcada como utilizada para siempre: no se podrá desmarcar ni volver a usar.
                    </p>
                    <input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && act('used', note)}
                        maxLength={255}
                        autoFocus
                        placeholder="¿A quién o dónde se entregó? (opcional)"
                        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs focus:border-[#D42410] focus:outline-none focus:ring-0"
                    />
                    <div className="flex gap-2">
                        <button type="button" onClick={() => act('used', note)} disabled={busy} className="inline-flex items-center gap-1 rounded-full bg-[#D42410] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#B81E0C] disabled:opacity-60">
                            <Icon name={busy ? 'progress_activity' : 'lock'} className={`text-sm ${busy ? 'animate-spin' : ''}`} /> Confirmar sello
                        </button>
                        <button type="button" onClick={() => { setSealing(false); setNote(''); }} className="rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 ring-1 ring-black/10 hover:ring-black/25">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </li>
    );
}

const FILTERS = [
    { id: 'all', label: 'Todas', test: () => true },
    { id: 'to_print', label: 'Por imprimir', test: (d) => !d.printed },
    { id: 'to_ship', label: 'Por enviar', test: (d) => d.printed && !d.shipped },
    { id: 'to_seal', label: 'Sin sellar', test: (d) => !d.used },
    { id: 'used', label: 'Selladas / reclamadas', test: (d) => d.used },
];

export default function BatchChecklist({ batch, onUsedChange, onChanged }) {
    const [devices, setDevices] = useState(null);
    const [error, setError] = useState(null);
    const [notice, setNotice] = useState(null);
    const [filter, setFilter] = useState('all');
    const [q, setQ] = useState('');
    const [selected, setSelected] = useState(() => new Set());
    const [sealing, setSealing] = useState(false);
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        window.axios.get(route('admin.batches.devices', batch.id))
            .then((r) => setDevices(r.data))
            .catch(() => setError('No se pudo cargar el checklist del lote.'));
    }, [batch.id]);

    const used = devices ? devices.filter((d) => d.used).length : 0;
    useEffect(() => { if (devices) onUsedChange?.(used); }, [used]); // eslint-disable-line react-hooks/exhaustive-deps

    const shown = useMemo(() => {
        if (!devices) return [];
        const needle = q.trim().toUpperCase();
        const test = FILTERS.find((f) => f.id === filter).test;
        return devices.filter((d) => test(d) && (!needle || d.code.includes(needle)));
    }, [devices, filter, q]);

    const chosen = useMemo(() => (devices ?? []).filter((d) => selected.has(d.id)), [devices, selected]);
    const canPrint = chosen.filter((d) => !d.printed).length;
    const canShip = chosen.filter((d) => d.printed && !d.shipped).length;
    const canSeal = chosen.filter((d) => !d.used).length;

    const allShownSelected = shown.length > 0 && shown.every((d) => selected.has(d.id));
    const someShownSelected = shown.some((d) => selected.has(d.id));

    const toggleOne = (id, on) => setSelected((s) => {
        const n = new Set(s);
        on ? n.add(id) : n.delete(id);
        return n;
    });
    const toggleAllShown = () => setSelected((s) => {
        const n = new Set(s);
        shown.forEach((d) => (allShownSelected ? n.delete(d.id) : n.add(d.id)));
        return n;
    });
    const clear = () => { setSelected(new Set()); setSealing(false); setNote(''); };

    /** Aplica una acción a una o varias tarjetas. Devuelve true si se guardó. */
    const apply = async (action, ids, noteText) => {
        setError(null);
        setNotice(null);
        try {
            const r = await window.axios.post(route('admin.batches.devices.bulk', batch.id), {
                action,
                ids,
                note: action === 'used' ? ((noteText || '').trim() || null) : null,
            });
            const byId = new Map(r.data.devices.map((d) => [d.id, d]));
            setDevices((list) => list.map((d) => byId.get(d.id) ?? d));
            if (ids.length > 1) {
                const verb = { printed: 'marcada(s) como impresas', shipped: 'marcada(s) como enviadas', used: 'sellada(s)' }[action];
                setNotice(`${r.data.done} tarjeta(s) ${verb}.${r.data.skipped ? ` ${r.data.skipped} ya estaban o no aplicaban.` : ''}`);
            }
            onChanged?.();
            return true;
        } catch {
            setError('No se pudo guardar. Intenta de nuevo.');
            return false;
        }
    };

    const runBulk = async (action) => {
        setBusy(true);
        const ok = await apply(action, chosen.map((d) => d.id), note);
        setBusy(false);
        if (ok) clear();
    };

    if (error && !devices) return <p className="rounded-xl bg-[#FFF4F2] px-4 py-3 text-xs font-medium text-[#B81E0C]">{error}</p>;
    if (!devices) {
        return (
            <p className="flex items-center gap-2 px-1 py-3 text-xs text-neutral-500">
                <Icon name="progress_activity" className="animate-spin text-base" /> Cargando tarjetas…
            </p>
        );
    }

    const btn = 'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40';

    return (
        <div className="sc-swap space-y-3 rounded-2xl bg-white p-4 ring-1 ring-black/[0.06]">
            <p className="flex items-start gap-1.5 text-xs text-neutral-600">
                <Icon name="info" className="mt-px text-sm text-neutral-400" />
                Marca cada paso desde la tarjeta, o selecciona varias para hacerlo de una vez.
            </p>

            {/* Filtros + búsqueda */}
            <div className="flex flex-wrap items-center gap-2">
                {FILTERS.map((f) => {
                    const n = devices.filter(f.test).length;
                    return (
                        <button
                            key={f.id}
                            type="button"
                            onClick={() => setFilter(f.id)}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${filter === f.id ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 ring-1 ring-black/10 hover:ring-black/25'}`}
                        >
                            {f.label} <span className="ml-1 opacity-60">{n}</span>
                        </button>
                    );
                })}
                <label className="ml-auto flex items-center gap-1.5 rounded-full border border-black/10 px-3 focus-within:border-[#D42410]">
                    <Icon name="search" className="text-base text-neutral-400" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Buscar código"
                        className="h-8 w-32 border-0 bg-transparent p-0 text-xs focus:outline-none focus:ring-0"
                    />
                </label>
            </div>

            {/* Selección en grupo: solo imprimir, enviar y sellar */}
            <div className={`space-y-2 rounded-2xl p-3 ring-1 transition ${chosen.length ? 'bg-[#FFF4F2] ring-[#D42410]/25' : 'bg-neutral-50 ring-black/[0.06]'}`}>
                <div className="flex flex-wrap items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-neutral-800">
                        <input
                            type="checkbox"
                            checked={allShownSelected}
                            ref={(el) => { if (el) el.indeterminate = !allShownSelected && someShownSelected; }}
                            onChange={toggleAllShown}
                            className="h-5 w-5 rounded-md border-black/25 text-[#D42410] focus:ring-[#D42410]"
                        />
                        Seleccionar todas{filter !== 'all' || q ? ' (de este filtro)' : ''}
                    </label>
                    <span className="text-xs text-neutral-500">
                        {chosen.length === 0 ? 'para marcarlas de una vez' : `${chosen.length} seleccionada(s)`}
                    </span>
                    {chosen.length > 0 && (
                        <button type="button" onClick={clear} className="ml-auto text-xs font-semibold text-neutral-500 hover:text-neutral-900">
                            Quitar selección
                        </button>
                    )}
                </div>

                {chosen.length > 0 && (
                    <div className="sc-swap flex flex-wrap gap-2">
                        <button type="button" disabled={busy || canPrint === 0} onClick={() => runBulk('printed')} className={`${btn} bg-neutral-900 text-white hover:bg-black`}>
                            <Icon name="print" className="text-base" /> Marcar impresas ({canPrint})
                        </button>
                        <button type="button" disabled={busy || canShip === 0} onClick={() => runBulk('shipped')} className={`${btn} bg-blue-600 text-white hover:bg-blue-700`} title="Solo las que ya están impresas">
                            <Icon name="local_shipping" className="text-base" /> Marcar enviadas ({canShip})
                        </button>
                        <button type="button" disabled={busy || canSeal === 0} onClick={() => setSealing(true)} className={`${btn} bg-[#D42410] text-white hover:bg-[#B81E0C]`}>
                            <Icon name="lock" className="text-base" /> Sellar ({canSeal})
                        </button>
                    </div>
                )}

                {sealing && canSeal > 0 && (
                    <div className="sc-swap space-y-2 rounded-xl bg-white p-3 ring-1 ring-[#D42410]/20">
                        <p className="flex items-start gap-1.5 text-xs font-semibold text-[#B81E0C]">
                            <Icon name="lock" className="mt-px text-sm" />
                            Vas a sellar {canSeal} tarjeta(s). Es definitivo: no se podrán desmarcar ni volver a usar.
                        </p>
                        <input
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && runBulk('used')}
                            maxLength={255}
                            autoFocus
                            placeholder="¿A quién o dónde se entregaron? (opcional)"
                            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs focus:border-[#D42410] focus:outline-none focus:ring-0"
                        />
                        <div className="flex gap-2">
                            <button type="button" onClick={() => runBulk('used')} disabled={busy} className={`${btn} bg-[#D42410] text-white hover:bg-[#B81E0C]`}>
                                <Icon name={busy ? 'progress_activity' : 'lock'} className={`text-sm ${busy ? 'animate-spin' : ''}`} /> Confirmar sello
                            </button>
                            <button type="button" onClick={() => { setSealing(false); setNote(''); }} className={`${btn} bg-white text-neutral-700 ring-1 ring-black/10 hover:ring-black/25`}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {notice && <p className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700"><Icon name="check_circle" className="text-sm" /> {notice}</p>}
            {error && <p className="rounded-xl bg-[#FFF4F2] px-3 py-2 text-xs font-medium text-[#B81E0C]">{error}</p>}

            <ul className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
                {shown.map((d) => (
                    <Row key={d.id} device={d} selected={selected.has(d.id)} onSelect={toggleOne} onAction={apply} />
                ))}
                {shown.length === 0 && <li className="py-6 text-center text-xs text-neutral-500">Ninguna tarjeta en este filtro.</li>}
            </ul>
        </div>
    );
}
