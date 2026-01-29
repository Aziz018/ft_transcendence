import { useState, useEffect } from "react";
import { Theme, getThemeColors, generateCSSVariables } from "../config/theme";

let currentTheme: Theme = "dark";
let themeListeners: Array<(theme: Theme) => void> = [];

/**
 * Apply CSS variables to document root
 */
const applyCSSVariables = (theme: Theme) => {
  const root = document.documentElement;
  const colors = getThemeColors(theme);
  
  // Set inline CSS variables for immediate effect
  root.style.setProperty("--bg-primary", colors.bg.primary);
  root.style.setProperty("--bg-secondary", colors.bg.secondary);
  root.style.setProperty("--bg-tertiary", colors.bg.tertiary);
  root.style.setProperty("--bg-input", colors.bg.input);
  
  root.style.setProperty("--text-primary", colors.text.primary);
  root.style.setProperty("--text-secondary", colors.text.secondary);
  root.style.setProperty("--text-tertiary", colors.text.tertiary);
  root.style.setProperty("--text-inverse", colors.text.inverse);
  
  root.style.setProperty("--border-primary", colors.border.primary);
  root.style.setProperty("--border-light", colors.border.light);
  
  root.style.setProperty("--accent-primary", colors.accent.primary);
  root.style.setProperty("--accent-secondary", colors.accent.secondary);
  root.style.setProperty("--accent-warning", colors.accent.warning);
  root.style.setProperty("--accent-success", colors.accent.success);
  root.style.setProperty("--accent-danger", colors.accent.danger);
  
  root.style.setProperty("--status-online", colors.status.online);
  root.style.setProperty("--status-offline", colors.status.offline);
  root.style.setProperty("--status-idle", colors.status.idle);
  
  root.style.setProperty("--overlay", colors.overlay);
};

/**
 * Apply theme class and CSS variables
 */
const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  const body = document.body;

  // Apply class for CSS selectors
  if (theme === "light") {
    root.classList.remove("dark");
    root.classList.add("light");
  } else {
    root.classList.remove("light");
    root.classList.add("dark");
  }
  
  // Apply data attribute for additional targeting
  root.setAttribute("data-theme", theme);
  body.setAttribute("data-theme", theme);
  
  // Apply CSS variables
  applyCSSVariables(theme);
};

// Initialize theme on load
if (typeof window !== "undefined") {
  const saved = localStorage.getItem("pong-rush-theme") as Theme | null;
  currentTheme = saved || "dark";
  
  // Apply initial theme (both class and CSS variables)
  applyTheme(currentTheme);
}

export const themeService = {
  getTheme: (): Theme => currentTheme,

  setTheme: (theme: Theme) => {
    currentTheme = theme;
    applyTheme(theme);
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
