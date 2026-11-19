/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F2F1FE',
          100: '#E4E2FD',
          200: '#CBC6FB',
          300: '#AEA6F9',
          400: '#8E82F6',
          500: '#5750F1', // NextAdmin signature electric purple/indigo
          600: '#4634FF',
          700: '#3730A3',
          800: '#312E81',
          900: '#1E1B4B',
        },
        nextadmin: {
          bg: '#F4F7FB',
          card: '#FFFFFF',
          border: '#E2E8F0',
          darkBg: '#0B132B',
          darkCard: '#1C2434',
          text: '#1C2434',
          muted: '#64748B',
          green: '#10B981',
          orange: '#FF9C55',
          purple: '#8B5CF6',
          cyan: '#00C5FF',
        },
        phantom: {
          bg: '#F4F7FB',
          surface: '#FFFFFF',
          border: '#E2E8F0',
          text: '#1C2434',
          muted: '#64748B',
          accent: '#5750F1',
          'accent-hover': '#4634FF',
          blue: '#3b82f6',
          darkBg: '#0F172A',
          darkSurface: '#1E293B',
          darkBorder: '#334155',
        },
        risk: {
          low: '#10b981',
          medium: '#f59e0b',
          high: '#f97316',
          critical: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
};
