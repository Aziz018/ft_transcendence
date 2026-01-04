/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
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
        lightTheme: {
          bg: "#F5F7FA",
          card: "#FFFFFF",
          cardHover: "#F8FAFC",
          border: "#E2E8F0",
          accentBlue: "#5B9DFF",
          accentPink: "#FFB5E8",
          accentPurple: "#A78BFA",
          text: "#1C1E21",
          textSecondary: "#64748B",
        },
      },
      maxWidth: {
        layout: "1135px",
        layoutLg: "1662px",
      },
      fontFamily: {
        questrial: ["Questrial", "sans-serif"],
      },
      spacing: {
        layout: "2rem",
      },
    },
  },
  plugins: [],
};
