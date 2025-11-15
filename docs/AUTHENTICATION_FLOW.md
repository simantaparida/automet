# Automet Authentication & Onboarding Flow

**Version:** 2.0  
**Last Updated:** November 15, 2025  
**Status:** Active

## Overview

This document describes the complete authentication and onboarding flow for Automet, including the merged login/welcome page architecture.

---

## Architecture Changes (v2.0)

### What Changed

**Previous Flow (v1.0):**
- Separate `/login` and `/onboarding/welcome` pages
- Welcome was just a landing page
- Login was a dedicated auth page

**Current Flow (v2.0):**
- **Merged** login functionality into `/onboarding/welcome`
- `/login` page **deleted** (no longer exists)
- Welcome page now serves as both:
  - Landing page for new users
  - Login page for returning users
- 2-column layout on desktop (hero content + login form)
- Stacked layout on mobile

---

## Complete User Flow

### 1. Landing Page → Welcome/Login

```
User visits: https://automet.app
↓
Clicks: "Get started"
↓
Redirects to: /onboarding/welcome
```

**Welcome Page Features:**
- Left column: Hero content, app benefits
- Right column: Login form (email + password + Google OAuth)
- Mobile: Stacked layout
- Auto-redirects logged-in users to `/dashboard`

### 2. New User → Sign Up

```
User at: /onboarding/welcome
↓
Clicks: "Sign up" link
↓
Redirects to: /signup
↓
User completes registration
↓
Auto-redirects to: /onboarding/company
```

**Signup Page Features:**
- Full name, email, password, confirm password
- Phone number (optional) with country code selector
- Password visibility toggles
- Google OAuth option
- Error handling for existing accounts → redirects to welcome

### 3. Existing User → Sign In

```
User at: /onboarding/welcome
↓
Enters email + password
↓
Clicks: "Sign in"
↓
If credentials valid: Redirect to /dashboard
If invalid: Show error message
```

**Sign In Options:**
- Email + password
- Google OAuth
- "Forgot password?" link

### 4. Onboarding Flow (New Users)

```
After signup: /onboarding/company
↓
Step 1: Company Details
  - Organization name
  - Industry
  - Working hours (custom time picker)
  - Currency
↓
/onboarding/team
↓
Step 2: Invite Team Members (Optional, skippable)
  - Email invitations
  - Role assignment
↓
/onboarding/customer
↓
Step 3: Add First Customer (Optional, skippable)
  - Customer name
  - Contact info
  - Address
↓
/onboarding/job
↓
Step 4: Create First Job (Optional, skippable)
  - Job title
  - Customer selection
  - Details
↓
/onboarding/complete
↓
Step 5: Completion Screen
  - Confetti animation
  - Summary of setup
  - Auto-redirect to dashboard (3 seconds)
```

**Skippable Steps:**
- Team invite
- Customer creation
- Job creation

**Required Step:**
- Company details (organization profile)

---

## Page Specifications

### `/onboarding/welcome` (Login/Welcome)

**File:** `pages/onboarding/welcome.tsx`

**Layout:**
```
Desktop (≥768px):
┌─────────────────────────────────────────┐
│  Hero Content     │   Login Form        │
│  (Left Column)    │   (Right Column)    │
│                   │                     │
│  - Logo           │   - Email input     │
│  - Headline       │   - Password input  │
│  - Benefits       │   - Sign in button  │
│  - Features       │   - Google OAuth    │
│                   │   - Sign up link    │
└─────────────────────────────────────────┘

Mobile (<768px):
┌─────────────────────┐
│   Hero Content      │
│   (Stacked)         │
├─────────────────────┤
│   Login Form        │
│   (Below hero)      │
└─────────────────────┘
```

