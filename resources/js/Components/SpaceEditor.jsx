/**
 * Editor de Spaces (tarjeta de presentación digital) con el estilo de la portada:
 * blanco / negro / rojo #D42410. Perfil, contacto, diseño (estilo, colores libres,
 * tipografía, esquinas, foto), enlaces y una vista previa en vivo que usa el mismo
 * CSS que la página pública /s/{slug} (ver SpacePreview.jsx).
 *
 * Al guardar: botón con estado (Guardando… / Guardado), toast del servidor
 * (flash) y aviso de «cambios sin guardar» mientras haya algo pendiente.
 */

import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { confirmDialog, toast } from '@/Components/Notify';
import SpacePreview, { FONT_PAIRS, SpacePage, contrastRatio } from '@/Components/SpacePreview';

function Icon({ name, fill = false, className = '' }) {
    return <span aria-hidden="true" className={`ms ${fill ? 'ms-fill' : ''} ${className}`}>{name}</span>;
}

/* ---------- Catálogos ---------- */

// Los temas cambian la estructura; los colores los elige el cliente.
// Fondos: al elegir uno se sugiere un estilo de botón (el cliente lo puede cambiar).
const THEMES = [
    { id: 'corporate', label: 'Liso', desc: 'Un solo color de fondo', free: true, button: 'filled' },
    { id: 'editorial', label: 'Suave', desc: 'Fondo que se tiñe de tu color', free: true, button: 'soft' },
    { id: 'aurora', label: 'Degradado', desc: 'Tu color principal al secundario', free: false, button: 'glass' },
    { id: 'bento', label: 'Foto', desc: 'Tu portada difuminada de fondo', free: false, button: 'glass' },
    { id: 'neon', label: 'Patrón', desc: 'Puntos de tu color', free: false, button: 'hard' },
];

const BUTTONS = [
    { id: 'filled', label: 'Relleno' },
    { id: 'outline', label: 'Contorno' },
    { id: 'soft', label: 'Suave' },
    { id: 'hard', label: 'Sombra' },
    { id: 'glass', label: 'Vidrio' },
];

const FONTS = Object.entries(FONT_PAIRS).map(([id, f]) => ({ id, ...f }));

const RADII = [
    { id: '0px', label: 'Rectas' },
    { id: '12px', label: 'Suaves' },
    { id: '24px', label: 'Redondas' },
    { id: '999px', label: 'Píldora' },
];

const AVATARS = [
    { id: 'circle', label: 'Círculo', cls: 'rounded-full' },
    { id: 'squircle', label: 'Suave', cls: 'rounded-[30%]' },
    { id: 'square', label: 'Cuadrado', cls: 'rounded-[4px]' },
];

const COLOR_FIELDS = [
    { key: 'primary', label: 'Color principal', hint: 'Botones e iconos' },
    { key: 'secondary', label: 'Color secundario', hint: 'Final del fondo Degradado' },
    { key: 'background', label: 'Fondo', hint: 'El color de toda la página' },
    { key: 'text', label: 'Texto', hint: 'Nombre, títulos y párrafos' },
];

const BLOCK_TYPES = {
    link: { label: 'Enlace', icon: 'link', placeholder: 'https://tusitio.com' },
    social: { label: 'Red social', icon: 'share', placeholder: 'https://instagram.com/tuusuario' },
    whatsapp: { label: 'WhatsApp', icon: 'chat', placeholder: 'https://wa.me/5215512345678' },
    email: { label: 'Correo', icon: 'mail', placeholder: 'mailto:hola@empresa.com' },
    phone: { label: 'Teléfono', icon: 'call', placeholder: 'tel:+525512345678' },
    header: { label: 'Encabezado', icon: 'title' },
    file: { label: 'Archivo', icon: 'download', placeholder: 'https://…/catalogo.pdf' },
    embed: { label: 'Incrustado', icon: 'open_in_new', placeholder: 'https://…' },
};
const ADDABLE = ['link', 'social', 'whatsapp', 'email', 'phone', 'header'];
const RICH_LABELS = {
    testimonial: 'Testimonios', differentiator: 'Diferenciadores', step: 'Pasos del proceso', faq: 'Preguntas frecuentes',
    client: 'Clientes', media: 'Galería', video: 'Video', catalog: 'Catálogo',
};

// Si al Space le faltan datos de diseño (p. ej. creado por seeder o IA) se completan con estos.
const DEFAULT_CONFIG = {
    layout: 'stack',
    background: 'solid',
    palette: { primary: '#d42410', secondary: '#525252', background: '#ffffff', text: '#0b0b0b' },
    font_pair: 'Outfit_Inter',
    button_style: 'filled',
    corner_radius: '12px',
    avatar_shape: 'circle',
};

function normalizeConfig(cfg) {
    const c = cfg && typeof cfg === 'object' ? cfg : {};
    return { ...DEFAULT_CONFIG, ...c, palette: { ...DEFAULT_CONFIG.palette, ...(c.palette || {}) } };
}

