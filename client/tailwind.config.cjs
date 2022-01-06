module.exports = {
  mode: 'jit', // ⚠ Make sure to have this
  purge: ["./src/**/*.svelte"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'regal-blue': '#243c5a',
        'indigo-dark': '#202e78',
        'aria-grey': '#f9fafb',
        'aria-silver': '#c6c6c6',
        'aria-green': '#1a535c',
        'aria-teal': '#25a8b0',
        'aria-yellow': '#f3ca40',
        'aria-orange': '#e95635',
        'aria-black': '#242325',
      },
      height: {
        'container': '150px',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      scale: {
        "101": '1.01',
        "102": '1.02',
      },
      fontFamily: {
        'aria-baloo': ['"Baloo Bhaijaan 2"'],
        'aria-montserrat': ['"Montserrat"'],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
