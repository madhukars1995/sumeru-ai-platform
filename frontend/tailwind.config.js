/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Design System Colors (Dark Theme)
      colors: {
        slate: {
          900: '#0d1117',
          800: '#111621', 
          700: '#161b22',
          600: '#1f2633',
          500: '#2e3648',
        },
        primary: {
          800: '#1e40af',
          700: '#1a5eff',
          600: '#2271ff',
          500: '#4d8dff',
          300: '#93c5fd',
        },
        accent: {
          700: '#b891ff',
          600: '#d6b4ff',
          500: '#a855f7',
          300: '#c084fc',
        },
        warning: {
          700: '#ffbc43',
          600: '#ffc94e',
          500: '#f59e0b',
          300: '#fcd34d',
        },
        success: {
          700: '#33d17c',
          600: '#3df08d',
          500: '#22c55e',
          300: '#86efac',
        },
        error: {
          700: '#ef4444',
          600: '#f87171',
          500: '#ef4444',
          300: '#fca5a5',
        },
        border: {
          900: '#ffffff09',
          800: '#ffffff12',
        }
      },
      
      // Typography Scale
      fontSize: {
        'xs': ['10px', '14px'],
        'sm': ['12px', '16px'],
        'base': ['14px', '20px'],
        'lg': ['16px', '22px'],
        'xl': ['18px', '24px'],
      },
      
      // Font Weights
      fontWeight: {
        'medium': '500',  // labels & ribbon
        'semibold': '600', // section heads
        'bold': '700',     // doc titles
      },
      
      // 8-pt Grid Spacing
      spacing: {
        's-1': '4px',
        's-2': '8px', 
        's-3': '12px',
        's-4': '16px',
        's-6': '24px',
      },
      
      // Border Radius
      borderRadius: {
        'sm': '3px',
        'md': '6px',
        'lg': '12px',
      },
      
      // Elevation Shadows
      boxShadow: {
        'e-1': '0 1px 2px rgba(255, 255, 255, 0.06)',
        'e-2': '0 2px 4px rgba(0, 0, 0, 0.25)',
      },
      
      // Layout Grid
      width: {
        'task': '20rem', // 320px
        'rail': '56px',
      },
      
      height: {
        'header': '48px',
        'ribbon': '56px',
        'footer': '56px',
        'pane-header': '40px',
      },
      
      // Background Gradients
      backgroundImage: {
        'header-gradient': 'linear-gradient(180deg, #111621 0%, #0d1117 100%)',
        'rail-gradient': 'linear-gradient(180deg, #0d1117 0%, #111621 100%)',
        'dot-grid': 'radial-gradient(circle, #ffffff09 1px, transparent 1px)',
      },
      
      backgroundSize: {
        'dot-grid': '24px 24px',
      },
      
      // Animation Timing
      transitionDuration: {
        '120': '120ms',
        '180': '180ms',
        '220': '220ms',
      },
      
      transitionTimingFunction: {
        'ease-out': 'ease-out',
        'ease-in': 'ease-in',
        'cubic-bezier': 'cubic-bezier(0.25, 0.8, 0.25, 1)',
      },
    },
  },
  plugins: [],
} 