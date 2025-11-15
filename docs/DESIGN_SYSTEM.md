# Automet Design System

**Version:** 2.0  
**Last Updated:** November 15, 2025  
**Status:** Active - Use this for all new UI components

## Overview

This document defines the visual design language and component patterns for Automet. All UI components should follow these guidelines to ensure consistency across the application.

---

## Brand Colors

### Primary Colors

```css
/* Primary Orange - Main brand color */
--color-primary: #EF7722;
--color-primary-dark: #d66a1e;
--color-primary-light: #ff8833;

/* Primary gradient - Use for CTAs and important actions */
--gradient-primary: linear-gradient(135deg, #EF7722 0%, #ff8833 100%);
```

### Background Colors

```css
/* Main background gradient - Use for auth pages and onboarding */
--gradient-background: linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%);

/* Subtle background colors */
--color-bg-light: #fff5ed;
--color-bg-white: #ffffff;
--color-bg-orange-light: #ffe8d6;
```

### Text Colors

```css
--color-text-primary: #111827;    /* Headings, important text */
--color-text-secondary: #6b7280;  /* Body text, labels */
--color-text-tertiary: #9ca3af;   /* Hints, captions */
```

### Utility Colors

```css
/* Success */
--color-success: #16a34a;
--color-success-bg: #dcfce7;

/* Error */
--color-error: #991b1b;
--color-error-bg: #fee2e2;

/* Border */
--color-border: #e5e7eb;
--color-border-orange: rgba(239, 119, 34, 0.1);
--color-border-orange-strong: rgba(239, 119, 34, 0.2);
--color-border-orange-stronger: rgba(239, 119, 34, 0.3);
```

---

## Typography

### Font Family

```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Font Sizes & Weights

#### Headings
```css
/* H1 - Page titles */
font-size: 1.75rem;    /* Mobile */
font-size: 2rem;       /* Desktop */
font-weight: 700;
color: #111827;

/* H2 - Section titles */
font-size: 1.5rem;
font-weight: 700;
color: #111827;

/* H3 - Card titles */
font-size: 1.125rem;   /* Mobile */
font-size: 1.25rem;    /* Desktop */
font-weight: 600;
color: #111827;
```

#### Body Text
```css
/* Regular body */
font-size: 0.875rem;   /* Mobile */
font-size: 1rem;       /* Desktop */
font-weight: 400;
line-height: 1.6;
color: #6b7280;

/* Small text */
font-size: 0.8125rem;
font-weight: 400;
color: #6b7280;

/* Captions */
font-size: 0.75rem;
font-weight: 400;
color: #9ca3af;
```

---

## Spacing System

Use consistent spacing multiples of 0.25rem (4px):

```css
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
```

### Common Spacing Patterns

- **Card padding**: 1.5rem mobile, 2rem desktop
- **Section margin**: 1.5rem mobile, 2rem desktop
- **Form field margin**: 0.875rem mobile, 1rem desktop
- **Button padding**: 0.75rem vertical, 1.5rem horizontal

---

## Shadows & Borders

### Box Shadows

```css
/* Card shadow - Default for cards and modals */
box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);

/* Button shadow - For primary CTAs */
box-shadow: 0 2px 8px rgba(239, 119, 34, 0.25);

/* Button hover shadow */
box-shadow: 0 4px 12px rgba(239, 119, 34, 0.3);

/* Elevated shadow - For dropdowns and popovers */
box-shadow: 0 20px 60px rgba(239, 119, 34, 0.15);
```

### Border Radius

```css
--radius-sm: 4px;     /* Small elements (badges, chips) */
--radius-md: 8px;     /* Buttons, inputs */
--radius-lg: 12px;    /* Cards */
--radius-xl: 16px;    /* Large cards */
--radius-full: 50%;   /* Circular elements */
```

### Borders

```css
/* Standard border */
border: 1px solid #e5e7eb;

/* Orange accent border */
border: 1px solid rgba(239, 119, 34, 0.1);

/* Strong orange border */
border: 2px solid rgba(239, 119, 34, 0.2);
```

---

## Button Styles

### Primary Button (CTA)

```tsx
<button
  style={{
    width: '100%',
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(239,119,34,0.25)',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-1px)';
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,119,34,0.3)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,119,34,0.25)';
  }}
>
  Button Text
</button>
```

### Secondary Button (Outline)

```tsx
<button
  style={{
    width: '100%',
    padding: '0.75rem 1.5rem',
    backgroundColor: 'white',
    color: '#1f2937',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.borderColor = '#EF7722';
    e.currentTarget.style.boxShadow = '0 0 0 1px rgba(239,119,34,0.2)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.borderColor = '#e5e7eb';
    e.currentTarget.style.boxShadow = 'none';
  }}
>
  Button Text
</button>
```

### Text Link

```tsx
<Link
  href="/path"
  style={{
    color: '#EF7722',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'text-decoration 0.2s',
  }}
  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
>
  Link Text
