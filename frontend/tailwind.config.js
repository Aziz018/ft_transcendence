/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Dynamic colors from CSS variables
        theme: {
          "bg-primary": "var(--bg-primary)",
          "bg-secondary": "var(--bg-secondary)",
          "bg-tertiary": "var(--bg-tertiary)",
          "text-primary": "var(--text-primary)",
          "text-secondary": "var(--text-secondary)",
          "text-tertiary": "var(--text-tertiary)",
          "text-inverse": "var(--text-inverse)",
          "accent-primary": "var(--accent-primary)",
          "accent-secondary": "var(--accent-secondary)",
          "border-primary": "var(--border-primary)",
          "border-light": "var(--border-light)",
        },
        // Static fallback colors
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

