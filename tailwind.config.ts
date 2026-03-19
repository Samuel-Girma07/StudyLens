import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Glossy Brutalist Palette
        "accent-cyan": "#00FFFF",
        "accent-lime": "#CCFF00",
        "background-dark": "#050505",
        "background-light": "#f6f7f7",
        "primary": "#526e84",
        
        // Slate scale for text
        slate: {
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
          950: '#020617',
        },
        
        // Card and surfaces
        card: {
          DEFAULT: '#0a0a0a',
          foreground: '#fafafa',
        },
        
        // Border
        border: 'rgba(255, 255, 255, 0.1)',
        
        // Muted
        muted: {
          DEFAULT: '#141414',
          foreground: '#64748b',
        },
      },
      
      fontFamily: {
        // Display font - Inter
        display: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        
        // Serif font - Fraunces (for dramatic headlines)
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        
        // Monospace - JetBrains Mono
        mono: ['var(--font-mono)', 'Consolas', 'monospace'],
      },
      
      // Brutalist - Zero radius
      borderRadius: {
        'DEFAULT': '0px',
        'sm': '0px',
        'md': '0px',
        'lg': '0px',
        'xl': '0px',
        '2xl': '0px',
        '3xl': '0px',
        'full': '9999px',
      },
      
      boxShadow: {
        // Brutalist shadows
        'brutalist-cyan': '4px 4px 0px #00FFFF',
        'brutalist-lime': '4px 4px 0px #CCFF00',
        'brutalist-cyan-sm': '2px 2px 0px #00FFFF',
        'brutalist-lime-sm': '2px 2px 0px #CCFF00',
        
        // Inner glows
        'inner-cyan': 'inset 0 0 20px rgba(0, 255, 255, 0.05)',
        'inner-lime': 'inset 0 0 20px rgba(204, 255, 0, 0.05)',
        
        // Glass effects
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      
      backgroundImage: {
        'glossy': 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)',
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
      },
      
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      
      // Spacing for brutalist layouts
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
      },
      
      // Max width
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      
      // Z-index
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
