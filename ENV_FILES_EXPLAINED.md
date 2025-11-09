# 📁 Environment Files Explained

## What You Have:

```bash
.env.example     # Template (safe to commit to GitHub)
.env.local       # Your local development (gitignored)
.env.staging     # Staging backup (gitignored)
```

---

## 🎯 **Quick Answer:**

### **For the Current Landing-Only Deployment:**

| File | Purpose | Do You Need It? | Action Required |
|------|---------|-----------------|-----------------|
| `.env.local` | Local development on your machine | ✅ YES | ✅ Update with new keys |
| `.env.staging` | Staging environment backup | ⚠️ OPTIONAL | ⚠️ Can update or delete |
| `.env.example` | Template for other developers | ✅ YES | ✅ Keep (no real keys) |

**Important:** Since you're deploying to **Vercel**, the actual staging/production environment variables are managed in the **Vercel Dashboard**, NOT in `.env.staging`.

---

## 📖 **Detailed Explanation:**

### **1. `.env.local` (Local Development)**

**Purpose:** Environment variables for your local machine

**When it's used:**
- When you run `npm run dev` on your laptop
- When you run `npm run build` locally
- When you test features on `localhost:3000`

**What's in it:**
```bash
# Local development settings
NEXT_PUBLIC_LANDING_ONLY=true
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase keys (your actual keys)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
DATABASE_URL=postgresql://...

# Other settings
ADMIN_SECRET=your-secret
SENDGRID_FROM_EMAIL=noreply@automet.app
```

**Action:** ✅ **YES, update this with your new Supabase keys**

---

### **2. `.env.staging` (Staging Backup - Optional)**

**Purpose:** Originally intended as a backup/template for staging environment variables

**The Reality:**
- ❌ Next.js does NOT automatically load `.env.staging`
- ❌ Vercel does NOT use this file
- ⚠️ It's just a reference/backup file

**When Vercel deploys:**
- Vercel uses environment variables from **Vercel Dashboard → Settings → Environment Variables**
- It does NOT read `.env.staging` from your repo

**Your Options:**

#### **Option A: Keep it as a backup (Recommended)**
- Update it with new keys (for your reference)
- Useful if you need to remember what staging should have
- Safe since it's in `.gitignore`

#### **Option B: Delete it**
- Since Vercel manages staging env vars, you don't technically need it
- All staging config is in Vercel Dashboard

**My Recommendation:** Keep it and update it as a backup/reference, but know that **Vercel Dashboard** is the source of truth for deployments.

---

### **3. `.env.example` (Template for GitHub)**

**Purpose:** Template file that shows what environment variables are needed (without real values)

**What's in it:**
```bash
# Example environment variables (SAFE to commit)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=your-database-url
```

**When it's used:**
- When a new developer clones the repo
- They copy `.env.example` to `.env.local` and fill in real values

**Action:** ✅ **Keep as-is** (it has placeholders, not real keys)

---

## 🚀 **How Next.js Loads Environment Variables:**

### **Local Development (`npm run dev`):**
```
1. Loads .env.local
2. Loads .env.development.local (if exists)
3. Loads .env.development (if exists)
4. Loads .env (if exists)
```

### **Vercel Deployment (Staging/Production):**
```
1. Uses Vercel Dashboard → Environment Variables
2. Does NOT use .env.staging
3. Does NOT use .env.local
4. Does NOT read any .env files from your repo
```

---

## 📋 **What You Should Do:**

### **Step 1: Update `.env.local`** (Local Development)

```bash
# Open the file
nano .env.local

# Or use VS Code
code .env.local

# Update these 6 values with new keys:
NEXT_PUBLIC_SUPABASE_URL=https://your-new-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
SUPABASE_URL=https://your-new-url.supabase.co
SUPABASE_ANON_KEY=your-new-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-new-service-key
DATABASE_URL=postgresql://postgres:new-password@db.xxx.supabase.co:5432/postgres
```

### **Step 2: Update `.env.staging` (Optional Backup)**

You can either:

**Option A: Update it (recommended)**
```bash
# Keep the same structure as .env.local but with staging-specific values
# (If your staging uses the same Supabase project, keys will be identical)
cp .env.local .env.staging
# Then edit if staging has different values
```

**Option B: Delete it**
```bash
rm .env.staging
```

### **Step 3: Verify `.env.example`**

Make sure it doesn't have real keys (just placeholders):
```bash
cat .env.example
# Should show "your-key-here" type placeholders
```

---

## 🔒 **Security Check:**

```bash
# These should be in .gitignore (they are):
.env.local          ✅ Ignored
.env.staging        ✅ Ignored
.env                ✅ Ignored

# This should NOT be in .gitignore:
.env.example        ✅ Safe (no real keys)
```

---

## 🎯 **Bottom Line:**

### **For Your Reset:**

1. **Must Update:**
   - ✅ `.env.local` - You use this locally
   - ✅ **Vercel Dashboard** - This is what production/staging uses

2. **Optional:**
   - ⚠️ `.env.staging` - Just a backup, Vercel doesn't use it

3. **Don't Touch:**
   - ✅ `.env.example` - Template file, keep as-is

---

## 💡 **Quick Command Reference:**

```bash
# Check which .env files you have
ls -la | grep .env

# Edit .env.local
code .env.local

# Copy .env.local to .env.staging (if you want to keep staging backup)
cp .env.local .env.staging

# Delete .env.staging (if you don't need it)
rm .env.staging

# Verify they're in .gitignore
cat .gitignore | grep .env
```

---

## ✅ **Summary:**

| File | Update with New Keys? | Why |
|------|----------------------|-----|
| `.env.local` | ✅ **YES** | You use this for local development |
| `.env.staging` | ⚠️ **OPTIONAL** | Backup only, Vercel doesn't use it |
| `.env.example` | ❌ **NO** | Template file with placeholders |
| **Vercel Dashboard** | ✅ **YES** | This is what staging/production actually uses |

**Next step:** Focus on updating `.env.local` and Vercel Dashboard. The `.env.staging` is up to you!

