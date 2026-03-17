/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#050B16',
        panel: '#0B1B33',
        neon: '#1DFF9E',
        cyan: '#00D7FF',
        alert: '#FF4D6D',
      },
      boxShadow: {
        glow: '0 0 30px rgba(29,255,158,0.2)',
      },
      fontFamily: {
        cyber: ['Orbitron', 'sans-serif'],
        body: ['Rajdhani', 'sans-serif'],
      },
      backgroundImage: {
        grid: 'radial-gradient(rgba(0,215,255,0.12) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '22px 22px',
      },
    },
  },
  plugins: [],
}
