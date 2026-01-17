# 🎮 PONG RUSH - Premium Gaming/Esports Design System

## Overview

A unified, premium visual identity designed for next-generation esports platforms. NO light/dark mode switching - single cohesive vision with premium gaming aesthetics.

---

## 🎨 Color System

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Neon Cyan** | `#00F0FF` | `0, 240, 255` | Primary accent, CTAs, highlights, main focus |
| **Voltage Purple** | `#AA00FF` | `170, 0, 255` | Secondary actions, alternate highlights |
| **Neon Lime** | `#39FF14` | `57, 255, 20` | Success, positive feedback, energy |

### Backgrounds

| Name | Hex | Usage |
|------|-----|-------|
| **Deep Midnight** | `#0A0E27` | Primary background |
| **Dark Navy** | `#12182F` | Cards, panels, secondary surfaces |
| **Surface** | `#1E2747` | Elevated surfaces, modals |
| **Tertiary** | `#191F3D` | Tertiary layers |

### Text Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Pure White** | `#FFFFFF` | Primary text, main content |
| **Cool Gray-Blue** | `#B0B8D4` | Secondary text, descriptions |
| **Muted Gray** | `#7A8599` | Tertiary text, disabled states |

### Semantic Colors

| State | Color | Hex |
|-------|-------|-----|
| Success | Neon Lime | `#39FF14` |
| Warning | Orange-Gold | `#FFB500` |
| Danger | Hot Pink | `#FF2E63` |
| Info | Neon Cyan | `#00F0FF` |

### Status Indicators

| Status | Color | Usage |
|--------|-------|-------|
| **Online** | `#39FF14` | User is active |
| **Idle** | `#FFB500` | User is idle |
| **Offline** | `#7A8599` | User is offline |
| **Playing** | `#00F0FF` | User is in a game |
| **Spectating** | `#AA00FF` | User is spectating |

---

## 📐 Typography System

### Font Families

```css
/* Display - Headers */
font-family: "Space Grotesk", "Questrial", sans-serif;

/* Body - Main content */
font-family: "Questrial", "Inter", sans-serif;

/* Code/Mono - Technical elements */
font-family: "IBM Plex Mono", monospace;
```

### Font Sizes

```
xs:   12px  (0.75rem)
sm:   14px  (0.875rem)
base: 16px  (1rem)
lg:   18px  (1.125rem)
xl:   20px  (1.25rem)
2xl:  24px  (1.5rem)
3xl:  30px  (1.875rem)
4xl:  36px  (2.25rem)
5xl:  48px  (3rem)
```

### Font Weights

- Light: 300
- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700
- Extrabold: 800

### Line Heights

- Tight: 1.2
- Normal: 1.5
- Relaxed: 1.75
- Loose: 2

---

## 🎪 Spacing System

Base unit: **4px**

```
0:   0px
1:   4px
2:   8px
3:   12px
4:   16px
6:   24px
8:   32px
12:  48px
16:  64px
20:  80px
24:  96px
```

---

## 🔲 Border Radius

```
sm:   4px    (0.25rem)
md:   8px    (0.5rem)
lg:   12px   (0.75rem)
xl:   16px   (1rem)
2xl:  32px   (2rem)
full: 9999px
```

---

## ✨ Shadow & Glow System

### Standard Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

### Glow Effects (Neon)

```css
/* Cyan Glow */
--shadow-glow-cyan: 0 0 20px rgba(0, 240, 255, 0.3), 
                    0 0 40px rgba(0, 240, 255, 0.15);
--shadow-glow-cyan-lg: 0 0 40px rgba(0, 240, 255, 0.5), 
                       0 0 80px rgba(0, 240, 255, 0.25);

/* Purple Glow */
--shadow-glow-purple: 0 0 20px rgba(170, 0, 255, 0.3), 
                      0 0 40px rgba(170, 0, 255, 0.15);

/* Lime Glow */
--shadow-glow-lime: 0 0 20px rgba(57, 255, 20, 0.3), 
                    0 0 40px rgba(57, 255, 20, 0.15);
```

---

## 🎬 Animation Timings

```
Fast:   150ms
Base:   300ms (default)
Slow:   500ms
Slower: 700ms
Slowest: 1000ms
```

### Easing Functions

```css
linear:     linear;
ease:       ease;
easeIn:     ease-in;
easeOut:    ease-out;
easeInOut:  ease-in-out;
smooth:     cubic-bezier(0.4, 0, 0.2, 1);
smoothIn:   cubic-bezier(0.4, 0, 1, 1);
smoothOut:  cubic-bezier(0, 0, 0.2, 1);
```

