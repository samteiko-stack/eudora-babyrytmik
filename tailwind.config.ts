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
          DEFAULT: '#004346',
          dark: '#0A4533',
          light: '#027A48',
        },
        accent: {
          DEFAULT: '#69A306',
          light: '#C8E793',
        },
        neutral: {
          50: '#FFFFFF',
          100: '#F5F3EA',
          200: '#F1F1E6',
          300: '#DDDDDD',
          400: '#C6C6C6',
          500: '#838383',
          600: '#828979',
          900: '#000000',
        },
        error: '#FFDEDE',
      },
    },
  },
  plugins: [],
}
export default config
