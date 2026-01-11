# Global Theme System - Implementation Guide

## Overview

A complete global light/dark mode theming system for the ft_transcendence dashboard. The system uses:

- **CSS Variables** for dynamic color switching
- **React Context** for state management
- **localStorage** for persistence
- **TypeScript** for type safety

---

## Architecture

### Files Created/Modified

1. **`src/config/theme.ts`** - Theme configuration and color definitions
2. **`src/context/ThemeContext.tsx`** - Enhanced with CSS variable support
3. **`src/components/ThemeToggle/ThemeToggle.tsx`** - Beautiful toggle component
4. **`src/components/ThemeToggle/ThemeToggle.css`** - Toggle styling
5. **`src/library/hooks/useTheme.ts`** - Custom hook for theme usage
6. **`src/styles/css-variables.css`** - CSS variable definitions
7. **`src/global/style.css`** - Updated to use variables

---

## Color Palettes

### Dark Mode (Default)
```typescript
{
  bg: {
    primary: "#141517",      // Main background
    secondary: "#1a1c1e",    // Cards/modals
    tertiary: "#2a2c2e",     // Hover states
    input: "#2a2c2e",        // Input fields
  },
  text: {
    primary: "#F9F9F9",      // Main text
    secondary: "#ffffff99",  // Secondary text (60%)
    tertiary: "#ffffff60",   // Tertiary text (37%)
    inverse: "#141517",      // On light backgrounds
  },
  accent: {
    primary: "#DDA15E",      // Orange
    secondary: "#B7F272",    // Green
  },
  // ... more colors
}
```

### Light Mode
```typescript
{
  bg: {
    primary: "#F9F9F9",      // Light background
    secondary: "#FFFFFF",    // White cards
    tertiary: "#F5F5F5",     // Hover states
    input: "#FFFFFF",        // Input fields
  },
  text: {
    primary: "#141517",      // Dark text
    secondary: "#666666",    // Secondary text
    tertiary: "#999999",     // Tertiary text
    inverse: "#F9F9F9",      // On dark backgrounds
  },
  accent: {
    primary: "#B7F272",      // Green (primary in light)
    secondary: "#DDA15E",    // Orange (secondary in light)
  },
  // ... more colors
}
```

---

## Quick Start

### 1. Use the Toggle Component

Add to your dashboard header:

```tsx
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";

export default function Dashboard() {
  return (
    <header>
      {/* ... other header content ... */}
      <ThemeToggle showLabel={true} />
    </header>
  );
}
```

### 2. Use the useTheme Hook

In any component:

```tsx
import { useTheme } from "@/library/hooks/useTheme";

export default function MyComponent() {
  const { theme, isDark, toggleTheme, colors } = useTheme();

  return (
    <div style={{ backgroundColor: colors.bg.primary }}>
      <p style={{ color: colors.text.primary }}>
        Current theme: {theme}
      </p>
      <button 
        onClick={toggleTheme}
        style={{
          backgroundColor: colors.accent.primary,
          color: colors.text.inverse,
        }}
      >
        Toggle Theme
      </button>
    </div>
  );
}
```

### 3. Use CSS Variables in Stylesheets

```css
.my-component {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-base);
}

.my-component:hover {
  background-color: var(--bg-tertiary);
}

.my-component.danger {
  color: var(--accent-danger);
}
```

---

## Usage Examples

### Example 1: Theme Toggle in Header

```tsx
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";

export default function Header() {
  return (
    <header className="header">
      <h1>Dashboard</h1>
      
      {/* Compact toggle without label */}
      <ThemeToggle compact={true} showLabel={false} />
    </header>
  );
}
```

### Example 2: Dynamic Component Colors

```tsx
import { useTheme } from "@/library/hooks/useTheme";

export default function Card() {
  const { colors, isDark } = useTheme();

  return (
    <div
      style={{
        backgroundColor: colors.bg.secondary,
        borderColor: colors.border.primary,
        color: colors.text.primary,
      }}
      className="card"
    >
      <h2>My Card</h2>
      <p>This card adapts to {isDark ? "dark" : "light"} mode</p>
    </div>
  );
}
```

### Example 3: Themed Button

```tsx
import { useTheme } from "@/library/hooks/useTheme";

interface ButtonProps {
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
  onClick?: () => void;
}

export default function Button({ 
  variant = "primary", 
  children, 
  onClick 
}: ButtonProps) {
  const { colors } = useTheme();

  const accentMap = {
    primary: colors.accent.primary,
    secondary: colors.accent.secondary,
    danger: colors.accent.danger,
  };

  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: accentMap[variant],
        color: colors.text.inverse,
        border: "none",
        padding: "8px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 300ms ease",
      }}
    >
      {children}
    </button>
  );
}
```

### Example 4: CSS Variables in Styles

```tsx
import "./ChatWindow.css";
import { useTheme } from "@/library/hooks/useTheme";

export default function ChatWindow() {
  const { isDark } = useTheme();

  return (
    <div className={`chat-window ${isDark ? "dark" : "light"}`}>
      <div className="chat-header">Chat</div>
      <div className="chat-messages">
        {/* Messages here */}
      </div>
      <input className="chat-input" placeholder="Type message..." />
    </div>
  );
}
```

```css
/* ChatWindow.css */
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.chat-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-primary);
  font-weight: 600;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
}

.chat-input {
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  font-family: inherit;
}

.chat-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(var(--accent-primary), 0.1);
}
```

