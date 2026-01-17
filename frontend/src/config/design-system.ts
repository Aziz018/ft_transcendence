/**
 * PONG RUSH - Premium Gaming/Esports Design System
 * 
 * Color Palette: Cyber-futuristic theme with gaming aesthetic
 * Last Updated: January 17, 2026
 */

// ============================================================
// PRIMARY COLORS - The Soul of the Brand
// ============================================================

export const COLORS = {
  // PRIMARY ACCENT - Neon Cyan / Electric Blue
  primary: {
    main: "#00F0FF",        // Bright Neon Cyan - Primary CTA, highlights
    dark: "#00B8CC",        // Darker cyan for hover states
    light: "#66FFFF",       // Lighter for glows
    glow: "rgba(0, 240, 255, 0.3)", // For shadows and glows
    rgb: "0, 240, 255",     // RGB version for opacity
  },

  // SECONDARY - Voltage Purple (Neon Purple)
  secondary: {
    main: "#AA00FF",        // Vibrant purple for secondary actions
    dark: "#8800CC",        // Darker purple for hover
    light: "#CC66FF",       // Lighter purple
    glow: "rgba(170, 0, 255, 0.3)",
    rgb: "170, 0, 255",
  },

  // TERTIARY - Neon Lime (Energy Green)
  tertiary: {
    main: "#39FF14",        // Bright neon green - Highlights, success
    dark: "#2BB810",        // Darker green
    light: "#7FFF5C",       // Lighter green
    glow: "rgba(57, 255, 20, 0.2)",
    rgb: "57, 255, 20",
  },

  // BACKGROUNDS - Deep Space Navy
  background: {
    // Deep blacks with blue undertones
    primary: "#0A0E27",     // Main background - Deep midnight blue-black
    secondary: "#12182F",   // Cards, panels - Slightly lighter
    tertiary: "#191F3D",    // Tertiary layers
    surface: "#1E2747",     // Elevated surfaces
    overlay: "#0A0E27",     // Modal overlays (80% opacity)
  },

  // TEXT COLORS - High contrast for readability
  text: {
    primary: "#FFFFFF",     // Main text - Pure white
    secondary: "#B0B8D4",   // Secondary text - Cool gray-blue
    tertiary: "#7A8599",    // Muted text - Darker cool gray
    inverse: "#0A0E27",     // Text on light/bright backgrounds
  },

  // BORDERS - Subtle but stylish
  border: {
    primary: "#3A4563",     // Main borders
    glow: "#00F0FF",        // Glowing borders (accent color)
    subtle: "#252E47",      // Very subtle borders
  },

  // SEMANTIC COLORS
  semantic: {
    success: "#39FF14",     // Green - Success states
    warning: "#FFB500",     // Orange-Gold - Warnings
    danger: "#FF2E63",      // Hot Pink-Red - Errors
    info: "#00F0FF",        // Cyan - Info
  },

  // STATUS INDICATORS
  status: {
    online: "#39FF14",      // Neon green
    idle: "#FFB500",        // Orange-gold
    offline: "#7A8599",     // Cool gray
    playing: "#00F0FF",     // Cyan
    spectating: "#AA00FF",  // Purple
  },

  // GRADIENTS - For premium feel
  gradients: {
    // Cyan to Purple gradient
    primary: "linear-gradient(135deg, #00F0FF 0%, #AA00FF 100%)",
    // Purple to Lime gradient
    secondary: "linear-gradient(135deg, #AA00FF 0%, #39FF14 100%)",
    // Cyan to Lime gradient
    tertiary: "linear-gradient(135deg, #00F0FF 0%, #39FF14 100%)",
    // Dark gradient for backgrounds
    background: "linear-gradient(135deg, #0A0E27 0%, #12182F 100%)",
    // Premium card gradient
    card: "linear-gradient(135deg, rgba(18, 24, 47, 0.8) 0%, rgba(30, 39, 71, 0.6) 100%)",
  },
};

