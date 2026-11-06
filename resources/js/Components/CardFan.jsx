/**
 * Roseta de tarjetas (al estilo Cash App): las seis SpaceCard reales apiladas
 * que, al entrar en pantalla, giran sobre su centro a distintos ángulos; al
 * salir vuelven a juntarse. Solo transform, con transición CSS.
 */
import { useEffect, useRef, useState } from 'react';
import SpaceCardFace from '@/Components/SpaceCardFace';

// De abajo hacia arriba; la de encima queda casi horizontal.
const CARDS = [
    { name: 'Verde', src: '/img/products/fronts/card-green.png', angle: 7.5 },
    { name: 'Azul', src: '/img/products/fronts/card-blue.png', angle: 15 },
    { name: 'Púrpura', src: '/img/products/fronts/card-purple.png', angle: 30 },
    { name: 'Rosa', src: '/img/products/fronts/card-pink.png', angle: 45 },
    { name: 'Negro', src: '/img/products/fronts/card-black.png', angle: 60 },
    { name: 'Rojo', src: '/img/products/fronts/card-red.png', angle: 75 },
];

export default function CardFan({ className = '' }) {
    const ref = useRef(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el || !('IntersectionObserver' in window)) {
            setOpen(true);
            return undefined;
        }
        const io = new IntersectionObserver(([e]) => setOpen(e.isIntersecting), { threshold: 0.5 });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div ref={ref} role="img" aria-label="Las seis SpaceCard: verde, azul, púrpura, rosa, negra y roja" className={`relative aspect-square w-full ${className}`}>
            {CARDS.map((c, i) => (
                <div
                    key={c.name}
                    className="absolute left-1/2 top-1/2 w-[40%] will-change-transform"
                    style={{
                        transform: `translate(-50%, -50%) rotate(${open ? c.angle : 0}deg)`,
                        transition: `transform 0.7s cubic-bezier(0.65, 0, 0.35, 1) ${open ? i * 55 : (CARDS.length - 1 - i) * 35}ms`,
                    }}
                >
                    <SpaceCardFace src={c.src} />
                </div>
            ))}
        </div>
    );
}
