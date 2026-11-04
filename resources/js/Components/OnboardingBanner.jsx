/**
 * Componente React para mostrar banners de onboarding guiados.
 * Segmenta la experiencia según el tipo de dispositivo que requiera configuración.
 *
 * Autor: Antigravity
 */

import React from 'react';

export default function OnboardingBanner({ devices, setActiveTab }) {
    // Buscar si hay algún dispositivo reclamado sin configurar (destination_type = none)
    const pendingDevice = devices.find(d => d.destination_type === 'none');

    if (!pendingDevice) return null;

    const isReviews = pendingDevice.type === 'review_plate';

    return (
        <div className="sc-rise relative overflow-hidden rounded-[26px] border border-[#FF3B1F]/30 bg-gradient-to-br from-[#1C0D0A] to-[#111111] p-6 sm:p-8">
            <div aria-hidden="true" className="sc-blob pointer-events-none absolute -right-20 -top-24 h-72 w-72 bg-[radial-gradient(closest-side,rgba(255,40,10,0.35),transparent)]" />
            <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div className="flex max-w-xl gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D42410] text-white">
                        <span aria-hidden="true" className="ms text-2xl">{isReviews ? 'reviews' : 'rocket_launch'}</span>
                    </span>
                    <div>
                        <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-900">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D42410]" />
                            Activación rápida
                        </span>
                        <h2 className="font-display text-2xl font-normal tracking-[-0.03em] text-white">
                            {isReviews
                                ? '¡Conecta tu negocio en menos de 2 minutos!'
                                : '¡Diseña tu tarjeta de presentación digital!'}
                        </h2>
                        <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">
                            {isReviews
                                ? `Has vinculado la placa de reseñas (${pendingDevice.code}). Vamos a asociar tu negocio de Google Maps para que comiences a recibir opiniones al instante.`
                                : `Tu tarjeta inteligente (${pendingDevice.code}) ya está vinculada. Crea un Space moderno para compartir tus datos de contacto o enlaza a tus redes sociales.`}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setActiveTab(isReviews ? 'reviews' : 'spaces')}
                    className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-[#D42410] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(255,40,10,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#B81E0C]"
                >
                    {isReviews ? 'Conectar negocio' : 'Diseñar mi Space'}
                    <span aria-hidden="true" className="ms text-lg transition duration-300 group-hover:translate-x-1">arrow_forward</span>
                </button>
            </div>
        </div>
    );
}
