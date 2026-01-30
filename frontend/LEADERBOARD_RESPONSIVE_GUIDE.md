# Leaderboard Page - Responsive & Parallax Implementation Guide

## 🎨 Background Styling with Parallax Effect

### Fixed Background Layer
```jsx
<div 
  className="fixed inset-0 w-full h-full bg-dark-950 z-0"
  style={{
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat'
  }}
>
```

**Properties:**
- `position: fixed` - Background stays fixed while content scrolls (parallax)
- `background-size: cover` - Background covers entire viewport
- `background-attachment: fixed` - Maintains fixed position during scroll
- `inset-0` - Covers full screen (top:0, right:0, bottom:0, left:0)
- `z-0` - Behind all content

### Decorative Gradient Overlays
```css
/* Top gradient blur */
.gradient-1 {
  position: absolute;
  top: 991px;
  left: -285px;
  width: 900px;
  height: 900px;
  background: rgba(249, 249, 249, 0.5);
  border-radius: 450px;
  filter: blur(153px);
  opacity: 0.3;
}

/* Right side gradient */
.gradient-2 {
  position: absolute;
  top: -338px;
  left: 1235px;
  width: 900px;
  height: 900px;
  background: radial-gradient(circle, rgba(221, 161, 94, 0.25), transparent);
  filter: blur(153px);
}

/* Bottom left gradient */
.gradient-3 {
  position: absolute;
  top: 721px;
  left: -512px;
  width: 700px;
  height: 700px;
  background: rgba(221, 161, 94, 0.5);
  border-radius: 350px;
  filter: blur(153px);
  opacity: 0.4;
}
```

---

## 📱 Mobile Layout (320px - 767px)

### Container
```css
.main-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}
```

### Hamburger Menu Button
```css
.hamburger-btn {
  position: fixed;
  top: 1.5rem; /* 24px */
  left: 1rem; /* 16px */
  z-index: 60;
  width: 44px;
  height: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(15, 15, 15, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.hamburger-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.hamburger-line {
  width: 24px;
  height: 2px;
  background: white;
  transition: all 0.3s ease;
}

.hamburger-line.open-first {
  transform: rotate(45deg) translateY(8px);
}

.hamburger-line.open-middle {
  opacity: 0;
}

.hamburger-line.open-last {
  transform: rotate(-45deg) translateY(-8px);
}
```

### Mobile Navigation Menu
```css
.mobile-nav {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 280px;
  background: rgba(15, 15, 15, 0.95);
  backdrop-filter: blur(24px);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 50;
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
}

.mobile-nav.open {
  transform: translateX(0);
}
```

### Header Section (Mobile)
```css
.header-mobile {
  margin-bottom: 1.5rem; /* 24px */
  display: flex;
  flex-direction: column;
  gap: 1rem; /* 16px */
}

.header-title-mobile {
  font-family: 'Questrial', sans-serif;
  font-size: 1.5rem; /* 24px */
  color: rgba(255, 255, 255, 1);
  margin-bottom: 0.25rem;
}

.header-subtitle-mobile {
  font-family: 'Questrial', sans-serif;
  font-size: 0.875rem; /* 14px */
  color: rgba(255, 255, 255, 0.6);
}
```

### Filter Buttons (Mobile - Stacked)
```css
.filter-buttons-mobile {
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* 8px */
  width: 100%;
}

.filter-btn-mobile {
  min-height: 44px;
  padding: 0.5rem 1rem; /* 8px 16px */
  border-radius: 8px;
  font-family: 'Questrial', sans-serif;
  font-weight: 600;
  font-size: 0.875rem; /* 14px */
  transition: all 0.3s ease;
  width: 100%;
}

.filter-btn-mobile.active {
  background: #d4ff00; /* Lime green */
  color: #0f0f0f;
}

.filter-btn-mobile.inactive {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 1);
}

.filter-btn-mobile.inactive:hover {
  background: rgba(255, 255, 255, 0.2);
}

.filter-btn-mobile.inactive:active {
  background: rgba(255, 255, 255, 0.3);
}
```

### Content Container (Mobile)
```css
.content-mobile {
  padding: 1.5rem 1rem; /* 24px 16px */
  position: relative;
  z-index: 10;
}
```

### Empty State (Mobile)
```css
.empty-state-mobile {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem; /* 16px */
  padding: 2rem; /* 32px */
  text-align: center;
}

.trophy-icon-mobile {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.75rem;
  font-size: 1.5rem; /* 24px */
}

.empty-title-mobile {
  font-family: 'Questrial', sans-serif;
  font-size: 1.125rem; /* 18px */
  color: white;
  margin-bottom: 0.5rem;
}

.empty-text-mobile {
  font-family: 'Questrial', sans-serif;
  font-size: 0.875rem; /* 14px */
  color: rgba(255, 255, 255, 0.6);
}
```

---

## 💻 Tablet Layout (768px - 1024px)

### Container
```css
@media (min-width: 768px) {
  .main-container {
    flex-direction: row;
  }
}
```

### Header Section (Tablet)
```css
@media (min-width: 640px) {
  .header-tablet {
    margin-bottom: 2rem; /* 32px */
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem; /* 24px */
  }

  .header-title-tablet {
    font-size: 1.875rem; /* 30px */
  }

  .header-subtitle-tablet {
    font-size: 1rem; /* 16px */
  }
}
```

### Filter Buttons (Tablet - Horizontal)
```css
@media (min-width: 640px) {
  .filter-buttons-tablet {
    display: flex;
    flex-direction: row;
    gap: 0.5rem; /* 8px */
    width: auto;
  }

  .filter-btn-tablet {
    min-height: 44px;
    padding: 0.625rem 1.5rem; /* 10px 24px */
    font-size: 1rem; /* 16px */
    width: auto;
  }
}
```