**State Management:**
```tsx
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [showPassword, setShowPassword] = useState(false);
const [authLoading, setAuthLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**Key Functions:**
- `handleEmailLogin()` - Email/password authentication
- `handleGoogleLogin()` - Google OAuth
- Auto-redirect if user already logged in

**Styling:**
- Orange gradient background
- Animated entry (slideInLeft/slideInRight)
- Responsive grid layout
- Decorative background elements

### `/signup` (Registration)

**File:** `pages/signup.tsx`

**Fields:**
- Full name (required)
- Email (required)
- Password (required, min 6 chars)
- Confirm password (required)
- Phone number (optional)
  - Country code selector
  - 10-digit validation
- Terms acceptance

**Features:**
- Password visibility toggles (both fields)
- Google OAuth option
- Form validation
- Error handling:
  - If email exists → redirect to `/onboarding/welcome`
  - If email confirmation required → show success screen
  - If auto-login → redirect to `/onboarding/company`

**Success Screen (Email Confirmation Required):**
- Check email message
- Link back to welcome page

### `/onboarding/company` (Step 1)

**File:** `pages/onboarding/company.tsx`

**Required Fields:**
- Organization name
- Industry (dropdown)
- Working hours (custom time picker with scroll wheels)
- Currency

**Features:**
- Form data cached in localStorage
- Back button → `/signup`
- Progress indicator: Step 1 of 5 (20%)
- Custom TimePickerModal component

### `/onboarding/team` (Step 2)

**File:** `pages/onboarding/team.tsx`

**Optional - Skippable**

**Features:**
- Invite team members by email
- Assign roles (Admin, Manager, Technician)
- Multiple invites
- Skip button

### `/onboarding/customer` (Step 3)

**File:** `pages/onboarding/customer.tsx`

**Optional - Skippable**

**Features:**
- Add first customer
- Customer details
- Skip button

### `/onboarding/job` (Step 4)

**File:** `pages/onboarding/job.tsx`

**Optional - Skippable**

**Features:**
- Create first job
- Job details
- Customer assignment
- Skip button

### `/onboarding/complete` (Step 5)

**File:** `pages/onboarding/complete.tsx`

**Features:**
- Confetti animation
- Setup summary
- Auto-redirect to `/dashboard` (3 seconds)
- Progress: 100% complete

---

## Authentication Logic

### Auth Context

**File:** `src/contexts/AuthContext.tsx`

**Provides:**
- `user` - Current user object
- `loading` - Auth loading state
- `signUp(email, password, fullName, phone)` - Registration
- `signIn(email, password)` - Email/password login
- `signInWithGoogle()` - OAuth login
- `signOut()` - Logout (redirects to `/onboarding/welcome`)

### Protected Routes

**File:** `src/components/ProtectedRoute.tsx`

**Logic:**
```tsx
if (!user && !loading) {
  router.push('/onboarding/welcome'); // Not /login
}
```

### Auth Redirect Logic

**File:** `src/lib/auth-redirect.ts`

**Functions:**
- `getAuthRedirectPath(user, userData)` - Where to redirect logged-in users
- `getPostSignupRedirectPath(userData)` - Where to send after signup
- `getPostLoginRedirectPath(userData)` - Where to send after login
- `checkRouteAccess(router)` - Check if user can access current route

**Redirect Rules:**
- If no user → `/onboarding/welcome`
- If user but no org_id → `/onboarding/company`
- If user with org_id → `/dashboard`

### OAuth Callback

**File:** `pages/auth/callback.tsx`

**Handles:**
- Google OAuth redirects
- Session creation
- Error handling → redirects to `/onboarding/welcome`

---

## Session Management

### Supabase Auth

**Provider:** Supabase Auth
**Session Storage:** Browser cookies
**Session Duration:** 7 days (default)

### Session Checks

1. **On page load:**
   - AuthContext checks for existing session
   - Auto-refreshes tokens if needed

2. **On protected routes:**
   - ProtectedRoute component validates session
   - Redirects to welcome if invalid

3. **On sign out:**
   - Clears session
   - Redirects to `/onboarding/welcome`

---

## Error Handling

### Common Errors

**Email Already Exists (Signup):**
```tsx
setError('An account with this email already exists. Redirecting to sign in...');
setTimeout(() => {
  router.push('/onboarding/welcome?message=Account already exists. Please sign in.');
}, 2000);
```

**Invalid Credentials (Login):**
```tsx
setError(error.message); // Display inline
// User stays on welcome page
```

**Email Confirmation Required:**
```tsx
// Show success screen with instructions
// Link back to welcome page
```

**Network Errors:**
```tsx
setError('Network error. Please check your connection.');
```

---

## URL Parameters

### Welcome Page

```
/onboarding/welcome?message=Your message here
```

Displays message banner at top of login form.

**Example Use Cases:**
- Account already exists
- Session expired
- Email confirmed successfully

### Signup Page

```
/signup?redirect=/dashboard
```

Redirects to specified path after successful signup.

---

## Mobile Considerations

### Responsive Breakpoints

```css
/* Mobile: < 768px */
- Stacked layout
- Full-width forms
- Larger touch targets

