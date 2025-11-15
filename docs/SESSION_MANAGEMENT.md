# Session Management & Logged-In User Flows

**Version:** 2.0  
**Last Updated:** November 15, 2025  
**Status:** Active

## Overview

This document explains how Automet manages user sessions, handles authentication state, and routes logged-in users through the application.

---

## Session Architecture

### Technology Stack

- **Provider**: Supabase Auth
- **Storage**: Browser cookies (httpOnly, secure in production)
- **Session Duration**: 7 days (default Supabase setting)
- **Token Refresh**: Automatic via Supabase SDK
- **State Management**: React Context (`AuthContext`)

### Session Storage

```typescript
// Sessions are stored in httpOnly cookies by Supabase
// Managed automatically by @supabase/supabase-js SDK
// Not accessible via JavaScript (security best practice)
```

---

## Session Lifecycle

### 1. Initial Session Check

**When:** On app load / page navigation  
**Where:** `src/contexts/AuthContext.tsx`

```typescript
useEffect(() => {
  // Get initial session from cookies
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
  });

  // Listen for auth state changes (login, logout, token refresh)
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

**What Happens:**
1. Checks for existing session in cookies
2. Sets user state if session exists
3. Subscribes to auth state changes
4. Auto-updates on login/logout/token refresh

### 2. Session Creation

**Login Flow:**
```typescript
// Email/Password
const { error } = await signIn(email, password);
// Supabase creates session → stored in cookies → AuthContext updates

// Google OAuth
const { error } = await signInWithGoogle();
// Redirects to Google → callback → session created → AuthContext updates
```

**Signup Flow:**
```typescript
const { data, error } = await signUp(email, password, fullName, phone);
// If email confirmation disabled: session created immediately
// If email confirmation enabled: no session until email verified
```

### 3. Session Refresh

**Automatic Refresh:**
- Supabase SDK automatically refreshes tokens before expiration
- Happens transparently via `onAuthStateChange` listener
- No manual intervention needed

**Token Expiration:**
- Access token: 1 hour
- Refresh token: 7 days
- Auto-refresh happens ~5 minutes before expiration

### 4. Session Termination

**Sign Out:**
```typescript
await signOut();
// Clears session from cookies
// AuthContext updates (user = null)
// Redirects to /onboarding/welcome
```

**Session Expired:**
- If refresh token expires → user must login again
- `onAuthStateChange` fires with `null` session
- Protected routes redirect to welcome page

---

## Logged-In User Flows

### Flow 1: User Visits Welcome Page (Already Logged In)

```
User visits: /onboarding/welcome
↓
AuthContext checks session → User exists
↓
useEffect detects: !loading && user
↓
Auto-redirect to: /dashboard
```

**Code:**
```typescript
// pages/onboarding/welcome.tsx
useEffect(() => {
  if (!loading && user) {
    router.push('/dashboard');
  }
}, [user, loading, router]);
```

**Result:** User never sees login form, goes straight to dashboard

---

### Flow 2: User Visits Protected Route (Logged In)

```
User visits: /dashboard (or any protected route)
↓
ProtectedRoute component checks: user && !loading
↓
If user exists → Render page content
If no user → Redirect to /onboarding/welcome
```

**Code:**
```typescript
// src/components/ProtectedRoute.tsx
useEffect(() => {
  if (!loading && !user) {
    router.push('/onboarding/welcome');
  }
}, [user, loading, router]);

if (!user) return null; // Will redirect
return <>{children}</>;
```

**Result:** Authenticated users see content, unauthenticated users redirected

---

### Flow 3: User Logs In Successfully

```
User enters credentials on /onboarding/welcome
↓
handleEmailLogin() calls signIn(email, password)
↓
Supabase validates → Creates session → Stores in cookies
↓
AuthContext.onAuthStateChange fires → Updates user state
↓
handleEmailLogin() redirects to /dashboard
```

**Code:**
```typescript
const handleEmailLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  const { error } = await signIn(email, password);
  
  if (error) {
    setError(error.message);
  } else {
    // Session created, AuthContext updated
    router.push('/dashboard');
  }
};
```

**Result:** User logged in and redirected to dashboard

---

### Flow 4: User Logs In via Google OAuth

```
User clicks "Continue with Google"
↓
signInWithGoogle() → Redirects to Google
↓
User authorizes → Google redirects to /auth/callback
↓
Callback page checks session → Gets user profile
↓
Redirects to /dashboard (via getOAuthCallbackRedirectPath)
```

**Code:**
```typescript
// pages/auth/callback.tsx
const { data: { session } } = await supabase.auth.getSession();

