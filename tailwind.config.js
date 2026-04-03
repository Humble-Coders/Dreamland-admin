/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0a1f13',
          surface: '#122b1a',
          card: '#163220',
          border: '#1e4a2a',
          gold: '#c9a84c',
          'gold-light': '#e2c070',
          'gold-dark': '#a8882a',
          text: '#f0ead6',
          muted: '#7a9e86',
          error: '#e05555',
          success: '#4caf7d',
          warning: '#e8a83a',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px 0 rgba(0,0,0,0.5)',
        dialog: '0 8px 48px 0 rgba(0,0,0,0.7)',
        gold: '0 0 16px rgba(201,168,76,0.25)',
      },
    },
  },
  plugins: [],
}
