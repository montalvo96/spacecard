/**
 * Vista del Dashboard de Administración (Avaspace) en React + Inertia.
 * Permite crear lotes manuales, gestionar planes de usuarios y procesar órdenes de compra.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BatchCard from '@/Components/BatchCard';
import OrdersPanel from '@/Components/OrdersPanel';
import { Head, router } from '@inertiajs/react';

export default function AdminDashboard({ batches, users, orders, stats, currentUserId }) {
    const [activeTab, setActiveTab] = useState('batches');
    const [openBatch, setOpenBatch] = useState(null);      // lote con el checklist abierto
    const [usedCounts, setUsedCounts] = useState({});      // utilizadas, actualizadas en vivo

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

    const handleToggleAdmin = (user) => {
        const accion = user.is_admin ? 'quitar acceso de administrador a' : 'hacer administrador a';
        if (confirm(`¿Seguro que quieres ${accion} ${user.name}?`)) {
            router.post(`/admin/users/${user.id}/toggle-admin`, {}, { preserveScroll: true });
        }
    };

    const roleBadge = (user) => {
        // Solo dos roles: administrador y cliente.
        if (user.is_admin) return { label: 'Administrador', cls: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300' };
        return { label: 'Cliente', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' };
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Consola de Administración - Avaspace
                </h2>
            }
        >
            <Head title="Admin Panel - SpaceCard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Estadísticas de Dispositivos */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800">
                            <span className="text-xs font-semibold text-gray-400 block mb-1">Total Dispositivos</span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_devices}</span>
                        </div>
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800">
                            <span className="text-xs font-semibold text-emerald-600 block mb-1">En Stock (Sin dueño)</span>
                            <span className="text-2xl font-bold text-emerald-600">{stats.stock_devices}</span>
                        </div>
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800">
                            <span className="text-xs font-semibold text-indigo-600 block mb-1">Reclamados (Activos)</span>
                            <span className="text-2xl font-bold text-indigo-600">{stats.claimed_devices}</span>
                        </div>
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800">
                            <span className="text-xs font-semibold text-red-500 block mb-1">Desactivados</span>
                            <span className="text-2xl font-bold text-red-500">{stats.disabled_devices}</span>
                        </div>
                    </div>

                    {/* Selector de Pestañas Administrativas */}
                    <div className="flex flex-wrap gap-x-8 overflow-x-auto bg-white px-6 shadow-sm sm:rounded-lg dark:bg-gray-800">
                        {[
                            { id: 'batches', label: 'Lotes de Manufactura' },
                            { id: 'orders', label: 'Órdenes de Compra' },
                            { id: 'users', label: 'Usuarios y Planes' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`inline-flex items-center border-b-2 px-1 py-4 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ${
                                    activeTab === tab.id
                                        ? 'border-indigo-400 text-gray-900 dark:border-indigo-600 dark:text-gray-100'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300'
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
                                <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800 space-y-6 h-fit">
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
                                                className="w-full p-3 text-sm rounded-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de producto</label>
                                                <select
                                                    value={type}
                                                    onChange={(e) => setType(e.target.value)}
                                                    className="w-full p-3 text-sm rounded-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                >
                                                    <option value="card">Tarjeta</option>
                                                    <option value="bracelet">Pulsera</option>
                                                    <option value="review_plate">Placa de reseñas</option>
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
                                                    className="w-full p-3 text-sm rounded-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                                                className="w-full p-3 text-sm rounded-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            ></textarea>
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-white rounded-md text-sm font-semibold"
                                        >
                                            Generar Lote
                                        </button>
                                    </form>
                                </div>

                                {/* Lista de Lotes */}
                                <div className="lg:col-span-2 space-y-4">
                                    <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800">
                                        <div className="mb-4 flex items-center justify-between gap-3">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lotes de manufactura</h3>
                                            <span className="text-xs text-gray-500">{batches.length} lote(s)</span>
                                        </div>

                                        {/* Guía rápida del flujo: 3 pasos siempre visibles */}
                                        <div className="mb-5 rounded-2xl bg-[#FFF4F2] p-4">
                                            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[#B81E0C]">
                                                <span aria-hidden="true" className="ms text-lg">help</span> ¿Cómo funciona un lote?
                                            </p>
                                            <ol className="grid gap-2 sm:grid-cols-3">
                                                {[
                                                    { n: 1, icon: 'print', t: 'Imprimir', d: 'Descarga el ZIP, mándalo a imprenta y marca las tarjetas como impresas.' },
                                                    { n: 2, icon: 'local_shipping', t: 'Enviar', d: 'Cuando salgan o las entregues, márcalas como enviadas.' },
                                                    { n: 3, icon: 'verified_user', t: 'Reclamar o sellar', d: 'Se marca sola cuando el cliente la escanea y la vincula a su cuenta. Si la entregaste tú, séllala.' },
                                                ].map((s) => (
                                                    <li key={s.n} className="rounded-xl bg-white p-3 ring-1 ring-black/[0.05]">
                                                        <p className="flex items-center gap-2 text-xs font-bold text-neutral-900">
                                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D42410] text-[11px] text-white">{s.n}</span>
                                                            <span aria-hidden="true" className="ms text-base text-neutral-500">{s.icon}</span> {s.t}
                                                        </p>
                                                        <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-600">{s.d}</p>
                                                    </li>
                                                ))}
                                            </ol>
                                            <p className="mt-3 flex items-start gap-1.5 text-[11px] text-neutral-600">
                                                <span aria-hidden="true" className="ms text-sm">tips_and_updates</span>
                                                Cada tarjeta tiene sus botones para marcarla sola. Para hacerlo con muchas, selecciónalas (o «Seleccionar todas»). Un lote se puede eliminar mientras ninguna tarjeta se haya enviado, sellado o reclamado.
                                            </p>
                                        </div>

                                        {batches.length === 0 ? (
                                            <div className="py-8 text-center text-gray-400 text-sm">Sin lotes. Crea uno con el formulario de la izquierda.</div>
                                        ) : (
                                            <div className="space-y-4">
                                                {batches.map((batch) => (
                                                    <BatchCard
                                                        key={batch.id}
                                                        batch={batch}
                                                        open={openBatch === batch.id}
                                                        onToggle={() => setOpenBatch(openBatch === batch.id ? null : batch.id)}
                                                        usedOverride={usedCounts[batch.id]}
                                                        onUsedChange={(n) => setUsedCounts((c) => ({ ...c, [batch.id]: n }))}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pestaña: Órdenes de Compra (Ecommerce) */}
                        {activeTab === 'orders' && <OrdersPanel orders={orders} />}

                        {/* Pestaña: Usuarios y Planes */}
                        {activeTab === 'users' && (
                            <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Usuarios Registrados {stats.total_users ? `(${stats.total_users})` : ''}
                                    </h3>
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
                                                    <span>Plan: <span className="capitalize font-bold text-indigo-600">{user.plan}</span></span>
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
                                                {user.id !== currentUserId && (
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
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-500/75 dark:bg-gray-900/75">
                            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
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
                                            className="w-full p-3 rounded-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                                                className="w-full p-3 rounded-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                required
                                            />
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowUserModal(false)}
                                            className="w-1/2 py-3 border border-gray-200 dark:border-gray-600 dark:text-gray-300 rounded-md font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="w-1/2 py-3 bg-gray-800 hover:bg-gray-700 text-white dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-white rounded-md font-semibold text-sm"
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
