/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          900: "#1B1D22",
          950: "#141517",
        },
        accent: {
          green: "#B7F272",
          orange: "#DDA15E",
        },
        light: "#F9F9F9",
      },
      maxWidth: {
        layout: "1135px",
      },
      fontFamily: {
        questrial: ["Questrial", "sans-serif"],
      },
      spacing: {
        layout: "2rem",
      },
      fontFamily: {
        questridl: ["Questridl", "sans-serif"],
      },
    },
  },
  plugins: [],
};
