# Automet Quick Reference Guide

**For Developers** - Fast lookup for common patterns and workflows

---

## 🎨 Design Tokens (Copy-Paste Ready)

### Primary Brand Color
```css
#EF7722  /* Main orange */
```

### Primary Gradient (CTA Buttons)
```css
background: linear-gradient(135deg, #EF7722 0%, #ff8833 100%);
```

### Background Gradient (Auth Pages)
```css
background: linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%);
```

### Text Colors
```css
#111827  /* Primary text (headings) */
#6b7280  /* Secondary text (body) */
#9ca3af  /* Tertiary text (hints) */
```

---

## 🔐 Auth Flow Quick Links

### Key Pages
- **Welcome/Login**: `/onboarding/welcome` (merged login page)
- **Signup**: `/signup`
- **First Step**: `/onboarding/company`
- **Dashboard**: `/dashboard`

### Redirect Rules
```tsx
// Not logged in → Welcome page
if (!user) router.push('/onboarding/welcome');

// Logged in, no org → Company setup
if (user && !org_id) router.push('/onboarding/company');

// Logged in, has org → Dashboard
if (user && org_id) router.push('/dashboard');
```

### Sign Out
```tsx
import { useAuth } from '@/contexts/AuthContext';
const { signOut } = useAuth();

await signOut(); // Auto-redirects to /onboarding/welcome
```

---

## 🎯 Component Snippets

### Primary Button
```tsx
<button
  style={{
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
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
  Click Me
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
  }}
  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
>
  Link Text
</Link>
```

### Input Field
```tsx
<input
  type="text"
  style={{
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
  }}
  onFocus={(e) => (e.currentTarget.style.borderColor = '#EF7722')}
  onBlur={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
/>
```

### Card
```tsx
<div
  style={{
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
    border: '1px solid rgba(239,119,34,0.1)',
  }}
>
  Content
</div>
```

---

## 📱 Responsive Patterns

### Mobile-First Media Query
```tsx
<style jsx>{`
  .container {
    padding: 1.5rem 1rem;
  }
  @media (min-width: 768px) {
    .container {
      padding: 2rem 3rem;
    }
  }
`}</style>
```

### 2-Column Layout (Desktop)
```tsx
<style jsx>{`
  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  @media (min-width: 768px) {
    .grid {
      grid-template-columns: 1fr 400px;
      gap: 3rem;
    }
  }
`}</style>
```

---

## 🔧 Common Tasks

### Add a New Protected Page
```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute>
      {/* Your content */}
    </ProtectedRoute>
  );
}
```

### Check Auth State
```tsx
import { useAuth } from '@/contexts/AuthContext';

const { user, loading } = useAuth();

if (loading) return <div>Loading...</div>;
if (!user) return <div>Not logged in</div>;
```

### Track Analytics
```tsx
import { trackPageView, OnboardingEvents } from '@/lib/analytics';

// Page view
useEffect(() => {
  trackPageView('/my-page');
}, []);

// Custom event
OnboardingEvents.signupCompleted('email');
```

### Show Error Message
```tsx
{error && (
  <div
    style={{
      padding: '0.75rem',
      marginBottom: '1rem',
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      borderRadius: '8px',
      fontSize: '0.875rem',
    }}
  >
    {error}
  </div>
)}
```

---

## 🚀 Development Commands

```bash
# Start dev server
npm run dev

# Clear cache and restart
rm -rf .next && npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

---

## 📚 File Locations

### Auth & Onboarding
```
pages/onboarding/welcome.tsx    - Merged login/welcome page
pages/signup.tsx                - Registration
pages/onboarding/company.tsx    - Step 1 (required)
pages/onboarding/team.tsx       - Step 2 (optional)
pages/onboarding/customer.tsx   - Step 3 (optional)
pages/onboarding/job.tsx        - Step 4 (optional)
pages/onboarding/complete.tsx   - Step 5 (final)
```

### Auth Logic
```
src/contexts/AuthContext.tsx       - Auth state & methods
src/components/ProtectedRoute.tsx  - Route protection
src/lib/auth-redirect.ts           - Redirect logic
pages/auth/callback.tsx            - OAuth callback
```

### Components
```
src/components/BottomNav.tsx   - Mobile navigation
src/components/Sidebar.tsx     - Desktop navigation
components/TimePickerModal.tsx - Custom time picker
```

---

## 🐛 Common Issues & Fixes

### Issue: Changes not showing
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue: Redirect loop
```tsx
// Check that ProtectedRoute isn't wrapping auth pages
// Auth pages should NOT use ProtectedRoute:
// - /onboarding/welcome
// - /signup
// - /auth/callback
```

### Issue: User not redirecting after login
```tsx
// Check auth-redirect.ts logic
// Ensure org_id is being set in database
```

### Issue: Styling not applying
```tsx
// Ensure you're using inline styles or <style jsx>
// CSS modules won't work with our current setup
```

---

## 📖 Full Documentation

- **Design System**: `/docs/DESIGN_SYSTEM.md`
- **Auth Flow**: `/docs/AUTHENTICATION_FLOW.md`
- **Project Context**: `/PROJECT_CONTEXT.md`
- **Onboarding Spec**: `/docs/ONBOARDING_DESIGN_SPEC.md`

---

## 🎯 Quick Wins

### Update a button to new branding
```tsx
// Find old button
backgroundColor: '#2563eb'

// Replace with
background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)'
```

### Add hover effect
```tsx
transition: 'all 0.2s'

onMouseEnter={(e) => {
  e.currentTarget.style.transform = 'translateY(-1px)';
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = 'translateY(0)';
}}
```

### Make component responsive
```tsx
<style jsx>{`
  @media (min-width: 768px) {
    /* Desktop styles */
  }
`}</style>
```

---

**Last Updated:** November 15, 2025

