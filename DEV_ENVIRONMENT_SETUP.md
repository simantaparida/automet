# 🛠️ Development Environment Setup Guide

**Last Updated:** November 11, 2025
**Purpose:** Configure separate dev/staging environments to safely develop v0.2.0 without affecting production

---

## 📋 Overview

You currently have:
- ✅ **Production**: `main` branch → Vercel Production → Supabase `automet-prod`
- ✅ **Development**: `develop` branch → Local dev → Supabase `automet-dev`
- ⚠️ **Missing**: Staging environment for testing before production

This guide will help you:
1. Set up proper branch workflow
2. Configure Vercel preview/staging deployments
3. Use correct Supabase project per environment
4. Prevent accidental production deployments

---

## 🌳 Part 1: Git Workflow Setup

### Current Branch Structure

```
main (production) ← Protected, requires PR
  ↑
  PR & squash merge
  ↑
develop (active development) ← Work here
  ↑
  feature branches (optional)
```

### Step 1.1: Switch to Develop Branch

```bash
# Switch to develop branch (your main working branch)
git checkout develop

# Make sure it's up to date
git pull origin develop

# Verify you're on develop
git branch --show-current
```

**✅ From now on, ALWAYS work on `develop` branch for v0.2.0 development**

### Step 1.2: GitHub Branch Protection (via Web UI)

1. Go to: https://github.com/simantaparida/automet/settings/branches
2. Edit branch protection rule for `main`:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require linear history (no merge commits)
   - ✅ Do not allow bypassing the above settings

3. **Add protection for `develop` branch** (optional but recommended):
   - Click "Add rule"
   - Branch name pattern: `develop`
   - ✅ Require pull request reviews (can be skipped for solo dev)
   - ✅ Require status checks to pass
   - ⚠️ Allow force pushes (for rebasing) - only if you're the only developer

**Result:** You can push directly to `develop`, but `main` requires a PR.

---

## 🚀 Part 2: Vercel Environment Setup

### Current Vercel Setup

Your Vercel project currently deploys:
- **Production**: `main` branch → https://automet.app
- **Preview**: Pull requests and other branches

### Step 2.1: Configure Vercel Branch Settings

1. **Go to Vercel Dashboard**: https://vercel.com/simantaparida/automet/settings/git

2. **Production Branch** (should already be set):
   - Production Branch: `main`
   - ✅ This deploys to https://automet.app

3. **Configure Preview Deployments**:
   - ✅ Enable automatic Preview Deployments for all branches
   - This means every push to `develop` will create a preview URL

4. **Optional: Create a Staging Environment**:
   - Go to Settings → Environments
   - You can promote `develop` branch to use "Preview" environment
   - Preview URLs look like: `automet-{branch}-simantaparida.vercel.app`

### Step 2.2: Set Up Environment Variables per Environment

Vercel allows you to set different environment variables for:
- **Production** (main branch)
- **Preview** (develop branch + PRs)
- **Development** (local `npm run dev`)

#### Configure in Vercel Dashboard:

1. Go to: https://vercel.com/simantaparida/automet/settings/environment-variables

2. **For PRODUCTION (main branch only)**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<your-production-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-production-anon-key>
   DATABASE_URL=<your-production-database-url>
   NEXT_PUBLIC_APP_URL=https://automet.app
   NEXT_PUBLIC_ADMIN_SECRET=<your-production-admin-secret>
   ```
   Check: ✅ Production

   **Important:** Get these values from your production Supabase project settings.

3. **For PREVIEW (develop branch)**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<your-development-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-development-anon-key>
   DATABASE_URL=<your-development-database-url>
   NEXT_PUBLIC_APP_URL=https://automet-git-develop-{your-vercel-username}.vercel.app
   NEXT_PUBLIC_ADMIN_SECRET=<your-dev-admin-secret>
   ```
   Check: ✅ Preview, ✅ Development

   **Important:** Get these values from your development Supabase project settings or `.env.local` file.