if (session) {
  const userResult = await supabase
    .from('users')
    .select('org_id')
    .eq('id', session.user.id)
    .maybeSingle();
  
  const redirectPath = getOAuthCallbackRedirectPath(userResult.data);
  router.push(redirectPath); // → /dashboard
}
```

**Result:** OAuth session created, user redirected to dashboard

---

### Flow 5: User Navigates Between Pages (Logged In)

```
User on /dashboard → Clicks link to /jobs
↓
ProtectedRoute checks: user exists → Allows access
↓
Page loads → Uses user.id for API calls
↓
No redirect needed (user already authenticated)
```

**Result:** Seamless navigation, no re-authentication needed

---

### Flow 6: Session Expires During Use

```
User browsing /dashboard (session expires)
↓
Supabase SDK attempts auto-refresh
↓
If refresh token valid → New session created → No interruption
If refresh token expired → onAuthStateChange fires with null
↓
ProtectedRoute detects: user = null
↓
Redirects to /onboarding/welcome
```

**Result:** User sees login form, must re-authenticate

---

## Redirect Logic for Logged-In Users

### Centralized Redirect Functions

**File:** `src/lib/auth-redirect.ts`

#### 1. `getAuthRedirectPath(user, profile)`

**Purpose:** General auth redirect (used after login check)

```typescript
if (!user) return '/onboarding/welcome';
if (profile?.org_id) return '/dashboard';
return '/onboarding/company'; // No org yet
```

#### 2. `getPostSignupRedirectPath(profile)`

**Purpose:** After successful signup

```typescript
if (profile?.org_id) return '/dashboard';
return '/onboarding/company'; // Always start onboarding
```

#### 3. `getPostLoginRedirectPath(profile)`

**Purpose:** After successful login

```typescript
return '/dashboard'; // Always go to dashboard
// Dashboard shows setup banner if no org
```

#### 4. `getOAuthCallbackRedirectPath(profile)`

**Purpose:** After OAuth callback

```typescript
return getPostLoginRedirectPath(profile); // Same as login
```

---

## Dashboard Behavior for Logged-In Users

### Organization Check

**File:** `pages/dashboard.tsx`

```typescript
useEffect(() => {
  const checkOrganization = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', user.id)
      .maybeSingle();
    
    setHasOrganization(!!data?.org_id);
  };
  
  checkOrganization();
}, [user]);
```

### Display Logic

**If User Has Organization:**
- Shows full dashboard with stats
- Fetches jobs, clients, inventory
- Normal functionality

**If User Has No Organization:**
- Shows setup banner: "Complete your setup"
- Links to `/onboarding/company`
- Limited functionality (can't create jobs)

**Result:** Dashboard is accessible but prompts completion if needed

---

## API Route Session Handling

### Server-Side Session Check

**File:** `src/lib/auth-middleware.ts`

```typescript
export async function withAuth(req, res) {
  // Create Supabase client from request cookies
  const supabase = createServerSupabaseClient({ req, res });
  
  // Get session from cookies
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Get user profile from database
  const { data: userProfile } = await supabase
    .from('users')
    .select('id, email, org_id, role')
    .eq('id', session.user.id)
    .maybeSingle();
  
  return { authenticated: true, user: userProfile };
}
```

**Usage in API Routes:**
```typescript
export default async function handler(req, res) {
  const authResult = await withAuth(req, res);
  if (!authResult.authenticated) return; // 401 sent
  
  const { user } = authResult;
  // Use user.id, user.org_id, user.role
}
```

---

## Session State Management

### AuthContext State

```typescript
interface AuthContextType {
  user: User | null;        // Supabase auth user
  session: Session | null;  // Full session object
  loading: boolean;         // Initial load state
  signIn: (email, password) => Promise<...>;
  signUp: (email, password, ...) => Promise<...>;
  signInWithGoogle: () => Promise<...>;
  signOut: () => Promise<void>;
}
```

### State Updates

**On Login:**
```typescript
// AuthContext automatically updates via onAuthStateChange
setUser(session.user);
setSession(session);
setLoading(false);
```

**On Logout:**
```typescript
// AuthContext automatically updates
setUser(null);
setSession(null);
setLoading(false);
```

**On Token Refresh:**
```typescript
// AuthContext automatically updates with new session
setSession(newSession);
// user stays the same
```

---

## Loading States

### Initial Load

**During Session Check:**
```typescript
if (loading) {
  return <div>Loading...</div>;
}
```

**Why:** Prevents flash of wrong content while checking session

### Protected Routes

**ProtectedRoute Component:**
```typescript
if (loading) {
  return <LoadingSpinner />;
}

if (!user) {
  return null; // Will redirect
}

