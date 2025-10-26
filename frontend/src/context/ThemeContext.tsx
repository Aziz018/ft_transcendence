import { useState } from "../library/hooks/useState";
import { useEffect } from "../library/hooks/useEffect";

export type Theme = "dark" | "light";

let currentTheme: Theme = "dark";
let themeListeners: Array<(theme: Theme) => void> = [];

if (typeof window !== "undefined") {
  const saved = localStorage.getItem("pong-rush-theme");
  currentTheme = (saved as Theme) || "dark";

  const root = document.documentElement;
  if (currentTheme === "light") {
    root.classList.remove("dark");
    root.classList.add("light");
  } else {
    root.classList.remove("light");
    root.classList.add("dark");
  }
}

export const themeService = {
  getTheme: (): Theme => currentTheme,

  setTheme: (theme: Theme) => {
    currentTheme = theme;
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.remove("light");
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }

    localStorage.setItem("pong-rush-theme", theme);
    themeListeners.forEach((listener) => listener(theme));
  },

  toggleTheme: () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    themeService.setTheme(newTheme);
  },

  subscribe: (listener: (theme: Theme) => void) => {
    themeListeners.push(listener);
    return () => {
      themeListeners = themeListeners.filter((l) => l !== listener);
    };
  },
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(themeService.getTheme());

  useEffect(() => {
    const unsubscribe = themeService.subscribe((newTheme) => {
      setTheme(newTheme);
    });
    return unsubscribe;
  }, []);

  return {
    theme,
    toggleTheme: themeService.toggleTheme,
    setTheme: themeService.setTheme,
  };
};
