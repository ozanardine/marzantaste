/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Montserrat', 'sans-serif'],
      },
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        caramel: 'rgb(var(--color-caramel) / <alpha-value>)',
        cream: 'rgb(var(--color-cream) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        error: 'rgb(var(--color-error) / <alpha-value>)',
      },
      backgroundImage: {
        'cookie-pattern': "url('/images/cookie-pattern.svg')",
      },
    },
  },
  plugins: [],
};