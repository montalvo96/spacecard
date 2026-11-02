/**
 * Componente React para mostrar banners de onboarding guiados.
 * Segmenta la experiencia según el tipo de dispositivo que requiera configuración.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

import React from 'react';

export default function OnboardingBanner({ devices, setActiveTab }) {
    // Buscar si hay algún dispositivo reclamado sin configurar (destination_type = none)
    const pendingDevice = devices.find(d => d.destination_type === 'none');

    if (!pendingDevice) return null;

    const isReviews = pendingDevice.type === 'review_plate';

    return (
        <div className="overflow-hidden border-l-4 border-indigo-400 bg-white p-6 shadow-sm sm:rounded-lg dark:border-indigo-600 dark:bg-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="max-w-xl">
                    <span className="inline-block px-2.5 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 text-xs font-semibold rounded-md mb-3 uppercase tracking-widest">
                        Activación Rápida
                    </span>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {isReviews 
                            ? '¡Conecta tu negocio en menos de 2 minutos!' 
                            : '¡Diseña tu tarjeta de presentación digital!'}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {isReviews 
                            ? `Has vinculado la placa de reseñas (${pendingDevice.code}). Vamos a asociar tu negocio de Google Maps para que comiences a recibir opiniones al instante.`
                            : `Tu tarjeta inteligente (${pendingDevice.code}) ya está vinculada. Crea un Space moderno para compartir tus datos de contacto o enlaza a tus redes sociales.`}
                    </p>
                </div>

                <div className="flex-shrink-0">
                    <button
                        onClick={() => setActiveTab(isReviews ? 'reviews' : 'spaces')}
                        className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-white dark:focus:ring-offset-gray-800"
                    >
                        {isReviews ? 'Conectar Negocio Now' : 'Diseñar Space Now'}
                    </button>
                </div>
            </div>
        </div>
    );
}
