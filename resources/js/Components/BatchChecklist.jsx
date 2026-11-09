/**
 * Checklist de un lote: cada tarjeta con su código, su enlace NFC y su QR,
 * y un sello de "utilizada" (entregada/asignada) con nota opcional de a quién o
 * dónde. El sello es definitivo, como un sello de autenticidad: una vez puesto
 * no se puede quitar ni reutilizar la tarjeta. Las que un cliente ya reclamó
 * cuentan como utilizadas automáticamente.
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
            aria-label="Copiar enlace NFC"
            className={`flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold transition ${ok ? 'bg-emerald-600 text-white' : 'bg-white text-neutral-700 ring-1 ring-black/10 hover:ring-black/25'}`}
        >
            <Icon name={ok ? 'check' : 'content_copy'} className="text-sm" />
            {ok ? 'Copiado' : 'Copiar'}
        </button>
    );
}

function Row({ device, onConfirm }) {
    const [confirming, setConfirming] = useState(false);
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);

    const confirm = async () => {
        setSaving(true);
        const ok = await onConfirm(device, note.trim());
        setSaving(false);
        if (ok) setConfirming(false);
    };

    return (
        <li className={`rounded-2xl border p-3 transition ${device.used ? 'border-[#D42410]/20 bg-[#FFF4F2]/60' : confirming ? 'border-[#D42410]/50 bg-white shadow-[0_0_0_4px_rgba(212,36,16,0.08)]' : 'border-black/[0.07] bg-white'}`}>
            <div className="flex flex-wrap items-center gap-3">
                {/* Sellada: candado; disponible: casilla que abre la confirmación */}
                {device.used ? (
                    <span className="flex items-center gap-2.5" title="Tarjeta sellada como utilizada: no se puede reutilizar">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#D42410] text-white">
                            <Icon name="lock" fill className="text-[13px]" />
                        </span>
                        <span className="font-mono text-[13px] font-bold text-neutral-900">{device.code}</span>
                    </span>
                ) : (
                    <label className="flex cursor-pointer items-center gap-2.5">
                        <input
                            type="checkbox"
                            checked={confirming}
                            onChange={(e) => setConfirming(e.target.checked)}
                            className="h-5 w-5 rounded-md border-black/25 text-[#D42410] focus:ring-[#D42410]"
                        />
                        <span className="font-mono text-[13px] font-bold text-neutral-900">{device.code}</span>
                    </label>
                )}

                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                    {device.claimed && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">Reclamada{device.owner ? ` · ${device.owner}` : ''}</span>}
                    {!device.claimed && device.used && <span className="rounded-full bg-[#D42410] px-2 py-0.5 text-white">Utilizada{device.used_at ? ` · ${device.used_at}` : ''}</span>}
                    {!device.used && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">Disponible</span>}
                    {device.printed && <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-600">Impresa</span>}
                    {device.shipped && <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-600">Enviada</span>}
                    {device.status === 'disabled' && <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-white">Desactivada</span>}
                </div>

                <div className="ml-auto flex items-center gap-1.5">
                    <CopyButton text={device.nfc_url} />
                    {device.has_qr && (
                        <a
                            href={route('admin.devices.qr', device.id)}
                            className="flex h-8 items-center gap-1 rounded-full bg-neutral-900 px-2.5 text-[11px] font-semibold text-white transition hover:bg-black"
                        >
                            <Icon name="download" className="text-sm" /> QR PNG
                        </a>
                    )}
                </div>
            </div>

            <a href={device.nfc_url} target="_blank" rel="noreferrer" className="mt-1.5 block truncate pl-[30px] font-mono text-[11px] text-neutral-500 hover:text-[#D42410]">
                {device.nfc_url}
            </a>

            {/* Nota guardada (solo lectura una vez sellada) */}
            {device.used && device.used_note && (
                <p className="mt-2 ml-[30px] flex items-center gap-1.5 text-xs text-neutral-600">
                    <Icon name="edit_square" className="text-sm text-neutral-400" /> {device.used_note}
                </p>
            )}

            {/* Confirmación: sellar es definitivo */}
            {!device.used && confirming && (
                <div className="sc-swap mt-3 ml-[30px] space-y-2 rounded-xl bg-[#FFF4F2] p-3">
                    <p className="flex items-start gap-1.5 text-xs font-semibold text-[#B81E0C]">
                        <Icon name="lock" className="mt-px text-sm" />
                        Al confirmar, esta tarjeta queda sellada como utilizada y no se podrá desmarcar ni volver a usar.
                    </p>
                    <input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && confirm()}
                        maxLength={255}
                        autoFocus
                        placeholder="¿A quién o dónde se entregó? (opcional)"
                        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs focus:border-[#D42410] focus:outline-none focus:ring-0"
                    />
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={confirm}
                            disabled={saving}
                            className="inline-flex items-center gap-1 rounded-full bg-[#D42410] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#B81E0C] disabled:opacity-60"
                        >
                            <Icon name={saving ? 'progress_activity' : 'lock'} className={`text-sm ${saving ? 'animate-spin' : ''}`} />
                            Confirmar uso
                        </button>
                        <button
                            type="button"
                            onClick={() => { setConfirming(false); setNote(''); }}
                            className="rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 ring-1 ring-black/10 hover:ring-black/25"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </li>
    );
}

export default function BatchChecklist({ batch, onUsedChange }) {
    const [devices, setDevices] = useState(null);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [q, setQ] = useState('');

    useEffect(() => {
        window.axios.get(route('admin.batches.devices', batch.id))
            .then((r) => setDevices(r.data))
            .catch(() => setError('No se pudo cargar el checklist del lote.'));
    }, [batch.id]);

    const used = devices ? devices.filter((d) => d.used).length : 0;
    useEffect(() => { if (devices) onUsedChange?.(used); }, [used]); // eslint-disable-line react-hooks/exhaustive-deps

    // Sella la tarjeta en el servidor (definitivo). Devuelve true si quedó sellada.
    const seal = async (device, note) => {
        setError(null);
        try {
            const r = await window.axios.post(route('admin.devices.used', device.id), { note: note || null });
            setDevices((list) => list.map((d) => (d.id === device.id ? r.data : d)));
            return true;
        } catch (e) {
            // 409: otra persona ya la había sellado; se muestra como está en el servidor.
            if (e.response?.status === 409 && e.response.data?.device) {
                setDevices((list) => list.map((d) => (d.id === device.id ? e.response.data.device : d)));
                setError(e.response.data.message);
                return true;
            }
            setError('No se pudo guardar. Intenta de nuevo.');
            return false;
        }
    };

    const shown = useMemo(() => {
        if (!devices) return [];
        const needle = q.trim().toUpperCase();
        return devices.filter((d) => (filter === 'all' || (filter === 'used' ? d.used : !d.used)) && (!needle || d.code.includes(needle)));
    }, [devices, filter, q]);

    if (error && !devices) return <p className="rounded-xl bg-[#FFF4F2] px-4 py-3 text-xs font-medium text-[#B81E0C]">{error}</p>;
    if (!devices) {
        return (
            <p className="flex items-center gap-2 px-1 py-3 text-xs text-neutral-500">
                <Icon name="progress_activity" className="animate-spin text-base" /> Cargando tarjetas…
            </p>
        );
    }

    const total = devices.length;
    const pct = total ? Math.round((used / total) * 100) : 0;

    return (
        <div className="sc-swap space-y-3 rounded-2xl bg-white p-4 ring-1 ring-black/[0.06]">
            <div>
                <div className="flex items-baseline justify-between">
                    <p className="text-sm font-semibold text-neutral-900">
                        <span className="font-display text-xl font-bold">{used}</span> de {total} utilizadas
                    </p>
                    <span className="text-xs font-semibold text-neutral-500">{total - used} disponibles</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full rounded-full bg-[#D42410] transition-[width] duration-500" style={{ width: `${pct}%` }} />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {[['all', 'Todas', total], ['pending', 'Disponibles', total - used], ['used', 'Utilizadas', used]].map(([id, label, n]) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setFilter(id)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${filter === id ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 ring-1 ring-black/10 hover:ring-black/25'}`}
                    >
                        {label} <span className="ml-1 opacity-60">{n}</span>
                    </button>
                ))}
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

            {error && <p className="rounded-xl bg-[#FFF4F2] px-3 py-2 text-xs font-medium text-[#B81E0C]">{error}</p>}

            <ul className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
                {shown.map((d) => (
                    <Row key={d.id} device={d} onConfirm={seal} />
                ))}
                {shown.length === 0 && <li className="py-6 text-center text-xs text-neutral-500">Ninguna tarjeta en este filtro.</li>}
            </ul>
        </div>
    );
}
