/**
 * Theme Configuration
 * 
 * Defines color palettes for light and dark modes.
 * CSS variables are generated from these definitions.
 */

export type Theme = "dark" | "light";

export interface ThemeColors {
  // Primary backgrounds
  bg: {
    primary: string;      // Main background
    secondary: string;    // Cards, modals
    tertiary: string;     // Hover states
    input: string;        // Input fields
  };

  // Text colors
  text: {
    primary: string;      // Main text
    secondary: string;    // Secondary text
    tertiary: string;     // Muted text
    inverse: string;      // Inverse (used on colored backgrounds)
  };

  // Borders
  border: {
    primary: string;      // Main borders
    light: string;        // Light borders
  };

  // Accent colors
  accent: {
    primary: string;      // Primary accent
    secondary: string;    // Secondary accent
    danger: string;       // Danger/error
    success: string;      // Success
    warning: string;      // Warning
  };

  // Semantic colors
  status: {
    online: string;
    offline: string;
    idle: string;
  };

  // Overlay
  overlay: string;        // Modal overlay
}

/**
 * Dark Mode Color Palette
 * Original design colors
 */
export const DARK_THEME: ThemeColors = {
  bg: {
    primary: "#141517",    // Dark navy background
    secondary: "#1a1c1e",  // Card background
    tertiary: "#2a2c2e",   // Hover state
    input: "#2a2c2e",      // Input field background
  },
  text: {
    primary: "#F9F9F9",    // Main text (light)
    secondary: "#ffffff99", // Secondary text (60% opacity)
    tertiary: "#ffffff60",  // Tertiary text (37% opacity)
    inverse: "#141517",    // Inverse text (on light backgrounds)
  },
  border: {
    primary: "#444444",
    light: "#333333",
  },
  accent: {
    primary: "#DDA15E",    // Orange accent
    secondary: "#B7F272",  // Green accent
    danger: "#FF6B6B",
    success: "#51CF66",
    warning: "#FFD43B",
  },
  status: {
    online: "#51CF66",
    offline: "#666666",
    idle: "#FFD43B",
  },
  overlay: "rgba(20, 21, 23, 0.7)",
};

/**
 * Light Mode Color Palette
 * Inverted design for light theme
 */
export const LIGHT_THEME: ThemeColors = {
  bg: {
    primary: "#F9F9F9",    // Light background
    secondary: "#FFFFFF",  // White cards
    tertiary: "#F5F5F5",   // Hover state
    input: "#FFFFFF",      // Input field background
  },
  text: {
    primary: "#141517",    // Dark text
    secondary: "#666666",  // Secondary text
    tertiary: "#999999",   // Tertiary text
    inverse: "#F9F9F9",    // Inverse text (on dark backgrounds)
  },
  border: {
    primary: "#E0E0E0",
    light: "#F0F0F0",
  },
  accent: {
    primary: "#B7F272",    // Green accent (primary in light mode)
    secondary: "#DDA15E",  // Orange accent (secondary in light mode)
    danger: "#E03131",
    success: "#40C057",
    warning: "#F59F00",
  },
  status: {
    online: "#40C057",
    offline: "#999999",
    idle: "#F59F00",
  },
  overlay: "rgba(0, 0, 0, 0.3)",
};

/**
 * Theme names for display
 */
export const THEME_LABELS: Record<Theme, string> = {
  dark: "Dark Mode",
  light: "Light Mode",
};

/**
 * Get theme colors by theme type
 */
export const getThemeColors = (theme: Theme): ThemeColors => {
  return theme === "dark" ? DARK_THEME : LIGHT_THEME;
};

/**
 * Convert theme colors to CSS variables
 */
export const generateCSSVariables = (theme: Theme): string => {
  const colors = getThemeColors(theme);

  return `
    /* Background Colors */
    --bg-primary: ${colors.bg.primary};
    --bg-secondary: ${colors.bg.secondary};
    --bg-tertiary: ${colors.bg.tertiary};
    --bg-input: ${colors.bg.input};

    /* Text Colors */
    --text-primary: ${colors.text.primary};
    --text-secondary: ${colors.text.secondary};
    --text-tertiary: ${colors.text.tertiary};
    --text-inverse: ${colors.text.inverse};

    /* Border Colors */
    --border-primary: ${colors.border.primary};
    --border-light: ${colors.border.light};

    /* Accent Colors */
    --accent-primary: ${colors.accent.primary};
    --accent-secondary: ${colors.accent.secondary};
    --accent-danger: ${colors.accent.danger};
    --accent-success: ${colors.accent.success};
    --accent-warning: ${colors.accent.warning};

    /* Status Colors */
    --status-online: ${colors.status.online};
    --status-offline: ${colors.status.offline};
    --status-idle: ${colors.status.idle};

    /* Overlay */
    --overlay: ${colors.overlay};
  `;
};
