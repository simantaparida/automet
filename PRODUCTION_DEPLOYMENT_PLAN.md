# 🚀 Production Deployment Plan

**Current Status:** ✅ Preview Environment Working  
**Goal:** Test mobile view → UI refinements → Production deployment

---

## 📱 Phase 1: Mobile View Testing (Now)

### Desktop Browser Testing

#### Chrome DevTools:
1. Open your preview URL
2. Press `F12` (or `Cmd+Opt+I` on Mac)
3. Click device toolbar icon (or `Cmd+Shift+M`)
4. Test these devices:
   - **iPhone 14 Pro** (393×852)
   - **iPhone SE** (375×667)
   - **Samsung Galaxy S21** (360×800)
   - **iPad** (768×1024)

#### Test These Pages:
- [ ] **Homepage** (`/`)
- [ ] **Pricing** (`/pricing`)
- [ ] **Features** (`/features`)
- [ ] **ROI Calculator** (`/roi-calculator`)
- [ ] **Blog** (`/blog`)

#### What to Check:
- [ ] Navigation menu (hamburger on mobile?)
- [ ] Text is readable (no tiny fonts)
- [ ] Buttons are tappable (min 44×44px)
- [ ] Images scale properly
- [ ] Forms work (waitlist signup)
- [ ] No horizontal scrolling
- [ ] Spacing looks good
- [ ] CTAs are visible

### Real Device Testing (Recommended)

**Method 1: Use Your Phone**
1. Open your preview URL on your phone
2. Share with team members
3. Test on iOS and Android if possible

**Method 2: Use BrowserStack** (free trial)
1. Go to: https://www.browserstack.com
2. Test on real devices remotely

---

## 🎨 Phase 2: UI Refinements (After Testing)

### Common Issues to Look For:

#### Mobile Issues:
- Navigation menu not mobile-friendly
- Buttons too small
- Text overflow
- Images not responsive
- Form inputs too small
- Footer cramped

#### Desktop Issues:
- Content too wide or too narrow
- Inconsistent spacing
- Button sizes inconsistent
- Color contrast issues

### Make Changes:
1. Note all issues in a list
2. Fix them locally
3. Push to `develop` branch
4. Vercel auto-deploys to preview
5. Test again on preview URL
6. Repeat until satisfied

---

## ✅ Phase 3: Pre-Production Checklist

Before going to production, verify:

### Functionality
- [ ] Waitlist form works (check Supabase `preorders` table)
- [ ] All pages load without errors
- [ ] No broken links
- [ ] Blog posts display correctly
- [ ] Images load properly
- [ ] No console errors in browser

### SEO & Meta Tags
- [ ] Page titles are correct
- [ ] Meta descriptions are set
- [ ] Open Graph tags for social sharing
- [ ] Favicon displays
- [ ] robots.txt exists (if needed)

### Performance
- [ ] Pages load in < 3 seconds
- [ ] Images are optimized
- [ ] No large bundle sizes
- [ ] Core Web Vitals are good (check Vercel Analytics)

### Security
- [ ] No exposed API keys in browser
- [ ] HTTPS working
- [ ] CSP headers set (already in next.config.js)
- [ ] Environment variables correct

### Content
- [ ] All text is proofread
- [ ] No placeholder text (e.g., "Lorem ipsum")
- [ ] Contact info is correct
- [ ] Legal pages exist (privacy policy, terms)
- [ ] Company info is accurate

---

## 🚀 Phase 4: Deploy to Production

### CI Guardrails (Before Final Merge)
- Ensure the GitHub Actions workflow named **CI** must pass on every PR.  
  - GitHub → Settings → Branches → “Add rule” for `develop` and `main` → require status check **CI**.  
- The CI pipeline now runs `npm run build` with safe defaults, `lint:core`, `test:ci`, and the Playwright smoke suite; keep those steps green before promoting a change.

### Option A: Merge to Main (Recommended)

**Step 1: Create Pull Request**
```bash
# Go to GitHub
# Click "Pull Requests" → "New Pull Request"
# Base: main ← Compare: develop
# Title: "Deploy MVP landing page to production"
# Create PR and merge
```

**Step 2: Vercel Auto-Deploys**
- Vercel detects merge to `main`
- Automatically deploys to production
- Production URL: `https://automet.vercel.app` (or your custom domain)