function fromSpace(s) {
    return {
        slug: s?.slug || '',
        display_name: s?.display_name || '',
        headline: s?.headline || '',
        company: s?.company || '',
        bio: s?.bio || '',
        contact_phone: s?.contact_phone || '',
        contact_email: s?.contact_email || '',
        contact_website: s?.contact_website || '',
        theme_template: s?.theme_template || 'corporate',
        theme_config: normalizeConfig(s?.theme_config),
        is_public: s?.is_public !== false,
    };
}

function blocksFrom(s) {
    return (s?.blocks || []).map((b) => ({ ...b, _key: `b${b.id}` }));
}

let tmpKey = 0;

/* ---------- Piezas de UI ---------- */

const inputCls =
    'w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition focus:border-[#D42410] focus:outline-none focus:ring-4 focus:ring-[#D42410]/10';

function Field({ label, hint, error, children, className = '' }) {
    return (
        <label className={`block ${className}`}>
            <span className="mb-1.5 block text-[13px] font-semibold text-neutral-700">{label}</span>
            {children}
            {error ? (
                <span className="mt-1 block text-xs font-medium text-[#D42410]">{error}</span>
            ) : (
                hint && <span className="mt-1 block text-xs text-neutral-500">{hint}</span>
            )}
        </label>
    );
}

function Section({ step, icon, title, desc, children, right }) {
    return (
        <section className="rounded-[24px] border border-black/[0.07] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-7">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D42410]/[0.08] text-[#D42410]">
                        <Icon name={icon} className="text-[22px]" />
                    </span>
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#D42410]">Paso {step}</p>
                        <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-neutral-900">{title}</h3>
                        {desc && <p className="mt-0.5 text-sm text-neutral-500">{desc}</p>}
                    </div>
                </div>
                {right}
            </div>
            {children}
        </section>
    );
}

function Switch({ checked, onChange, disabled, label, desc, locked }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className="flex w-full items-center justify-between gap-4 rounded-2xl border border-black/[0.07] bg-neutral-50/60 p-4 text-left transition hover:border-black/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
            <span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
                    {label}
                    {locked && <ProBadge />}
                </span>
                {desc && <span className="mt-0.5 block text-xs text-neutral-500">{desc}</span>}
            </span>
            <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-[#D42410]' : 'bg-neutral-300'}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
            </span>
        </button>
    );
}

/** Muestra en miniatura de cada estilo de botón. */
function ButtonSample({ kind }) {
    const base = 'h-5 w-14 rounded-md';
    if (kind === 'outline') return <span className={`${base} border-2 border-neutral-900`} />;
    if (kind === 'soft') return <span className={`${base} bg-white shadow-[0_4px_10px_rgba(0,0,0,0.18)]`} />;
    if (kind === 'hard') return <span className={`${base} border-2 border-neutral-900 bg-[#D42410] shadow-[3px_3px_0_#0b0b0b]`} />;
    if (kind === 'glass') return <span className={`${base} border border-white/50 bg-gradient-to-r from-neutral-300 to-neutral-200`} />;
    return <span className={`${base} bg-[#D42410]`} />;
}

/** Selector de color libre: muestra + código hex editable. */
function ColorField({ label, hint, value, onChange }) {
    const [draft, setDraft] = useState(value);
    useEffect(() => setDraft(value), [value]);

    const commit = (v) => {
        let hex = v.trim().toLowerCase();
        if (!hex.startsWith('#')) hex = `#${hex}`;
        if (/^#[0-9a-f]{3}$/.test(hex)) hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
        if (/^#[0-9a-f]{6}$/.test(hex)) onChange(hex);
        else setDraft(value);
    };

    return (
        <div className="flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-white p-2.5 pr-3 transition focus-within:border-[#D42410]/50">
            <label className="relative h-11 w-11 shrink-0 cursor-pointer overflow-hidden rounded-xl ring-1 ring-black/10" style={{ background: value }} title={`Elegir ${label.toLowerCase()}`}>
                <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label={label} />
            </label>
            <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-neutral-900">{label}</p>
                <p className="text-[11px] leading-tight text-neutral-500">{hint}</p>
            </div>
            <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={(e) => commit(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), commit(e.currentTarget.value))}
                spellCheck={false}
                aria-label={`Código de ${label.toLowerCase()}`}
                className="w-[84px] rounded-lg border border-black/10 bg-neutral-50 px-2 py-1.5 font-mono text-xs uppercase text-neutral-700 focus:border-[#D42410] focus:outline-none"
            />
        </div>
    );
}

function ProBadge() {
    return (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            <Icon name="bolt" fill className="text-[11px] text-[#FF5A3C]" />
            Pro
        </span>
    );
}

function SaveButton({ state, onClick, type = 'button', children, dirty }) {
    const saving = state === 'saving';
    const saved = state === 'saved';
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={saving}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition duration-300 disabled:cursor-wait ${
                saved
                    ? 'bg-emerald-600 shadow-[0_10px_24px_rgba(5,150,105,0.3)]'
                    : `bg-[#D42410] shadow-[0_10px_24px_rgba(212,36,16,0.3)] hover:-translate-y-0.5 hover:bg-[#B81E0C] ${dirty ? '' : 'opacity-90'}`
            }`}
        >
            <Icon name={saving ? 'progress_activity' : saved ? 'check_circle' : 'save'} fill={saved} className={`text-lg ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Guardando…' : saved ? 'Guardado' : children}
        </button>
    );
}

