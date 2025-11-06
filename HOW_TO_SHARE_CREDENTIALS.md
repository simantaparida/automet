# 🔐 How to Share Credentials Securely

## Option 1: Create `.env.staging` File (Recommended)

### Step 1: Create the file
```bash
# In your project root
cp .env.staging.template .env.staging
```

### Step 2: Fill in your values
Open `.env.staging` and replace the placeholder values with your actual credentials.

### Step 3: Share with me
You can either:

**A. Paste the values here in chat** (I'll help you set it up)
- Just paste the values (without the variable names if you prefer)
- I'll create the file for you

**B. Tell me when it's ready** (I'll read it)
- Fill in `.env.staging` yourself
- Tell me "ready" and I'll read it and set everything up

---

## Option 2: Paste Values Directly Here

Just paste your credentials in this format:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
RESEND_API_KEY=re_xxxxx
SENDGRID_FROM_EMAIL=noreply@automet.app
NEXT_PUBLIC_APP_URL=https://staging.automet.app
ADMIN_SECRET=your_secret_here
```

I'll create the `.env.staging` file for you.

---

## Option 3: Set in Vercel Directly (For Deployment)

If you're deploying to Vercel, you can set environment variables in the Vercel dashboard:

1. Go to your Vercel project
2. **Settings** → **Environment Variables**
3. Add each variable
4. Select environment: **Preview** (for staging) or **Production**

Then tell me and I'll help configure everything.

---

## 🔒 Security Notes

- ✅ `.env.staging` is in `.gitignore` - won't be committed to git
- ✅ Never commit secrets to git
- ✅ Vercel environment variables are encrypted
- ⚠️ If sharing in chat, be aware it's visible to me (but I won't store it)

---

## 📋 Quick Checklist

What I need:
- [ ] `SUPABASE_URL` (from your dev project)
- [ ] `SUPABASE_ANON_KEY` (from your dev project)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (from your dev project)
- [ ] `DATABASE_URL` (from your dev project)
- [ ] `RESEND_API_KEY` (from Resend dashboard)
- [ ] `SENDGRID_FROM_EMAIL` (usually `noreply@automet.app`)
- [ ] `NEXT_PUBLIC_APP_URL` (your staging URL)
- [ ] `ADMIN_SECRET` (generate with `openssl rand -hex 32`)

---

## 🚀 Once You Share

I'll:
1. ✅ Create `.env.staging` file
2. ✅ Run database migrations on staging
3. ✅ Test all critical flows
4. ✅ Set up Vercel deployment (if needed)
5. ✅ Deploy to staging

**Ready?** Just paste your credentials below or tell me when `.env.staging` is ready! 🎉