### Option B: Direct Deploy from Vercel Dashboard

**Step 1: Promote Preview to Production**
1. Go to Vercel Deployments
2. Find your working preview deployment
3. Click three dots (•••)
4. Click "Promote to Production"

---

## 📋 Production Environment Variables

**Before production, verify these in Vercel:**

Go to: **Settings → Environment Variables**

### Check These Are Set for PRODUCTION:

```bash
# Landing-only mode
NEXT_PUBLIC_LANDING_ONLY=true

# Production settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com  # Update this!

# Supabase (NEW keys)
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_URL=your-url
SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-key
DATABASE_URL=your-db-url

# Other
ADMIN_SECRET=your-secret
SENDGRID_FROM_EMAIL=noreply@automet.app
```

**Action:** Update `NEXT_PUBLIC_APP_URL` to your actual production domain!

---

## 🔧 Custom Domain Setup (Optional)

If you have a custom domain (e.g., `automet.com`):

### Step 1: Add Domain in Vercel
1. Go to Project → Settings → Domains
2. Click "Add"
3. Enter: `automet.com` and `www.automet.com`
4. Click "Add"

### Step 2: Update DNS
1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Add these DNS records:

**For apex domain (automet.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: Wait for DNS Propagation
- Can take 5 minutes to 48 hours
- Vercel will show "Valid Configuration" when ready
- SSL certificate is auto-provisioned

### Step 4: Update Environment Variables
```bash
NEXT_PUBLIC_APP_URL=https://automet.com
```

Then redeploy.

---

## 📊 Post-Production Monitoring

### Week 1 After Launch:

#### Daily Checks:
- [ ] Website is loading
- [ ] Waitlist signups are coming in
- [ ] No error emails from Vercel
- [ ] Supabase database is working

#### Vercel Analytics (Free):
- Go to: Project → Analytics
- Check:
  - Page views
  - Unique visitors
  - Top pages
  - Device breakdown
  - Core Web Vitals

#### Supabase Monitoring:
- Go to: Supabase Dashboard → Database → `preorders` table
- Check new signups
- Verify email confirmations

---

## 🐛 Rollback Plan (If Something Breaks)

### Quick Rollback:
1. Go to Vercel → Deployments
2. Find the last working deployment
3. Click three dots (•••)
4. Click "Promote to Production"
5. Production instantly rolls back

### Git Rollback:
```bash
git revert HEAD
git push origin main
```

---

## 📈 Future: Full App Deployment

When ready to deploy the full app (dashboard, jobs, etc.):

### Step 1: Update Environment Variable
```bash
NEXT_PUBLIC_LANDING_ONLY=false  # Remove or set to false
```

### Step 2: Add Missing Variables
```bash
# Google OAuth (for login)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-id
GOOGLE_CLIENT_SECRET=your-secret

# Razorpay (for payments)
RAZORPAY_KEY_ID=your-key
RAZORPAY_KEY_SECRET=your-secret

# Email service (for notifications)
RESEND_API_KEY=your-key
```

### Step 3: Run Database Migrations
- Ensure all tables exist in production Supabase
- RLS policies are active
- Test with a staging environment first

### Step 4: Deploy
- Merge to `main`
- Test thoroughly in staging
- Monitor closely after production deployment

---

## ✅ Summary: Your Roadmap

**Today:**
1. ✅ Preview deployment working
2. ⏭️ Test mobile view (30 minutes)
3. ⏭️ Note UI issues

**Tomorrow:**
1. Fix UI issues
2. Test again on preview
3. Final review

**Day After:**
1. Complete pre-production checklist
2. Merge `develop` → `main`
3. 🚀 **PRODUCTION LAUNCH**

**Week 1:**
1. Monitor analytics
2. Check for errors
3. Collect waitlist signups
4. Gather user feedback

**Future:**
1. Add custom domain (optional)
2. Deploy full app when ready
3. Scale as needed

---

## 📞 Quick Reference

**Preview URL:**
- https://automet-git-develop-simantaparidas-projects.vercel.app

**Vercel Dashboard:**
- https://vercel.com/dashboard

**Supabase Dashboard:**
- https://app.supabase.com

**Git Branches:**
- `develop` → Preview environment (current)
- `main` → Production environment (deploy here)

---

**Status:** ✅ Ready for Mobile Testing  
**Next:** Test on mobile devices and note UI issues

