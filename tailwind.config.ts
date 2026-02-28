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
        primary: {
          DEFAULT: '#000000',
          dark: '#1A3A3A',
          teal: '#1A3A3A',
        },
        accent: {
          DEFAULT: '#B8D88E',
          light: '#B8D88E',
          gray: '#8B8B8B',
          darkGray: '#6B6B6B',
        },
        neutral: {
          50: '#FFFFFF',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#C6C6C6',
          500: '#8B8B8B',
          600: '#6B6B6B',
          900: '#000000',
        },
        error: {
          DEFAULT: '#FFB3C1',
          light: '#FFE5E5',
        },
      },
    },
  },
  plugins: [],
}
export default config
