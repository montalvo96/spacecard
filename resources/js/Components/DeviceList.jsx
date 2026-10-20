/**
 * Componente React para listar y gestionar dispositivos reclamados.
 * Permite cambiar destinos (Inertia routes) y ver detalles físicos de fábrica.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

import React, { useState } from 'react';
import { router } from '@inertiajs/react';

export default function DeviceList({ devices, spaces, reviewTargets }) {
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [activeModal, setActiveModal] = useState(null); // 'destination' | 'design' | null
    
    // Formulario destino
    const [destinationType, setDestinationType] = useState('none');
    const [externalUrl, setExternalUrl] = useState('');
    const [spaceId, setSpaceId] = useState('');
    const [reviewTargetId, setReviewTargetId] = useState('');

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
        router.post(`/devices/${selectedDevice.id}/destination`, {
            destination_type: destinationType,
            external_url: destinationType === 'external' ? externalUrl : null,
            space_id: destinationType === 'space' ? spaceId : null,
            review_target_id: destinationType === 'review' ? reviewTargetId : null,
        }, {
            onSuccess: () => setActiveModal(null)
        });
    };

    const getDestinationLabel = (device) => {
        switch (device.destination_type) {
            case 'external':
                return `Enlace externo (${device.external_url})`;
            case 'space':
                return `Space Digital (/s/${device.space?.slug})`;
            case 'review':
                return `Google Reviews (${device.review_target?.business_name})`;
            default:
                return 'Ninguno (sin configurar)';
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-none">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Mis Dispositivos
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Configura el comportamiento digital y revisa los detalles físicos de fábrica de tus tarjetas, pulseras y placas.
                    </p>
                </div>
            </div>

            {devices.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                        Aún no tienes ningún dispositivo vinculado.
                    </p>
                    <p className="text-xs text-gray-400">
                        Escanea un dispositivo físico SpaceCard o introduce su código para reclamarlo.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-700 text-xs text-gray-400 font-semibold uppercase">
                                <th className="py-4 px-2">Código</th>
                                <th className="py-4 px-2">Tipo</th>
                                <th className="py-4 px-2">Destino</th>
                                <th className="py-4 px-2 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                            {devices.map((device) => (
                                <tr key={device.id} className="text-gray-700 dark:text-gray-300">
                                    <td className="py-4 px-2 font-mono text-xs font-semibold text-gray-900 dark:text-white">
                                        {device.code}
                                    </td>
                                    <td className="py-4 px-2 capitalize">
                                        {device.type === 'review_plate' ? 'Placa Reviews' : device.type}
                                    </td>
                                    <td className="py-4 px-2 truncate max-w-xs text-xs text-gray-500 dark:text-gray-400">
                                        {getDestinationLabel(device)}
                                    </td>
                                    <td className="py-4 px-2 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openDestinationModal(device)}
                                                className="px-3 py-1.5 bg-violet-50 text-violet-700 dark:bg-violet-950/20 dark:text-violet-300 rounded-lg hover:bg-violet-100 text-xs font-semibold"
                                            >
                                                Destino
                                            </button>
                                            <button
                                                onClick={() => openDesignModal(device)}
                                                className="px-3 py-1.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 text-xs font-semibold"
                                            >
                                                Ver Diseño
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Destino */}
            {activeModal === 'destination' && selectedDevice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 dark:border-gray-700 animate-fadeIn">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Configurar acción: {selectedDevice.code}
                        </h4>
                        <form onSubmit={submitDestination} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tipo de Destino
                                </label>
                                <select
                                    value={destinationType}
                                    onChange={(e) => setDestinationType(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="none">Ninguno (Aviso público)</option>
                                    <option value="external">Redirigir a URL externa</option>
                                    {selectedDevice.type !== 'review_plate' && (
                                        <option value="space">Abrir Space Digital (Networking)</option>
                                    )}
                                    <option value="review">Abrir Google Reviews (Reviews)</option>
                                </select>
                            </div>

                            {destinationType === 'external' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        URL Externa
                                    </label>
                                    <input
                                        type="url"
                                        value={externalUrl}
                                        onChange={(e) => setExternalUrl(e.target.value)}
                                        placeholder="https://linkedin.com/in/tu-perfil"
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    />
                                </div>
                            )}

                            {destinationType === 'space' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Seleccionar Space
                                    </label>
                                    {spaces.length === 0 ? (
                                        <div className="p-3 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-300 rounded-xl">
                                            No tienes Spaces creados. Ve a la pestaña "Spaces" para crear uno.
                                        </div>
                                    ) : (
                                        <select
                                            value={spaceId}
                                            onChange={(e) => setSpaceId(e.target.value)}
                                            className="w-full p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            required
                                        >
                                            <option value="">Selecciona un Space...</option>
                                            {spaces.map(s => (
                                                <option key={s.id} value={s.id}>{s.display_name} (/s/{s.slug})</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}

                            {destinationType === 'review' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Seleccionar Negocio Conectado
                                    </label>
                                    {reviewTargets.length === 0 ? (
                                        <div className="p-3 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-300 rounded-xl">
                                            No tienes negocios conectados. Conecta uno primero en la pestaña "Reviews".
                                        </div>
                                    ) : (
                                        <select
                                            value={reviewTargetId}
                                            onChange={(e) => setReviewTargetId(e.target.value)}
                                            className="w-full p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            required
                                        >
                                            <option value="">Selecciona un negocio...</option>
                                            {reviewTargets.map(t => (
                                                <option key={t.id} value={t.id}>{t.business_name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setActiveModal(null)}
                                    className="w-1/2 py-3 border border-gray-200 dark:border-gray-600 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Cerrar
                                </button>
                                <button
                                    type="submit"
                                    className="w-1/2 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-violet-500/20"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Detalles Físicos (Solo lectura de fábrica) */}
            {activeModal === 'design' && selectedDevice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 dark:border-gray-700 animate-fadeIn">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            Especificaciones de Impresión: {selectedDevice.code}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            Detalles de la personalización física de fábrica elegidos en tu orden de compra. El hardware no admite cambios digitales de diseño tras su impresión.
                        </p>
                        
                        <div className="space-y-4">
                            {/* Caso: Sin personalización (tag de stock genérico) */}
                            {!selectedDevice.design_color_primary && !selectedDevice.design_logo_url && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-900 text-center text-xs text-gray-400 rounded-xl border">
                                    Dispositivo genérico de stock. No posee personalización física impresa.
                                </div>
                            )}

                            {/* Colores */}
                            {selectedDevice.design_color_primary && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <span className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Color Principal</span>
                                        <div className="flex items-center gap-2">
                                            <div 
                                                className="w-6 h-6 rounded-md border" 
                                                style={{ backgroundColor: selectedDevice.design_color_primary }}
                                            ></div>
                                            <span className="font-mono text-xs text-gray-700 dark:text-gray-300 font-semibold">
                                                {selectedDevice.design_color_primary.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    {selectedDevice.design_color_secondary && (
                                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                                            <span className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Color Secundario</span>
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="w-6 h-6 rounded-md border" 
                                                    style={{ backgroundColor: selectedDevice.design_color_secondary }}
                                                ></div>
                                                <span className="font-mono text-xs text-gray-700 dark:text-gray-300 font-semibold">
                                                    {selectedDevice.design_color_secondary.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Logo */}
                            {selectedDevice.design_logo_url && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <span className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Logotipo de Grabado</span>
                                    <div className="flex justify-center p-2 bg-white rounded-lg border border-gray-100">
                                        <img 
                                            src={selectedDevice.design_logo_url} 
                                            alt="Logo de fábrica" 
                                            className="max-h-20 max-w-xs object-contain" 
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="px-5 py-2.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-xl font-semibold text-xs hover:bg-gray-200"
                            >
                                Cerrar Ventana
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
