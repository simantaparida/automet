# 🎯 Staging Strategy - Using Dev Project

Since Supabase free tier only allows 2 projects, here's the best approach:

## ✅ Recommended Approach: Use Dev Project for Staging

**Strategy:**
- **Dev Project** = Use for both development AND staging
- **Production Project** = Create later when ready for production launch

This is a common practice for early-stage startups!

---

## 🔄 Two Options

### Option 1: Same Database, Different Environments (Recommended)

**Use the same Supabase project but:**
- Development: `http://localhost:3000` → Uses dev data
- Staging: `https://staging.automet.app` → Uses same database (or separate tables)

**Pros:**
- ✅ No need for second Supabase project
- ✅ Easy to test with real data
- ✅ Free
- ✅ Can use Vercel preview deployments (automatic staging URLs)

**Cons:**
- ⚠️ Dev and staging share the same database (can add prefixes to separate if needed)

---

### Option 2: Vercel Preview Deployments (Best for Staging)

**How it works:**
- Push to `staging` branch → Auto-deploys to `automet-git-staging-username.vercel.app`
- Push to `main` branch → Auto-deploys to production
- Each PR gets its own preview URL

**Pros:**
- ✅ Completely free
- ✅ Automatic staging URLs
- ✅ No need for separate Supabase project
- ✅ Each PR gets isolated preview

**Cons:**
- ⚠️ Preview URLs are long (but you can add custom domain)

---

## 🚀 Recommended Setup

### Step 1: Use Dev Supabase Project for Staging

**What you'll provide:**
- Same credentials as your dev project
- We'll use the same database (or add table prefixes if you want separation)

### Step 2: Use Vercel for Deployment

**Benefits:**
- Automatic staging deployments from `staging` branch
- Production deployments from `main` branch
- Preview deployments for every PR
- Free tier is generous

### Step 3: Environment Variables Strategy

```bash
# .env.local (Development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_URL=your-dev-project-url
# ... other dev vars

# Vercel Environment Variables (Staging)
# Set in Vercel dashboard → Project Settings → Environment Variables
# Select "Preview" environment
NEXT_PUBLIC_APP_URL=https://staging.automet.app (or Vercel preview URL)
SUPABASE_URL=same-dev-project-url
# ... same vars as dev

# Vercel Environment Variables (Production)
# Select "Production" environment
NEXT_PUBLIC_APP_URL=https://automet.app
SUPABASE_URL=production-project-url (create later)
# ... production vars
```

---

## 📋 What I Need From You

Since we're using the dev project for staging:

1. **Dev Supabase Project Credentials** (you already have these):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`

2. **Resend Email Service:**
   - `RESEND_API_KEY`
   - Domain verification status

3. **Staging URL:**
   - Option A: Vercel preview URL (automatic)
   - Option B: Custom staging domain (e.g., `staging.automet.app`)

4. **Admin Secret:**
   - Generate: `openssl rand -hex 32`

---

## 🎯 Deployment Flow

### Development
- Local: `npm run dev` → Uses `.env.local`
- Database: Dev Supabase project

### Staging
- Branch: `staging` → Auto-deploys to Vercel preview
- Database: Same dev Supabase project
- URL: `automet-git-staging-username.vercel.app`

### Production (Later)
- Branch: `main` → Auto-deploys to production
- Database: **New production Supabase project** (create when ready)
- URL: `automet.app`

---

## 🔐 Database Separation (Optional)

If you want to separate staging data from dev data, we can:

1. **Option A: Use table prefixes**
   - Dev tables: `preorders`, `users`, etc.
   - Staging tables: `staging_preorders`, `staging_users`, etc.

2. **Option B: Use separate schemas**
   - Dev schema: `public`
   - Staging schema: `staging`

3. **Option C: Just use same tables** (simplest)
   - Dev and staging share data
   - Clear data between tests if needed

**Recommendation:** Start with Option C (same tables). Add separation later if needed.

---

## ✅ Action Plan

1. **Now (Staging):**
   - Use dev Supabase project
   - Deploy to Vercel preview/staging
   - Test everything

2. **Later (Production):**
   - Create production Supabase project (when ready)
   - Update Vercel production environment variables
   - Deploy to production

---

## 🚀 Ready to Proceed?

**Just provide:**
1. Your existing dev Supabase credentials
2. Resend API key
3. Admin secret (generate with `openssl rand -hex 32`)

**I'll:**
1. Set up staging environment
2. Configure Vercel deployment
3. Test everything
4. Deploy to staging

**No need for a separate Supabase project!** We'll use your dev project for staging and create the production project later when you're ready to launch. 🎉

