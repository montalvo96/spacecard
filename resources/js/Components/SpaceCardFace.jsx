/**
 * Frente plano de una SpaceCard (public/img/products/fronts/card-*.png).
 * Esas imágenes salen de la textura del modelo 3D, con el diseño real sin
 * perspectiva; las esquinas redondeadas se recortan aquí.
 */

export default function SpaceCardFace({ src, alt = '', className = '' }) {
    return (
        <div className={`relative aspect-[480/762] overflow-hidden rounded-[7%/4.4%] shadow-[0_24px_50px_-18px_rgba(0,0,0,0.6)] ring-1 ring-white/10 ${className}`}>
            <img
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
                draggable="false"
                className="h-full w-full select-none object-cover"
            />
        </div>
    );
}
