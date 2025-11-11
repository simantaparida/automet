# ✅ Vercel Landing Page Deployment Checklist

## 🎯 Goal
Deploy **ONLY the landing page** (not the full app) to Vercel staging environment.

---

## 📋 Step-by-Step Checklist

### ✅ Step 1: Set Environment Variables in Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

**Copy and paste these** (replace with your actual values):

```bash
# 🔴 CRITICAL - Enable landing-only mode
NEXT_PUBLIC_LANDING_ONLY=true

# App configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://automet-git-develop-username.vercel.app

# Supabase (Get from Supabase Dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
DATABASE_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres

# Email (optional for now)
SENDGRID_FROM_EMAIL=noreply@automet.app

# Admin secret (generate a random string)
ADMIN_SECRET=your-secret-here-use-openssl-rand-hex-32
```

**For each environment variable:**
1. Click "Add New"
2. Paste the **key** (e.g., `NEXT_PUBLIC_LANDING_ONLY`)
3. Paste the **value** (e.g., `true`)
4. Select environment: **Production** and **Preview**
5. Click "Save"

---

### ✅ Step 2: Verify Build Settings

Go to: **Settings → General → Build & Development Settings**

Ensure:
- ✅ **Framework Preset:** Next.js
- ✅ **Build Command:** `npm run build` (or leave empty)
- ✅ **Output Directory:** Leave empty
- ✅ **Install Command:** `npm install` (or leave empty)
- ✅ **Node.js Version:** 20.x

---

### ✅ Step 3: Deploy

Option A: **Automatic (Recommended)**
- Push to GitHub `develop` branch
- Vercel will auto-deploy

Option B: **Manual**
- Go to Vercel Dashboard → Deployments
- Click "Redeploy" on the latest deployment

---

### ✅ Step 4: Verify Deployment

After deployment completes (2-5 minutes):

**Test these URLs (should work):**
- `https://your-url.vercel.app/` ✅ Home
- `https://your-url.vercel.app/pricing` ✅ Pricing
- `https://your-url.vercel.app/features` ✅ Features
- `https://your-url.vercel.app/blog` ✅ Blog
- Fill waitlist form ✅ Should save to Supabase

**Test these URLs (should redirect to home):**
- `https://your-url.vercel.app/dashboard` → `/`
- `https://your-url.vercel.app/login` → `/`
- `https://your-url.vercel.app/jobs` → `/`

---

## 🎯 What This Achieves

✅ **Only landing pages are accessible**
✅ **Build succeeds without complex setup**
✅ **Waitlist functionality works**
✅ **Blog works**
✅ **No authentication required**
✅ **App pages are blocked**

---

## 🚨 If Build Still Fails

### Error: "routes-manifest.json not found"
**Cause:** Missing `NEXT_PUBLIC_` env vars
**Fix:** Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

### Error: "Supabase client initialization failed"
**Cause:** `NEXT_PUBLIC_LANDING_ONLY` not set
**Fix:** Set `NEXT_PUBLIC_LANDING_ONLY=true` in Vercel

### Error: Build timeout or out of memory
**Cause:** Too many pages being built
**Fix:** Ensure `NEXT_PUBLIC_LANDING_ONLY=true` is set

---

## 📞 Next Steps

After landing page is deployed:

1. ✅ Share staging URL for feedback
2. ✅ Test waitlist form
3. ✅ Test all landing pages
4. ✅ Deploy to production (same process)
5. ⏭️ Later: Remove `NEXT_PUBLIC_LANDING_ONLY` when ready for full app

---

## 🔍 Quick Debug Commands

**Check if landing-only mode is active:**
```bash
# In browser console on your deployed site
console.log(process.env.NEXT_PUBLIC_LANDING_ONLY)
// Should show: "true"
```

**Check deployment logs:**
1. Go to Vercel Dashboard → Deployments
2. Click on the latest deployment
3. Check "Building" logs for errors

---

## ✅ Summary

**3 Critical Things:**
1. ✅ Set `NEXT_PUBLIC_LANDING_ONLY=true` in Vercel
2. ✅ Set all Supabase env vars (especially `NEXT_PUBLIC_*`)
3. ✅ Deploy and test

**Expected result:** Landing page works, app pages are blocked. MVP is live! 🎉