---

## 🎨 Gradients

### Preset Gradients

```css
/* Cyan to Purple */
background: linear-gradient(135deg, #00F0FF 0%, #AA00FF 100%);

/* Purple to Lime */
background: linear-gradient(135deg, #AA00FF 0%, #39FF14 100%);

/* Cyan to Lime */
background: linear-gradient(135deg, #00F0FF 0%, #39FF14 100%);

/* Dark Background */
background: linear-gradient(135deg, #0A0E27 0%, #12182F 100%);

/* Card Surface */
background: linear-gradient(135deg, rgba(18, 24, 47, 0.8) 0%, 
                                    rgba(30, 39, 71, 0.6) 100%);
```

---

## 🎭 Glass Morphism

```css
.glass {
  background: rgba(18, 24, 47, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 240, 255, 0.1);
}

.glass-elevated {
  background: rgba(30, 39, 71, 0.8);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(0, 240, 255, 0.15);
}
```

---

## 🎪 Key Animations

### Core Animations

```
fadeIn      - Opacity 0 → 1
slideInUp   - Transform Y: 20px → 0, opacity 0 → 1
slideInDown - Transform Y: -20px → 0, opacity 0 → 1
slideInLeft - Transform X: -20px → 0, opacity 0 → 1
slideInRight- Transform X: 20px → 0, opacity 0 → 1
scaleIn     - Scale 0.95 → 1, opacity 0 → 1
```

### Glow Pulse

```
glowPulse   - Box shadow pulsing at 2s interval
```

### Float

```
float       - Subtle Y translation movement (3s)
floatSlow   - Slow Y translation movement (4s)
```

### Rotate

```
rotate      - 360deg rotation (1s linear)
```

---

## 🖼️ Component Patterns

### Premium Card

```tsx
<PremiumCard glowColor="cyan" gradient>
  <PremiumCardHeader
    title="Player Stats"
    subtitle="Live gaming metrics"
    icon="🎮"
  />
  <PremiumCardBody>
    Win rate: 76% | ELO: 2,450
  </PremiumCardBody>
  <PremiumCardFooter align="between">
    <span>Last played: 2 hours ago</span>
  </PremiumCardFooter>
</PremiumCard>
```

**Props:**
- `glowColor`: "cyan" | "purple" | "lime"
- `gradient`: true | false
- `hover`: true | false
- `animated`: true | false

### Glow Button

```tsx
<GlowButton
  variant="primary"
  size="md"
  onClick={handleClick}
>
  Start Game
</GlowButton>
```

**Variants:**
- `primary` - Cyan background
- `secondary` - Purple background
- `tertiary` - Lime background
- `danger` - Red background

**Sizes:**
- `sm` - Small
- `md` - Medium (default)
- `lg` - Large

### Status Orb

```tsx
<StatusOrb
  userStatus="playing"
  onStatusChange={(status) => console.log(status)}
/>
```

**Statuses:**
- "online" - Green glow, user is active
- "idle" - Orange glow, user is idle
- "offline" - Gray, user is offline
- "playing" - Cyan glow, user is gaming
- "spectating" - Purple glow, user is watching

### Animated Background

```tsx
<AnimatedBackground
  type="combined"
  intensity="medium"
/>
```

**Types:**
- "particles" - Floating particles
- "grid" - Animated grid lines
- "aurora" - Aurora-like gradient waves
- "combined" - All effects together

**Intensities:**
- "light" - Minimal effect
- "medium" - Balanced (default)
- "heavy" - Intense animations

---

## 🔧 Usage in Tailwind

### Color Classes

```html
<!-- Text -->
<p class="text-cyan-500">Neon Cyan</p>
<p class="text-purple-500">Voltage Purple</p>
<p class="text-lime-500">Neon Lime</p>

<!-- Background -->
<div class="bg-dark-950">Deep background</div>
<div class="bg-dark-900">Secondary surface</div>

<!-- Borders -->
<div class="border border-cyan-500">Cyan border</div>
<div class="border border-purple-500">Purple border</div>

<!-- Shadows/Glows -->
<div class="shadow-glow-cyan">Cyan glow</div>
<div class="shadow-glow-purple-lg">Large purple glow</div>
<div class="shadow-glow-lime">Lime glow</div>

<!-- Gradients -->
<div class="bg-gradient-cyan-purple">Cyan to Purple</div>
<div class="bg-gradient-purple-lime">Purple to Lime</div>

<!-- Animations -->
<div class="animate-glow-pulse">Glowing pulse</div>
<div class="animate-float">Floating animation</div>
```

