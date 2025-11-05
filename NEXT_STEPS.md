# ✅ Setup Progress - What's Done & What's Next

## ✅ Completed (By Claude)

1. ✅ **All project files created** (50+ files, ~4,500 LOC)
2. ✅ **Dependencies installed** (1024 npm packages)
3. ✅ **Environment file created** (`.env.local`)
4. ✅ **Git repository initialized** (7 commits)
5. ✅ **Database migrations ready** (8 migrations with rollbacks)
6. ✅ **Seed scripts ready** (demo data prepared)
7. ✅ **Dev scripts ready** (one-command setup)

---

## ⏳ What You Need to Do (Cannot Be Automated)

These steps require browser-based signups and manual configuration:

### **Step 1: Create Supabase Projects** (15-20 minutes)

#### A. Dev Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in:
   - **Name**: `automet-dev`
   - **Database Password**: (generate strong password and save it!)
   - **Region**: **Asia South (Mumbai)** - `ap-south-1`
   - **Pricing Plan**: Free
4. Wait ~2 minutes for provisioning
5. Once ready, go to **Settings → API**:
   - Copy **Project URL** → Will be `SUPABASE_URL`
   - Copy **anon/public key** → Will be `SUPABASE_ANON_KEY`
   - Copy **service_role key** → Will be `SUPABASE_SERVICE_ROLE_KEY`
6. Go to **Settings → Database**:
   - Scroll to **Connection string**
   - Select **URI** tab
   - Copy the URI and replace `[YOUR-PASSWORD]` with your database password
   - This will be `DATABASE_URL`

#### B. Create Storage Buckets

1. In Supabase Dashboard, go to **Storage**
2. Click **"New bucket"**
3. Create these 3 buckets:

   **Bucket 1:**
   - Name: `job-media`
   - Public: ❌ **OFF** (Private)
   - File size limit: 10 MB

   **Bucket 2:**
   - Name: `user-avatars`
   - Public: ✅ **ON**
   - File size limit: 2 MB

   **Bucket 3:**
   - Name: `client-logos`
   - Public: ✅ **ON**
   - File size limit: 2 MB

#### C. Enable Auth Providers

