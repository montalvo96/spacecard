/**
 * Tarjeta de un lote de manufactura en el panel admin.
 * Muestra el avance como tres pasos (Impresas → Enviadas → Utilizadas), dice cuál
 * es el siguiente paso, y permite abrir el checklist, exportar el ZIP o eliminar
 * el lote si se creó por error.
 */

import { router } from '@inertiajs/react';
import BatchChecklist from '@/Components/BatchChecklist';

const TYPE_LABELS = { card: 'Tarjeta', bracelet: 'Pulsera', review_plate: 'Placa de reseñas' };

function Icon({ name, fill = false, className = '' }) {
    return <span aria-hidden="true" className={`ms ${fill ? 'ms-fill' : ''} ${className}`}>{name}</span>;
}

function Step({ n, icon, label, value, total, hint }) {
    const complete = total > 0 && value >= total;
    const started = value > 0;
    return (
        <div className={`flex-1 rounded-xl border p-3 ${complete ? 'border-emerald-200 bg-emerald-50' : started ? 'border-amber-200 bg-amber-50/60' : 'border-black/[0.06] bg-white'}`}>
            <div className="flex items-center gap-2">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${complete ? 'bg-emerald-600 text-white' : started ? 'bg-amber-500 text-white' : 'bg-neutral-200 text-neutral-600'}`}>
                    {complete ? <Icon name="check" className="text-sm" /> : n}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-neutral-800">
                    <Icon name={icon} className="text-sm text-neutral-500" /> {label}
                </span>
            </div>
            <p className="mt-1.5 pl-8 text-lg font-bold leading-none text-neutral-900">
                {value}<span className="text-xs font-semibold text-neutral-400">/{total}</span>
            </p>
            {hint && <p className="mt-1 pl-8 text-[11px] text-neutral-500">{hint}</p>}
        </div>
    );
}

export default function BatchCard({ batch, open, onToggle, usedOverride, onUsedChange }) {
    const total = batch.devices_count ?? batch.quantity;
    const printed = batch.printed_count ?? 0;
    const shipped = batch.shipped_count ?? 0;
    const claimed = batch.claimed_count ?? 0;
    const used = usedOverride ?? batch.used_count ?? 0;

    // Terminado: todas impresas, enviadas y utilizadas (reclamadas por un cliente o selladas a mano).
    const done = total > 0 && printed >= total && shipped >= total && used >= total;

    const next = done
        ? 'Todo listo: este lote ya está terminado.'
        : printed < total
            ? 'Siguiente paso: descarga el ZIP, imprime y marca las tarjetas como impresas.'
            : shipped < total
                ? 'Siguiente paso: marca como enviadas las tarjetas que ya mandaste o entregaste.'
                : 'Esperando a que los clientes escaneen y reclamen sus tarjetas (o séllalas si las entregaste tú).';

    // Solo se borra si ninguna tarjeta salió al mundo.
    const linked = batch.order_linked_count ?? 0;
    const deleteBlock = linked > 0
        ? 'Este lote surte un pedido de SpaceShop, no se puede eliminar.'
        : shipped > 0 || used > 0
            ? 'Ya hay tarjetas enviadas, utilizadas o reclamadas: no se puede eliminar.'
            : null;

    const handleDelete = () => {
        const warn = printed > 0
            ? `\n\nOjo: ${printed} tarjeta(s) ya están impresas. Sus QR/NFC dejarán de funcionar.`
            : '';
        if (confirm(`¿Eliminar el lote «${batch.name}» y sus ${total} tarjetas? Esto no se puede deshacer.${warn}`)) {
            router.delete(route('admin.batches.destroy', batch.id), { preserveScroll: true });
        }
    };

    const refresh = () => router.reload({ only: ['batches'], preserveScroll: true });

    return (
        <div className={`space-y-4 rounded-2xl border p-4 transition ${done ? 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/30' : 'border-black/[0.07] bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40'}`}>
            {/* Encabezado */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold text-gray-900 dark:text-white">{batch.name}</h4>
                    <p className="text-xs text-gray-500">
                        {TYPE_LABELS[batch.type] ?? batch.type} • {total} tarjetas • Creó: {batch.creator?.name ?? '—'}
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    {done && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                            <Icon name="task_alt" className="text-sm" /> Lote completado
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={!!deleteBlock}
                        title={deleteBlock ?? 'Eliminar lote (por ejemplo, si se creó por error)'}
                        aria-label="Eliminar lote"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 ring-1 ring-black/10 transition hover:bg-[#FFF4F2] hover:text-[#D42410] hover:ring-[#D42410]/40 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-neutral-500 disabled:hover:ring-black/10"
                    >
                        <Icon name="delete" className="text-lg" />
                    </button>
                </div>
            </div>

            {/* Pasos */}
            <div className="flex flex-col gap-2 sm:flex-row">
                <Step n={1} icon="print" label="Impresas" value={printed} total={total} />
                <Step n={2} icon="local_shipping" label="Enviadas" value={shipped} total={total} />
                <Step n={3} icon="verified_user" label="Reclamadas / selladas" value={used} total={total} hint={`${claimed} reclamada(s) por cliente · ${Math.max(0, used - claimed)} sellada(s)`} />
            </div>

            <p className={`flex items-start gap-1.5 text-xs font-medium ${done ? 'text-emerald-700' : 'text-neutral-600'}`}>
                <Icon name={done ? 'task_alt' : 'arrow_forward'} className="mt-px text-sm" /> {next}
            </p>

            {/* Acciones */}
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={onToggle}
                    aria-expanded={open}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#D42410] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#B81E0C]"
                >
                    <Icon name={open ? 'keyboard_arrow_up' : 'checklist'} className="text-base" />
                    {open ? 'Ocultar tarjetas' : 'Ver y gestionar tarjetas'}
                </button>
                <a
                    href={`/admin/batches/${batch.id}/export`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-800 ring-1 ring-black/10 transition hover:ring-black/25"
                >
                    <Icon name="download" className="text-base" /> Descargar ZIP para imprenta
                </a>
            </div>

            {open && <BatchChecklist batch={batch} onUsedChange={onUsedChange} onChanged={refresh} />}
        </div>
    );
}
