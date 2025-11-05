# Deployment Troubleshooting Guide

This guide helps you diagnose and fix common deployment failures.

## Common Deployment Failures

### 1. Missing Secrets Error

**Error Message:**

```
Error: Secret 'VERCEL_TOKEN' is not set
```

**Solution:**

1. Go to **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions**
2. Add the following **Repository Secrets**:
   - `VERCEL_TOKEN` - Get from [Vercel Dashboard](https://vercel.com/account/tokens)
   - `VERCEL_ORG_ID` - Get from Vercel Dashboard → Settings → General
   - `VERCEL_PROJECT_ID` - Get from Vercel Dashboard → Settings → General

3. Go to **Settings** → **Environments** → **staging**
4. Add the following **Environment Secrets**:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your staging Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your staging Supabase anon key
   - `NEXT_PUBLIC_APP_URL` - Your staging app URL (e.g., `https://automet-staging.vercel.app`)

### 2. Build Failure - Missing Environment Variables

**Error Message:**

```
Error: Environment variable NEXT_PUBLIC_SUPABASE_URL is not set
```

**Solution:**

- Ensure all required environment variables are set in the **staging environment secrets**
- Check that the secrets are spelled correctly (case-sensitive)
- Verify the workflow is using the correct environment name

### 3. Type Check Failure

**Error Message:**

```
Type error: ...
```

**Solution:**

1. Run locally to identify the error:
   ```bash
   npm run typecheck
   ```
2. Fix TypeScript errors in your code
3. Commit and push the fixes

### 4. Test Failure

**Error Message:**

```
Test suite failed to run
```

**Solution:**

1. Run tests locally:
   ```bash
   npm run test:ci
   ```
2. Fix failing tests
3. Ensure test database is configured if needed

### 5. Vercel Deployment Failure

**Error Message:**

```
Error: Vercel deployment failed
```

**Possible Causes:**

1. **Invalid Vercel Token**:
   - Go to [Vercel Account Tokens](https://vercel.com/account/tokens)
   - Create a new token
   - Update `VERCEL_TOKEN` secret

2. **Wrong Project ID**:
   - Go to Vercel Dashboard → Project → Settings → General
   - Copy the **Project ID**
   - Update `VERCEL_PROJECT_ID` secret

3. **Wrong Organization ID**:
   - Go to Vercel Dashboard → Settings → General
   - Copy the **Team ID** (this is your org ID)
   - Update `VERCEL_ORG_ID` secret

4. **Project Not Linked**:
   - Run `vercel link` locally to link the project
   - Or create a new project in Vercel dashboard

### 6. Environment Not Configured

**Error Message:**

```
Environment 'staging' not found
```

**Solution:**

1. Go to **GitHub Repository** → **Settings** → **Environments**
2. Click **"New environment"**
3. Name it `staging`
4. Add the required secrets (see section 1)
5. Set deployment branch: `develop`

### 7. Build Timeout

**Error Message:**

```
Job timed out after 20 minutes
```

**Solution:**

1. Check build logs for slow operations
2. Optimize build process (reduce dependencies, optimize images)
3. Increase timeout in workflow file:
   ```yaml
   timeout-minutes: 30
   ```

## Step-by-Step Setup Checklist

### Repository Secrets (Required for all deployments)

- [ ] `VERCEL_TOKEN` - Vercel API token
- [ ] `VERCEL_ORG_ID` - Vercel organization/team ID
- [ ] `VERCEL_PROJECT_ID` - Vercel project ID

### Staging Environment Secrets

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Staging Supabase URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Staging Supabase anon key
- [ ] `NEXT_PUBLIC_APP_URL` - Staging app URL

### Production Environment Secrets

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Production Supabase URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Production Supabase anon key
- [ ] `NEXT_PUBLIC_APP_URL` - Production app URL

## How to Get Vercel Credentials

### 1. Get Vercel Token

1. Go to [Vercel Account Tokens](https://vercel.com/account/tokens)
2. Click **"Create Token"**
3. Name it: `github-actions-automet`
4. Set expiration: **No expiration** (or your preferred duration)
5. Click **"Create"**
6. **Copy the token immediately** (you won't see it again)
7. Add as `VERCEL_TOKEN` secret in GitHub

### 2. Get Vercel Organization ID

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your **Team/Organization** name (top-left)
3. Go to **Settings** → **General**
4. Scroll to **Team ID** section
5. Copy the **Team ID** (format: `team_xxxxx`)
6. Add as `VERCEL_ORG_ID` secret in GitHub

### 3. Get Vercel Project ID

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **General**
3. Scroll to **Project ID** section
4. Copy the **Project ID** (format: `prj_xxxxx`)
5. Add as `VERCEL_PROJECT_ID` secret in GitHub

**Note:** If you don't have a Vercel project yet:

1. Run `vercel` locally to create one
2. Or create it via Vercel Dashboard

## Testing Deployment Locally

Before deploying, test the build locally:

```bash
# Install dependencies
npm ci

# Run type check
npm run typecheck

# Build the project (with environment variables)
NEXT_PUBLIC_SUPABASE_URL=your_url \
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
NEXT_PUBLIC_APP_URL=http://localhost:3000 \
npm run build

# Run tests
npm run test:ci
```

## Debugging Deployment Logs

1. Go to **GitHub Repository** → **Actions** tab
2. Click on the failed workflow run
3. Click on the failed job (usually "Deploy to Staging")
4. Expand each step to see detailed logs
5. Look for error messages in red

## Common Workflow Issues

### Issue: Workflow doesn't trigger on push

**Check:**

- Branch name matches: `develop` (for staging) or `main` (for production)
- Workflow file is in `.github/workflows/` directory
- Workflow file has correct YAML syntax

### Issue: Secrets are empty

**Check:**

- Secrets are added in the correct location (repository vs environment)
- Secret names match exactly (case-sensitive)
- No extra spaces in secret names or values

### Issue: Vercel action fails

**Check:**

- Vercel project exists and is linked
- Vercel token has correct permissions
- Project ID and Org ID are correct
- Vercel project settings allow deployments from GitHub

## Getting Help

If you're still stuck:

1. Check the workflow logs for specific error messages
2. Verify all secrets are configured correctly
3. Test the build locally first
4. Check [Vercel Documentation](https://vercel.com/docs)
5. Check [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Last Updated:** November 2025
