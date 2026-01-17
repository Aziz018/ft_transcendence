# 🚀 Implementation Guide - PONG RUSH Design System

## Quick Start

### 1. Import Global Styles

Your `src/global/style.css` now includes:
- All CSS variables
- All animations
- Glass morphism effects
- Glow animations

Everything is automatically available via Tailwind.

### 2. Use Design System Colors

```tsx
// Neon Cyan
<div className="text-cyan-500 bg-cyan-500 border-cyan-500">

// Voltage Purple
<div className="text-purple-500 bg-purple-500 border-purple-500">

// Neon Lime
<div className="text-lime-500 bg-lime-500 border-lime-500">

// Dark Backgrounds
<div className="bg-dark-950 bg-dark-900">

// Text Colors
<p className="text-white text-text-secondary text-text-tertiary">
```

### 3. Add Glow Effects

```tsx
// Cyan glow
<div className="shadow-glow-cyan hover:shadow-glow-cyan-lg">

// Purple glow
<div className="shadow-glow-purple hover:shadow-glow-purple-lg">

// Lime glow
<div className="shadow-glow-lime">
```

### 4. Use Animations

```tsx
// Fade in
<div className="animate-fade-in">

// Slide in
<div className="animate-slide-in-up">
<div className="animate-slide-in-left">

// Glow pulse
<div className="animate-glow-pulse">

// Float
<div className="animate-float animate-float-slow">
```

### 5. Use Premium Components

```tsx
import { PremiumCard, PremiumCardHeader, PremiumCardBody } from "@/components/PremiumCard";
import { GlowButton } from "@/components/GlowButton";
import { StatusOrb } from "@/components/StatusOrb";
import { AnimatedBackground } from "@/components/AnimatedBackground";

// In your component
<AnimatedBackground type="combined" intensity="medium" />

<PremiumCard glowColor="cyan" gradient>
  <PremiumCardHeader title="Title" icon="🎮" />
  <PremiumCardBody>Content</PremiumCardBody>
</PremiumCard>

<GlowButton variant="primary" size="lg">Click me</GlowButton>

<StatusOrb userStatus="playing" />
```

---

## File Locations

| File | Purpose |
|------|---------|
| `src/config/design-system.ts` | Design tokens, colors, typography |
| `src/global/animations.css` | All keyframes and animations |
| `src/global/style.css` | Main styles (updated) |
| `tailwind.config.js` | Tailwind configuration (updated) |
| `src/components/StatusOrb/StatusOrb.tsx` | Game status indicator |
| `src/components/PremiumCard/PremiumCard.tsx` | Premium card component |
| `src/components/GlowButton/GlowButton.tsx` | Glow button component |
| `src/components/AnimatedBackground/AnimatedBackground.tsx` | Animated background |

---

## What Was Removed

❌ Theme toggle button
❌ Light mode colors
❌ ThemeContext (context/ThemeContext.tsx)
❌ ThemeToggle component (components/ThemeToggle/)
❌ Dark mode CSS variables

---

## Customization

### Change Primary Color

Edit `src/config/design-system.ts`:

```typescript
primary: {
  main: "#00F0FF",        // Change this
  dark: "#00B8CC",
  light: "#66FFFF",
  glow: "rgba(0, 240, 255, 0.3)",
  rgb: "0, 240, 255",
},
```

Then update CSS variables in `src/global/animations.css`:

```css
--color-primary: #00f0ff;  /* Change this */
--color-primary-rgb: 0, 240, 255;
```

### Adjust Animation Speed

In `src/global/animations.css`:

```css
--duration-fast: 150ms;
--duration-base: 300ms;
--duration-slow: 500ms;
```

Or in components:

```tsx
<motion.div
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}  // Custom duration
>
```

### Modify Glow Intensity

Edit shadow values in `tailwind.config.js`:

```javascript
boxShadow: {
  "glow-cyan": "0 0 20px rgba(0, 240, 255, 0.5), ...", // More intense
}
```

---

## Common Patterns

### Premium Card with Icon

```tsx
<PremiumCard glowColor="cyan">
  <PremiumCardHeader
    title="Upcoming Match"
    subtitle="Tournament Finals"
    icon="🏆"
  />
  <PremiumCardBody>
    You are matched with: Alex
  </PremiumCardBody>
</PremiumCard>
```