### Content Container (Tablet)
```css
@media (min-width: 640px) {
  .content-tablet {
    padding: 2rem 1.5rem; /* 32px 24px */
  }
}
```

### Empty State (Tablet)
```css
@media (min-width: 640px) {
  .empty-state-tablet {
    padding: 3rem; /* 48px */
  }

  .trophy-icon-tablet {
    width: 64px;
    height: 64px;
    font-size: 1.875rem; /* 30px */
    margin-bottom: 1rem;
  }

  .empty-title-tablet {
    font-size: 1.25rem; /* 20px */
  }

  .empty-text-tablet {
    font-size: 1rem; /* 16px */
  }
}
```

---

## 🖥️ Desktop Layout (1024px+)

### Sidebar (Desktop - Visible)
```css
@media (min-width: 1024px) {
  .desktop-sidebar {
    display: flex;
    width: 300px;
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    min-height: 100vh;
    flex-direction: column;
    position: relative;
    z-index: 20;
    flex-shrink: 0;
    background: rgba(15, 15, 15, 0.8);
    backdrop-filter: blur(24px);
  }

  .sidebar-logo {
    padding-top: 47px;
    padding-left: 43px;
    padding-bottom: 50px;
  }

  .nav-items-desktop {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 0 60px;
    flex: 1;
  }

  .logout-btn-desktop {
    margin-top: auto;
    margin-bottom: 50px;
    padding: 0 60px;
  }
}
```

### Header Section (Desktop)
```css
@media (min-width: 1024px) {
  .header-desktop {
    margin-bottom: 2rem;
  }

  .header-title-desktop {
    font-size: 2.25rem; /* 36px */
  }

  .content-desktop {
    padding: 3rem 2rem; /* 48px 32px */
  }
}
```

---

## 🎯 Leaderboard Table (Responsive)

### Mobile Table
```css
.table-container-mobile {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  overflow: hidden;
}

.table-scroll-mobile {
  overflow-x: auto;
}

.leaderboard-table {
  width: 100%;
  min-width: 600px; /* Horizontal scroll on small screens */
}

/* Mobile cells */
.table-cell-mobile {
  padding: 0.75rem; /* 12px */
}

.rank-badge-mobile {
  width: 28px;
  height: 28px;
  font-size: 0.75rem; /* 12px */
}

.avatar-mobile {
  width: 32px;
  height: 32px;
}

.player-name-mobile {
  font-size: 0.875rem; /* 14px */
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xp-badge-mobile {
  font-size: 0.875rem; /* 14px */
  padding: 0.25rem 0.5rem; /* 4px 8px */
}
```

### Tablet/Desktop Table
```css
@media (min-width: 640px) {
  .table-cell-tablet {
    padding: 1rem 1.5rem; /* 16px 24px */
  }

  .rank-badge-tablet {
    width: 32px;
    height: 32px;
    font-size: 0.875rem; /* 14px */
  }

  .avatar-tablet {
    width: 40px;
    height: 40px;
  }

  .player-name-tablet {
    font-size: 1.125rem; /* 18px */
    max-width: none;
  }

  .xp-badge-tablet {
    font-size: 1.125rem; /* 18px */
    padding: 0.25rem 0.75rem; /* 4px 12px */
  }
}
```

---

## 🎨 Color Palette

```css
/* Theme Colors */
--dark-950: #0f0f0f;
--light: #ffffff;
--accent-green: #d4ff00; /* Lime green */
--accent-orange: #dda15e;

/* Opacity Variants */
--white-5: rgba(255, 255, 255, 0.05);
--white-10: rgba(255, 255, 255, 0.1);
--white-20: rgba(255, 255, 255, 0.2);
--white-30: rgba(255, 255, 255, 0.3);
--white-60: rgba(255, 255, 255, 0.6);

/* Rank Badge Colors */
--rank-1: #d4ff00; /* Gold/Lime */
--rank-2: #dda15e; /* Orange */
--rank-3: #9ca3af; /* Gray */
```

---

## 🎭 Animations & Transitions

```css
/* Smooth transitions for all interactive elements */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Pulse animation for XP indicator */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Spin animation for loading */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

---

## 📐 Z-Index Layers

```css
/* Background (Fixed) */
.z-0 { z-index: 0; }

/* Main Content */
.z-10 { z-index: 10; }

/* Desktop Sidebar */
.z-20 { z-index: 20; }

/* Mobile Menu Overlay */
.z-40 { z-index: 40; }

/* Mobile Menu */
.z-50 { z-index: 50; }

/* Hamburger Button */
.z-60 { z-index: 60; }
```

---

## ✅ Responsive Checklist

### Mobile (320px - 767px)
- ✅ Desktop sidebar hidden
- ✅ Hamburger menu visible
- ✅ Touch targets minimum 44px
- ✅ Stacked filter buttons
- ✅ Proper padding (16-24px)
- ✅ Background fixed with parallax
- ✅ Smooth menu transitions

### Tablet (768px - 1024px)
- ✅ Optimized spacing
- ✅ Horizontal filter buttons
- ✅ Responsive font sizes
- ✅ Proper margins
- ✅ Background covers viewport

### Desktop (1024px+)
- ✅ Full sidebar visible
- ✅ Hamburger menu hidden
- ✅ Optimal layout spacing
- ✅ All features accessible
- ✅ Background parallax effect

### All Sizes
- ✅ Background size: cover
- ✅ Background attachment: fixed
- ✅ Dark theme consistent
- ✅ Lime green accents (#d4ff00)
- ✅ Logo always visible
- ✅ Smooth transitions (300ms)
- ✅ Content scrolls over fixed background