---

## CSS Variables Reference

### Background Colors
```css
--bg-primary        /* Main page/container background */
--bg-secondary      /* Cards, modals, elevated surfaces */
--bg-tertiary       /* Hover states, subtle backgrounds */
--bg-input          /* Input field background */
```

### Text Colors
```css
--text-primary      /* Main text content */
--text-secondary    /* Secondary text, descriptions */
--text-tertiary     /* Muted text, hints */
--text-inverse      /* Text on colored backgrounds */
```

### Border Colors
```css
--border-primary    /* Main borders, dividers */
--border-light      /* Light borders, subtle separators */
```

### Accent Colors
```css
--accent-primary    /* Primary action color (Orange in dark, Green in light) */
--accent-secondary  /* Secondary action color */
--accent-danger     /* Error/danger indicator */
--accent-success    /* Success indicator */
--accent-warning    /* Warning indicator */
```

### Status Colors
```css
--status-online     /* Online user indicator */
--status-offline    /* Offline user indicator */
--status-idle       /* Idle/away indicator */
```

### Other
```css
--overlay           /* Modal/dialog backdrop */
--spacing-*         /* Spacing utilities */
--radius-*          /* Border radius utilities */
--shadow-*          /* Box shadow utilities */
--transition-*      /* Animation timing */
```

---

## Theming Checklist

When building new components:

- [ ] Use `var(--bg-primary)` instead of hardcoded colors
- [ ] Use `var(--text-primary)` for main text
- [ ] Use `var(--border-primary)` for borders
- [ ] Use `var(--accent-primary)` for interactive elements
- [ ] Add smooth transitions with `var(--transition-base)`
- [ ] Test in both dark and light modes
- [ ] Ensure sufficient contrast for accessibility

---

## Adding New Colors

1. **Update `src/config/theme.ts`**:
   ```typescript
   export const DARK_THEME: ThemeColors = {
     // ... existing colors ...
     newColor: "#ABC123",
   };

   export const LIGHT_THEME: ThemeColors = {
     // ... existing colors ...
     newColor: "#XYZ789",
   };
   ```

2. **Update `src/styles/css-variables.css`**:
   ```css
   :root {
     --new-color: #ABC123;
   }

   html.light {
     --new-color: #XYZ789;
   }
   ```

3. **Use in components**:
   ```css
   .my-element {
     color: var(--new-color);
   }
   ```

---

## How It Works

### Theme Switching Flow

1. **User clicks toggle**
   ```
   ThemeToggle.tsx → onClick handler
   ```

2. **Theme service updates**
   ```
   themeService.setTheme(newTheme)
   ```

3. **CSS variables are applied**
   ```
   applyCSSVariables() → root.style.setProperty()
   ```

4. **Components re-render**
   ```
   useTheme hook notified → useState updated → component refreshed
   ```

5. **localStorage persists**
   ```
   localStorage.setItem("pong-rush-theme", newTheme)
   ```

### Why This Approach?

✅ **Performance**: CSS variables are instant, no page reload  
✅ **Flexibility**: Easy to add new colors without refactoring  
✅ **Maintainability**: Centralized color definitions  
✅ **Type-safe**: TypeScript ensures no typos  
✅ **Persistent**: User preference saved automatically  
✅ **Accessible**: Works with all modern browsers  

---

## Browser Support

- ✅ Chrome/Edge 49+
- ✅ Firefox 31+
- ✅ Safari 9.1+
- ✅ iOS Safari 9.3+

CSS variables are supported in all modern browsers.

---

## Troubleshooting

### Colors not updating?
- Clear browser cache
- Check if `html.light` or `html.dark` class is set
- Verify CSS is imported in correct order

### Theme not persisting?
- Check localStorage is enabled
- Look for "pong-rush-theme" in browser DevTools
- Clear localStorage and toggle theme again

### useTheme hook not working?
- Ensure you're importing from correct path
- Check that ThemeContext is initialized
- Verify component is wrapped in proper tree

---

## Best Practices

1. **Always use variables** - Never hardcode colors
2. **Use semantic names** - `var(--text-primary)` not `var(--color-a)`
3. **Group related styles** - Keep theme colors together
4. **Test both modes** - Don't just test in dark mode
5. **Plan for contrast** - Ensure readability in both themes
6. **Use transitions** - Add smooth animations on theme switch
7. **Document custom colors** - If adding new colors, document why

---

## File Structure

```
frontend/src/
├── config/
│   └── theme.ts                 # Theme definitions
├── context/
│   └── ThemeContext.tsx         # Theme service
├── components/
│   └── ThemeToggle/
│       ├── ThemeToggle.tsx      # Toggle component
│       └── ThemeToggle.css      # Toggle styles
├── library/
│   └── hooks/
│       └── useTheme.ts          # Custom hook
├── styles/
│   ├── css-variables.css        # CSS variable definitions
│   └── theme-utilities.css      # Tailwind utilities
└── global/
    └── style.css                # Global styles
```

---

## Next Steps

1. **Add toggle to dashboard header** - Use `<ThemeToggle />`
2. **Refactor existing components** - Replace hardcoded colors with variables
3. **Test in both themes** - Ensure everything looks good
4. **Document team colors** - Create shared color guide

Ready to switch themes! 🌓
