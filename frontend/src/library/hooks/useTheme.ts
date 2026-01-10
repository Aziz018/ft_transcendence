/**
 * useTheme Hook
 * 
 * Easy way to access and control the theme throughout your components.
 * 
 * Usage:
 *   const { theme, isDark, toggleTheme, setTheme } = useTheme();
 */

import { useState } from "../../index";
import { useEffect } from "./useEffect";
import { themeService } from "../../context/ThemeContext";
import { Theme, getThemeColors, ThemeColors } from "../../config/theme";

interface UseThemeReturn {
  /** Current theme ("dark" or "light") */
  theme: Theme;
  
  /** Is dark mode enabled */
  isDark: boolean;
  
  /** Is light mode enabled */
  isLight: boolean;
  
  /** Toggle between light and dark mode */
  toggleTheme: () => void;
  
  /** Set a specific theme */
  setTheme: (theme: Theme) => void;
  
  /** Get the current theme's color palette */
  colors: ThemeColors;
}

/**
 * Custom hook to use theme in components
 * 
 * @returns {UseThemeReturn} Theme utilities and colors
 * 
 * @example
 * ```tsx
 * const { theme, isDark, toggleTheme, colors } = useTheme();
 * 
 * return (
 *   <div style={{ backgroundColor: colors.bg.primary }}>
 *     <button onClick={toggleTheme}>
 *       Switch to {isDark ? "Light" : "Dark"} Mode
 *     </button>
 *   </div>
 * );
 * ```
 */
export const useTheme = (): UseThemeReturn => {
  const [theme, setThemeState] = useState<Theme>(themeService.getTheme());

  useEffect(() => {
    // Subscribe to theme changes
    const unsubscribe = themeService.subscribe((newTheme) => {
      setThemeState(newTheme);
    });

    return () => unsubscribe();
  }, []);

  return {
    theme,
    isDark: theme === "dark",
    isLight: theme === "light",
    toggleTheme: themeService.toggleTheme,
    setTheme: themeService.setTheme,
    colors: getThemeColors(theme),
  };
};

export default useTheme;