4. **For LOCAL DEVELOPMENT**:
   - Already configured in `.env.local` (dev Supabase project)
   - No changes needed

### Step 2.3: Test Preview Deployment

```bash
# Make a small change on develop
git checkout develop
echo "# Testing preview" >> README.md
git add README.md
git commit -m "test: verify preview deployment"
git push origin develop
```

Then:
1. Go to Vercel dashboard → Deployments
2. Find the deployment for `develop` branch
3. Click to see the preview URL (e.g., `automet-git-develop-simantaparida.vercel.app`)
4. Test that it uses the **dev Supabase project**

---

## 🗄️ Part 3: Supabase Environment Separation

### Current Setup

| Environment | Supabase Project | Branch | Purpose |
|-------------|-----------------|--------|---------|
| **Production** | `automet-prod` | `main` | Live users, real data |
| **Development** | `automet-dev` | `develop` | Testing, seed data |

### Step 3.1: Verify Local Dev Uses Dev Supabase

Your `.env.local` should point to your development Supabase project:
```bash
# Confirm this in .env.local:
NEXT_PUBLIC_SUPABASE_URL=<your-development-supabase-url>
```

✅ Make sure this points to your DEV project, not production.

### Step 3.2: Run Migrations on Dev Database

```bash
# Make sure you're connected to DEV Supabase project
# Go to Supabase Dashboard → Select your development project

# Option 1: Run migrations via SQL Editor (recommended)
# - Copy migration files from migrations/ folder
# - Run in Supabase SQL Editor

# Option 2: Use migration script (if configured)
npm run migrate

# Verify tables exist
# Go to Supabase → Table Editor → Check for organizations, users, clients, etc.
```

### Step 3.3: Add Seed Data for Testing

```bash
# Run seed data on DEV database
npm run seed

# This will populate:
# - Demo organization (Sharma Services)
# - 4 users (owner, coordinator, 2 technicians)
# - Sample clients, sites, assets, jobs
```

### Step 3.4: Test Authentication on Dev

1. Go to Supabase Dashboard → Select your development project
2. Navigate to **Authentication → Users**
3. You should see seed users OR create a test user for testing

---

## 🔄 Part 4: Daily Development Workflow

### Starting Development

```bash
# 1. Always start on develop branch
git checkout develop
git pull origin develop

# 2. Start local dev server
npm run dev

# 3. Open http://localhost:3000
# ✅ Uses automet-dev Supabase project
# ✅ No risk to production
```

### Making Changes

```bash
# Option A: Work directly on develop (simple, solo dev)
git checkout develop
# Make changes...
git add .
git commit -m "feat: add organization onboarding"
git push origin develop

# Option B: Use feature branches (recommended for larger features)
git checkout -b feature/onboarding-flow
# Make changes...
git add .
git commit -m "feat: add organization onboarding"
git push origin feature/onboarding-flow

# Then create PR: feature/onboarding-flow → develop
```

### Testing on Preview Deployment

```bash
# After pushing to develop
git push origin develop

# Vercel automatically deploys to preview URL
# Check: https://vercel.com/simantaparida/automet
# Find deployment → Click "Visit" to test
```

### Deploying to Production

```bash
# When ready to deploy to production:

# 1. Make sure develop is stable
npm run build  # Test production build locally
npm run test:ci  # Run all tests

# 2. Create PR from develop to main
gh pr create --base main --head develop --title "release: v0.2.0 - Authentication & Onboarding"

# OR via GitHub web UI:
# https://github.com/simantaparida/automet/compare/main...develop

# 3. Review PR, wait for CI checks to pass
# 4. Merge PR (squash merge)
# 5. Vercel automatically deploys main → Production
```

---

## ⚠️ Part 5: Safety Checklist

### Before Every Coding Session

- [ ] Check current branch: `git branch --show-current`
- [ ] Verify it says `develop` (NOT `main`)
- [ ] Pull latest changes: `git pull origin develop`
- [ ] Verify `.env.local` points to dev Supabase (dogzgbpp...)

