/**
 * Logo de SpaceCard para las vistas de Breeze que lo importan (ver BrandLogo.jsx).
 */
import BrandLogo from '@/Components/BrandLogo';

export default function ApplicationLogo({ className = '' }) {
    return <BrandLogo className={`!h-auto ${className}`} />;
}