### Button with Loading State

```tsx
<GlowButton
  variant="primary"
  size="lg"
  loading={isLoading}
  onClick={() => startGame()}
>
  {isLoading ? "Loading..." : "Start Game"}
</GlowButton>
```

### Status Badge

```tsx
<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-cyan-500 border-opacity-30">
  <span className="text-lime-500">●</span>
  <span className="text-sm font-mono text-white">Online</span>
</div>
```

### Glowing Card Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <PremiumCard key={item.id} glowColor="cyan" animate>
      {/* Card content */}
    </PremiumCard>
  ))}
</div>
```

### Hero Section

```tsx
<div className="relative min-h-screen bg-gradient-dark overflow-hidden">
  <AnimatedBackground type="combined" intensity="medium" />
  
  <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center">
    <h1 className="text-6xl font-bold text-white font-display mb-4 animate-fade-in">
      PONG RUSH
    </h1>
    <p className="text-xl text-text-secondary mb-8">
      Next-Generation Esports Platform
    </p>
    <GlowButton variant="primary" size="lg">
      Enter Tournament
    </GlowButton>
  </div>
</div>
```

---

## Animation Combinations

### Entrance + Glow

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="shadow-glow-cyan"
>
  Content
</motion.div>
```

### Hover Scale + Glow

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  className="shadow-glow-cyan hover:shadow-glow-cyan-lg"
>
  Click me
</motion.button>
```

### Pulse + Float

```tsx
<div className="animate-pulse animate-float">
  Pulsing floating element
</div>
```

---

## Performance Tips

1. **Use `will-change` for heavy animations**
   ```css
   .animated {
     will-change: transform, opacity;
   }
   ```

2. **Limit AnimatedBackground complexity**
   ```tsx
   // Light version for mobile
   <AnimatedBackground type="particles" intensity="light" />
   ```

3. **Memoize components**
   ```tsx
   export const MyCard = React.memo(PremiumCard);
   ```

4. **Use CSS animations over JS when possible**
   ```css
   /* Fast CSS animation */
   @keyframes glow {
     ...
   }
   ```

---

## Responsive Grid Example

```tsx
<div className="grid 
  grid-cols-1      /* Mobile: 1 column */
  sm:grid-cols-2   /* Small: 2 columns */
  md:grid-cols-2   /* Medium: 2 columns */
  lg:grid-cols-3   /* Large: 3 columns */
  xl:grid-cols-4   /* Extra large: 4 columns */
  gap-4 sm:gap-6
">
  {/* Grid items */}
</div>
```

---

## Testing Colors for Accessibility

Use this tool to check contrast:
https://webaim.org/resources/contrastchecker/

Target ratios:
- **AAA (Preferred)**: 7:1
- **AA (Minimum)**: 4.5:1

Our neon colors on dark background: ✅ All pass AAA

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Note**: Backdrop blur not supported in older browsers (graceful degradation)

---

## Troubleshooting

### Colors not applying?

1. Check imports in your component
2. Verify class names (e.g., `text-cyan-500` not `text-primary`)
3. Clear cache: `npm run build` then restart dev server

### Animations not working?

1. Verify Framer Motion is installed: `npm install framer-motion gsap`
2. Check animation names in CSS
3. Ensure `global/animations.css` is imported in `style.css`

### Glow effects not visible?

1. Check background color (needs dark background)
2. Verify shadow classes are applied
3. Test with DevTools to confirm styles are loaded

### Text not readable?

1. Check contrast ratio (should be 4.5:1 minimum)
2. Increase font size if needed
3. Use `text-white` on dark backgrounds

---

## Next Steps

1. **Update all screens** with new component patterns
2. **Add animations** to dashboard transitions
3. **Implement** StatusOrb in all header/navbar areas
4. **Test** on mobile devices
5. **Gather feedback** and iterate

---

## Resources

- **Design Tokens**: `src/config/design-system.ts`
- **System Documentation**: `DESIGN_SYSTEM.md`
- **Tailwind Docs**: https://tailwindcss.com/docs
- **Framer Motion Docs**: https://www.framer.com/motion/
- **GSAP Docs**: https://greensock.com/docs

---

**Version**: 1.0.0  
**Last Updated**: January 17, 2026  
**Status**: ✅ Ready to Use