1. Go to **Authentication → Providers**
2. **Email provider** should already be enabled
3. For **Google provider**, leave it for now (we'll configure after Step 2)

---

### **Step 2: Google OAuth Setup** (10-15 minutes)

Follow this guide: [docs/GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md)

**Quick Summary:**

1. Go to https://console.cloud.google.com
2. Create new project: **"Automet"**
3. Go to **APIs & Services → OAuth consent screen**
   - User type: **External**
   - App name: **Automet**
   - User support email: (your email)
   - Add test users: (your email)
4. Go to **Credentials → Create Credentials → OAuth Client ID**
   - Application type: **Web application**
   - Name: **Automet Web Client**
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:3000/auth/callback
     https://<your-supabase-project-id>.supabase.co/auth/v1/callback
     ```
     (Replace `<your-supabase-project-id>` with your actual Supabase project reference ID from Settings → General)
5. Copy:
   - **Client ID** → Will be `GOOGLE_CLIENT_ID`
   - **Client Secret** → Will be `GOOGLE_CLIENT_SECRET`

**Then go back to Supabase:**

1. Go to **Authentication → Providers → Google**
2. Toggle **Enable Sign in with Google** to ON
3. Paste Client ID and Client Secret
4. Save

---

### **Step 3: Razorpay Setup** (10-15 minutes)

Follow this guide: [docs/RAZORPAY_SETUP.md](docs/RAZORPAY_SETUP.md)

**Quick Summary:**

1. Go to https://razorpay.com
2. Sign up with your email
3. Verify email and phone
4. Stay in **Test Mode** (top-right toggle)
5. Go to **Settings → API Keys**
6. Click **"Generate Test Keys"**
7. Copy:
   - **Key ID** → Will be `RZ_KEY_ID`
   - **Key Secret** → Will be `RZ_KEY_SECRET`

**Webhook Setup (for local testing):**

1. You'll need ngrok later for local webhook testing
2. For now, generate a random webhook secret:
   ```bash
   openssl rand -hex 32
   ```
   Save this as `RZ_WEBHOOK_SECRET`

**Create Subscription Plans:**

1. Go to **Subscriptions → Plans**
2. Click **"+ Create Plan"**

   **Plan 1: Free**
   - Plan Name: `Automet Free Plan`
   - Billing Interval: Monthly
   - Billing Amount: `0` INR
   - Click **Create**
   - **Note down the Plan ID** (starts with `plan_`)

   **Plan 2: Pro**
   - Plan Name: `Automet Pro Plan`
   - Billing Interval: Monthly
   - Billing Amount: `999` INR
   - Click **Create**
   - **Note down the Plan ID**

---

### **Step 4: Update `.env.local`** (5 minutes)

Open `.env.local` in your editor and fill in all the values from Steps 1-3:

```bash
# Supabase (Dev) - from Step 1
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Database (for migrations) - from Step 1
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres

# Google OAuth - from Step 2
GOOGLE_CLIENT_ID=123456789-xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# Razorpay (Test Mode) - from Step 3
RZ_KEY_ID=rzp_test_xxxxx
RZ_KEY_SECRET=xxxxx
RZ_WEBHOOK_SECRET=xxxxx

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**Save the file!**

---

### **Step 5: Run Setup Script** (2 minutes)

Once `.env.local` is filled in, run:

```bash
cd /Users/simantparida/Desktop/Vibe\ Coding/Automet
./scripts/dev.sh
```

This will:

1. ✅ Run all 8 database migrations
2. ✅ Populate demo data (Sharma Services org)
3. ✅ Start the dev server at http://localhost:3000

**Expected output:**

```
Running database migrations...
Found 8 migration(s)

Applying: 20251101_001_create_core_tables.sql
✓ Successfully applied 20251101_001_create_core_tables.sql
...
✓ All migrations completed successfully

Running database seeds...
Found 5 seed file(s)
...
✓ All seeds completed successfully

Starting development server...
```

---

### **Step 6: Create Demo User in Supabase Auth** (5 minutes)

The seed scripts created a user record in the `users` table, but you need to create the corresponding auth user in Supabase:

1. Go to Supabase Dashboard → **Authentication → Users**
2. Click **"Add user"** → **Email**
3. Fill in:
   - **Email**: `admin@automet.dev`
   - **Password**: (your choice - remember it!)
   - **Auto Confirm User**: ✅ Check this (to skip email verification)
4. Click **Create user**
5. **Important**: After creation, copy the UUID shown
6. You need to **update the user record** to link it:
   ```sql
   -- Run this in Supabase SQL Editor
   UPDATE users
   SET id = '<paste-the-uuid-from-auth-users>'
   WHERE email = 'admin@automet.dev';
   ```

**Alternatively (easier):**

1. Before creating the user in Supabase Auth, note the UUID from seed file:
   - UUID: `20000000-0000-0000-0000-000000000001`
2. When creating user in Supabase Dashboard, you can't set UUID directly
3. So instead, use Supabase SQL Editor:
   ```sql
   -- Insert directly into auth.users
   INSERT INTO auth.users (
     instance_id,
     id,
     aud,
     role,
     email,
     encrypted_password,
     email_confirmed_at,
     created_at,
     updated_at,
     confirmation_token,
     email_change,
     email_change_token_new,
     recovery_token
   ) VALUES (
     '00000000-0000-0000-0000-000000000000',
     '20000000-0000-0000-0000-000000000001',
     'authenticated',
     'authenticated',
     'admin@automet.dev',
     crypt('your-password-here', gen_salt('bf')),
     NOW(),
     NOW(),
     NOW(),
     '',
     '',
     '',
     ''
   );
   ```

Now you can log in with:

- Email: `admin@automet.dev`
- Password: (what you set)

---

## 🎯 Checklist

Use this to track your progress:

- [ ] **Supabase Dev Project Created**
  - [ ] Project URL copied
  - [ ] Anon key copied
  - [ ] Service role key copied
  - [ ] Database URL copied
  - [ ] Storage buckets created (job-media, user-avatars, client-logos)

- [ ] **Google OAuth Configured**
  - [ ] Google Cloud project created
  - [ ] OAuth consent screen configured
  - [ ] OAuth credentials created
  - [ ] Client ID copied
  - [ ] Client Secret copied
  - [ ] Supabase Google provider enabled

- [ ] **Razorpay Configured**
  - [ ] Razorpay account created
  - [ ] Test mode keys copied
  - [ ] Webhook secret generated
  - [ ] Subscription plans created

- [ ] **Environment Variables Set**
  - [ ] `.env.local` filled with all values
  - [ ] No placeholder values remaining

- [ ] **Database Migrated & Seeded**
  - [ ] `./scripts/dev.sh` ran successfully
  - [ ] Migrations completed
  - [ ] Seeds completed
  - [ ] Dev server started

- [ ] **Demo User Created**
  - [ ] Auth user created in Supabase
  - [ ] Can log in successfully

---

## 🆘 Troubleshooting

### "DATABASE_URL not set"

- Make sure you filled in `DATABASE_URL` in `.env.local`
- Check there are no typos or extra spaces
- Ensure password is correct (no special characters need escaping)

### "Migration failed"

- Check Supabase project is not paused (free tier pauses after 1 week inactivity)
- Verify DATABASE_URL is correct
- Try running migrations one-by-one to isolate the issue

### "Cannot log in"

- Verify email is confirmed in Supabase Auth dashboard
- Check password is correct
- Make sure Google OAuth is enabled if using Google sign-in

### "npm install failed"

- Already fixed! But if issues persist, try:
  ```bash
  rm -rf node_modules package-lock.json
  npm install --cache /tmp/.npm
  ```

---

## 📞 Need Help?

- **Supabase Issues**: [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)
- **Google OAuth Issues**: [docs/GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md)
- **Razorpay Issues**: [docs/RAZORPAY_SETUP.md](docs/RAZORPAY_SETUP.md)
- **Migration Issues**: [docs/MIGRATIONS.md](docs/MIGRATIONS.md)
- **General Setup**: [docs/SETUP.md](docs/SETUP.md)

---

## ✅ When You're Done

Once all checkboxes are checked and dev server is running:

1. Open http://localhost:3000
2. You should see the Next.js welcome page (no frontend built yet)
3. Test API health endpoint: http://localhost:3000/api/health (will 404 until we build API routes in Module 2)
4. Verify database by running:
   ```bash
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM jobs;"
   ```
   Should return 10 (from seed data)

**Then let me know, and we'll proceed with Module 2: API Routes, Tests, and Frontend!**

---

_Last Updated: 2025-11-01_
