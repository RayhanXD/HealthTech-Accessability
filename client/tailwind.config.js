/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          purple: '#8B5CF6',
          purpleDark: '#7C3AED',
          green: '#78E66C',
          white: '#FFFFFF',
          black: '#000000',
        },
        // Semantic colors
        primary: {
          DEFAULT: '#8B5CF6',
          dark: '#7C3AED',
        },
        semantic: {
          success: '#78E66C',
          warning: '#D2DB70',
          error: '#E44F4F',
          info: '#8B5CF6',
        },
        // Zone colors
        zone: {
          green: '#40BF80',
          yellow: '#D2DB70',
          red: '#E44F4F',
        },
        // Text colors
        text: {
          primary: '#FFFFFF',
          secondary: 'rgba(255, 255, 255, 0.7)',
          tertiary: 'rgba(255, 255, 255, 0.6)',
        },
        // Border colors
        border: {
          primary: '#8B5CF6',
          secondary: '#FFFFFF',
          muted: 'rgba(255, 255, 255, 0.1)',
        },
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '28px',
        '4xl': '32px',
        '5xl': '36px',
        '6xl': '48px',
      },
      fontSize: {
        xs: ['10px', { lineHeight: '12px' }],
        sm: ['12px', { lineHeight: '14px' }],
        base: ['13px', { lineHeight: '16px' }],
        md: ['14px', { lineHeight: '17px' }],
        lg: ['16px', { lineHeight: '20px' }],
        xl: ['18px', { lineHeight: '22px' }],
        '2xl': ['20px', { lineHeight: '24px' }],
        '3xl': ['28px', { lineHeight: '34px' }],
        '4xl': ['48px', { lineHeight: '58px' }],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          "'Segoe UI'",
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
