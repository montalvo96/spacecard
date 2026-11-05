/**
 * Logo oficial de SpaceCard (public/img/spacecard-logo.svg):
 * etiqueta roja inclinada con "SPACECARD" en blanco.
 */

export default function BrandLogo({ className = 'h-8' }) {
    return (
        <img
            src="/img/spacecard-logo.svg"
            alt="SpaceCard"
            width="748"
            height="176"
            className={`block aspect-[748/176] w-auto max-w-none shrink-0 transition duration-500 hover:-translate-y-0.5 hover:drop-shadow-[0_6px_16px_rgba(228,35,41,0.45)] ${className}`}
        />
    );
}
