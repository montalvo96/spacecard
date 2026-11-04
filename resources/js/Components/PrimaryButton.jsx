export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center gap-1.5 rounded-full border border-transparent bg-[#D42410] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(255,40,10,0.3)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#B81E0C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070707] active:translate-y-0 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
