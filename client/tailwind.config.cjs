module.exports = {
  mode: 'jit', // ⚠ Make sure to have this
  purge: ["./src/**/*.svelte"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'regal-blue': '#243c5a',
        'indigo-dark': '#202e78'
      },
      height: {
        'container': '150px',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
       }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
