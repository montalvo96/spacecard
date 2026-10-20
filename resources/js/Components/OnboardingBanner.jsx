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
        <div className="mb-8 p-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl shadow-lg border border-violet-500/20 relative overflow-hidden animate-pulse-subtle">
            {/* Efectos decorativos de fondo */}
            <div className="absolute right-0 top-0 translate-x-20 -translate-y-20 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute left-1/3 bottom-0 translate-y-10 w-40 h-40 bg-white/5 rounded-full blur-xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="max-w-xl">
                    <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full mb-3 uppercase tracking-wider">
                        Activación Rápida
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
                        {isReviews 
                            ? '¡Conecta tu negocio en menos de 2 minutos!' 
                            : '¡Diseña tu tarjeta de presentación digital!'}
                    </h2>
                    <p className="text-sm text-violet-100 leading-relaxed">
                        {isReviews 
                            ? `Has vinculado la placa de reseñas (${pendingDevice.code}). Vamos a asociar tu negocio de Google Maps para que comiences a recibir opiniones al instante.`
                            : `Tu tarjeta inteligente (${pendingDevice.code}) ya está vinculada. Crea un Space moderno para compartir tus datos de contacto o enlaza a tus redes sociales.`}
                    </p>
                </div>

                <div className="flex-shrink-0">
                    <button
                        onClick={() => setActiveTab(isReviews ? 'reviews' : 'spaces')}
                        className="py-3.5 px-6 bg-white text-violet-700 hover:bg-violet-50 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
                    >
                        {isReviews ? 'Conectar Negocio Now' : 'Diseñar Space Now'}
                    </button>
                </div>
            </div>
        </div>
    );
}