### Before Every Commit

- [ ] Review changes: `git diff`
- [ ] Check you're on `develop` branch
- [ ] No production credentials in code
- [ ] Test locally: `npm run dev`

### Before Creating PR to Main

- [ ] All tests pass: `npm run test:ci`
- [ ] Production build works: `npm run build`
- [ ] Preview deployment tested
- [ ] No breaking changes to production data
- [ ] Database migrations documented

### If You Accidentally Commit to Main

```bash
# If you haven't pushed yet:
git checkout develop
git cherry-pick <commit-hash>
git checkout main
git reset --hard origin/main

# If you already pushed:
# Don't panic - main is protected, push will be rejected
# Just switch to develop and continue there
```

---

## 🎯 Part 6: Quick Reference

### Git Commands

```bash
# Check current branch
git branch --show-current

# Switch to develop
git checkout develop

# Create feature branch
git checkout -b feature/my-feature

# View all branches
git branch -a

# Delete local branch
git branch -d feature/my-feature

# Pull latest from develop
git pull origin develop
```

### Environment URLs

| Environment | URL | Supabase | Branch |
|-------------|-----|----------|--------|
| **Production** | https://automet.app | automet-prod | `main` |
| **Preview/Staging** | https://automet-git-develop-{user}.vercel.app | automet-dev | `develop` |
| **Local Dev** | http://localhost:3000 | automet-dev | any |

### Supabase Projects

| Project | URL | Purpose |
|---------|-----|---------|
| **automet-prod** | Your production Supabase project | Production data (LIVE) |
| **automet-dev** | Your development Supabase project | Development testing |

---

## 🐛 Part 7: Troubleshooting

### Issue: "Why is my local dev using production data?"

**Solution:**
```bash
# Check .env.local
cat .env.local | grep SUPABASE_URL

# Should show your DEVELOPMENT Supabase URL
# NOT your PRODUCTION Supabase URL

# If wrong, update .env.local and restart dev server
```

### Issue: "I pushed to main by accident"

**Solution:**
```bash
# Branch protection will reject it
# Error: "remote rejected main -> main (protected branch)"
# Just switch to develop and push there instead
git checkout develop
git cherry-pick <your-commit>
git push origin develop
```

### Issue: "Preview deployment failed"

**Solution:**
1. Check Vercel deployment logs
2. Verify environment variables are set for Preview
3. Check if build passes locally: `npm run build`

### Issue: "Authentication not working on preview deployment"

**Solution:**
1. Check Vercel environment variables (Preview environment)
2. Verify `NEXT_PUBLIC_APP_URL` is set to preview URL
3. Check Supabase Auth settings (allowed redirect URLs)
4. Go to Supabase → Authentication → URL Configuration
5. Add: `https://automet-git-develop-simantaparida.vercel.app/auth/callback`

---

## ✅ Summary

### What You Should Do NOW

1. **Switch to develop branch**:
   ```bash
   git checkout develop
   ```

2. **Configure Vercel environment variables** (via dashboard):
   - Set Preview environment to use `automet-dev` Supabase
   - Set Production environment to use `automet-prod` Supabase

3. **Test preview deployment**:
   ```bash
   git push origin develop
   # Check Vercel dashboard for preview URL
   ```

4. **Start coding v0.2.0 on develop**:
   ```bash
   # You're now safe to develop!
   npm run dev
   ```

### Daily Workflow (Simple Version)

```bash
# Morning: Start work
git checkout develop
git pull origin develop
npm run dev

# During day: Make changes
git add .
git commit -m "feat: your changes"
git push origin develop

# Automatic: Vercel deploys preview
# Test at: https://automet-git-develop-simantaparida.vercel.app

# When ready for production:
# Create PR: develop → main
# Merge PR → Auto-deploy to production
```

---

**🎉 You're now set up for safe development!**

All v0.2.0 work should happen on `develop` branch, which uses the dev Supabase project and deploys to preview URLs. Production (`main` branch) is protected and only updated via PR.
