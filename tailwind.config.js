/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Home Font Size 
      fontSize : {
        'course-deatails-heading-small' : ['26px', '36px' ],
        'course-deatails-heading-large' : ['36px', '44px' ],
        'home-heading-small' : ['28px', '34px'],
        'home-heading-large' : ['48px', '56px' ],
        'default': ['15px', '21px' ]
      }
    },
  },
  plugins: [],
}