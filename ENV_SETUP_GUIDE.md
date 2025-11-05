# Environment Setup Guide

## Your Current Setup

Based on your configuration, you have three Supabase environments:
1. **Supabase Dev** - Development database (has service role key)
2. **Supabase Public** - Public/production database (only public keys)
3. **Supabase Test** - Testing database (for CI/CD)

---

## ✅ Recommended `.env.local` Configuration

### Option 1: Server-Side Only (Recommended)

```bash
# ==============================================================================
# SUPABASE DEV (Primary Development)
# ==============================================================================
SUPABASE_URL=https://your-dev-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-dev-service-key

# ==============================================================================
# SUPABASE TEST (CI/CD Testing)
# ==============================================================================
SUPABASE_TEST_URL=https://your-test-project.supabase.co
SUPABASE_TEST_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-test-anon-key
SUPABASE_TEST_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-test-service-key

# ==============================================================================
# OTHER SERVICES
# ==============================================================================
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Razorpay
RZ_KEY_ID=rzp_test_xxxxx
RZ_KEY_SECRET=xxxxx
RZ_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx

# Email
RESEND_API_KEY=re_xxxxx
SENDGRID_FROM_EMAIL=noreply@automet.in
EMAIL_TOKEN_SECRET=your-random-32-char-secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Database (for migrations)
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

---

### Option 2: With Client-Side Access (If You Need Browser Access)

```bash
# ==============================================================================
# SUPABASE DEV - Server-side
# ==============================================================================
SUPABASE_URL=https://your-dev-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-dev-service-key

# ==============================================================================
# SUPABASE PUBLIC - Client-side (for browser/React components)
# ==============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://your-public-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-public-anon-key
# NOTE: DO NOT add NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY - service keys should NEVER be exposed!

# ... rest of config same as Option 1
```

---

## 🎯 Which Option Should You Use?

### Use Option 1 (Server-Side Only) if:
- ✅ You're only using API routes
- ✅ All Supabase calls go through your Next.js backend
- ✅ You want maximum security
- ✅ **This is the recommended approach**

### Use Option 2 (With Client-Side) if:
- ✅ You need to call Supabase directly from React components
- ✅ You want real-time subscriptions in the browser
- ✅ You're using Supabase Auth UI components
- ⚠️ **Only use anon key with NEXT_PUBLIC_ prefix**

---

## 🔍 How the Code Works Now

The code now supports **both naming conventions** automatically:

### For API Routes (Server-Side):
```typescript
// The code checks in this order:
1. SUPABASE_URL          (server-side, preferred)
2. NEXT_PUBLIC_SUPABASE_URL   (falls back to this)

1. SUPABASE_ANON_KEY     (server-side, preferred)
2. NEXT_PUBLIC_SUPABASE_ANON_KEY  (falls back to this)
```

### For Service Role (Admin Operations):
```typescript
// Only checks server-side (no NEXT_PUBLIC_ fallback for security)
SUPABASE_SERVICE_ROLE_KEY   (server-side only)
```

---

## 📝 Your Specific Case

Based on your description, here's what you probably have:

### Supabase Dev Section:
```bash
SUPABASE_URL=https://dev-project.supabase.co
SUPABASE_ANON_KEY=ey...dev-anon
SUPABASE_SERVICE_ROLE_KEY=ey...dev-service  # ✓ Has service role key
```

### Supabase Public Section:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://public-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...public-anon
# No service role key here (correct - never expose!)
```

### Supabase Test Section:
```bash
SUPABASE_TEST_URL=https://test-project.supabase.co
SUPABASE_TEST_ANON_KEY=ey...test-anon
SUPABASE_TEST_SERVICE_KEY=ey...test-service
```

**This is perfectly valid!** The code will work with this setup.

---

## ✅ What Will Happen

