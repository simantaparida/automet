# 🚀 Staging Environment Setup Guide

This guide will help you set up a staging environment for Automet before production deployment.

> **💡 Note:** Since Supabase free tier only allows 2 projects, we'll use your **dev project for staging** and save the second project slot for production later. This is a common practice!

---

## 📋 What You Need to Provide

### 1. **Supabase Project Credentials** (Use Your Dev Project)

**Steps:**
1. Go to https://app.supabase.com
2. Open your existing **Automet Dev** project
3. Go to **Settings → API**:
   - Copy **Project URL** → This will be `SUPABASE_URL`
   - Copy **anon/public key** → This will be `SUPABASE_ANON_KEY`
   - Copy **service_role key** → This will be `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **KEEP SECRET**

4. Go to **Settings → Database**:
   - Scroll to **Connection string**
   - Select **URI** tab
   - Copy the URI and replace `[YOUR-PASSWORD]` with your database password
   - This will be `DATABASE_URL`

**Provide me with:**
- ✅ `SUPABASE_URL` (from your dev project)
- ✅ `SUPABASE_ANON_KEY` (from your dev project)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (from your dev project)
- ✅ `DATABASE_URL` (from your dev project)

> **Note:** We're using the same project for dev and staging. When you're ready for production, we'll create a new production project.

---

### 2. **Resend Email Service** (Required for email sending)

**Steps:**
1. Go to https://resend.com
2. Sign up or log in
3. Go to **API Keys** section
4. Create a new API key
5. **Domain Setup:**
   - Go to **Domains** section
   - Add domain: `automet.app` (or your staging domain)
   - Follow DNS verification steps
   - Once verified, you can send emails from `noreply@automet.app`

**Provide me with:**
- ✅ `RESEND_API_KEY`
- ✅ Confirmation that domain `automet.app` is verified (or staging domain)

---

### 3. **Staging Domain/URL** (Required)

**Options:**
- **Option A:** Use Vercel preview deployments (automatic staging URLs)
- **Option B:** Use a custom staging domain (e.g., `staging.automet.app`)
- **Option C:** Use Vercel staging branch (e.g., `automet-git-staging-username.vercel.app`)

**Provide me with:**
- ✅ Staging URL (e.g., `https://staging.automet.app` or Vercel preview URL)

---

### 4. **Admin Secret** (Required for admin waitlist access)

**Generate a strong secret:**
```bash
# On Mac/Linux:
openssl rand -hex 32

# Or use an online generator:
# https://www.random.org/strings/?num=1&len=32&digits=on&upperalpha=on&loweralpha=on&unique=on&format=html&rnd=new
```

**Provide me with:**
- ✅ `ADMIN_SECRET` (a strong random string, 32+ characters)

---

### 5. **Optional: Google OAuth** (For user authentication)

**If you want to test Google sign-in:**
1. Go to https://console.cloud.google.com
2. Create a new project or use existing
3. Go to **APIs & Services → Credentials**
4. Create **OAuth 2.0 Client ID**
5. Add authorized redirect URI: `https://your-staging-url.com/auth/callback`

**Provide me with:**
- ✅ `GOOGLE_CLIENT_ID` (optional)
- ✅ `GOOGLE_CLIENT_SECRET` (optional)

---

## 🔧 What I'll Do Once You Provide the Info

1. ✅ Create `.env.staging` file with all your credentials
2. ✅ Run database migrations on staging database
3. ✅ Seed staging database with test data (if needed)
4. ✅ Configure all environment variables
5. ✅ Test all critical flows
6. ✅ Verify email sending works
7. ✅ Deploy to staging environment

---

## 📝 Environment Variables Template

Once you provide the values, I'll create this file:

```bash
# .env.staging

# Supabase (Staging)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres

# Email Service
RESEND_API_KEY=re_xxxxx
SENDGRID_FROM_EMAIL=noreply@automet.app

# App Configuration
NEXT_PUBLIC_APP_URL=https://staging.automet.app
NODE_ENV=production

# Admin
ADMIN_SECRET=your_strong_random_secret_here

# Optional: Google OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
```

---

## 🚀 Deployment Steps (After Setup)

### Option 1: Vercel (Recommended)

1. **Connect GitHub repo to Vercel:**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Configure build settings (auto-detected for Next.js)

2. **Set Environment Variables:**
   - Go to **Project Settings → Environment Variables**
   - Add all variables from `.env.staging`
   - Select **Environment**: Production, Preview, Development (as needed)

3. **Deploy:**
   - Push to `main` branch → Auto-deploys to production
   - Push to `staging` branch → Auto-deploys to staging
   - Or create a pull request → Preview deployment

### Option 2: Manual Deployment

```bash
# Build the project
npm run build

# Start production server
npm start
```

---

## ✅ Pre-Deployment Checklist

Before deploying to staging, make sure:

- [ ] All TypeScript errors fixed
- [ ] All linting errors fixed
- [ ] `npm run build` succeeds
- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Test data seeded (if needed)
- [ ] Email service configured
- [ ] Domain verified (for email)

---

## 🧪 Testing Checklist (After Deployment)

Test these flows on staging:

- [ ] **Waitlist Signup:**
  - [ ] Fill out pre-order form
  - [ ] Submit and verify success message
  - [ ] Check email received (welcome email)

- [ ] **Contact Form:**
  - [ ] Submit contact form
  - [ ] Verify email sent to support@automet.app

- [ ] **Blog Pages:**
  - [ ] Visit `/blog`
  - [ ] Click on a blog post
  - [ ] Verify formatting looks good

- [ ] **ROI Calculator:**
  - [ ] Visit `/roi-calculator`
  - [ ] Enter values and calculate
  - [ ] Verify results display correctly

- [ ] **Admin Waitlist:**
  - [ ] Visit `/admin/waitlist`
  - [ ] Enter admin password
  - [ ] Verify waitlist data displays

- [ ] **Navigation:**
  - [ ] Test all navigation links
  - [ ] Verify all pages load correctly

- [ ] **Mobile Responsiveness:**
  - [ ] Test on mobile device
  - [ ] Verify all pages look good

---

## 🐛 Troubleshooting

### "Email not sending"
- Check `RESEND_API_KEY` is set correctly
- Verify domain is verified in Resend
- Check Resend dashboard for error logs

### "Database connection error"
- Verify `DATABASE_URL` is correct
- Check Supabase project is not paused
- Verify database password is correct

### "Admin access denied"
- Verify `ADMIN_SECRET` matches what you set
- Check environment variable is set correctly

### "Build fails"
- Run `npm run typecheck` locally
- Run `npm run lint` locally
- Fix any errors before deploying

---

## 📞 Next Steps

1. **Provide me with the credentials** listed above
2. **I'll set up the staging environment**
3. **We'll test together**
4. **Fix any issues found**
5. **Deploy to production** (after staging is verified)

---

**Ready?** Start by creating the Supabase staging project and provide me with the credentials! 🚀