/* Tablet/Desktop: ≥ 768px */
- 2-column layout (welcome page)
- Side-by-side content
- Optimized spacing
```

### Touch Interactions

- Minimum 44x44px tap targets
- Larger form inputs (0.75rem padding)
- Visible focus states
- No hover-only interactions

---

## Analytics & Tracking

### Events Tracked

**File:** `src/lib/analytics.ts`

```tsx
// Onboarding events
OnboardingEvents.signupStarted('email' | 'google');
OnboardingEvents.signupCompleted('email' | 'google');
OnboardingEvents.signupFailed(errorMessage);
OnboardingEvents.companyDetailsViewed();
OnboardingEvents.companyDetailsCompleted(industry, currency);
// ... more events
```

### Page Views

```tsx
trackPageView('/onboarding/welcome');
trackPageView('/signup');
// ... etc
```

---

## Security Considerations

### Password Requirements

- Minimum 6 characters
- Must match confirmation
- Stored as hashed by Supabase

### OAuth Security

- Google OAuth uses Supabase's secure flow
- Tokens managed server-side
- PKCE flow for additional security

### Session Security

- HttpOnly cookies
- Secure flag in production
- Auto-refresh before expiry
- Session invalidation on sign out

---

## Testing Checklist

### Manual Testing

- [ ] Landing → Welcome page loads correctly
- [ ] Welcome page shows login form on desktop (2-column)
- [ ] Welcome page stacks on mobile
- [ ] Email/password login works
- [ ] Google OAuth works
- [ ] Invalid credentials show error
- [ ] "Sign up" link goes to `/signup`
- [ ] Signup with new email works
- [ ] Signup with existing email redirects to welcome
- [ ] Password toggles work
- [ ] Form validation works
- [ ] Auto-redirect after signup works
- [ ] Onboarding flow completes successfully
- [ ] Can skip optional steps
- [ ] Completion redirects to dashboard
- [ ] Logged-in users auto-redirect from welcome

### Error Cases

- [ ] Network error handling
- [ ] Invalid email format
- [ ] Password mismatch
- [ ] Email confirmation required
- [ ] Session expired

---

## Troubleshooting

### Issue: Redirect loop on welcome page

**Cause:** Auth state not loading properly  
**Fix:** Check AuthContext initialization

### Issue: Login form not submitting

**Cause:** Event propagation or loading state  
**Fix:** Verify `handleEmailLogin` is attached to form `onSubmit`

### Issue: Google OAuth not working

**Cause:** Supabase OAuth not configured  
**Fix:** Check Supabase dashboard → Auth → Providers → Google

### Issue: Old /login page still accessible

**Cause:** Old code references or cached routes  
**Fix:** 
```bash
rm -rf .next
npm run dev
```

---

## Reference Files

### Core Files

- `pages/onboarding/welcome.tsx` - Merged login/welcome page
- `pages/signup.tsx` - Registration page
- `pages/onboarding/company.tsx` - Step 1 of onboarding
- `pages/onboarding/complete.tsx` - Final onboarding step
- `src/contexts/AuthContext.tsx` - Auth state management
- `src/lib/auth-redirect.ts` - Redirect logic
- `src/components/ProtectedRoute.tsx` - Route protection

### Related Documentation

- `DESIGN_SYSTEM.md` - UI/UX guidelines
- `PROJECT_CONTEXT.md` - Overall architecture
- `ONBOARDING_DESIGN_SPEC.md` - Detailed onboarding specs

---

**Last Updated:** November 15, 2025  
**Version:** 2.0 (Merged Login/Welcome)

