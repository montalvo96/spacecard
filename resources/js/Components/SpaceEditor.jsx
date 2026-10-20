/**
 * Componente React SpaceEditor para la edición de tarjetas de presentación digital.
 * Constructor modular de bloques de contacto, temas y previsualización de móvil en vivo.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function SpaceEditor({ spaces, userPlan }) {
    const isPro = userPlan.is_pro;
    const [selectedSpace, setSelectedSpace] = useState(spaces[0] || null);

    // Formulario de creación
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newSlug, setNewSlug] = useState('');
    const [newDisplayName, setNewDisplayName] = useState('');
    const [newHeadline, setNewHeadline] = useState('');

    // Creación con IA
    const [showAiForm, setShowAiForm] = useState(false);
    const [aiName, setAiName] = useState('');
    const [aiSlug, setAiSlug] = useState('');
    const [aiDescription, setAiDescription] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    // Límite de spaces según plan
    const canCreate = userPlan.can_create_space ?? (spaces.length < (userPlan.max_spaces ?? 1));
    const aiEnabled = userPlan.ai_enabled ?? false;

    // Estado del Space actual
    const [slug, setSlug] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [headline, setHeadline] = useState('');
    const [company, setCompany] = useState('');
    const [bio, setBio] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactWebsite, setContactWebsite] = useState('');
    
    // Tema
    const [themeTemplate, setThemeTemplate] = useState('corporate');
    const [themeConfig, setThemeConfig] = useState({
        layout: 'stack',
        background: 'solid',
        palette: { primary: '#8b5cf6', secondary: '#6b7280', background: '#0c0b14', text: '#ffffff' },
        font_pair: 'Outfit_Inter',
        button_style: 'filled',
        corner_radius: '8px',
        avatar_shape: 'circle'
    });
    
    const [isPublic, setIsPublic] = useState(true);
    const [showBranding, setShowBranding] = useState(true);

    // Bloques
    const [blocks, setBlocks] = useState([]);

    // Imágenes
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);

    // Cargar datos del Space seleccionado
    useEffect(() => {
        if (!selectedSpace) return;
        setSlug(selectedSpace.slug || '');
        setDisplayName(selectedSpace.display_name || '');
        setHeadline(selectedSpace.headline || '');
        setCompany(selectedSpace.company || '');
        setBio(selectedSpace.bio || '');
        setContactPhone(selectedSpace.contact_phone || '');
        setContactEmail(selectedSpace.contact_email || '');
        setContactWebsite(selectedSpace.contact_website || '');
        setThemeTemplate(selectedSpace.theme_template || 'corporate');
        
        const defaultThemeConfig = {
            layout: 'stack',
            background: 'solid',
            palette: { primary: '#8b5cf6', secondary: '#6b7280', background: '#0c0b14', text: '#ffffff' },
            font_pair: 'Outfit_Inter',
            button_style: 'filled',
            corner_radius: '8px',
            avatar_shape: 'circle'
        };
        setThemeConfig(selectedSpace.theme_config || defaultThemeConfig);
        setIsPublic(selectedSpace.is_public !== false);
        setShowBranding(selectedSpace.show_branding !== false);
        setAvatarPreview(selectedSpace.avatar_url || null);
        setCoverPreview(selectedSpace.cover_url || null);
        setAvatarFile(null);
        setCoverFile(null);

        // Fetch bloques del Space (si los queremos cargar dinámicamente)
        // O si ya vienen incluidos en la relación si cargamos la relación en el controlador
        // En nuestro controller, pusimos $user->spaces()->get() sin bloques.
        // Haremos que la relación cargue bloques inyectados, o simplemente si vienen en spaces
        // Modificaremos la carga en el DashboardController si es necesario, pero asumimos que $selectedSpace viene con blocks.
        // Verificamos si selectedSpace tiene blocks
        setBlocks(selectedSpace.blocks || []);
    }, [selectedSpace]);

    const handleCreateSpace = (e) => {
        e.preventDefault();
        router.post('/spaces', {
            slug: newSlug,
            display_name: newDisplayName,
            headline: newHeadline,
        }, {
            onSuccess: () => {
                setShowCreateForm(false);
                setNewSlug('');
                setNewDisplayName('');
                setNewHeadline('');
            }
        });
    };

    const handleGenerateAi = (e) => {
        e.preventDefault();
        setAiLoading(true);
        router.post('/spaces/ai-generate', {
            display_name: aiName,
            slug: aiSlug,
            description: aiDescription,
        }, {
            preserveScroll: true,
            onFinish: () => setAiLoading(false),
            onSuccess: () => {
                setShowAiForm(false);
                setAiName('');
                setAiSlug('');
                setAiDescription('');
            },
        });
    };

    const handleUpdateSpace = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('slug', slug);
        formData.append('display_name', displayName);
        formData.append('headline', headline || '');
        formData.append('company', company || '');
        formData.append('bio', bio || '');
        formData.append('contact_phone', contactPhone || '');
        formData.append('contact_email', contactEmail || '');
        formData.append('contact_website', contactWebsite || '');
        formData.append('theme_template', themeTemplate);
        formData.append('theme_config', JSON.stringify(themeConfig));
        formData.append('is_public', isPublic ? '1' : '0');
        formData.append('show_branding', showBranding ? '1' : '0');

        if (avatarFile) formData.append('avatar', avatarFile);
        if (coverFile) formData.append('cover', coverFile);

        router.post(`/spaces/${selectedSpace.id}`, formData, {
            onSuccess: () => {
                // Forzar refresco
            }
        });
    };

    // Bloques CRUD locales
    const addBlock = (type) => {
        const newBlock = {
            id: null,
            type: type,
            label: type === 'header' ? 'Nueva Sección' : 'Nuevo Enlace',
            url: type === 'header' ? null : 'https://',
            icon: type === 'social' ? 'link' : null,
            is_active: true,
            position: blocks.length
        };
        setBlocks([...blocks, newBlock]);
    };

    const updateBlockField = (index, field, value) => {
        const updated = [...blocks];
        updated[index][field] = value;
        setBlocks(updated);
    };

    const removeBlock = (index) => {
        const updated = [...blocks];
        updated.splice(index, 1);
        setBlocks(updated);
    };

    const moveBlock = (index, direction) => {
        const updated = [...blocks];
        if (direction === 'up' && index > 0) {
            const temp = updated[index];
            updated[index] = updated[index - 1];
            updated[index - 1] = temp;
        } else if (direction === 'down' && index < blocks.length - 1) {
            const temp = updated[index];
            updated[index] = updated[index + 1];
            updated[index + 1] = temp;
        }
        setBlocks(updated);
    };

    const saveAllBlocks = () => {
        router.post(`/spaces/${selectedSpace.id}/blocks`, {
            blocks: blocks
        });
    };

    // Temas Preset Configs
    const applyPresetTheme = (template) => {
        setThemeTemplate(template);
        let config = { ...themeConfig };
        
        switch (template) {
            case 'aurora':
                config.layout = 'stack';
                config.background = 'mesh';
                config.palette = { primary: '#ec4899', secondary: '#8b5cf6', background: '#0a0915', text: '#ffffff' };
                config.button_style = 'glass';
                config.corner_radius = '16px';
                config.avatar_shape = 'squircle';
                break;
            case 'bento':
                config.layout = 'bento';
                config.background = 'solid';
                config.palette = { primary: '#6366f1', secondary: '#1e293b', background: '#f8fafc', text: '#0f172a' };
                config.button_style = 'filled';
                config.corner_radius = '24px';
                config.avatar_shape = 'circle';
                break;
            case 'editorial':
                config.layout = 'stack';
                config.background = 'solid';
                config.palette = { primary: '#111827', secondary: '#6b7280', background: '#fafaf9', text: '#1c1917' };
                config.button_style = 'outline';
                config.corner_radius = '0px';
                config.avatar_shape = 'square';
                break;
            case 'neon':
                config.layout = 'stack';
                config.background = 'solid';
                config.palette = { primary: '#39ff14', secondary: '#00ffff', background: '#050508', text: '#f3f4f6' };
                config.button_style = 'glass';
                config.corner_radius = '12px';
                config.avatar_shape = 'circle';
                break;
            case 'corporate':
                config.layout = 'stack';
                config.background = 'solid';
                config.palette = { primary: '#1e3a8a', secondary: '#475569', background: '#ffffff', text: '#0f172a' };
                config.button_style = 'filled';
                config.corner_radius = '8px';
                config.avatar_shape = 'circle';
                break;
        }
        setThemeConfig(config);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna Izquierda: Listado y Perfil */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Cabecera / Selector */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-none">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Mis Spaces Digitales
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {(userPlan.spaces_used ?? spaces.length)} / {userPlan.max_spaces ?? 1} usados
                                {' · '}Plan {isPro ? 'Pro' : 'Free'}
                            </p>
                        </div>
                        {!showCreateForm && !showAiForm && canCreate && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAiForm(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                                >
                                    ✨ Crear con IA
                                </button>
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    className="px-4 py-2 border border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-xl text-xs font-semibold"
                                >
                                    + Manual
                                </button>
                            </div>
                        )}
                        {!canCreate && (
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium text-right max-w-[220px]">
                                Alcanzaste el límite de {userPlan.max_spaces ?? 1} Space{(userPlan.max_spaces ?? 1) > 1 ? 's' : ''}
                                {!isPro && ' · Haz upgrade a Pro para 3'}
                            </span>
                        )}
                    </div>

                    {/* Formulario de creación con IA */}
                    {showAiForm && (
                        <form onSubmit={handleGenerateAi} className="space-y-4 p-4 mb-4 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-900/10">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">✨</span>
                                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Generar Space con IA</h4>
                            </div>
                            {!aiEnabled && (
                                <p className="text-xs text-amber-600 dark:text-amber-400">
                                    La IA aún no está configurada (falta ANTHROPIC_API_KEY). Puedes llenar el formulario; se activará al configurarla.
                                </p>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Nombre para mostrar</label>
                                    <input type="text" value={aiName} onChange={(e) => setAiName(e.target.value)}
                                        className="w-full text-xs p-2.5 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Ana Torres" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Slug URL (/s/{aiSlug})</label>
                                    <input type="text" value={aiSlug} onChange={(e) => setAiSlug(e.target.value)}
                                        className="w-full text-xs p-2.5 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="ana-torres" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Describe quién eres o qué haces</label>
                                <textarea value={aiDescription} onChange={(e) => setAiDescription(e.target.value)} rows={4}
                                    className="w-full text-xs p-2.5 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Ej: Soy coach de ventas B2B. Ayudo a equipos comerciales a cerrar más rápido con un método propio. Doy sesiones 1:1 y talleres in-company."
                                    minLength={20} required />
                                <p className="text-[11px] text-gray-400 mt-1">La IA generará headline, bio, tema y secciones (diferenciadores, pasos, FAQ...).</p>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowAiForm(false)}
                                    className="px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs dark:text-gray-300">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={aiLoading}
                                    className="px-4 py-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg text-xs font-semibold disabled:opacity-60 flex items-center gap-1">
                                    {aiLoading ? 'Generando…' : '✨ Generar Space'}
                                </button>
                            </div>
                        </form>
                    )}

                    {showCreateForm ? (
                        <form onSubmit={handleCreateSpace} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-950/20 rounded-xl border border-gray-100 dark:border-gray-800">
                            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Crear Nueva Tarjeta de Presentación</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Slug URL (/s/{newSlug})</label>
                                    <input
                                        type="text"
                                        value={newSlug}
                                        onChange={(e) => setNewSlug(e.target.value)}
                                        className="w-full text-xs p-2.5 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="maria-lopez"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Nombre para mostrar</label>
                                    <input
                                        type="text"
                                        value={newDisplayName}
                                        onChange={(e) => setNewDisplayName(e.target.value)}
                                        className="w-full text-xs p-2.5 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="María López"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs dark:text-gray-300"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-semibold"
                                >
                                    Crear
                                </button>
                            </div>
                        </form>
                    ) : (
                        spaces.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {spaces.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedSpace(s)}
                                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                                            selectedSpace?.id === s.id
                                                ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/10'
                                                : 'bg-white border-gray-200 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                                        }`}
                                    >
                                        {s.display_name} (/s/{s.slug})
                                    </button>
                                ))}
                            </div>
                        )
                    )}
                </div>

                {/* Formulario Perfil y Diseño */}
                {selectedSpace && (
                    <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-none space-y-8">
                        <form onSubmit={handleUpdateSpace} className="space-y-6">
                            <h4 className="text-md font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
                                Editar Perfil
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Slug URL</label>
                                            <input
                                                type="text"
                                                value={slug}
                                                onChange={(e) => setSlug(e.target.value)}
                                                className="w-full text-sm p-3 border border-gray-200 rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Nombre de Perfil</label>
                                            <input
                                                type="text"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                className="w-full text-sm p-3 border border-gray-200 rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Cargo / Headline</label>
                                            <input
                                                type="text"
                                                value={headline}
                                                onChange={(e) => setHeadline(e.target.value)}
                                                className="w-full text-sm p-3 border border-gray-200 rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                placeholder="Ej: Director Creativo"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Empresa</label>
                                            <input
                                                type="text"
                                                value={company}
                                                onChange={(e) => setCompany(e.target.value)}
                                                className="w-full text-sm p-3 border border-gray-200 rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                placeholder="Ej: Avaspace"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Biografía / Bio</label>
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            rows="3"
                                            className="w-full text-sm p-3 border border-gray-200 rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Imagen de Perfil (Avatar)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setAvatarFile(file);
                                                    setAvatarPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                            className="w-full text-xs text-gray-500 p-2 border border-gray-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Imagen de Portada (Cover)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setCoverFile(file);
                                                    setCoverPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                            className="w-full text-xs text-gray-500 p-2 border border-gray-200 rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>

                            <h4 className="text-md font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pt-4 pb-2">
                                Datos de Contacto Directo (vCard / Botón Guardar Contacto)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
                                    <input
                                        type="tel"
                                        value={contactPhone}
                                        onChange={(e) => setContactPhone(e.target.value)}
                                        className="w-full text-sm p-3 border border-gray-200 rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="+52 1 123 456 7890"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Correo electrónico</label>
                                    <input
                                        type="email"
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                        className="w-full text-sm p-3 border border-gray-200 rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="hola@empresa.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Sitio Web</label>
                                    <input
                                        type="url"
                                        value={contactWebsite}
                                        onChange={(e) => setContactWebsite(e.target.value)}
                                        className="w-full text-sm p-3 border border-gray-200 rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="https://empresa.com"
                                    />
                                </div>
                            </div>

                            <h4 className="text-md font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pt-4 pb-2">
                                Selección del Tema Visual
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {[
                                    { id: 'corporate', label: 'Corporate', free: true },
                                    { id: 'editorial', label: 'Editorial', free: true },
                                    { id: 'aurora', label: 'Aurora (Mesh)', free: false },
                                    { id: 'bento', label: 'Bento Grid', free: false },
                                    { id: 'neon', label: 'Neon Glow', free: false },
                                ].map((theme) => {
                                    const disabled = !isPro && !theme.free;
                                    return (
                                        <button
                                            key={theme.id}
                                            type="button"
                                            disabled={disabled}
                                            onClick={() => applyPresetTheme(theme.id)}
                                            className={`p-3 rounded-xl border font-semibold text-xs transition-all relative flex flex-col items-center justify-center gap-1 ${
                                                disabled 
                                                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700' 
                                                    : themeTemplate === theme.id
                                                    ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/10'
                                                    : 'bg-white border-gray-200 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {theme.label}
                                            {!theme.free && (
                                                <span className="text-[9px] bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 px-1 py-0.5 rounded font-bold uppercase">
                                                    Pro
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex gap-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_public"
                                            checked={isPublic}
                                            onChange={(e) => setIsPublic(e.target.checked)}
                                            className="h-4 w-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                                        />
                                        <label htmlFor="is_public" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Space Público</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="show_branding"
                                            disabled={!isPro}
                                            checked={showBranding}
                                            onChange={(e) => setShowBranding(e.target.checked)}
                                            className="h-4 w-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500 disabled:opacity-50"
                                        />
                                        <label htmlFor="show_branding" className="ml-2 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50">
                                            Mostrar Branding Avaspace {!isPro && '(Pro)'}
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-violet-500/20"
                                >
                                    Guardar Perfil y Tema
                                </button>
                            </div>
                        </form>

                        {/* Modificador de Bloques Dinámicos */}
                        <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="text-md font-bold text-gray-900 dark:text-white">
                                        Bloques del Space
                                    </h4>
                                    <p className="text-xs text-gray-400">
                                        Añade cabeceras, enlaces directos, WhatsApp o enlaces sociales en el orden que prefieras.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => addBlock('header')}
                                        className="px-3 py-1.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 text-xs font-semibold"
                                    >
                                        + Cabecera
                                    </button>
                                    <button
                                        onClick={() => addBlock('link')}
                                        className="px-3 py-1.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 text-xs font-semibold"
                                    >
                                        + Enlace
                                    </button>
                                    <button
                                        onClick={() => addBlock('social')}
                                        className="px-3 py-1.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 text-xs font-semibold"
                                    >
                                        + Red Social
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {blocks.map((block, index) => (
                                    <div key={index} className="flex gap-4 items-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <div className="flex flex-col gap-1">
                                            <button type="button" onClick={() => moveBlock(index, 'up')} className="text-gray-400 hover:text-gray-700">▲</button>
                                            <button type="button" onClick={() => moveBlock(index, 'down')} className="text-gray-400 hover:text-gray-700">▼</button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-grow">
                                            <div>
                                                <span className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Tipo: {block.type}</span>
                                                <input
                                                    type="text"
                                                    value={block.label}
                                                    onChange={(e) => updateBlockField(index, 'label', e.target.value)}
                                                    placeholder="Etiqueta del botón"
                                                    className="w-full text-xs p-2 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    required
                                                />
                                            </div>
                                            {block.type !== 'header' && (
                                                <div className="md:col-span-2">
                                                    <span className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Enlace / URL</span>
                                                    <input
                                                        type="text"
                                                        value={block.url || ''}
                                                        onChange={(e) => updateBlockField(index, 'url', e.target.value)}
                                                        placeholder={block.type === 'whatsapp' ? 'https://wa.me/...' : 'https://...'}
                                                        className="w-full text-xs p-2 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                        required
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeBlock(index)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}

                                {blocks.length > 0 && (
                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="button"
                                            onClick={saveAllBlocks}
                                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-500/20"
                                        >
                                            Guardar Estructura de Bloques
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Columna Derecha: Preview Móvil */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Preview en Vivo
                </h3>
                <div className="flex justify-center">
                    {/* Estructura del teléfono celular ficticio */}
                    <div className="w-[300px] h-[600px] bg-black border-[10px] border-gray-800 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col select-none">
                        {/* Cámara/Cápsula */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-gray-800 rounded-full z-20"></div>
                        
                        {/* Contenedor Interno de la Tarjeta */}
                        <div 
                            className="flex-grow overflow-y-auto p-4 pt-8 flex flex-col items-center relative text-center"
                            style={{
                                backgroundColor: themeConfig.palette.background || '#0c0b14',
                                color: themeConfig.palette.text || '#ffffff',
                                backgroundImage: themeTemplate === 'aurora' 
                                    ? 'radial-gradient(circle at 10% 20%, rgba(236, 72, 153, 0.25) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.25) 0%, transparent 40%)'
                                    : 'none'
                            }}
                        >
                            {/* Portada */}
                            {coverPreview ? (
                                <div className="absolute top-0 left-0 w-full h-20 bg-cover bg-center opacity-70" style={{ backgroundImage: `url(${coverPreview})` }}></div>
                            ) : (
                                <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-violet-950 to-indigo-950 opacity-40"></div>
                            )}

                            {/* Avatar */}
                            <div className="mt-10 relative z-10">
                                <img
                                    src={avatarPreview || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'}
                                    alt="Avatar"
                                    className={`w-16 h-16 border-2 border-white object-cover ${
                                        themeConfig.avatar_shape === 'squircle' 
                                            ? 'rounded-2xl' 
                                            : themeConfig.avatar_shape === 'square'
                                            ? 'rounded-none'
                                            : 'rounded-full'
                                    }`}
                                />
                            </div>

                            <div className="mt-3 relative z-10">
                                <h5 className="font-bold text-sm" style={{ fontFamily: themeConfig.font_pair.split('_')[0] }}>
                                    {displayName || 'Tu Nombre'}
                                </h5>
                                <p className="text-[10px] text-gray-400">{headline || 'Tu Cargo / Especialidad'}</p>
                                <p className="text-[9px] text-gray-500 font-semibold">{company || 'Tu Empresa'}</p>
                            </div>

                            {bio && (
                                <p className="text-[10px] mt-2 max-w-xs text-gray-300 leading-normal px-2">
                                    {bio}
                                </p>
                            )}

                            {/* Botón Guardar Contacto (vCard) */}
                            {(contactPhone || contactEmail || contactWebsite) && (
                                <button
                                    type="button"
                                    className="mt-4 w-full py-2.5 px-3 text-[11px] font-bold tracking-wide uppercase transition-all"
                                    style={{
                                        background: themeConfig.palette.primary,
                                        color: '#ffffff',
                                        borderRadius: themeConfig.corner_radius,
                                    }}
                                >
                                    Guardar Contacto
                                </button>
                            )}

                            {/* Bloques Dinámicos */}
                            <div className="w-full mt-4 flex flex-col gap-2">
                                {blocks.filter(b => b.is_active).map((block, index) => {
                                    if (block.type === 'header') {
                                        return (
                                            <div key={index} className="text-left font-bold text-[10px] uppercase text-gray-400 mt-2 px-1">
                                                {block.label}
                                            </div>
                                        );
                                    }

                                    // Renderizado de botón
                                    const buttonStyle = themeConfig.button_style;
                                    let style = {
                                        borderRadius: themeConfig.corner_radius,
                                        fontSize: '11px',
                                        fontWeight: '600'
                                    };

                                    if (buttonStyle === 'filled') {
                                        style.background = themeConfig.palette.primary;
                                        style.color = '#ffffff';
                                        style.border = 'none';
                                    } else if (buttonStyle === 'outline') {
                                        style.background = 'transparent';
                                        style.color = themeConfig.palette.text;
                                        style.border = `1.5px solid ${themeConfig.palette.primary}`;
                                    } else if (buttonStyle === 'glass') {
                                        style.background = 'rgba(255, 255, 255, 0.08)';
                                        style.color = themeConfig.palette.text;
                                        style.border = '1px solid rgba(255, 255, 255, 0.15)';
                                        style.backdropFilter = 'blur(10px)';
                                    } else { // soft
                                        style.background = 'rgba(139, 92, 246, 0.15)';
                                        style.color = themeConfig.palette.primary;
                                        style.border = 'none';
                                    }

                                    return (
                                        <div
                                            key={index}
                                            className="w-full py-2.5 px-3 flex justify-between items-center cursor-pointer hover:scale-[1.01] active:scale-95 transition-all"
                                            style={style}
                                        >
                                            <span>{block.label}</span>
                                            <span className="opacity-40">➔</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Branding de Avaspace */}
                            {showBranding && (
                                <div className="mt-auto pt-6 text-[9px] text-gray-500 font-semibold">
                                    Hecho con <span className="text-violet-500">SpaceCard</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