### Blog API (`/api/blog`):
1. Checks for `SUPABASE_URL` → Not found (you don't have this)
2. Falls back to `NEXT_PUBLIC_SUPABASE_URL` → ✓ Found!
3. Checks for `SUPABASE_ANON_KEY` → Not found
4. Falls back to `NEXT_PUBLIC_SUPABASE_ANON_KEY` → ✓ Found!
5. ✅ **Blog works with your public credentials**

### Protected API Routes (`/api/clients`, etc.):
1. Tries to use authenticated session
2. Falls back to env vars if needed
3. Uses `SUPABASE_SERVICE_ROLE_KEY` from Dev section
4. ✅ **Protected routes work with your dev credentials**

---

## 🚨 Common Issues & Solutions

### Issue 1: "Server configuration error"
**Means**: Neither SUPABASE_URL nor NEXT_PUBLIC_SUPABASE_URL is set

**Solution**: Add at least one of these to your `.env.local`

### Issue 2: Blog works but protected routes don't
**Means**: You have public credentials but no dev credentials

**Solution**: Add server-side credentials (without NEXT_PUBLIC_ prefix)

### Issue 3: Everything works in dev but fails in production
**Means**: NEXT_PUBLIC_ vars in .env.local aren't deployed

**Solution**: Set environment variables in your hosting platform (Vercel, etc.)

---

## 🎨 Recommended Setup for Your Case

Based on your three-section setup, here's what I recommend:

```bash
# ==============================================================================
# DEVELOPMENT - Use your "Supabase Dev" credentials
# ==============================================================================
SUPABASE_URL=https://your-dev-project.supabase.co
SUPABASE_ANON_KEY=your-dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-dev-service-key

# ==============================================================================
# PUBLIC/CLIENT - Use your "Supabase Public" credentials
# ==============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://your-public-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key

# ==============================================================================
# TESTING - Use your "Supabase Test" credentials
# ==============================================================================
SUPABASE_TEST_URL=https://your-test-project.supabase.co
SUPABASE_TEST_ANON_KEY=your-test-anon-key
SUPABASE_TEST_SERVICE_KEY=your-test-service-key
```

This way:
- ✅ API routes can use either dev or public credentials
- ✅ Client components can access public project
- ✅ Tests use test project
- ✅ Maximum flexibility and security

---

## 🔧 Testing Your Configuration

### Test 1: Check what vars are loaded
Add this to any API route temporarily:
```typescript
console.log('Env check:', {
  url: process.env.SUPABASE_URL || 'not set',
  publicUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set',
  hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
  hasPublicAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
});
```

### Test 2: Use the helper utility
```typescript
import { getSupabaseEnvConvention, isSupabaseConfigured } from '@/lib/supabase-env';

console.log('Configured:', isSupabaseConfigured());
console.log('Convention:', getSupabaseEnvConvention());
```

---

## 📚 Helper Utility Reference

We created `src/lib/supabase-env.ts` with these functions:

```typescript
// Get URL (checks both naming conventions)
getSupabaseUrl(): string | undefined

// Get anon key (checks both naming conventions)
getSupabaseAnonKey(): string | undefined

// Get service role key (server-only, no fallback)
getSupabaseServiceRoleKey(): string | undefined

// Get credentials for public routes (throws if missing)
getPublicSupabaseCredentials(): { url: string; anonKey: string }

// Get credentials for admin routes (throws if missing)
getAdminSupabaseCredentials(): { url: string; serviceRoleKey: string }

// Check if configured
isSupabaseConfigured(): boolean

// See which naming convention is being used
getSupabaseEnvConvention(): { url, anonKey, serviceRoleKey }
```

---

## 🎯 Quick Summary

**Your setup is valid!** The code now:
1. ✅ Checks for server-side credentials first (SUPABASE_*)
2. ✅ Falls back to client-side credentials (NEXT_PUBLIC_SUPABASE_*)
3. ✅ Works with either or both
4. ✅ Shows clear error messages if both are missing

**Just make sure**:
- Blog routes can access NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- Protected routes can access SUPABASE_SERVICE_ROLE_KEY
- Never add NEXT_PUBLIC_ prefix to service role keys!

---

## 📞 Need Help?

If blog page still doesn't load:
1. Check browser console for specific error
2. Check server terminal for API errors
3. Verify your .env.local has at least URL and anon key (with either naming convention)
4. Try the debug scripts above

Everything should work now! 🎉
