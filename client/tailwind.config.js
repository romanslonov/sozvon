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
        gray: {
          100: '#EEEEEE',
          200: '#D5D5D5',
          300: '#BBBBBB',
          400: '#888888',
          500: '#555555',
          600: '#4D4D4D',
          700: '#333333',
          800: '#262626',
          900: '#1A1A1A',
        },
      },
    },
    borderColor: (theme) => ({
      ...theme('colors'),
      default: theme('colors.gray.200'),
    }),
  },
  variants: {},
  plugins: [],
  purge: [
    './src/**/*.html',
    './src/**/*.vue',
    './src/**/*.jsx',
  ],
};