function ImagePicker({ label, preview, onPick, shape = 'wide', maxKb }) {
    const id = `img-${label.replace(/\s+/g, '-').toLowerCase()}`;
    return (
        <div>
            <span className="mb-1.5 block text-[13px] font-semibold text-neutral-700">{label}</span>
            <label
                htmlFor={id}
                className={`group relative flex cursor-pointer items-center justify-center overflow-hidden border-2 border-dashed border-black/10 bg-neutral-50 transition hover:border-[#D42410]/50 hover:bg-[#FFF4F2] ${
                    shape === 'round' ? 'mx-auto h-28 w-28 rounded-full' : 'h-28 w-full rounded-2xl'
                }`}
            >
                {preview ? (
                    <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                    <span className="flex flex-col items-center gap-1 text-neutral-400">
                        <Icon name="photo_camera" className="text-2xl" />
                        <span className="text-[11px] font-semibold">Subir</span>
                    </span>
                )}
                {preview && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 transition group-hover:opacity-100">
                        <Icon name="photo_camera" className="text-2xl" />
                    </span>
                )}
            </label>
            <input
                id={id}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (!file) return;
                    if (file.size > maxKb * 1024) {
                        toast.error(`La imagen pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. El máximo es ${maxKb >= 1024 ? maxKb / 1024 + ' MB' : maxKb + ' KB'}.`, { title: 'Imagen muy pesada' });
                        return;
                    }
                    onPick(file);
                }}
            />
            <p className="mt-1.5 text-center text-[11px] text-neutral-500">JPG o PNG · máx. {maxKb >= 1024 ? `${maxKb / 1024} MB` : `${maxKb} KB`}</p>
        </div>
    );
}

/* ---------- Editor ---------- */

