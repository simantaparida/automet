# Supabase Project Setup Guide

This guide covers creating and configuring Supabase projects for development and testing.

## Overview

You'll need **two Supabase projects**:
1. **Dev Project** - For local development and testing features
2. **Test Project** - For automated CI/CD testing

Later, you'll create a third **Production Project** when deploying.

---

## Part 1: Create Dev Project

### Step 1: Sign Up / Log In

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in with GitHub (recommended) or email

### Step 2: Create New Project

1. Click **"New Project"**
2. Select your organization (or create one)
3. Fill in project details:
   - **Name**: `automet-dev`
   - **Database Password**: Generate a strong password (save it securely!)
   - **Region**: **Asia South (Mumbai)** - `ap-south-1`
     - Closest to India for lowest latency
   - **Pricing Plan**: Free (suitable for development)

4. Click **"Create new project"**
5. Wait ~2 minutes for provisioning

### Step 3: Get API Keys

Once the project is ready:

1. Go to **Settings** (gear icon) → **API**
2. You'll see:
   - **Project URL** - Copy this
   - **anon/public key** - Copy this
   - **service_role key** - Copy this (⚠️ **NEVER expose to client!**)

3. Add to `.env.local`:
   ```bash
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 4: Configure Authentication

#### Enable Email Provider

1. Go to **Authentication** → **Providers**
2. **Email** should be enabled by default
3. Configure settings:
   - ✅ Enable email confirmations
   - ✅ Secure email change
   - Email templates: Use defaults (can customize later)

#### Enable Google OAuth

1. Still in **Providers**, click **Google**
2. Toggle **Enable Sign in with Google**
3. You'll need:
   - **Client ID** (from [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md))
   - **Client Secret** (from [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md))
4. Paste them and click **Save**

**Note:** Complete the [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md) guide first to get these values.

#### Configure Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Set:
   - **Site URL**: `http://localhost:3000` (dev)
   - **Redirect URLs**: Add these URLs (one per line):
     ```
     http://localhost:3000/auth/callback
     http://localhost:3000/**
     ```
3. **Save**

### Step 5: Create Storage Buckets

We need three storage buckets for different types of media:

#### 1. job-media (Private)

1. Go to **Storage** → Click **"New bucket"**
2. Settings:
   - **Name**: `job-media`
   - **Public bucket**: ❌ **OFF** (private)
   - **File size limit**: 10 MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, video/mp4, application/pdf`
3. Click **Create bucket**

#### 2. user-avatars (Public)

1. Create new bucket:
   - **Name**: `user-avatars`
   - **Public bucket**: ✅ **ON**
   - **File size limit**: 2 MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
2. Click **Create bucket**

#### 3. client-logos (Public)

1. Create new bucket:
   - **Name**: `client-logos`
   - **Public bucket**: ✅ **ON**
   - **File size limit**: 2 MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/svg+xml, image/webp`
2. Click **Create bucket**

### Step 6: (Optional) Get Database Connection String

For running migrations via `psql` or migration tools:

1. Go to **Settings** → **Database**
2. Scroll to **Connection string**
3. Copy the **URI** format
4. Replace `[YOUR-PASSWORD]` with your database password
5. Add to `.env.local`:
   ```bash
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

---

## Part 2: Create Test Project

Repeat the same steps for a **test project** used in CI/CD:

1. Create new project: **Name**: `automet-test`
2. **Region**: Same as dev (Asia South Mumbai)
3. Get API keys and add to **GitHub Secrets** (not `.env.local`):
   - `SUPABASE_TEST_URL`
   - `SUPABASE_TEST_ANON_KEY`
   - `SUPABASE_TEST_SERVICE_KEY`

4. Configure Auth and Storage the same way as dev project

### Adding Secrets to GitHub

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add each secret:
   - Name: `SUPABASE_TEST_URL`
   - Value: `https://yyyyy.supabase.co`
4. Repeat for `SUPABASE_TEST_ANON_KEY` and `SUPABASE_TEST_SERVICE_KEY`

---

## Part 3: Run Migrations

Now that Supabase is set up, you can run the database migrations:

```bash
./scripts/migrate.sh
```

This will:
- Connect to your Supabase project
- Create all tables (organizations, users, jobs, inventory, etc.)
- Set up triggers and functions
- Apply Row Level Security (RLS) policies

### Verify Migration Success

1. Go to Supabase → **Table Editor**
2. You should see tables:
   - organizations
   - users
   - clients
   - sites
   - assets
   - jobs
   - job_assignments
   - job_media
   - inventory_items
   - inventory_issuances
   - subscription_plans
   - org_subscriptions
   - payments
   - etc.

3. Go to **SQL Editor** and run:
   ```sql
   SELECT COUNT(*) FROM subscription_plans;
   ```
   Should return 2 (Free and Pro plans after seeding)

---

## Part 4: Configure Storage Policies (Optional)

By default, storage buckets have no policies. You can add RLS-style policies:

### Example: job-media bucket policy

1. Go to **Storage** → **Policies** → `job-media` bucket
2. Click **New Policy**
3. **Select** policy:
   ```sql
   -- Allow authenticated users in same org to view
   (
     bucket_id = 'job-media'
     AND auth.role() = 'authenticated'
     AND EXISTS (
       SELECT 1 FROM jobs j
       WHERE j.id::text = (storage.foldername(name))[1]
       AND j.org_id IN (
         SELECT org_id FROM users WHERE id = auth.uid()
       )
     )
   )
   ```

4. **Insert** policy:
   ```sql
   -- Allow authenticated users to upload
   (
     bucket_id = 'job-media'
     AND auth.role() = 'authenticated'
   )
   ```

**Note:** For MVP, you can rely on signed URLs and skip custom storage policies initially.

---

## Part 5: Enable Realtime (Optional)

If you want real-time updates for job status changes:

1. Go to **Database** → **Replication**
2. Find the `jobs` table
3. Toggle **Realtime** to ON
4. Repeat for other tables as needed (job_assignments, job_media)

---

## Troubleshooting

### Project provisioning stuck
- Wait up to 5 minutes
- Refresh the page
- If still stuck, contact Supabase support

### "Invalid API key" error
- Double-check you copied the full key (very long string)
- Ensure no extra spaces or line breaks
- Verify you're using keys from the correct project (dev vs. test)

### Cannot connect to database
- Check that project is not paused (free tier pauses after 1 week inactivity)
- Go to **Settings** → **General** → Click **Resume project**
- Verify database password is correct

### Storage bucket creation fails
- Ensure bucket name is lowercase, no spaces
- Use hyphens instead of underscores
- Check that name is unique in your project

### Migrations fail
- Check SQL Editor for syntax errors
- Verify you're connected to the correct project
- Try running migrations one-by-one to isolate the issue
- Check Supabase logs: **Logs** → **Postgres Logs**

---

## Next Steps

- ✅ Supabase dev and test projects created
- ✅ API keys added to `.env.local` and GitHub Secrets
- ✅ Storage buckets configured
- ✅ Auth providers enabled

**Continue to:**
- [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md)
- [Razorpay Setup](./RAZORPAY_SETUP.md)
- [Run Migrations](./MIGRATIONS.md)

---

## Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Dashboard](https://app.supabase.com)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Documentation](https://supabase.com/docs/guides/storage)
