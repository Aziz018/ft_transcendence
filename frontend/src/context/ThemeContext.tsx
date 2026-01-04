// Simplified theme context - always uses dark theme
export type Theme = "dark";

if (typeof window !== "undefined") {
  const root = document.documentElement;
  root.classList.add("dark");
}

export const themeService = {
  getTheme: (): Theme => "dark",
};

export const useTheme = () => {
  return {
    theme: "dark" as Theme,
  };
};
