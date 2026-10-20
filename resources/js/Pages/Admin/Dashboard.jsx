/**
 * Vista del Dashboard de Administración (Avaspace) en React + Inertia.
 * Permite crear lotes manuales, gestionar planes de usuarios y procesar órdenes de compra.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function AdminDashboard({ batches, users, orders, stats, isMaster = false }) {
    const [activeTab, setActiveTab] = useState('batches');

    // Formulario de Lote Manual
    const [name, setName] = useState('');
    const [type, setType] = useState('card');
    const [quantity, setQuantity] = useState(10);
    const [notes, setNotes] = useState('');

    // Modal de usuario
    const [selectedUser, setSelectedUser] = useState(null);
    const [plan, setPlan] = useState('free');
    const [planExpiresAt, setPlanExpiresAt] = useState('');
    const [showUserModal, setShowUserModal] = useState(false);

    const handleSubmitBatch = (e) => {
        e.preventDefault();
        router.post('/admin/batches', {
            name,
            type,
            quantity,
            notes
        }, {
            onSuccess: () => {
                setName('');
                setQuantity(10);
                setNotes('');
            }
        });
    };

    const handleOpenUserModal = (user) => {
        setSelectedUser(user);
        setPlan(user.plan || 'free');
        setPlanExpiresAt(user.plan_expires_at ? user.plan_expires_at.split(' ')[0] : '');
        setShowUserModal(true);
    };

    const handleSubmitUserPlan = (e) => {
        e.preventDefault();
        router.post(`/admin/users/${selectedUser.id}/plan`, {
            plan,
            plan_expires_at: plan === 'pro' ? planExpiresAt : null
        }, {
            onSuccess: () => setShowUserModal(false)
        });
    };

    const handleProcessOrder = (orderId) => {
        if (confirm('¿Estás seguro de procesar esta orden? Se generarán los dispositivos físicos en stock con su diseño de fábrica.')) {
            router.post(`/admin/orders/${orderId}/generate`);
        }
    };

    const handleToggleAdmin = (user) => {
        const accion = user.is_admin ? 'quitar acceso de administrador a' : 'hacer administrador a';
        if (confirm(`¿Seguro que quieres ${accion} ${user.name}?`)) {
            router.post(`/admin/users/${user.id}/toggle-admin`, {}, { preserveScroll: true });
        }
    };

    const handleMarkPrinted = (batch) => {
        if (confirm(`Marcar todas las tarjetas del lote «${batch.name}» como IMPRESAS?`)) {
            router.post(`/admin/batches/${batch.id}/printed`, {}, { preserveScroll: true });
        }
    };

    const handleMarkShipped = (batch) => {
        if (confirm(`Marcar las tarjetas impresas del lote «${batch.name}» como ENVIADAS?`)) {
            router.post(`/admin/batches/${batch.id}/shipped`, {}, { preserveScroll: true });
        }
    };

    const roleBadge = (user) => {
        if (user.is_master) return { label: 'Maestro', cls: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950/40 dark:text-fuchsia-300' };
        if (user.is_admin) return { label: 'Admin', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300' };
        return { label: 'Usuario', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' };
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-gray-900 dark:text-gray-100 font-title">
                    Consola de Administración - Avaspace
                </h2>
            }
        >
            <Head title="Admin Panel - SpaceCard" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Estadísticas de Dispositivos */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-none">
                            <span className="text-xs font-semibold text-gray-400 block mb-1">Total Dispositivos</span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_devices}</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-none">
                            <span className="text-xs font-semibold text-emerald-600 block mb-1">En Stock (Sin dueño)</span>
                            <span className="text-2xl font-bold text-emerald-600">{stats.stock_devices}</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-none">
                            <span className="text-xs font-semibold text-violet-600 block mb-1">Reclamados (Activos)</span>
                            <span className="text-2xl font-bold text-violet-600">{stats.claimed_devices}</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-none">
                            <span className="text-xs font-semibold text-red-500 block mb-1">Desactivados</span>
                            <span className="text-2xl font-bold text-red-500">{stats.disabled_devices}</span>
                        </div>
                    </div>

                    {/* Selector de Pestañas Administrativas */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 pt-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50">
                        {[
                            { id: 'batches', label: 'Lotes de Manufactura' },
                            { id: 'orders', label: 'Órdenes de Compra' },
                            { id: 'users', label: 'Usuarios y Planes' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
                                    activeTab === tab.id
                                        ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                {tab.label}
                                {tab.id === 'orders' && orders.filter(o => o.status === 'paid').length > 0 && (
                                    <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-amber-500 text-white rounded-full">
                                        {orders.filter(o => o.status === 'paid').length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Contenido Dinámico de Pestañas */}
                    <div className="transition-all duration-300">
                        
                        {/* Pestaña: Lotes de Manufactura */}
                        {activeTab === 'batches' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Formulario Lote */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-none space-y-6 h-fit">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Crear Lote Genérico (Stock)
                                    </h3>
                                    <form onSubmit={handleSubmitBatch} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Nombre del Lote</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Ej: Lote Genérico Tarjetas NFC"
                                                className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de Tag</label>
                                                <select
                                                    value={type}
                                                    onChange={(e) => setType(e.target.value)}
                                                    className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                >
                                                    <option value="card">Tarjeta (Card)</option>
                                                    <option value="bracelet">Pulsera (Bracelet)</option>
                                                    <option value="review_plate">Placa de Reseñas</option>
                                                    <option value="sticker">Sticker</option>
                                                    <option value="keychain">Llavero (Keychain)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
                                                <input
                                                    type="number"
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(e.target.value)}
                                                    min="1"
                                                    max="1000"
                                                    className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Notas internas</label>
                                            <textarea
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                rows="3"
                                                className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            ></textarea>
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-violet-500/20"
                                        >
                                            Generar Lote
                                        </button>
                                    </form>
                                </div>

                                {/* Lista de Lotes */}
                                <div className="lg:col-span-2 space-y-4">
                                    <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-none">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                            Lotes Existentes ( Manufactura )
                                        </h3>
                                        {batches.length === 0 ? (
                                            <div className="py-8 text-center text-gray-400 text-sm">Sin lotes.</div>
                                        ) : (
                                            <div className="space-y-4">
                                                {batches.map((batch) => (
                                                    <div key={batch.id} className="p-4 bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700 rounded-2xl space-y-3">
                                                        <div className="flex justify-between items-start gap-4">
                                                            <div>
                                                                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{batch.name}</h4>
                                                                <p className="text-xs text-gray-400">
                                                                    Tipo: <span className="capitalize">{batch.type}</span> • Cantidad: {batch.quantity} • Creador: {batch.creator?.name}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Pipeline de producción */}
                                                        <div className="flex flex-wrap gap-2 text-[11px]">
                                                            <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                                                🖨️ Impresas: <strong>{batch.printed_count ?? 0}/{batch.devices_count ?? batch.quantity}</strong>
                                                            </span>
                                                            <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                                                📦 Enviadas: <strong>{batch.shipped_count ?? 0}/{batch.devices_count ?? batch.quantity}</strong>
                                                            </span>
                                                            <span className="px-2 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300">
                                                                ✅ Reclamadas: <strong>{batch.claimed_count ?? 0}/{batch.devices_count ?? batch.quantity}</strong>
                                                            </span>
                                                        </div>

                                                        {/* Acciones: exportar (para imprenta), marcar impreso, marcar enviado */}
                                                        <div className="flex flex-wrap gap-2">
                                                            <a
                                                                href={`/admin/batches/${batch.id}/export`}
                                                                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-500/10"
                                                            >
                                                                ⬇️ Exportar ZIP (QR + NFC)
                                                            </a>
                                                            <button
                                                                onClick={() => handleMarkPrinted(batch)}
                                                                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 rounded-xl text-xs font-semibold"
                                                            >
                                                                🖨️ Marcar impreso
                                                            </button>
                                                            <button
                                                                onClick={() => handleMarkShipped(batch)}
                                                                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
                                                            >
                                                                📦 Marcar enviado
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pestaña: Órdenes de Compra (Ecommerce) */}
                        {activeTab === 'orders' && (
                            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-none">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                                    Pedidos y Personalizaciones Recibidas
                                </h3>
                                
                                {orders.length === 0 ? (
                                    <div className="py-12 text-center text-gray-400 text-sm">
                                        No se han recibido pedidos de hardware personalizado todavía.
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {orders.map((order) => (
                                            <div 
                                                key={order.id} 
                                                className={`p-6 border rounded-2xl flex flex-col lg:flex-row justify-between gap-6 ${
                                                    order.status === 'paid' 
                                                        ? 'border-amber-200 bg-amber-50/10 dark:border-amber-900/30' 
                                                        : 'border-gray-100 bg-gray-50/10 dark:border-gray-700'
                                                }`}
                                            >
                                                {/* Detalles de envío */}
                                                <div className="space-y-3 flex-grow">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                                                            Pedido #SPC-{10000 + order.id}
                                                        </span>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                            order.status === 'paid'
                                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                        }`}>
                                                            {order.status === 'paid' ? 'Pendiente Fabricar' : 'Surtido / Completado'}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="text-xs space-y-1 text-gray-600 dark:text-gray-300">
                                                        <div><strong className="text-gray-900 dark:text-white">Cliente:</strong> {order.customer_name} ({order.customer_email})</div>
                                                        <div>
                                                            <strong className="text-gray-900 dark:text-white">Cuenta:</strong>{' '}
                                                            {order.user ? (
                                                                <span className="inline-flex items-center gap-1">
                                                                    {order.user.name}
                                                                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-bold">VINCULADA</span>
                                                                </span>
                                                            ) : (
                                                                <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 text-[10px] font-bold">INVITADO</span>
                                                            )}
                                                        </div>
                                                        <div><strong className="text-gray-900 dark:text-white">Envío:</strong> {order.shipping_address}</div>
                                                        <div><strong className="text-gray-900 dark:text-white">Fecha:</strong> {new Date(order.created_at).toLocaleString()}</div>
                                                    </div>

                                                    {/* Artículos de la orden y su diseño */}
                                                    <div className="pt-2">
                                                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Artículos a Fabricar:</h5>
                                                        <div className="space-y-3">
                                                            {order.items.map((item) => (
                                                                <div key={item.id} className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 items-center">
                                                                    <div className="text-xs">
                                                                        <span className="font-bold text-gray-900 dark:text-white capitalize">
                                                                            {item.product_type === 'review_plate' ? 'Placa Google' : item.product_type}
                                                                        </span>
                                                                        <span className="text-gray-400 ml-2">Cant: {item.quantity}</span>
                                                                    </div>

                                                                    {/* Qué imprimir: catálogo vs personalizado */}
                                                                    {item.design_config?.mode === 'preset' ? (
                                                                        <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                                                            🎴 Catálogo AVASPACE · {item.design_config.preset_name}
                                                                        </span>
                                                                    ) : item.product_type === 'card' ? (
                                                                        <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                                                                            🎨 Diseño personalizado (2 caras)
                                                                        </span>
                                                                    ) : null}
                                                                    
                                                                    {/* Mockup de color */}
                                                                    {item.color_primary && (
                                                                        <div className="flex items-center gap-1.5 text-xs">
                                                                            <span className="text-[10px] text-gray-400">Color Primario:</span>
                                                                            <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: item.color_primary }}></div>
                                                                            <span className="font-mono text-[10px]">{item.color_primary}</span>
                                                                        </div>
                                                                    )}
                                                                    {item.color_secondary && (
                                                                        <div className="flex items-center gap-1.5 text-xs">
                                                                            <span className="text-[10px] text-gray-400">Secundario:</span>
                                                                            <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: item.color_secondary }}></div>
                                                                            <span className="font-mono text-[10px]">{item.color_secondary}</span>
                                                                        </div>
                                                                    )}

                                                                    {/* Logotipo */}
                                                                    {item.logo_url && (
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px] text-gray-400">Logo:</span>
                                                                            <a 
                                                                                href={item.logo_url} 
                                                                                target="_blank" 
                                                                                className="p-1 bg-gray-100 rounded border hover:bg-gray-200"
                                                                            >
                                                                                <img src={item.logo_url} alt="Logo" className="h-6 object-contain" />
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Botón de Surtido */}
                                                <div className="flex items-center justify-end shrink-0">
                                                    {order.status === 'paid' ? (
                                                        <button
                                                            onClick={() => handleProcessOrder(order.id)}
                                                            className="py-3 px-5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/15"
                                                        >
                                                            Procesar y Generar Dispositivos
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                                            ✓ Surtido Completado
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pestaña: Usuarios y Planes */}
                        {activeTab === 'users' && (
                            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-none">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Usuarios Registrados {stats.total_users ? `(${stats.total_users})` : ''}
                                    </h3>
                                    {isMaster && (
                                        <span className="text-[11px] px-2 py-1 rounded-lg bg-fuchsia-50 dark:bg-fuchsia-950/30 text-fuchsia-700 dark:text-fuchsia-300 font-semibold">
                                            Vista de Usuario Maestro
                                        </span>
                                    )}
                                </div>
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {users.map((user) => {
                                        const badge = roleBadge(user);
                                        return (
                                        <div key={user.id} className="py-4 flex flex-wrap justify-between items-center gap-3">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user.name}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${badge.cls}`}>{badge.label}</span>
                                                </div>
                                                <span className="text-xs text-gray-400">{user.email}</span>
                                                <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-x-3">
                                                    <span>Plan: <span className="capitalize font-bold text-violet-600">{user.plan}</span></span>
                                                    <span>Tarjetas: <strong>{user.devices_count ?? 0}</strong></span>
                                                    <span>Spaces: <strong>{user.spaces_count ?? 0}</strong></span>
                                                    {user.created_at && <span>Alta: {user.created_at}</span>}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleOpenUserModal(user)}
                                                    className="px-3 py-1.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 text-xs font-semibold"
                                                >
                                                    Cambiar Plan
                                                </button>
                                                {isMaster && !user.is_master && (
                                                    <button
                                                        onClick={() => handleToggleAdmin(user)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                                            user.is_admin
                                                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 hover:bg-rose-200'
                                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 hover:bg-blue-200'
                                                        }`}
                                                    >
                                                        {user.is_admin ? 'Quitar admin' : 'Hacer admin'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Modal Usuario */}
                    {showUserModal && selectedUser && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    Modificar Plan: {selectedUser.name}
                                </h4>
                                <form onSubmit={handleSubmitUserPlan} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Plan del Usuario
                                        </label>
                                        <select
                                            value={plan}
                                            onChange={(e) => setPlan(e.target.value)}
                                            className="w-full p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="free">Free (Básico)</option>
                                            <option value="pro">Pro (Premium)</option>
                                        </select>
                                    </div>

                                    {plan === 'pro' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Fecha de Expiración
                                            </label>
                                            <input
                                                type="date"
                                                value={planExpiresAt}
                                                onChange={(e) => setPlanExpiresAt(e.target.value)}
                                                className="w-full p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                required
                                            />
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowUserModal(false)}
                                            className="w-1/2 py-3 border border-gray-200 dark:border-gray-600 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="w-1/2 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-violet-500/20"
                                        >
                                            Actualizar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
