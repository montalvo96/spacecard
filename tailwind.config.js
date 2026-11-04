import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',

    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                inter: ['Inter', ...defaultTheme.fontFamily.sans],
                display: ['"Inter Tight"', ...defaultTheme.fontFamily.sans],
            },
            // Esquinas más amplias en las tarjetas de Breeze (rounded-lg), como la landing.
            borderRadius: {
                lg: '1.375rem',
            },
            colors: {
                // Identidad visual actual (negro + rojo, como la landing): los
                // componentes del panel usan gray/indigo de Breeze, así que se
                // remapean aquí en vez de reescribir cada clase.
                gray: {
                    50: '#FAFAFA',
                    100: '#F5F5F5',
                    200: '#E5E5E5',
                    300: '#D4D4D4',
                    400: '#A3A3A3',
                    500: '#8A8A8A',
                    600: '#525252',
                    700: '#2A2A2A',
                    800: '#141414',
                    900: '#0E0E0E',
                    950: '#070707',
                },
                indigo: {
                    50: '#FFF1EE',
                    100: '#FFE0DA',
                    200: '#FFC2B6',
                    300: '#FF9A85',
                    400: '#FF5A3C',
                    500: '#E8361D',
                    600: '#D42410',
                    700: '#B81E0C',
                    800: '#8F1809',
                    900: '#5C1006',
                    950: '#330903',
                },
                brand: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#5b53e8',
                    700: '#4f46e5',
                    800: '#4338ca',
                    900: '#3730a3',
                },
            },
        },
    },

    plugins: [forms],
};
