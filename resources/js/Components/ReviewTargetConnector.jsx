/**
 * Componente React para conectar un negocio local a una placa de reseñas.
 * Utiliza el proxy seguro de Laravel para Google Places Autocomplete y Details.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

export default function ReviewTargetConnector({ reviewTargets, flash }) {
    const [businessName, setBusinessName] = useState('');
    const [placeId, setPlaceId] = useState('');
    const [feedbackEnabled, setFeedbackEnabled] = useState(false);
    
    // Estados para la búsqueda Autocomplete
    const [searchQuery, setSearchQuery] = useState('');
    const [predictions, setPredictions] = useState([]);
    const [showPredictions, setShowPredictions] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowPredictions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // Consultar el proxy con debounce simple
    useEffect(() => {
        if (searchQuery.length < 3) {
            setPredictions([]);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            setLoading(true);
            fetch(`/api/places/autocomplete?input=${encodeURIComponent(searchQuery)}`)
                .then(res => res.json())
                .then(data => {
                    setPredictions(data.predictions || []);
                    setShowPredictions(true);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching autocomplete predictions:', err);
                    setLoading(false);
                });
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSelectPrediction = (prediction) => {
        setSearchQuery(prediction.description);
        setBusinessName(prediction.description.split(',')[0]); // Nombre principal del negocio
        setPlaceId(prediction.place_id);
        setShowPredictions(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!placeId || !businessName) return;

        router.post('/review-targets', {
            business_name: businessName,
            place_id: placeId,
            feedback_enabled: feedbackEnabled
        }, {
            onSuccess: () => {
                setBusinessName('');
                setPlaceId('');
                setSearchQuery('');
                setFeedbackEnabled(false);
            }
        });
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-none">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Conectar nuevo negocio (Google Reviews)
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Busca tu negocio local para generar automáticamente el enlace directo al formulario de reseñas de Google.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div ref={wrapperRef} className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Buscar Negocio
                    </label>
                    <input
                        type="text"
                        placeholder="Escribe el nombre de tu negocio local..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                    />

                    {loading && (
                        <div className="absolute right-3 top-9 flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-violet-500 border-t-transparent"></div>
                        </div>
                    )}

                    {showPredictions && predictions.length > 0 && (
                        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto dark:bg-gray-700 dark:border-gray-600">
                            {predictions.map((p) => (
                                <li
                                    key={p.place_id}
                                    onClick={() => handleSelectPrediction(p)}
                                    className="px-4 py-3 hover:bg-violet-50 dark:hover:bg-violet-950/20 cursor-pointer text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                                >
                                    {p.description}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {placeId && (
                    <div className="p-4 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 rounded-xl text-sm border border-emerald-100 dark:border-emerald-900/30">
                        <strong>Negocio seleccionado:</strong> {businessName} <br/>
                        <span className="text-xs opacity-80">Place ID: {placeId}</span>
                    </div>
                )}

                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="feedback_enabled"
                            type="checkbox"
                            checked={feedbackEnabled}
                            onChange={(e) => setFeedbackEnabled(e.target.checked)}
                            className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="feedback_enabled" className="font-medium text-gray-700 dark:text-gray-300">
                            Habilitar buzón de soporte / comentarios privado (Feedback opcional)
                        </label>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                            Si se activa, el cliente podrá elegir entre escribir reseña en Google o enviar un comentario privado que recibirás directamente en tu panel. Ambas opciones a la misma altura sin gating.
                        </p>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!placeId}
                    className={`w-full py-3 px-4 rounded-xl text-white font-semibold transition-all ${
                        placeId
                            ? 'bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-500/20'
                            : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500'
                    }`}
                >
                    Vincular Negocio
                </button>
            </form>

            {/* Listado de Negocios Activos */}
            {reviewTargets && reviewTargets.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Negocios vinculados anteriormente:
                    </h4>
                    <div className="space-y-3">
                        {reviewTargets.map((target) => (
                            <div key={target.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div>
                                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                                        {target.business_name}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Plataforma: Google Reviews • Buzón privado: {target.feedback_enabled ? 'Activado' : 'Desactivado'}
                                    </div>
                                </div>
                                <span className="text-xs px-2 py-1 bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300 rounded-md font-semibold">
                                    Conectado
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
