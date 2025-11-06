# 🚀 Vercel Deployment Guide

## Step 1: Connect Your Repository to Vercel

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Sign up or log in (use GitHub account for easiest setup)

2. **Import Project:**
   - Click **"Add New..."** → **"Project"**
   - Import your GitHub repository (Automet)
   - Or connect via Git provider

3. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

---

## Step 2: Set Environment Variables in Vercel

**Before deploying, add these environment variables:**

1. Go to your project in Vercel
2. Click **Settings** → **Environment Variables**
3. Add each variable below
4. **Important:** Select **"Preview"** environment (for staging)

### Required Environment Variables:

```bash
# Supabase
SUPABASE_URL=https://dogzgbppyiokvipvsgln.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvZ3pnYnBweWlva3ZpcHZzZ2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NDEwMTYsImV4cCI6MjA3NzUxNzAxNn0.0cnh62VqxUrsRe5HzZn1OVzV4vxs4Zp0q0vBmGspfAQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvZ3pnYnBweWlva3ZpcHZzZ2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTk0MTAxNiwiZXhwIjoyMDc3NTE3MDE2fQ.P6OC8GpoVucZJdpPgfVW-m9daYIsDXv1Drp-LSt5I7w
DATABASE_URL=postgresql://postgres:BAyJfvtCc2jYK1eu@db.dogzgbppyiokvipvsgln.supabase.co:5432/postgres

# Email (Add later - leave empty for now)
# RESEND_API_KEY=
SENDGRID_FROM_EMAIL=noreply@automet.app

# App Configuration
NODE_ENV=production

# Admin Secret
ADMIN_SECRET=4322fafeaed92a1230774e90f2162b6ce0f04b353f3bf14700f31e888d074315
```

**Note:** 
- `NEXT_PUBLIC_APP_URL` will be automatically set by Vercel (you'll get a preview URL)
- `RESEND_API_KEY` - Leave empty for now, we'll add it later

---

## Step 3: Deploy

1. **Click "Deploy"**
   - Vercel will automatically:
     - Install dependencies
     - Run `npm run build`
     - Deploy to a preview URL

2. **Wait for deployment to complete**
   - Usually takes 2-5 minutes
   - You'll see build logs in real-time

3. **Get your preview URL**
   - After deployment, you'll get a URL like:
     - `https://automet-git-main-username.vercel.app`
     - Or if you push to a `staging` branch: `https://automet-git-staging-username.vercel.app`

---

## Step 4: Update NEXT_PUBLIC_APP_URL

Once you have your Vercel preview URL:

1. Go to **Settings** → **Environment Variables**
2. Add or update:
   ```
   NEXT_PUBLIC_APP_URL=https://your-preview-url.vercel.app
   ```
3. **Redeploy** (Vercel will auto-redeploy when you update env vars, or click "Redeploy")

---

## Step 5: Run Database Migrations

After deployment, we need to run migrations on your Supabase database:

**Option A: Run via Supabase Dashboard**
1. Go to Supabase Dashboard → SQL Editor
2. Run the migration files from `migrations/` folder

**Option B: Run via CLI** (if you have Supabase CLI installed)
```bash
./scripts/migrate.sh
```

**Option C: I can help you run them** - Just tell me when you're ready!

---

## Step 6: Test Your Deployment

Visit your Vercel preview URL and test:

- [ ] Homepage loads
- [ ] Navigation works
- [ ] Blog pages load
- [ ] ROI Calculator works
- [ ] Waitlist form (email won't work yet, but form should submit)
- [ ] Contact form (email won't work yet, but form should submit)
- [ ] Admin waitlist page (use the admin secret)

---

## Step 7: Add Resend API Key Later

When you're ready to enable email:

1. Get your Resend API key from https://resend.com
2. Go to Vercel → Settings → Environment Variables
3. Add: `RESEND_API_KEY=re_xxxxx`
4. Vercel will auto-redeploy
5. Test email sending (waitlist signup, contact form)

---

## 🎯 Quick Checklist

- [ ] Connect repository to Vercel
- [ ] Add environment variables (except RESEND_API_KEY)
- [ ] Deploy
- [ ] Get preview URL
- [ ] Update NEXT_PUBLIC_APP_URL with preview URL
- [ ] Run database migrations
- [ ] Test deployment
- [ ] Add Resend API key later

---

## 🆘 Troubleshooting

### Build Fails
- Check build logs in Vercel
- Make sure all environment variables are set
- Verify `npm run build` works locally

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Supabase project is not paused
- Verify database password is correct

### Environment Variables Not Working
- Make sure you selected the correct environment (Preview/Production)
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

---

**Ready to deploy?** Follow the steps above and let me know when you have your Vercel preview URL! 🚀

