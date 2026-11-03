/**
 * Visor 3D interactivo de SpaceCard y SpaceBand.
 * Three.js va en un chunk aparte y la escena solo arranca cuando el visor entra en pantalla.
 * La imagen de producto queda visible mientras carga y es el resultado final si no hay WebGL.
 *
 * Autor: SpaceCard 2.0
 */
import { useEffect, useRef, useState } from 'react';

const PRODUCTS = [
    {
        id: 'card',
        name: 'SpaceCard',
        colors: [
            { id: 'black', name: 'Negro', swatch: '#1d1d1b' },
            { id: 'red', name: 'Rojo', swatch: '#e42529' },
        ],
    },
    {
        id: 'band',
        name: 'SpaceBand',
        colors: [
            { id: 'black', name: 'Negro', swatch: '#1d1d1b' },
            { id: 'red', name: 'Rojo', swatch: '#e80f2f' },
            { id: 'white', name: 'Blanco', swatch: '#ffffff' },
        ],
    },
];

export default function Product3DViewer({
    poster,
    alt,
    className = '',
    posterClassName = '',
}) {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const [ready, setReady] = useState(false);
    const [productId, setProductId] = useState('card');
    const [colorId, setColorId] = useState('black');

    const product = PRODUCTS.find((p) => p.id === productId);

    useEffect(() => {
        const container = containerRef.current;
        if (navigator.connection?.saveData) return undefined;

        let cancelled = false;
        const start = async () => {
            try {
                const { createProductScene } =
                    await import('@/three/productScene');
                if (cancelled) return;
                const reducedMotion = window.matchMedia(
                    '(prefers-reduced-motion: reduce)',
                ).matches;
                const scene = createProductScene(container, {
                    autoRotate: !reducedMotion,
                });
                sceneRef.current = scene;
                await scene.show('card', 'black');
                if (!cancelled) setReady(true);
            } catch (error) {
                // Sin WebGL o sin red: se queda la imagen de producto.
                console.warn('No se pudo iniciar el visor 3D', error);
            }
        };

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                observer.disconnect();
                start();
            }
        });
        observer.observe(container);

        return () => {
            cancelled = true;
            observer.disconnect();
            sceneRef.current?.dispose();
            sceneRef.current = null;
        };
    }, []);

    const select = (nextProduct, nextColor) => {
        setProductId(nextProduct);
        setColorId(nextColor);
        sceneRef.current?.show(nextProduct, nextColor).catch((error) => {
            console.warn('No se pudo cargar el modelo 3D', error);
        });
    };

    return (
        <div className={`flex w-full flex-col items-center ${className}`}>
            <div className="relative aspect-square w-full">
                <img
                    src={poster}
                    alt={alt}
                    className={`absolute inset-0 m-auto w-full transition-opacity duration-500 ${ready ? 'pointer-events-none opacity-0' : 'opacity-100'} ${posterClassName}`}
                />
                <div
                    ref={containerRef}
                    role="img"
                    aria-label={`Modelo 3D interactivo de ${product.name}`}
                    className={`absolute inset-0 transition-opacity duration-500 ${ready ? 'cursor-grab opacity-100 active:cursor-grabbing' : 'opacity-0'}`}
                />
            </div>

            {ready && (
                <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
                    <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1 dark:border-white/10 dark:bg-white/5">
                        {PRODUCTS.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                aria-pressed={p.id === productId}
                                onClick={() =>
                                    select(
                                        p.id,
                                        p.colors.some((c) => c.id === colorId)
                                            ? colorId
                                            : p.colors[0].id,
                                    )
                                }
                                className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${p.id === productId ? 'bg-gray-900 text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
                            >
                                {p.name}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        {product.colors.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                title={c.name}
                                aria-label={`Color ${c.name}`}
                                aria-pressed={c.id === colorId}
                                onClick={() => select(productId, c.id)}
                                style={{ backgroundColor: c.swatch }}
                                className={`h-7 w-7 rounded-full border border-gray-300 transition dark:border-white/20 ${c.id === colorId ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-white dark:ring-offset-[#0b0b13]' : 'hover:scale-110'}`}
                            />
                        ))}
                    </div>
                    <p className="w-full text-center text-xs text-gray-400 dark:text-gray-500">
                        Arrastra para girar
                    </p>
                </div>
            )}
        </div>
    );
}
