const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        gray: colors.coolGray,
        blue: colors.lightBlue,
        red: colors.rose,
        pink: colors.fuchsia
      },
      fontFamily: { google: ['Balsamiq Sans'] },
      spacing: {
        128: '32rem',
        144: '36rem'
      },
      borderRadius: {
        '4xl': '2rem'
      },
      backgroundImage: {
        parallax: "url('/src/assets/reka.jpg')"
      }
    }
  },
  plugins: []
}
