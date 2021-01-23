module.exports = {
  purge: {
    enabled: false,
    content: [
      './public/index.html',
      './public/sketch.js'
    ]
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        'minecraftia': ['Minecraftia-20', 'serif'],
        'nokia': ['Nokia-Cellphone-Small', 'serif'],
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require("tailwindcss"),
    require("autoprefixer")
  ],
}
