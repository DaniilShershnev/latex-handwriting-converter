/**
 * Конфигурация Tailwind CSS
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      colors: {
        // Кастомные цвета можно добавить здесь
        'primary': {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#d6e0fd',
          300: '#b3c6fc',
          400: '#849df8',
          500: '#5a71f3',
          600: '#3a4fe8',
          700: '#2c3dd6',
          800: '#2733ae',
          900: '#252d89',
        },
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      boxShadow: {
        'custom': '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}