export default function SpaceEditor({ spaces, userPlan }) {
    const isPro = userPlan.is_pro;
    const maxSpaces = userPlan.max_spaces ?? 1;
    const canCreate = userPlan.can_create_space ?? spaces.length < maxSpaces;

    const [selectedId, setSelectedId] = useState(spaces[0]?.id ?? null);
    const selected = spaces.find((s) => s.id === selectedId) || spaces[0] || null;

    const [form, setForm] = useState(() => fromSpace(selected));
    const [saved, setSaved] = useState(() => JSON.stringify(fromSpace(selected)));
    const [blocks, setBlocks] = useState(() => blocksFrom(selected));
    const [savedBlocks, setSavedBlocks] = useState(() => JSON.stringify(blocksFrom(selected)));
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(selected?.avatar_url || null);
    const [coverPreview, setCoverPreview] = useState(selected?.cover_url || null);
    const [errors, setErrors] = useState({});
    const [profileState, setProfileState] = useState('idle');
    const [blocksState, setBlocksState] = useState('idle');

    // Crear Space
    const [showCreate, setShowCreate] = useState(spaces.length === 0);
    const [newSpace, setNewSpace] = useState({ display_name: '', slug: '' });
    const [creating, setCreating] = useState(false);
    const [createErrors, setCreateErrors] = useState({});

    // Al cambiar de Space se cargan sus datos.
    const loadSpace = (s) => {
        const f = fromSpace(s);
        const bl = blocksFrom(s);
        setForm(f);
        setSaved(JSON.stringify(f));
        setBlocks(bl);
        setSavedBlocks(JSON.stringify(bl));
        setAvatarFile(null);
        setCoverFile(null);
        setAvatarPreview(s?.avatar_url || null);
        setCoverPreview(s?.cover_url || null);
        setErrors({});
    };

    useEffect(() => {
        loadSpace(selected);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId]);

    const profileDirty = useMemo(() => JSON.stringify(form) !== saved || !!avatarFile || !!coverFile, [form, saved, avatarFile, coverFile]);
    const blocksDirty = useMemo(() => JSON.stringify(blocks) !== savedBlocks, [blocks, savedBlocks]);
    const dirty = profileDirty || blocksDirty;

    // Avisar antes de salir con cambios pendientes.
    useEffect(() => {
        if (!dirty) return;
        const onBefore = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', onBefore);
        return () => window.removeEventListener('beforeunload', onBefore);
    }, [dirty]);

    const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
    const setCfg = (patch) => setForm((f) => ({ ...f, theme_config: { ...f.theme_config, ...patch } }));
    const setPalette = (patch) => setForm((f) => ({ ...f, theme_config: { ...f.theme_config, palette: { ...f.theme_config.palette, ...patch } } }));

    const flashSaved = (setter) => {
        setter('saved');
        setTimeout(() => setter('idle'), 2600);
    };

    const firstError = (errs) => Object.values(errs)[0];

    /* --- Guardar perfil y diseño --- */
    const saveProfile = (e, then) => {
        e?.preventDefault();
        if (!selected) return;

        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => {
            if (k === 'theme_config') fd.append(k, JSON.stringify(v));
            else if (typeof v === 'boolean') fd.append(k, v ? '1' : '0');
            else fd.append(k, v ?? '');
        });
        if (avatarFile) fd.append('avatar', avatarFile);
        if (coverFile) fd.append('cover', coverFile);

        setProfileState('saving');
        router.post(`/spaces/${selected.id}`, fd, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                if (page.props.flash?.error) {
                    setProfileState('idle');
                    return;
                }
                const fresh = page.props.spaces?.find((s) => s.id === selected.id);
                const f = fromSpace(fresh);
                setForm(f);
                setSaved(JSON.stringify(f));
                setAvatarFile(null);
                setCoverFile(null);
                setAvatarPreview(fresh?.avatar_url || null);
                setCoverPreview(fresh?.cover_url || null);
                setErrors({});
                flashSaved(setProfileState);
                then?.();
            },
            onError: (errs) => {
                setErrors(errs);
                setProfileState('idle');
                toast.error(firstError(errs) || 'Revisa los campos marcados en rojo.', { title: 'No se pudo guardar' });
            },
        });
    };

    /* --- Bloques --- */
    const addBlock = (type) => {
        const def = BLOCK_TYPES[type];
        setBlocks((bl) => [
            ...bl,
            { _key: `n${++tmpKey}`, id: null, type, label: type === 'header' ? 'Nueva sección' : def.label, url: type === 'header' ? null : '', icon: null, is_active: true },
        ]);
    };
    const updateBlock = (i, patch) => setBlocks((bl) => bl.map((b, j) => (j === i ? { ...b, ...patch } : b)));
    const removeBlock = (i) => setBlocks((bl) => bl.filter((_, j) => j !== i));
    const moveBlock = (i, dir) =>
        setBlocks((bl) => {
            const j = i + dir;
            if (j < 0 || j >= bl.length) return bl;
            const next = [...bl];
            [next[i], next[j]] = [next[j], next[i]];
            return next;
        });

    const saveBlocks = () => {
        if (!selected) return;
        const empty = blocks.findIndex((b) => !RICH_LABELS[b.type] && !String(b.label || '').trim());
        if (empty !== -1) {
            toast.error(`El bloque ${empty + 1} no tiene texto.`, { title: 'Falta un dato' });
            return;
        }

        setBlocksState('saving');
        router.post(
            `/spaces/${selected.id}/blocks`,
            { blocks: blocks.map(({ _key, ...b }) => ({ id: b.id, type: b.type, label: b.label, url: b.url, icon: b.icon, is_active: !!b.is_active })) },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    if (page.props.flash?.error) {
                        setBlocksState('idle');
                        return;
                    }
                    const fresh = page.props.spaces?.find((s) => s.id === selected.id);
                    const bl = blocksFrom(fresh);
                    setBlocks(bl);
                    setSavedBlocks(JSON.stringify(bl));
                    flashSaved(setBlocksState);
                },
                onError: (errs) => {
                    setBlocksState('idle');
                    toast.error(firstError(errs) || 'Revisa tus enlaces.', { title: 'No se pudieron guardar' });
                },
            },
        );
    };

    const saveAll = () => {
        // Inertia cancela una visita si empieza otra: se guardan una tras otra.
        if (profileDirty) saveProfile(null, blocksDirty ? saveBlocks : undefined);
        else if (blocksDirty) saveBlocks();
    };

    /* --- Crear Space --- */
    const createSpace = (e) => {
        e.preventDefault();
        setCreating(true);
        const before = new Set(spaces.map((s) => s.id));
        router.post('/spaces', newSpace, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                setCreateErrors({});
                const created = page.props.spaces?.find((s) => !before.has(s.id));
                if (created) {
                    setShowCreate(false);
                    setNewSpace({ display_name: '', slug: '' });
                    setSelectedId(created.id);
                }
            },
            onError: (errs) => {
                setCreateErrors(errs);
                toast.error(firstError(errs) || 'Revisa los datos.', { title: 'No se pudo crear' });
            },
            onFinish: () => setCreating(false),
        });
    };

    // Mientras se escribe se permite un guion al final (si no, no se podría teclear «maria-»).
    const slugify = (v, typing = false) => {
        const s = v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+/, '');
        return typing ? s : s.replace(/-+$/, '');
    };

    const publicUrl = selected ? `${window.location.origin}/s/${form.slug || selected.slug}` : '';
    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/s/${selected.slug}`);
            toast.success('Pégalo donde quieras compartir tu Space.', { title: 'Enlace copiado' });
        } catch {
            toast.error('No se pudo copiar el enlace.');
        }
    };

    const cfg = form.theme_config;

    // La raíz es <section> para que las clases de tarjeta del tabpanel del
    // Dashboard ([&>div:first-child]) no envuelvan todo el editor.
    return (
        <section className="space-y-6">
            <style>{`.sc-scroll::-webkit-scrollbar{display:none}.sc-scroll{scrollbar-width:none}`}</style>

            {/* ---------- Cabecera: mis Spaces ---------- */}
            <div className="relative overflow-hidden rounded-[24px] bg-[#0B0B0B] p-6 text-white shadow-[0_30px_70px_rgba(0,0,0,0.18)] sm:p-8">
                <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 bg-[radial-gradient(closest-side,rgba(255,40,10,0.35),transparent)]" />
                <div className="relative flex flex-wrap items-end justify-between gap-5">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">Tu tarjeta digital</p>
                        <h2 className="mt-2 font-display text-[32px] font-bold leading-none tracking-[-0.04em]">Mis Spaces</h2>
                        <p className="mt-2 text-sm text-neutral-400">
                            {userPlan.spaces_used ?? spaces.length} de {maxSpaces} usados · Plan {isPro ? 'Pro' : 'Free'}
                            {!isPro && ' · Pro te da 3 Spaces y todos los temas'}
                        </p>
                    </div>
                    {canCreate ? (
                        !showCreate && (
                            <button
                                type="button"
                                onClick={() => setShowCreate(true)}
                                className="group inline-flex items-center gap-2 rounded-full bg-[#D42410] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(212,36,16,0.35)] transition hover:-translate-y-0.5 hover:bg-[#B81E0C]"
                            >
                                <Icon name="add" className="text-lg transition duration-500 group-hover:rotate-90" />
                                Crear Space
                            </button>
                        )
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-neutral-300">
                            <Icon name="lock" className="text-base" />
                            Llegaste al límite de tu plan
                        </span>
                    )}
                </div>

                {spaces.length > 0 && (
                    <div className="sc-scroll relative mt-6 flex gap-2 overflow-x-auto">
                        {spaces.map((s) => {
                            const active = s.id === selected?.id;
                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={async () => {
                                        if (active) return;
                                        if (dirty) {
                                            const ok = await confirmDialog({
                                                title: 'Tienes cambios sin guardar',
                                                message: 'Si cambias de Space se perderán. ¿Quieres continuar?',
                                                confirmText: 'Descartar cambios',
                                                tone: 'danger',
                                                icon: 'delete',
                                            });
                                            if (!ok) return;
                                        }
                                        setSelectedId(s.id);
                                    }}
                                    className={`shrink-0 rounded-full px-4 py-2 text-left text-[13px] font-semibold transition ${
                                        active ? 'bg-white text-neutral-900' : 'bg-white/[0.07] text-neutral-300 hover:bg-white/15 hover:text-white'
                                    }`}
                                >
                                    {s.display_name}
                                    <span className="ml-1.5 text-xs font-medium text-neutral-500">/s/{s.slug}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {showCreate && canCreate && (
                    <form onSubmit={createSpace} className="relative mt-6 grid gap-3 rounded-2xl bg-white p-4 text-neutral-900 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
                        <Field label="Nombre para mostrar" error={createErrors.display_name}>
                            <input
                                className={inputCls}
                                value={newSpace.display_name}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setNewSpace((n) => ({ display_name: v, slug: n.slugTouched ? n.slug : slugify(v), slugTouched: n.slugTouched }));
                                }}
                                placeholder="María López"
                                required
                            />
                        </Field>
                        <Field label="Tu enlace" error={createErrors.slug} hint={`spacecard…/s/${newSpace.slug || 'tu-nombre'}`}>
                            <input
                                className={inputCls}
                                value={newSpace.slug}
                                onChange={(e) => setNewSpace((n) => ({ ...n, slug: slugify(e.target.value, true), slugTouched: true }))}
                                placeholder="maria-lopez"
                                required
                            />
                        </Field>
                        <div className="flex gap-2 sm:pt-[26px]">
                            {spaces.length > 0 && (
                                <button type="button" onClick={() => setShowCreate(false)} className="rounded-full border border-black/15 px-4 py-2.5 text-sm font-semibold transition hover:border-neutral-900">
                                    Cancelar
                                </button>
                            )}
                            <button type="submit" disabled={creating} className="inline-flex items-center gap-1.5 rounded-full bg-[#D42410] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#B81E0C] disabled:opacity-60">
                                <Icon name={creating ? 'progress_activity' : 'rocket_launch'} className={`text-lg ${creating ? 'animate-spin' : ''}`} />
                                {creating ? 'Creando…' : 'Crear'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {!selected ? (
                <div className="rounded-[24px] border border-dashed border-black/15 bg-white p-10 text-center">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D42410]/[0.08] text-[#D42410]">
                        <Icon name="language" className="text-3xl" />
                    </span>
                    <h3 className="mt-4 font-display text-xl font-bold">Crea tu primer Space</h3>
                    <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">Es la página que se abre cuando alguien acerca su celular a tu tarjeta.</p>
                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
                    {/* ---------- Columna de edición ---------- */}
                    <div className="space-y-6">
                        <form onSubmit={saveProfile} className="space-y-6">
                            <Section step={1} icon="person" title="Tu perfil" desc="Lo primero que ve quien escanea tu tarjeta.">
                                <div className="grid gap-6 md:grid-cols-[140px_1fr]">
                                    <ImagePicker
                                        label="Foto"
                                        shape="round"
                                        maxKb={1024}
                                        preview={avatarPreview}
                                        onPick={(f) => {
                                            setAvatarFile(f);
                                            setAvatarPreview(URL.createObjectURL(f));
                                        }}
                                    />
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field label="Nombre" error={errors.display_name}>
                                            <input className={inputCls} value={form.display_name} onChange={(e) => set('display_name', e.target.value)} required />
                                        </Field>
                                        <Field label="Enlace del Space" error={errors.slug} hint={`/s/${form.slug || '…'}`}>
                                            <input className={inputCls} value={form.slug} onChange={(e) => set('slug', slugify(e.target.value, true))} required />
                                        </Field>
                                        <Field label="Cargo" error={errors.headline}>
                                            <input className={inputCls} value={form.headline} onChange={(e) => set('headline', e.target.value)} placeholder="Directora creativa" />
                                        </Field>
                                        <Field label="Empresa" error={errors.company}>
                                            <input className={inputCls} value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Avaspace" />
                                        </Field>
                                        <Field label="Sobre ti" className="sm:col-span-2" error={errors.bio} hint="Una o dos líneas funcionan mejor.">
                                            <textarea className={`${inputCls} resize-none`} rows={3} value={form.bio} onChange={(e) => set('bio', e.target.value)} placeholder="Cuéntale a la gente en una o dos líneas qué haces." />
                                        </Field>
                                    </div>
                                </div>
                                <div className="mt-5">
                                    <ImagePicker
                                        label="Portada"
                                        maxKb={2048}
                                        preview={coverPreview}
                                        onPick={(f) => {
                                            setCoverFile(f);
                                            setCoverPreview(URL.createObjectURL(f));
                                        }}
                                    />
                                </div>
                            </Section>

                            <Section step={2} icon="contact_page" title="Contacto" desc="Activa el botón «Guardar contacto» en tu Space.">
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <Field label="Teléfono" error={errors.contact_phone}>
                                        <input type="tel" className={inputCls} value={form.contact_phone} onChange={(e) => set('contact_phone', e.target.value)} placeholder="+52 55 1234 5678" />
                                    </Field>
                                    <Field label="Correo" error={errors.contact_email}>
                                        <input type="email" className={inputCls} value={form.contact_email} onChange={(e) => set('contact_email', e.target.value)} placeholder="hola@empresa.com" />
                                    </Field>
                                    <Field label="Sitio web" error={errors.contact_website}>
                                        <input type="url" className={inputCls} value={form.contact_website} onChange={(e) => set('contact_website', e.target.value)} placeholder="https://empresa.com" />
                                    </Field>
                                </div>
                            </Section>

                            <Section step={3} icon="palette" title="Diseño" desc="Elige la estructura y ponle tus colores: todo se ve al instante en la vista previa.">
                                <p className="mb-2.5 text-[13px] font-semibold text-neutral-700">Estilo</p>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                                    {THEMES.map((t) => {
                                        const locked = !isPro && !t.free;
                                        const active = form.theme_template === t.id;
                                        return (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => {
                                                    if (locked) {
                                                        toast.info('Compra cualquier producto de SpaceShop y tu plan Pro se activa solo.', { title: `${t.label} es un estilo Pro` });
                                                        return;
                                                    }
                                                    setForm((f) => ({ ...f, theme_template: t.id, theme_config: { ...f.theme_config, button_style: t.button } }));
                                                }}
                                                aria-pressed={active}
                                                className={`group relative overflow-hidden rounded-2xl border-2 text-left transition duration-300 ${
                                                    active ? 'border-[#D42410] shadow-[0_10px_24px_rgba(212,36,16,0.18)]' : 'border-black/[0.07] hover:-translate-y-0.5 hover:border-black/20'
                                                }`}
                                            >
                                                {/* Miniatura real del estilo con los colores del cliente */}
                                                <div className="pointer-events-none relative h-[132px] overflow-hidden" style={{ background: cfg.palette.background }} aria-hidden="true">
                                                    <div className="absolute left-1/2 top-0 -translate-x-1/2" style={{ width: 375, zoom: 0.36 }}>
                                                        <SpacePage
                                                            compact
                                                            form={{ ...form, theme_template: t.id, bio: '', theme_config: { ...cfg, button_style: active ? cfg.button_style : t.button } }}
                                                            blocks={blocks.filter((b) => !RICH_LABELS[b.type]).slice(0, 3)}
                                                            avatar={avatarPreview}
                                                            cover={coverPreview}
                                                        />
                                                    </div>
                                                    {locked && (
                                                        <span className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[1px]">
                                                            <Icon name="lock" className="text-xl text-white" />
                                                        </span>
                                                    )}
                                                    {active && (
                                                        <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#D42410] text-white">
                                                            <Icon name="check" className="text-sm" />
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="border-t border-black/[0.06] bg-white px-3 py-2">
                                                    <p className="flex items-center gap-1 text-[13px] font-bold text-neutral-900">
                                                        {t.label}
                                                        {!t.free && <ProBadge />}
                                                    </p>
                                                    <p className="text-[11px] leading-tight text-neutral-500">{t.desc}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Colores: libres, los decide el cliente */}
                                <div className="mt-7">
                                    <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-[13px] font-semibold text-neutral-700">Tus colores</p>
                                        <button
                                            type="button"
                                            onClick={() => setPalette({ background: cfg.palette.text, text: cfg.palette.background })}
                                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
                                        >
                                            <Icon name="swap_vert" className="text-base" />
                                            Invertir fondo y texto
                                        </button>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {COLOR_FIELDS.map((c) => (
                                            <ColorField key={c.key} label={c.label} hint={c.hint} value={cfg.palette[c.key]} onChange={(v) => setPalette({ [c.key]: v })} />
                                        ))}
                                    </div>
                                    {contrastRatio(cfg.palette.text, cfg.palette.background) < 4.5 && (
                                        <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-800">
                                            <Icon name="info" className="text-base" />
                                            El texto y el fondo se parecen mucho y puede costar leerlo. Prueba un texto más claro o más oscuro.
                                        </p>
                                    )}
                                </div>

                                <div className="mt-7 grid gap-6 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                        <p className="mb-2.5 text-[13px] font-semibold text-neutral-700">Tipografía</p>
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                            {FONTS.map((f) => (
                                                <button
                                                    key={f.id}
                                                    type="button"
                                                    onClick={() => setCfg({ font_pair: f.id })}
                                                    className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2 text-left transition ${cfg.font_pair === f.id ? 'border-[#D42410] bg-[#FFF4F2]' : 'border-black/[0.07] hover:border-black/20'}`}
                                                >
                                                    <span className="text-2xl font-semibold" style={{ fontFamily: f.title }}>Aa</span>
                                                    <span className="text-[13px] font-semibold">{f.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <p className="mb-2.5 text-[13px] font-semibold text-neutral-700">Botones</p>
                                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                                            {BUTTONS.map((b) => (
                                                <button
                                                    key={b.id}
                                                    type="button"
                                                    onClick={() => setCfg({ button_style: b.id })}
                                                    className={`flex flex-col items-center gap-2 rounded-xl border-2 px-2 py-3 transition ${cfg.button_style === b.id ? 'border-[#D42410] bg-[#FFF4F2]' : 'border-black/[0.07] hover:border-black/20'}`}
                                                >
                                                    <ButtonSample kind={b.id} />
                                                    <span className="text-[11px] font-semibold">{b.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="mb-2.5 text-[13px] font-semibold text-neutral-700">Esquinas</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            {RADII.map((r) => (
                                                <button
                                                    key={r.id}
                                                    type="button"
                                                    onClick={() => setCfg({ corner_radius: r.id })}
                                                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-1 py-2 transition ${cfg.corner_radius === r.id ? 'border-[#D42410] bg-[#FFF4F2]' : 'border-black/[0.07] hover:border-black/20'}`}
                                                >
                                                    <span className="h-4 w-9 border-2 border-neutral-800" style={{ borderRadius: r.id === '999px' ? 999 : r.id === '24px' ? 7 : r.id === '12px' ? 4 : 0 }} />
                                                    <span className="text-[11px] font-semibold">{r.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="mb-2.5 text-[13px] font-semibold text-neutral-700">Forma de la foto</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {AVATARS.map((a) => (
                                                <button
                                                    key={a.id}
                                                    type="button"
                                                    onClick={() => setCfg({ avatar_shape: a.id })}
                                                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-1 py-2 transition ${cfg.avatar_shape === a.id ? 'border-[#D42410] bg-[#FFF4F2]' : 'border-black/[0.07] hover:border-black/20'}`}
                                                >
                                                    <span className={`h-5 w-5 bg-neutral-800 ${a.cls}`} />
                                                    <span className="text-[11px] font-semibold">{a.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-7">
                                    <Switch checked={form.is_public} onChange={(v) => set('is_public', v)} label="Space público" desc="Si lo apagas, nadie podrá verlo." />
                                </div>

                                <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-black/[0.06] pt-5">
                                    {profileDirty && profileState === 'idle' && (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                                            Cambios sin guardar
                                        </span>
                                    )}
                                    <SaveButton type="submit" state={profileState} dirty={profileDirty}>
                                        Guardar perfil y diseño
                                    </SaveButton>
                                </div>
                            </Section>
                        </form>

                        {/* ---------- Bloques ---------- */}
                        <Section
                            step={4}
                            icon="add_link"
                            title="Enlaces y botones"
                            desc="Tus redes, WhatsApp, sitio web… en el orden que quieras."
                        >
                            <div className="flex flex-wrap gap-2">
                                {ADDABLE.map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => addBlock(t)}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-2 text-[13px] font-semibold text-neutral-800 transition hover:-translate-y-0.5 hover:border-[#D42410] hover:text-[#D42410]"
                                    >
                                        <Icon name={BLOCK_TYPES[t].icon} className="text-lg" />
                                        {BLOCK_TYPES[t].label}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-5 space-y-3">
                                {blocks.length === 0 && (
                                    <div className="rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-neutral-500">
                                        Aún no tienes enlaces. Agrega el primero con los botones de arriba.
                                    </div>
                                )}

                                {blocks.map((b, i) => {
                                    const rich = RICH_LABELS[b.type];
                                    const def = BLOCK_TYPES[b.type] || { label: rich, icon: 'auto_awesome_mosaic' };
                                    return (
                                        <div
                                            key={b._key}
                                            className={`flex gap-3 rounded-2xl border p-3 transition sm:p-4 ${b.is_active ? 'border-black/[0.08] bg-white' : 'border-dashed border-black/10 bg-neutral-50 opacity-70'}`}
                                        >
                                            <div className="flex flex-col items-center gap-0.5">
                                                <button type="button" onClick={() => moveBlock(i, -1)} disabled={i === 0} aria-label="Subir" className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30">
                                                    <Icon name="keyboard_arrow_up" className="text-xl" />
                                                </button>
                                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D42410]/[0.08] text-[#D42410]">
                                                    <Icon name={def.icon} className="text-lg" />
                                                </span>
                                                <button type="button" onClick={() => moveBlock(i, 1)} disabled={i === blocks.length - 1} aria-label="Bajar" className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30">
                                                    <Icon name="keyboard_arrow_down" className="text-xl" />
                                                </button>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">{def.label}</p>
                                                {rich ? (
                                                    <p className="text-sm text-neutral-700">
                                                        <span className="font-semibold">{b.heading || rich}</span>
                                                        <span className="block text-xs text-neutral-500">Sección creada con IA. Puedes moverla, ocultarla o quitarla.</span>
                                                    </p>
                                                ) : (
                                                    <div className={`grid gap-2 ${b.type === 'header' ? '' : 'sm:grid-cols-[1fr_1.4fr]'}`}>
                                                        <input
                                                            className={inputCls}
                                                            value={b.label || ''}
                                                            onChange={(e) => updateBlock(i, { label: e.target.value })}
                                                            placeholder={b.type === 'header' ? 'Título de la sección' : 'Texto del botón'}
                                                        />
                                                        {b.type !== 'header' && (
                                                            <input
                                                                className={inputCls}
                                                                value={b.url || ''}
                                                                onChange={(e) => updateBlock(i, { url: e.target.value })}
                                                                placeholder={def.placeholder}
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => updateBlock(i, { is_active: !b.is_active })}
                                                    aria-label={b.is_active ? 'Ocultar' : 'Mostrar'}
                                                    title={b.is_active ? 'Ocultar en el Space' : 'Mostrar en el Space'}
                                                    className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
                                                >
                                                    <Icon name={b.is_active ? 'visibility' : 'visibility_off'} className="text-lg" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeBlock(i)}
                                                    aria-label="Eliminar"
                                                    title="Eliminar"
                                                    className="flex h-9 w-9 items-center justify-center rounded-full text-[#D42410] transition hover:bg-[#FFF4F2]"
                                                >
                                                    <Icon name="delete" className="text-lg" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-black/[0.06] pt-5">
                                {blocksDirty && blocksState === 'idle' && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                                        Cambios sin guardar
                                    </span>
                                )}
                                <SaveButton state={blocksState} onClick={saveBlocks} dirty={blocksDirty}>
                                    Guardar enlaces
                                </SaveButton>
                            </div>
                        </Section>
                    </div>

                    {/* ---------- Vista previa ---------- */}
                    <aside className="lg:sticky lg:top-6 lg:self-start">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D42410]">En vivo</p>
                                <h3 className="font-display text-lg font-bold">Así se ve tu Space</h3>
                            </div>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${form.is_public ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                                <Icon name={form.is_public ? 'visibility' : 'visibility_off'} className="text-sm" />
                                {form.is_public ? 'Público' : 'Oculto'}
                            </span>
                        </div>

                        <SpacePreview form={form} blocks={blocks} avatar={avatarPreview} cover={coverPreview} />

                        <div className="mt-5 grid grid-cols-2 gap-2">
                            <a
                                href={`/s/${selected.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-black"
                            >
                                <Icon name="open_in_new" className="text-base" />
                                Abrir
                            </a>
                            <button
                                type="button"
                                onClick={copyLink}
                                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-black/15 bg-white px-4 py-2.5 text-[13px] font-semibold text-neutral-900 transition hover:border-neutral-900"
                            >
                                <Icon name="content_copy" className="text-base" />
                                Copiar enlace
                            </button>
                        </div>
                        <p className="mt-2 truncate text-center text-[11px] text-neutral-400">{publicUrl}</p>
                    </aside>
                </div>
            )}

            {/* Barra flotante cuando hay cambios en ambas partes */}
            {profileDirty && blocksDirty && profileState === 'idle' && blocksState === 'idle' && (
                <div className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-center justify-between gap-3 rounded-full bg-[#0B0B0B] py-2 pl-5 pr-2 text-white shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:bottom-6">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                        Tienes cambios sin guardar
                    </span>
                    <button type="button" onClick={saveAll} className="inline-flex items-center gap-1.5 rounded-full bg-[#D42410] px-4 py-2 text-sm font-semibold transition hover:bg-[#B81E0C]">
                        <Icon name="save" className="text-base" />
                        Guardar todo
                    </button>
                </div>
            )}
        </section>
    );
}
