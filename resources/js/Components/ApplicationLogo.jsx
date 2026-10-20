/**
 * Logomark de marca SpaceCard / AVASPACE: "S" angular (rayo) en rojo.
 *
 * Autor: SpaceCard 2.0
 */
export default function ApplicationLogo(props) {
    return (
        <svg
            {...props}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="scMark" x1="20" y1="8" x2="80" y2="92" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#818cf8" />
                    <stop offset="1" stopColor="#6d28d9" />
                </linearGradient>
            </defs>
            <path
                d="M58 8 L22 50 H44 L38 92 L78 46 H54 L58 8 Z"
                fill="url(#scMark)"
            />
        </svg>
    );
}
