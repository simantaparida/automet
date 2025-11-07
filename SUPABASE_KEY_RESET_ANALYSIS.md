# 🔍 Supabase API Keys - Complete Reset Analysis

**Date:** November 6, 2025  
**Purpose:** Comprehensive map of all locations where Supabase keys need to be updated

---

## 📊 Summary

Your Supabase keys are referenced in **3 critical locations**:
1. **Vercel Environment Variables** (Production/Preview) ⚠️ MOST IMPORTANT
2. **Local `.env.local` file** (Your machine)
3. **Code files** (These are fine - they READ the env vars)

**Documentation files** have exposed keys and need cleanup (I'll handle this).

---

## 🎯 PRIORITY 1: Vercel Environment Variables

### Location
**Vercel Dashboard → Project "Automet" → Settings → Environment Variables**

### Action Required: DELETE then ADD

#### Step 1: Delete These (if they exist):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

#### Step 2: Add NEW keys (after getting from Supabase):

| Variable Name | Type | Environments | Description |
|---------------|------|--------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Production + Preview | Your project URL (e.g., https://xxx.supabase.co) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Production + Preview | Anon/public key (safe for client-side) |
| `SUPABASE_URL` | Server | Production + Preview | Same as above (server-side fallback) |
| `SUPABASE_ANON_KEY` | Server | Production + Preview | Same as above (server-side fallback) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Production + Preview | Service role key (NEVER expose to client) |
| `DATABASE_URL` | Server | Production + Preview | PostgreSQL connection string |

**CRITICAL:** 
- ✅ Select BOTH "Production" AND "Preview" for each variable
- ✅ Paste values with NO extra spaces or quotes
- ✅ Click "Save" after adding each one

---

## 🏠 PRIORITY 2: Local Environment File

### Location
**File:** `.env.local` in your project root (`/Users/simantparida/Desktop/Vibe Coding/Automet/.env.local`)

### Action Required: Update these lines

```bash
# Supabase Configuration - UPDATE THESE
NEXT_PUBLIC_SUPABASE_URL=https://your-new-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
SUPABASE_URL=https://your-new-project-url.supabase.co
SUPABASE_ANON_KEY=your-new-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key
DATABASE_URL=postgresql://postgres:your-new-password@db.your-project.supabase.co:5432/postgres

# Keep these as-is
NEXT_PUBLIC_LANDING_ONLY=true
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_SECRET=your-admin-secret
SENDGRID_FROM_EMAIL=noreply@automet.app
```

---

## 📁 CODE FILES (No Action Needed - Analysis Only)

These files READ the environment variables. You don't need to edit these.

### Client-Side Files (Use `NEXT_PUBLIC_` vars)
1. **`src/lib/supabase.ts`** - Main Supabase client
   - Reads: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Fallback: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
   - ✅ Properly configured

2. **`src/contexts/AuthContext.tsx`** - Authentication context
   - Checks if Supabase is configured
   - Uses the client from `src/lib/supabase.ts`
   - ✅ Properly configured

### Server-Side Files (Use all vars including `SERVICE_ROLE_KEY`)
3. **`src/lib/supabase-server.ts`** - Server-side Supabase client
   - Reads: `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`
   - ✅ Properly configured

4. **`pages/api/preorder.ts`** - Waitlist API
   - Uses: Service role key for admin operations
   - ✅ Properly configured

5. **`pages/api/blog/[slug].ts`** - Blog post API
   - Uses: Anon key for public access
   - ✅ Properly configured

6. **`pages/api/blog/index.ts`** - Blog list API
   - Uses: Anon key for public access
   - ✅ Properly configured

### Helper Files
7. **`src/lib/supabase-env.ts`** - Environment helper
   - Utility functions to get Supabase credentials
   - ✅ Properly configured

8. **`src/lib/env.ts`** - General environment helper
   - Validates all environment variables
   - ✅ Properly configured

### Migration Scripts
9. **`scripts/run-migrations.js`** - Database migrations
   - Uses: `SUPABASE_SERVICE_ROLE_KEY` from `.env.local`
   - ✅ Will automatically use new keys after you update `.env.local`

---

## 📚 DOCUMENTATION FILES (Need Cleanup - I'll Handle)

These files have **hardcoded keys** that need to be removed:

### Files with EXPOSED KEYS (Security Risk):
1. ❌ `VERCEL_SETUP_CHECKLIST.md` - Contains old keys
2. ❌ `LANDING_ONLY_DEPLOYMENT.md` - Contains sample keys
3. ❌ `VERCEL_DEPLOYMENT_GUIDE.md` - Has placeholder examples
4. ⚠️ `SUPABASE_KEY_REGENERATION_GUIDE.md` - Created just now (has examples)

**Action:** I will clean these files and replace with placeholders.

---

## 🔐 WHERE TO GET NEW KEYS

### Supabase Dashboard Instructions:

1. **Go to:** https://app.supabase.com
2. **Select** your project
3. **Navigate to:**

#### A. API Keys (Settings → API)
```
Project URL:  https://xxx.supabase.co
Anon Key:     eyJhbGci... (long JWT token)
Service Key:  eyJhbGci... (long JWT token - NEVER expose)
```

#### B. Database Connection (Settings → Database)
```
Connection String → URI tab
Replace [YOUR-PASSWORD] with your actual database password
Result: postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

---

## ✅ STEP-BY-STEP RESET PROCESS

### Phase 1: Get New Keys from Supabase
```
[ ] Login to https://app.supabase.com
[ ] Go to Settings → API
[ ] Copy Project URL
[ ] Copy Anon/public key
[ ] Copy Service role key
[ ] Go to Settings → Database
[ ] Copy Connection String (URI) and replace [YOUR-PASSWORD]
```

### Phase 2: Update Vercel (MOST CRITICAL)
```
[ ] Login to Vercel Dashboard
[ ] Go to Project Settings → Environment Variables
[ ] Delete all 6 old Supabase variables
[ ] Add NEXT_PUBLIC_SUPABASE_URL (Production + Preview)
[ ] Add NEXT_PUBLIC_SUPABASE_ANON_KEY (Production + Preview)
[ ] Add SUPABASE_URL (Production + Preview)
[ ] Add SUPABASE_ANON_KEY (Production + Preview)
[ ] Add SUPABASE_SERVICE_ROLE_KEY (Production + Preview)
[ ] Add DATABASE_URL (Production + Preview)
[ ] Click Save
```

### Phase 3: Update Local `.env.local`
```
[ ] Open .env.local file
[ ] Replace NEXT_PUBLIC_SUPABASE_URL
[ ] Replace NEXT_PUBLIC_SUPABASE_ANON_KEY
[ ] Replace SUPABASE_URL
[ ] Replace SUPABASE_ANON_KEY
[ ] Replace SUPABASE_SERVICE_ROLE_KEY
[ ] Replace DATABASE_URL
[ ] Save file
```

### Phase 4: Test Locally
```
[ ] Run: rm -rf .next
[ ] Run: npm install
[ ] Run: npm run build
[ ] Run: npm start
[ ] Test: Visit http://localhost:3000
[ ] Test: Try waitlist form
```

### Phase 5: Deploy to Vercel
```
[ ] Trigger redeploy in Vercel Dashboard
[ ] Monitor build logs
[ ] Verify deployment succeeds
[ ] Test live URL
```

### Phase 6: Cleanup (I'll do this)
```
[ ] Remove exposed keys from documentation files
[ ] Update security checklist
[ ] Commit changes to GitHub
```

---

## 🚨 SECURITY NOTES

### DO NOT commit to GitHub:
- ❌ `.env.local` (already in .gitignore)
- ❌ Any file with actual keys

### SAFE for GitHub:
- ✅ `.env.example` (with placeholder values)
- ✅ Documentation with `your-key-here` placeholders
- ✅ Code files that READ env vars

### Vercel-Specific:
- ✅ Environment variables in Vercel are encrypted
- ✅ They're never exposed in build logs
- ✅ Select "Production + Preview" for all keys

---

## 🐛 COMMON ISSUES

### Issue 1: "Missing NEXT_PUBLIC_SUPABASE_URL"
**Cause:** Environment variables not set in Vercel  
**Fix:** Double-check all 6 variables are added to Vercel with "Production + Preview" selected

### Issue 2: "Invalid Supabase credentials"
**Cause:** Keys have extra spaces or wrong format  
**Fix:** Copy keys again, paste without quotes, verify no trailing spaces

### Issue 3: "404 on Vercel after deploy"
**Cause:** Build failed due to missing env vars  
**Fix:** Check Vercel build logs, ensure `NEXT_PUBLIC_` vars are set

### Issue 4: "Waitlist form not working"
**Cause:** Missing `SUPABASE_SERVICE_ROLE_KEY`  
**Fix:** Add service role key to Vercel environment variables

---

## 📞 NEXT STEPS

**Ready to proceed?**

1. Open Supabase Dashboard in one tab
2. Open Vercel Dashboard in another tab
3. Copy keys from Supabase
4. Paste them here for verification (I'll check format)
5. Then add to Vercel together

**Let me know when you're ready to start!** 🚀

