/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        citrine: '#e5ff5d',
        carbon: '#111111',
        bone: '#f9f9f9',
        graphite: '#2b2b2b',
        ash: '#6e6e6e',
        stone: '#9c9c9c',
        smoke: '#565656',
        chalk: '#d6d6d6',
        cream: '#eeeeee',
        pureblack: '#000000',
        sand: '#b7b3a2',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'utility': ['10px', { lineHeight: '1.5', letterSpacing: '0.32px' }],
        'caption': ['12px', { lineHeight: '1.5', letterSpacing: '0.24px' }],
        'body-sm': ['14px', { lineHeight: '1.5' }],
        'body': ['16px', { lineHeight: '1.5' }],
        'subhead': ['20px', { lineHeight: '1.3' }],
        'heading-sm': ['24px', { lineHeight: '1.2', letterSpacing: '-0.24px' }],
        'heading': ['48px', { lineHeight: '1.1', letterSpacing: '-0.48px' }],
        'display': ['80px', { lineHeight: '0.9', letterSpacing: '-0.8px' }],
      },
      borderRadius: {
        'btn': '4px',
        'nav': '8px',
        'card': '12px',
        'decorative': '20px',
      },
      maxWidth: {
        'page': '1280px',
      },
      animation: {
        'spin-slow': 'spin 40s linear infinite',
        'spin-slower': 'spin 60s linear infinite',
        'spin-reverse': 'spin-reverse 50s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
      },
      keyframes: {
        'spin-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.15' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
};