return <>{children}</>;
```

---

## Security Considerations

### Session Storage

✅ **Secure:**
- Sessions stored in httpOnly cookies
- Not accessible via JavaScript
- Secure flag in production (HTTPS only)
- SameSite protection

### Token Refresh

✅ **Automatic:**
- Supabase SDK handles refresh
- Happens before expiration
- No manual token management needed

### Session Validation

✅ **Server-Side:**
- API routes validate sessions server-side
- Uses Supabase server client
- Checks database for user profile

### Logout

✅ **Complete:**
- Clears session from cookies
- Updates AuthContext state
- Redirects to welcome page

---

## Common Scenarios

### Scenario 1: User Opens App in New Tab

```
Tab 1: User logged in on /dashboard
Tab 2: User opens /onboarding/welcome
↓
AuthContext checks session → User exists
↓
Auto-redirects to /dashboard
```

**Result:** Consistent state across tabs

### Scenario 2: User Logs Out in One Tab

```
Tab 1: User clicks logout
↓
Session cleared → AuthContext updates
↓
Tab 2: onAuthStateChange fires → user = null
↓
ProtectedRoute redirects to /onboarding/welcome
```

**Result:** All tabs reflect logout state

### Scenario 3: User Session Expires

```
User browsing /dashboard
↓
Session expires → Refresh token expired
↓
onAuthStateChange fires → user = null
↓
ProtectedRoute redirects to /onboarding/welcome
↓
User must login again
```

**Result:** Graceful handling, no errors

### Scenario 4: User Completes Onboarding

```
User on /onboarding/company → Creates org
↓
org_id saved to database
↓
User navigates to /dashboard
↓
Dashboard checks org_id → Shows full dashboard
```

**Result:** Seamless transition, no re-login needed

---

## Debugging Session Issues

### Check Session State

```typescript
const { user, session, loading } = useAuth();

console.log('User:', user);
console.log('Session:', session);
console.log('Loading:', loading);
```

### Check Cookies

```javascript
// In browser console
document.cookie // Shows all cookies
// Look for supabase-auth-token
```

### Check Supabase Dashboard

1. Go to Supabase Dashboard → Authentication → Users
2. Find user → Check "Last Sign In"
3. Verify session is active

### Common Issues

**Issue:** User shows as logged in but API returns 401
- **Cause:** Session cookie not sent with API request
- **Fix:** Ensure API uses `createServerSupabaseClient` with req/res

**Issue:** Session persists after logout
- **Cause:** Cookie not cleared properly
- **Fix:** Ensure `signOut()` is awaited and completes

**Issue:** Redirect loop on welcome page
- **Cause:** AuthContext not initialized properly
- **Fix:** Check `loading` state before redirecting

---

## Best Practices

### ✅ DO

- Always check `loading` state before using `user`
- Use `ProtectedRoute` for protected pages
- Use centralized redirect functions from `auth-redirect.ts`
- Let Supabase SDK handle token refresh automatically
- Check `org_id` in dashboard for onboarding status

### ❌ DON'T

- Don't manually manage tokens
- Don't store session in localStorage
- Don't bypass `ProtectedRoute` checks
- Don't hardcode redirect paths
- Don't assume user has org_id without checking

---

## Reference Files

### Core Session Management
- `src/contexts/AuthContext.tsx` - Session state & auth methods
- `src/components/ProtectedRoute.tsx` - Route protection
- `src/lib/auth-redirect.ts` - Redirect logic
- `src/lib/auth-middleware.ts` - API route authentication

### Pages Using Sessions
- `pages/onboarding/welcome.tsx` - Auto-redirect if logged in
- `pages/dashboard.tsx` - Checks org_id for onboarding status
- `pages/auth/callback.tsx` - OAuth session handling

### Related Documentation
- `AUTHENTICATION_FLOW.md` - Complete auth flow
- `DESIGN_SYSTEM.md` - UI patterns
- `QUICK_REFERENCE.md` - Quick lookup

---

## Summary

**Session Management:**
- ✅ Supabase Auth handles sessions automatically
- ✅ Stored in httpOnly cookies (secure)
- ✅ Auto-refreshes before expiration
- ✅ State managed via React Context

**Logged-In User Flows:**
- ✅ Welcome page auto-redirects to dashboard
- ✅ Protected routes check session
- ✅ Dashboard checks org_id for onboarding status
- ✅ API routes validate sessions server-side

**Key Points:**
- Always check `loading` state before using `user`
- Use `ProtectedRoute` for protected pages
- Use centralized redirect functions
- Let Supabase SDK handle token refresh

---

**Last Updated:** November 15, 2025  
**Version:** 2.0

