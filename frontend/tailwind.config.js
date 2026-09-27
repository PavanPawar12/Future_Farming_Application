/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: '#f2f8f0', 100: '#e0efe0', 200: '#c2dfc1', 300: '#96c795',
          400: '#66a865', 500: '#448a44', 600: '#326e33', 700: '#2a572b',
          800: '#244625', 900: '#1f3a20',
        },
        cream: '#faf7f0',
        soil: '#5b4636',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
