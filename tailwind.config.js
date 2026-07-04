/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        meow: {
          cream: "#FFF4D5",
          gold: "#FFC929",
          orange: "#FF8200",
          "orange-dark": "#DC7322",
          danger: "#FF5100",
          warning: "#EDB44D",
          pink: "#F8A4C1",
          dark: "#0A0903",
          "dark-red": "#A51604",
          surface: "#F5D17B",
        },
      },
    },
  },
  plugins: [],
};