// ============================================================
// TYPOGRAPHY SYSTEM
// ============================================================

export const TYPOGRAPHY = {
  // Font families
  fontFamily: {
    primary: '"Questrial", "Inter", sans-serif',
    mono: '"IBM Plex Mono", monospace',
    display: '"Space Grotesk", "Questrial", sans-serif',
  },

  // Font sizes
  size: {
    xs: "0.75rem",      // 12px
    sm: "0.875rem",     // 14px
    base: "1rem",       // 16px
    lg: "1.125rem",     // 18px
    xl: "1.25rem",      // 20px
    "2xl": "1.5rem",    // 24px
    "3xl": "1.875rem",  // 30px
    "4xl": "2.25rem",   // 36px
    "5xl": "3rem",      // 48px
  },

  // Font weights
  weight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Letter spacing for premium feel
  letterSpacing: {
    tight: "-0.02em",
    normal: "0em",
    wide: "0.05em",
    wider: "0.1em",
  },
};

// ============================================================
// SPACING SYSTEM
// ============================================================

export const SPACING = {
  // Base unit: 4px
  0: "0",
  1: "0.25rem",   // 4px
  2: "0.5rem",    // 8px
  3: "0.75rem",   // 12px
  4: "1rem",      // 16px
  6: "1.5rem",    // 24px
  8: "2rem",      // 32px
  12: "3rem",     // 48px
  16: "4rem",     // 64px
  20: "5rem",     // 80px
  24: "6rem",     // 96px
};

// ============================================================
// BORDER RADIUS - Curved edges for gaming feel
// ============================================================

export const BORDER_RADIUS = {
  none: "0",
  sm: "0.25rem",    // 4px
  base: "0.5rem",   // 8px
  md: "0.75rem",    // 12px
  lg: "1rem",       // 16px
  xl: "1.5rem",     // 24px
  "2xl": "2rem",    // 32px
  full: "9999px",
};

// ============================================================
// SHADOWS - Glow effects for futuristic feel
// ============================================================

export const SHADOWS = {
  // Subtle shadows
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",

  // Glow effects (primary color)
  "glow-cyan": "0 0 20px rgba(0, 240, 255, 0.3), 0 0 40px rgba(0, 240, 255, 0.15)",
  "glow-cyan-lg": "0 0 40px rgba(0, 240, 255, 0.5), 0 0 80px rgba(0, 240, 255, 0.25)",

  // Glow effects (secondary color)
  "glow-purple": "0 0 20px rgba(170, 0, 255, 0.3), 0 0 40px rgba(170, 0, 255, 0.15)",
  "glow-purple-lg": "0 0 40px rgba(170, 0, 255, 0.5), 0 0 80px rgba(170, 0, 255, 0.25)",

  // Glow effects (tertiary color)
  "glow-lime": "0 0 20px rgba(57, 255, 20, 0.3), 0 0 40px rgba(57, 255, 20, 0.15)",
  "glow-lime-lg": "0 0 40px rgba(57, 255, 20, 0.5), 0 0 80px rgba(57, 255, 20, 0.25)",
};

// ============================================================
// Z-INDEX HIERARCHY
// ============================================================

export const Z_INDEX = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
};

// ============================================================
// ANIMATION DURATIONS
// ============================================================

export const ANIMATION = {
  fast: "150ms",
  base: "300ms",
  slow: "500ms",
  slower: "700ms",
  slowest: "1000ms",

  // Easing functions
  easing: {
    linear: "linear",
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
    smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
    smoothIn: "cubic-bezier(0.4, 0, 1, 1)",
    smoothOut: "cubic-bezier(0, 0, 0.2, 1)",
  },
};

// ============================================================
// EXPORT PRESET COMBINATIONS
// ============================================================

export const DESIGN_SYSTEM = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  zIndex: Z_INDEX,
  animation: ANIMATION,
};

export default DESIGN_SYSTEM;
