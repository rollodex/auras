/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'aura-violet': '#A26CFA',
        'rizz-pink': '#FF4FCB',
        'vibe-blue': '#3D9CFF',
        'night-black': '#121212',
        'glow-white': '#FFFFFF',
      },
      backgroundImage: {
        'synthetic-gradient': 'linear-gradient(135deg, #FF4FCB 0%, #A26CFA 50%, #3D9CFF 100%)',
        'synthetic-gradient-reverse': 'linear-gradient(135deg, #3D9CFF 0%, #A26CFA 50%, #FF4FCB 100%)',
        'synthetic-radial': 'radial-gradient(circle at center, #FF4FCB 0%, #A26CFA 50%, #3D9CFF 100%)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
};