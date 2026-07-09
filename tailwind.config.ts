import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './data/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          100: '#f7dfac',
          300: '#dfb76a',
          500: '#c99a4d',
          700: '#8e632c'
        },
        ink: {
          950: '#041014',
          900: '#071820',
          800: '#10252b'
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        display: ['var(--font-display)', 'Songti SC', 'STSong', 'serif']
      },
      boxShadow: {
        glow: '0 0 32px rgba(223, 183, 106, 0.22)'
      }
    }
  },
  plugins: []
}

export default config
