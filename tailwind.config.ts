import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'var(--color-bg)',
          sage: 'var(--color-bg-sage)',
        },
        surface: 'var(--color-surface)',
        'surface-subtle': 'var(--color-surface-subtle)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        border: 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        field: 'var(--color-field)',
        teal: {
          DEFAULT: 'var(--color-teal)',
          hover: 'var(--color-teal-hover)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          light: 'var(--color-accent)',
          strong: 'var(--color-accent-strong)',
          gray: 'var(--color-muted)',
          darkGray: 'var(--color-muted)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          light: 'var(--color-error-bg)',
          bg: 'var(--color-error-bg)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          bg: 'var(--color-success-bg)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          bg: 'var(--color-warning-bg)',
        },
        primary: {
          DEFAULT: 'var(--color-ink)',
          dark: 'var(--color-teal)',
          teal: 'var(--color-teal)',
        },
        neutral: {
          50: 'var(--color-surface)',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: 'var(--color-border)',
          400: '#C6C6C6',
          500: 'var(--color-muted)',
          600: 'var(--color-muted)',
          900: 'var(--color-ink)',
        },
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
        10: 'var(--space-10)',
        12: 'var(--space-12)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
      fontFamily: {
        sans: ['var(--font-geist)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['var(--font-nohemi)', 'ui-serif', 'Georgia', 'serif'],
      },
      fontSize: {
        xs: ['var(--font-size-xs)', { lineHeight: '1.4' }],
        sm: ['var(--font-size-sm)', { lineHeight: '1.5' }],
        base: ['var(--font-size-base)', { lineHeight: '1.5' }],
        lg: ['var(--font-size-lg)', { lineHeight: '1.45' }],
        xl: ['var(--font-size-xl)', { lineHeight: '1.35' }],
        '2xl': ['var(--font-size-2xl)', { lineHeight: '1.3' }],
        '3xl': ['var(--font-size-3xl)', { lineHeight: '1.2' }],
        '4xl': ['var(--font-size-4xl)', { lineHeight: '1.15' }],
        '5xl': ['var(--font-size-5xl)', { lineHeight: '1.05' }],
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        card: 'var(--shadow-card)',
        dropdown: 'var(--shadow-dropdown)',
      },
    },
  },
  plugins: [],
}
export default config