---

## 📱 Responsive Design

All components are mobile-first and responsive. Use Tailwind's breakpoints:

```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

Example:
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- Responsive columns -->
</div>
```

---

## ♿ Accessibility

- High contrast text (9:1 ratio minimum)
- Focus states with glow effects
- Smooth transitions (not instant changes)
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support

---

## 🎮 Gaming-First Design Principles

1. **Immersion** - Futuristic, premium aesthetic
2. **Clarity** - High contrast, readable at a glance
3. **Energy** - Neon colors, glowing elements, smooth motion
4. **Feedback** - Clear hover/focus states, animations
5. **Performance** - Optimized animations, hardware-accelerated
6. **Consistency** - Unified across all screens

---

## 📝 Design Tokens Reference

| Token | Value |
|-------|-------|
| `--color-primary` | `#00F0FF` |
| `--color-secondary` | `#AA00FF` |
| `--color-tertiary` | `#39FF14` |
| `--bg-primary` | `#0A0E27` |
| `--text-primary` | `#FFFFFF` |
| `--duration-base` | `300ms` |
| `--timing-ease` | `cubic-bezier(0.4, 0, 0.2, 1)` |

---

## 🚀 Implementation Checklist

- [x] Remove Light/Dark mode toggle
- [x] Remove ThemeContext & ThemeToggle
- [x] Create unified design system
- [x] Implement CSS variables
- [x] Create animated components
- [x] Add glow effects & shadows
- [x] Setup Tailwind config
- [x] Create global animations
- [x] Build premium card component
- [x] Build glow button component
- [x] Build status orb indicator
- [x] Build animated background
- [x] Document all patterns

---

## 🎯 File Structure

```
src/
├── config/
│   └── design-system.ts          # Design tokens & system
├── global/
│   ├── style.css                 # Main imports
│   └── animations.css            # All animations & effects
├── components/
│   ├── StatusOrb/
│   │   └── StatusOrb.tsx         # Game status indicator
│   ├── PremiumCard/
│   │   └── PremiumCard.tsx       # Premium card component
│   ├── GlowButton/
│   │   └── GlowButton.tsx        # Neon button component
│   └── AnimatedBackground/
│       └── AnimatedBackground.tsx # Particle & grid background
└── screens/
    └── Dashboard/
        └── sections/
            └── WelcomeHeaderSection.tsx (Updated with StatusOrb)
```

---

## 🎨 Example: Building a Screen

```tsx
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { PremiumCard, PremiumCardHeader, PremiumCardBody } from "@/components/PremiumCard";
import { GlowButton } from "@/components/GlowButton";
import { StatusOrb } from "@/components/StatusOrb";

export default function GameDashboard() {
  return (
    <>
      <AnimatedBackground type="combined" intensity="medium" />
      
      <div className="relative z-10 min-h-screen bg-gradient-dark p-8">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white font-display">
            PONG RUSH
          </h1>
          <StatusOrb userStatus="online" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PremiumCard glowColor="cyan" gradient>
            <PremiumCardHeader title="Next Match" icon="🎮" />
            <PremiumCardBody>
              Playing against Alex in 5 minutes...
            </PremiumCardBody>
          </PremiumCard>

          <PremiumCard glowColor="purple">
            <PremiumCardHeader title="Stats" icon="📊" />
            <PremiumCardBody>
              Win rate: 76% | ELO: 2,450
            </PremiumCardBody>
          </PremiumCard>

          <PremiumCard glowColor="lime">
            <PremiumCardHeader title="Achievements" icon="🏆" />
            <PremiumCardBody>
              5 new badges unlocked!
            </PremiumCardBody>
          </PremiumCard>
        </div>

        <div className="mt-8 flex gap-4">
          <GlowButton variant="primary" size="lg">
            Start Tournament
          </GlowButton>
          <GlowButton variant="secondary" size="lg">
            View Leaderboard
          </GlowButton>
        </div>
      </div>
    </>
  );
}
```

---

## 📱 Mobile-First Approach

- All components are designed mobile-first
- Touch-friendly sizes (min 44px for buttons)
- Responsive spacing and typography
- Optimized for landscape/portrait
- No horizontal scroll

---

## 🎓 Learn More

- **Design System**: `/src/config/design-system.ts`
- **Global Styles**: `/src/global/animations.css`
- **Tailwind Config**: `/tailwind.config.js`
- **Components**: `/src/components/`

---

**Last Updated**: January 17, 2026  
**Design Philosophy**: Premium Gaming/Esports Aesthetic  
**Status**: ✅ Production Ready
