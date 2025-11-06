# 🚀 Landing Page Only Deployment Guide

This guide explains how to deploy **ONLY the landing page** to Vercel, excluding the authenticated app (dashboard, jobs, etc.).

---

## 📋 What's Included in Landing-Only Mode

### ✅ Pages That Will Work:
- **Home Page** (`/`)
- **Pricing** (`/pricing`)
- **Features** (`/features`)
- **ROI Calculator** (`/roi-calculator`)
- **Blog** (`/blog`, `/blog/[slug]`)
- **Terms of Service** (`/terms-of-service`)
- **Privacy Policy** (`/privacy-policy`)
- **About** (`/about`)
- **Waitlist/Preorder** (`/preorder/success`, `/preorder/confirm`)
- **Admin Waitlist Viewer** (`/admin/waitlist`)

### ❌ Pages That Will Be Blocked:
- Dashboard (`/dashboard`)
- Login/Signup (`/login`, `/signup`, `/auth/*`)
- Profile (`/profile`)
- Jobs, Clients, Sites, Assets, Inventory (all management pages)

**Why?** These pages require full Supabase authentication, RLS policies, and database setup. For MVP landing page, we don't need them.

---

## 🔧 Step 1: Set Up Vercel Environment Variables

Go to your Vercel project → **Settings** → **Environment Variables** and add these:

### Required Variables:

```bash
# Landing-only mode flag (CRITICAL - enables landing-only mode)
NEXT_PUBLIC_LANDING_ONLY=true

# App URL
NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app

# Supabase (for waitlist functionality)
NEXT_PUBLIC_SUPABASE_URL=https://dogzgbppyiokvipvsgln.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_URL=https://dogzgbppyiokvipvsgln.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:your-password@db.dogzgbppyiokvipvsgln.supabase.co:5432/postgres

# Email (for contact form - can skip for now)
# RESEND_API_KEY=
SENDGRID_FROM_EMAIL=noreply@automet.app

# Admin secret (for /admin/waitlist page)
ADMIN_SECRET=your-secure-random-secret-here

# Production mode
NODE_ENV=production
```

### ⚠️ CRITICAL: Set `NEXT_PUBLIC_LANDING_ONLY=true`

This environment variable:
- Disables auth initialization in `AuthContext`
- Activates middleware to block non-landing pages
- Allows build to succeed with minimal configuration

---

## 🔧 Step 2: Verify Build Settings in Vercel

1. Go to **Settings** → **General** → **Build & Development Settings**
2. Ensure:
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build` (or leave empty)
   - **Output Directory:** Leave empty (defaults to `.next`)
   - **Install Command:** `npm install` (or leave empty)
   - **Node.js Version:** 20.x

---

## 🚀 Step 3: Deploy

1. Push your code to GitHub
2. Vercel will automatically deploy
3. Or manually trigger deployment in Vercel dashboard

---

## ✅ Step 4: Verify Landing-Only Mode Works

After deployment:

1. **Test landing pages** (should work):
   - `https://your-url.vercel.app/`
   - `https://your-url.vercel.app/pricing`
   - `https://your-url.vercel.app/features`
   - `https://your-url.vercel.app/blog`

2. **Test blocked pages** (should redirect to `/`):
   - `https://your-url.vercel.app/dashboard` → redirects to `/`
   - `https://your-url.vercel.app/login` → redirects to `/`
   - `https://your-url.vercel.app/jobs` → redirects to `/`

3. **Test waitlist** (should work):
   - Fill out the waitlist form on homepage
   - Should save to Supabase `preorders` table
   - Check `/admin/waitlist?secret=YOUR_ADMIN_SECRET`

---

## 📊 What Happens in Landing-Only Mode?

### 1. **AuthContext Skips Initialization**
```typescript
// In src/contexts/AuthContext.tsx
if (isLandingOnly || !hasSupabaseConfig) {
  setLoading(false);
  return; // Skip Supabase auth setup
}
```

### 2. **Middleware Blocks App Pages**
```typescript
// In middleware.ts
if (!isLandingPage && isLandingOnly) {
  return NextResponse.redirect(new URL('/', request.url));
}
```

### 3. **Supabase Client Still Works for Waitlist**
- API routes `/api/preorder` and `/api/blog/*` still work
- These use server-side Supabase client
- No authentication required for these endpoints

---

## 🔄 Migrating to Full App Later

When you're ready to deploy the full app:

1. **Update Environment Variables in Vercel:**
   ```bash
   # Remove or set to false
   NEXT_PUBLIC_LANDING_ONLY=false
   
   # Add full Supabase configuration (if not already set)
   # Add Razorpay keys
   # Add Google OAuth keys
   ```

2. **Run Database Migrations:**
   - Connect to your production Supabase project
   - Run migrations via Supabase dashboard or CLI

3. **Redeploy:**
   - Push changes or manually redeploy in Vercel
   - Full app will now be available

---

## 🐛 Troubleshooting

### Build fails with "routes-manifest.json not found"
**Solution:** Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in Vercel env vars.

### Build fails with "Supabase client error"
**Solution:** Set `NEXT_PUBLIC_LANDING_ONLY=true` in Vercel env vars.

### Pages redirect to home even though I'm not in landing-only mode
**Solution:** Check that `NEXT_PUBLIC_LANDING_ONLY` is set to `false` or removed entirely.

### Waitlist form doesn't work
**Solution:** Verify:
1. `SUPABASE_SERVICE_ROLE_KEY` is set
2. `preorders` table exists in Supabase
3. RLS policy allows anonymous inserts on `preorders`

### Admin waitlist page shows error
**Solution:** Verify:
1. URL includes `?secret=YOUR_ADMIN_SECRET`
2. `ADMIN_SECRET` env var matches the URL parameter
3. Supabase credentials are correct

---

## 📝 Summary

**Landing-Only Mode Features:**
- ✅ Minimal env vars required
- ✅ Auth context skipped gracefully
- ✅ App pages automatically blocked
- ✅ Waitlist functionality still works
- ✅ Blog still works
- ✅ SEO pages (terms, privacy) work
- ✅ Fast, clean deployment for MVP

**To Enable:** Set `NEXT_PUBLIC_LANDING_ONLY=true` in Vercel environment variables.