</Link>
```

---

## Form Input Styles

### Text Input

```tsx
<input
  type="text"
  style={{
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'border-color 0.2s',
  }}
  onFocus={(e) => (e.currentTarget.style.borderColor = '#EF7722')}
  onBlur={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
/>
```

### Label

```tsx
<label
  style={{
    display: 'block',
    marginBottom: '0.375rem',
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#374151',
  }}
>
  Label Text
</label>
```

### Error Message

```tsx
<div
  style={{
    padding: '0.75rem',
    marginBottom: '1rem',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '8px',
    fontSize: '0.875rem',
    border: '1px solid #fecaca',
  }}
>
  Error message here
</div>
```

---

## Card Styles

### Standard Card

```tsx
<div
  style={{
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
    border: '1px solid rgba(239,119,34,0.1)',
  }}
>
  Card content
</div>
```

### Elevated Card (Auth pages)

```tsx
<div
  style={{
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(239,119,34,0.15)',
    border: '1px solid rgba(239,119,34,0.1)',
  }}
>
  Card content
</div>
```

---

## Layout Patterns

### Full-Screen Background (Auth Pages)

```tsx
<div
  style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    position: 'relative',
    overflow: 'hidden',
  }}
>
  {/* Decorative element */}
  <div
    style={{
      position: 'absolute',
      top: '-100px',
      right: '-100px',
      width: '300px',
      height: '300px',
      background: 'radial-gradient(circle, rgba(239,119,34,0.1) 0%, transparent 70%)',
      borderRadius: '50%',
      pointerEvents: 'none',
    }}
  />
  {/* Content */}
</div>
```

### 2-Column Layout (Welcome Page)

```tsx
<div
  style={{
    display: 'grid',
    gridTemplateColumns: '1fr',              // Mobile: stacked
    gap: '1.5rem',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '1.5rem 1rem',
  }}
>
  {/* Desktop: 2 columns */}
  <style jsx>{`
    @media (min-width: 768px) {
      div {
        grid-template-columns: 1fr 400px;
        gap: 3rem;
        padding: 2rem 3rem;
      }
    }
  `}</style>
</div>
```

---

## Animations

### Fade In

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

animation: fadeIn 0.5s ease-out;
```

### Slide In (Left/Right)

```css
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

animation: slideInLeft 0.8s ease-out forwards;
```

### Button Hover

```tsx
transition: 'all 0.2s'

onMouseEnter={(e) => {
  e.currentTarget.style.transform = 'translateY(-1px)';
  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,119,34,0.3)';
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = 'translateY(0)';
  e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,119,34,0.25)';
}}
```

---

## Responsive Breakpoints

```css
/* Mobile first approach */
/* Mobile: < 768px (default) */

/* Tablet: 768px and up */
@media (min-width: 768px) { }

/* Desktop: 1024px and up */
@media (min-width: 1024px) { }

/* Large Desktop: 1280px and up */
@media (min-width: 1280px) { }
```

### Responsive Padding Pattern

```jsx
<style jsx>{`
  .container {
    padding: 1.5rem 1rem;
  }
  @media (min-width: 768px) {
    .container {
      padding: 2rem 2rem;
    }
  }
  @media (min-width: 1024px) {
    .container {
      padding: 2.5rem 4rem;
    }
  }
`}</style>
```

---

## Component Examples

### Password Input with Toggle

```tsx
const [showPassword, setShowPassword] = useState(false);

<div style={{ position: 'relative' }}>
  <input
    type={showPassword ? 'text' : 'password'}
    style={{
      width: '100%',
      padding: '0.75rem',
      paddingRight: '3rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '1rem',
    }}
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    style={{
      position: 'absolute',
      right: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#6b7280',
    }}
  >
    {showPassword ? '🙈' : '👁️'}
  </button>
</div>
```

### Loading State

```tsx
{loading && <div>Loading...</div>}

// Or with spinner
<div style={{ 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  minHeight: '100vh' 
}}>
  <div>Loading...</div>
</div>
```

---

## Icon Usage

### Lucide React Icons (Preferred)

```tsx
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';

<Eye size={20} color="#6b7280" />
```

### SVG Icons (Custom)

Use 24x24 viewBox for consistency:

```tsx
<svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="..." />
</svg>
```

---

## Best Practices

### ✅ DO

- Use the orange gradient for all primary CTAs
- Use consistent spacing from the spacing system
- Apply hover effects to interactive elements
- Use the background gradient for auth/onboarding pages
- Add transitions for smooth interactions (0.2s duration)
- Use responsive breakpoints for mobile-first design
- Include proper focus states for accessibility

### ❌ DON'T

- Don't use blue colors (old branding)
- Don't use arbitrary spacing values
- Don't use sharp corners (minimum 4px radius)
- Don't forget hover states on buttons and links
- Don't use gray backgrounds for auth pages
- Don't hardcode colors - reference the design tokens

---

## Migration from Old Design

If updating old components, replace:

```tsx
// OLD (Blue branding)
backgroundColor: '#2563eb'
color: '#2563eb'
backgroundColor: '#f5f5f5'

// NEW (Orange branding)
background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)'
color: '#EF7722'
background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)'
```

---

## Questions?

For design questions or clarifications, refer to these reference files:
- `/pages/onboarding/welcome.tsx` - Auth page layout
- `/pages/onboarding/company.tsx` - Form and input patterns
- `/pages/signup.tsx` - Button and card styles
- `/src/components/BottomNav.tsx` - Mobile navigation patterns

**Last Updated:** November 15, 2025

