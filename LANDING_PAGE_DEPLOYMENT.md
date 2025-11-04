# Landing Page Deployment Guide

## Overview

This guide helps you deploy **only the landing page** with the waitlist form, while keeping the core app (dashboard, jobs, etc.) private and not accessible.

## Current Setup

### Public Routes (Safe to Deploy)
- ✅ `/` - Landing page
- ✅ `/blog` - Blog listing
- ✅ `/blog/[slug]` - Blog posts
- ✅ `/preorder/success` - Success page
- ✅ `/preorder/confirm` - Email confirmation
- ✅ `/api/preorder` - Waitlist signup API
- ✅ `/api/blog` - Blog API

### Protected Routes (Will Redirect to Login)
- 🔒 `/dashboard` - Dashboard
- 🔒 `/jobs` - Job management
- 🔒 `/clients` - Client management
- 🔒 `/sites` - Site management
- 🔒 `/assets` - Asset management
- 🔒 `/inventory` - Inventory management
- 🔒 `/profile` - User profile
- 🔒 `/login` - Login page
- 🔒 `/signup` - Signup page
- 🔒 All other API routes

## Supabase Setup Strategy

### Option 1: Use Current Dev Supabase (Simplest)
**Recommended for quick launch**

Your current dev Supabase already has:
- ✅ `preorders` table with public RLS policies
- ✅ `blog_posts` table with public read policies
- ✅ All other tables protected by RLS

**Pros:**
- Quick to deploy
- No additional setup needed
- Can migrate data later

**Cons:**
- Dev database exposed to public (but RLS protects sensitive data)
- Need to be careful with migrations

### Option 2: Separate Supabase Projects (Recommended Long-term)

**Structure:**
1. **Supabase (Dev)** - Current setup, for local development
2. **Supabase (Public)** - New project, only for landing page
3. **Supabase (Test)** - For automated testing

**Public Project Setup:**
```sql
-- Only these tables needed:
- preorders (with public INSERT policy)
- blog_posts (with public SELECT policy for published posts)
```

## Deployment Steps

### Step 1: Environment Variables

Create a `.env.production` file (or set in Vercel):

```bash
# Supabase (Public/Landing Page)
NEXT_PUBLIC_SUPABASE_URL=https://your-public-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-public-service-role-key

# App Config
NEXT_PUBLIC_APP_URL=https://automet.in
NODE_ENV=production
```

**If using Option 1 (Dev Supabase):**
- Use your current dev Supabase credentials
- All other tables are protected by RLS anyway

### Step 2: Verify RLS Policies

Run this in Supabase SQL Editor to verify:

```sql
-- Check preorders policies
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'preorders';

-- Should show:
-- "Public can insert into preorders" | INSERT | {public}
-- "Public can view preorders" | SELECT | {public}

-- Check blog_posts policies
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'blog_posts';

-- Should show:
-- "Public can view published posts" | SELECT | {public}
```

### Step 3: Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables in Vercel:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all variables from `.env.production`
   - Set for **Production** environment

### Step 4: Verify Deployment

1. **Test Public Routes:**
   - ✅ `https://your-domain.com/` - Landing page loads
   - ✅ `https://your-domain.com/blog` - Blog loads
   - ✅ Submit waitlist form - Should work

2. **Verify Protected Routes Redirect:**
   - 🔒 `https://your-domain.com/dashboard` - Should redirect to login (or show login page)
   - 🔒 `https://your-domain.com/jobs` - Should redirect to login
   - All protected routes should be inaccessible

## Security Checklist

### ✅ Database Security
- [x] RLS enabled on all tables
- [x] `preorders` has public INSERT policy (only for waitlist)
- [x] `blog_posts` has public SELECT policy (only for published posts)
- [x] All other tables require authentication (no public access)
- [x] Service role key never exposed to client

### ✅ Route Security
- [x] Protected routes use `ProtectedRoute` component
- [x] Protected routes redirect to `/login` if not authenticated
- [x] API routes check authentication for sensitive operations
- [x] Landing page and blog are public (intentional)

### ✅ API Security
- [x] `/api/preorder` - Public (for waitlist signup)
- [x] `/api/blog` - Public (for blog content)
- [x] All other API routes require authentication

## Monitoring

### Track Waitlist Signups
```sql
-- In Supabase SQL Editor
SELECT 
  COUNT(*) as total_signups,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7d
FROM preorders;
```

### Export Waitlist Data
```sql
-- Export all waitlist entries
SELECT 
  email,
  phone,
  contact_name,
  org_name,
  city,
  tech_count,
  plan_interest,
  created_at
FROM preorders
ORDER BY created_at DESC;
```

## Next Steps After Launch

1. **Monitor waitlist growth**
2. **Export data periodically** for email campaigns
3. **When ready to launch core app:**
   - Set up separate Supabase projects (Dev/Public/Test)
   - Configure proper authentication flows
   - Deploy core app with authentication

## Troubleshooting

### Issue: Protected routes accessible
**Fix:** Check that `ProtectedRoute` component is working and redirecting

### Issue: Form submission fails
**Fix:** 
1. Verify RLS policies on `preorders` table
2. Check service role key is set in environment variables
3. Check server logs for detailed error

### Issue: Blog posts not showing
**Fix:** 
1. Verify RLS policy on `blog_posts` table
2. Check posts are marked as `is_published = true`

## Notes

- The landing page is **fully functional** and ready to collect user interest
- Core app remains **private** and protected by authentication
- You can launch the landing page **now** and add the core app later
- All sensitive data is protected by RLS policies

