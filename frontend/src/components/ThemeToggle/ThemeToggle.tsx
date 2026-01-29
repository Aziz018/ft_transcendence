/**
 * Theme Toggle Component
 * 
 * Displays a beautiful toggle switch to switch between light and dark modes.
 * Can be placed in the dashboard header or settings.
 */

import React, { useEffect } from "react";
import { useState } from "react";
import { themeService } from "../../context/ThemeContext";
import { THEME_LABELS } from "../../config/theme";
import "./ThemeToggle.css";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

export const ThemeToggle = ({
  className = "",
  showLabel = true,
  compact = false,
}: ThemeToggleProps) => {
  const [isDark, setIsDark] = useState(themeService.getTheme() === "dark");

  useEffect(() => {
    const unsubscribe = themeService.subscribe((theme) => {
      setIsDark(theme === "dark");
    });

    return () => unsubscribe();
  }, []);

  const handleToggle = () => {
    themeService.toggleTheme();
  };

  const currentTheme = isDark ? "dark" : "light";

  return (
    <div className={`theme-toggle-container ${className}`}>
      <button
        className={`theme-toggle ${compact ? "compact" : ""}`}
        onClick={handleToggle}
        aria-label="Toggle theme"
        title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
      >
        {/* Sun Icon (for light mode) */}
        <svg
          className="theme-toggle-icon sun-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>

        {/* Moon Icon (for dark mode) */}
        <svg
          className="theme-toggle-icon moon-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>

        {/* Slider */}
        <div className="theme-toggle-slider"></div>
      </button>

      {showLabel && (
        <span className="theme-toggle-label">
          {THEME_LABELS[currentTheme]}
        </span>
      )}
    </div>
  );
};

export default ThemeToggle;
