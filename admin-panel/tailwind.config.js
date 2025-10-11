/** @type {import('tailwindcss').Config} */
export default {
  important: '[data-theme="dark"]',
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'SF Pro Text', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
    },
    extend: {
      colors: {
        // Dark theme palette per spec
        app: { bg:'#14151A' },
        surface: '#1B1C22',
        elev1: '#20222A',
        elev2: '#262833',
        line: { soft:'#2E303A', strong:'#3A3D49' },
        text: { primary:'#E7E8EE', secondary:'#B7BAC7', tertiary:'#8F93A1', inverse:'#0E0F13' },
        brand: { DEFAULT:'#6366F1', 600:'#5558E6', 700:'#4B4ED1' },
        accent: { secondary:'#A855F7' },
        info:'#38BDF8', success:'#22C55E', warning:'#F59E0B', danger:'#EF4444',
      },
      borderRadius: { '10':'10px','12':'12px','14':'14px','16':'16px' },
      boxShadow: {
        elev1:'0 1px 0 rgba(0,0,0,.35), 0 8px 24px rgba(0,0,0,.35)',
        elev2:'0 2px 0 rgba(0,0,0,.35), 0 14px 36px rgba(0,0,0,.45)',
      },
      spacing: { 3.5:'14px' },
      transitionTimingFunction: {
        in:'cubic-bezier(0.2,0,0,1)', out:'cubic-bezier(0.4,0,0.2,1)'
      },
    }
  },
  plugins: [],
}


