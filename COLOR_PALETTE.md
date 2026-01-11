# Color Palette Reference

## Dark Mode (Default)

### Backgrounds
- Primary: `#141517` (Main background)
- Secondary: `#1a1c1e` (Cards/modals)
- Tertiary: `#2a2c2e` (Hover states)
- Input: `#2a2c2e` (Input fields)

### Text
- Primary: `#F9F9F9` (Main text - light)
- Secondary: `#ffffff99` (Secondary text - 60% opacity)
- Tertiary: `#ffffff60` (Muted text - 37% opacity)
- Inverse: `#141517` (On light backgrounds)

### Borders
- Primary: `#444444`
- Light: `#333333`

### Accents
- Primary: `#DDA15E` (Orange)
- Secondary: `#B7F272` (Green)
- Warning: `#FFD43B` (Yellow)
- Success: `#51CF66` (Green)
- Danger: `#FF6B6B` (Red)

### Status
- Online: `#51CF66` (Green)
- Offline: `#666666` (Gray)
- Idle: `#FFD43B` (Yellow)

### Overlay
- `rgba(20, 21, 23, 0.7)` (Dark overlay with opacity)

---

## Light Mode

### Backgrounds
- Primary: `#F9F9F9` (Light background)
- Secondary: `#FFFFFF` (White cards)
- Tertiary: `#F5F5F5` (Hover states)
- Input: `#FFFFFF` (Input fields)

### Text
- Primary: `#141517` (Main text - dark)
- Secondary: `#666666` (Secondary text)
- Tertiary: `#999999` (Muted text)
- Inverse: `#F9F9F9` (On dark backgrounds)

### Borders
- Primary: `#E0E0E0`
- Light: `#F0F0F0`

### Accents (SWAPPED in Light Mode)
- Primary: `#B7F272` (Green - becomes primary)
- Secondary: `#DDA15E` (Orange - becomes secondary)
- Warning: `#F59F00` (Orange)
- Success: `#40C057` (Green)
- Danger: `#E03131` (Red)

### Status
- Online: `#40C057` (Green)
- Offline: `#999999` (Gray)
- Idle: `#F59F00` (Orange)

### Overlay
- `rgba(0, 0, 0, 0.3)` (Dark overlay with less opacity)

---

## CSS Variables in Code

All colors are available as CSS variables:

```css
/* Use in CSS */
.my-component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}
```

## Tailwind Classes in Code

Or use Tailwind utility classes:

```tsx
<div className="bg-theme-bg-primary text-theme-text-primary border border-theme-border-primary">
```

## JavaScript Hook

Or access colors dynamically in React:

```tsx
import { useTheme } from "@/library/hooks/useTheme";

export default function MyComponent() {
  const { colors } = useTheme();
  
  return (
    <div style={{
      backgroundColor: colors.bg.primary,
      color: colors.text.primary,
    }}>
    </div>
  );
}
```

---

## How Theme Colors Flow

```
Color Definition (theme.ts)
  ↓
DARK_THEME / LIGHT_THEME objects
  ↓
getThemeColors(theme) function
  ↓
applyCSSVariables() dynamically sets --bg-primary, --text-primary, etc.
  ↓
CSS variables available to all components
  ↓
Tailwind utilities (bg-theme-bg-primary) use var(--bg-primary)
  ↓
Components instantly update colors when theme changes
```

---

## Quick Reference: What Changes Between Modes

| Element | Dark Mode | Light Mode | Swap |
|---------|-----------|------------|------|
| Background | #141517 | #F9F9F9 | ✅ |
| Text | #F9F9F9 | #141517 | ✅ |
| Primary Accent | #DDA15E (orange) | #B7F272 (green) | ✅ |
| Secondary Accent | #B7F272 (green) | #DDA15E (orange) | ✅ |
| Borders | #444444 | #E0E0E0 | ✅ |
| Overlay | 70% dark | 30% dark | Reduced |

---

## Implementation Location

**Source of Truth:** `frontend/src/config/theme.ts`
- Lines 50-90: DARK_THEME definition
- Lines 92-130: LIGHT_THEME definition
- Lines 140-145: getThemeColors() function
- Lines 147-179: generateCSSVariables() function

**Applied Via:** `frontend/src/context/ThemeContext.tsx`
- Lines 11-38: applyCSSVariables() function
- Lines 40-62: applyTheme() function
- Lines 64-71: Initial theme application

**Available As:** `frontend/tailwind.config.js`
- Lines 8-23: theme.colors.theme configuration

---

**All colors persist and update globally when user clicks theme toggle!**
