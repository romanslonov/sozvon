module.exports = {
  theme: {
    extend: {
      colors: {
        blue: {
          100: '#EAEDFF',
          200: '#CBD3FF',
          300: '#ACB9FE',
          400: '#6D84FE',
          500: '#2F4FFD',
          600: '#2A47E4',
          700: '#1C2F98',
          800: '#152472',
          900: '#0E184C',
        },
      },
    },
  },
  variants: {},
  plugins: [],
  purge: [
    './src/**/*.html',
    './src/**/*.vue',
    './src/**/*.jsx',
  ],
};
