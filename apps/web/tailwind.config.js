const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    // ESTA es la nueva forma oficial en monorepos Nx para que Turbopack vuele
    join(__dirname, '../../libs/**/src/**/*!(*.stories|*.spec).{ts,tsx,html}'),
  ],
  theme: {
    extend: {
      colors: {
        // Brand / Primary (Azul vibrante/Cyan)
        primary: {
          50: '#e0f6ff',
          100: '#b8ebff',
          200: '#8adfff',
          300: '#5cd3ff',
          400: '#2ec8ff',
          500: '#1cb0f6', // Base
          600: '#1899d6', // Shadow
          700: '#1481b5',
          800: '#0f6891',
          900: '#0c5275',
        },
        // Secondary / Accent (Morado/Violeta para gemas/destacados)
        secondary: {
          50: '#f8f4ff',
          100: '#eee6ff',
          200: '#dbceff',
          300: '#c5b4ff',
          400: '#af9aff',
          500: '#a573ff', // Base
          600: '#8e5ff2', // Shadow
          700: '#774cdb',
          800: '#5e3eb8',
          900: '#4c3196',
        },
        // Success (Verde vibrante para aciertos/rachas)
        success: {
          50: '#f1fbeb',
          100: '#def6ce',
          200: '#bceb94',
          300: '#9add5a',
          400: '#7dd020',
          500: '#58cc02', // Base
          600: '#58a700', // Shadow
          700: '#488c00',
          800: '#3a7200',
          900: '#325c00',
        },
        // Warning (Naranja/Amarillo para dudas/advertencias)
        warning: {
          50: '#fffbea',
          100: '#fff5cd',
          200: '#ffe99a',
          300: '#ffdd67',
          400: '#ffd133',
          500: '#ffc800', // Base
          600: '#e5b400', // Shadow
          700: '#cc9f00',
          800: '#a68200',
          900: '#886a00',
        },
        // Error (Rojo sandía para fallos/vidas)
        error: {
          50: '#ffeaea',
          100: '#ffcdcc',
          200: '#ff9d9d',
          300: '#ff6f6d',
          400: '#ff4d4d',
          500: '#ff4b4b', // Base
          600: '#ea1515', // Shadow
          700: '#c91212',
          800: '#a31010',
          900: '#870e0e',
        },
        // Surface (Grises azulados para el UI Canvas)
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      boxShadow: {
        // Elevaciones direccionales sólidas (3D) que heredan el var(--tw-shadow-color) de la clase de Tailwind
        '3d-sm': '0 2px 0 0 var(--tw-shadow-color)',
        '3d-md': '0 4px 0 0 var(--tw-shadow-color)',
        '3d-lg': '0 6px 0 0 var(--tw-shadow-color)',
      },
      borderRadius: {
        // Radios semánticos "Bubbly"
        'button': '1rem', // 16px
        'card': '1.5rem', // 24px
        'pill': '9999px', // Redondo perfecto
      },
      fontFamily: {
        sans: ['var(--font-nunito)', 'Nunito', 'sans-serif'],
        display: ['var(--font-nunito-bold)', 'Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
