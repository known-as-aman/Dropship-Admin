/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    fontFamily: {
      sans: ["Segoe UI", "Segoe UI"],
    },
    extend: {
      boxShadow: {
        'upper-md': '0px -3px 10px rgba(0, 0, 0, 0.4)',
        'upper-sm': '0px -1px 1px rgba(0, 0, 0, 0.4)',
      },
      inset: {
        '72': '290px',
        '80': '320px',
      },
      height:{
        '88':'352px',
        '62':'248px',
      }
    },
  },
  plugins: [],
});
