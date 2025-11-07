# 🚀 Pre-Production Checklist

**Status:** Preview environment is live and working!  
**Preview URL:** Check Vercel Dashboard for your preview URL

---

## ✅ Phase 1: Testing & QA

### 1. Mobile View Testing

Test on these devices/viewports:

**Mobile Phones:**
- [ ] iPhone 12/13/14 (390px width)
- [ ] iPhone SE (375px width)
- [ ] Samsung Galaxy S21 (360px width)
- [ ] Larger phones (414px width)

**Tablets:**
- [ ] iPad (768px width)
- [ ] iPad Pro (1024px width)

**Desktop:**
- [ ] Laptop (1366px width)
- [ ] Desktop (1920px width)

**Test These Elements:**
- [ ] Navigation menu (hamburger on mobile)
- [ ] Hero section layout
- [ ] Pricing cards stack properly
- [ ] Features section responsive
- [ ] Waitlist form usable on mobile
- [ ] Footer layout
- [ ] Blog posts readable on mobile
- [ ] Touch targets are 44px minimum

---

### 2. UI Refinement Tasks

**Typography:**
- [ ] Font sizes readable on mobile
- [ ] Line heights comfortable
- [ ] Heading hierarchy clear
- [ ] No text overflow

**Spacing:**
- [ ] Padding appropriate on mobile
- [ ] Margins between sections
- [ ] Button padding comfortable for touch
- [ ] Form input spacing

**Colors & Contrast:**
- [ ] All text has sufficient contrast (WCAG AA)
- [ ] CTA buttons stand out
- [ ] Links are clearly identifiable
- [ ] Error messages visible

**Interactions:**
- [ ] Buttons have hover/active states
- [ ] Forms have focus states
- [ ] Loading states for waitlist form
- [ ] Success/error messages clear
- [ ] Smooth scrolling works

---

### 3. Functional Testing

**Landing Pages (Should Work):**
- [ ] `/` - Homepage loads
- [ ] `/pricing` - Pricing page loads
- [ ] `/features` - Features page loads
- [ ] `/blog` - Blog list loads
- [ ] `/blog/[slug]` - Individual blog posts load
- [ ] `/roi-calculator` - Calculator works
- [ ] `/terms-of-service` - Legal page loads
- [ ] `/privacy-policy` - Privacy page loads

**Waitlist Form:**
- [ ] Can enter email
- [ ] Can enter name
- [ ] Can select business size
- [ ] Form validation works
- [ ] Submission succeeds
- [ ] Success message appears
- [ ] Data saves to Supabase `preorders` table
- [ ] Confirmation email (if configured)

**Blocked Pages (Should Redirect to Home):**
- [ ] `/dashboard` → redirects to `/`
- [ ] `/login` → redirects to `/`
- [ ] `/signup` → redirects to `/`
- [ ] `/jobs` → redirects to `/`
- [ ] `/profile` → redirects to `/`

**Performance:**
- [ ] Pages load in < 3 seconds
- [ ] Images are optimized
- [ ] No console errors
- [ ] Lighthouse score > 90

---

### 4. Cross-Browser Testing

**Browsers to Test:**
- [ ] Chrome (latest)
- [ ] Safari (iOS & macOS)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Samsung Internet (Android)

**Check for:**
- [ ] Layout consistency
- [ ] Font rendering
- [ ] Form functionality
- [ ] Button interactions
- [ ] Animations work

---

### 5. Content Review

**Copy:**
- [ ] No typos or grammar errors
- [ ] Brand name consistent (Automet)
- [ ] Pricing accurate
- [ ] Contact information correct
- [ ] Legal pages up to date

**Images:**
- [ ] All images load
- [ ] Alt text present for accessibility
- [ ] Images are optimized (WebP/AVIF)
- [ ] No broken image links

**Links:**
- [ ] All internal links work
- [ ] External links open in new tab
- [ ] No broken links
- [ ] Email links work (mailto:)

---

### 6. SEO Check

**Meta Tags:**
- [ ] Title tags present on all pages
- [ ] Meta descriptions present
- [ ] Open Graph tags (for social sharing)
- [ ] Twitter Card tags
- [ ] Canonical URLs

**Technical SEO:**
- [ ] robots.txt configured
- [ ] sitemap.xml generated
- [ ] Structured data (JSON-LD)
- [ ] Mobile-friendly test passes

---

## ✅ Phase 2: UI Refinements (If Needed)

Based on your testing, document any UI issues here:

### Issues Found:

1. **Issue:** [Description]
   - **Fix:** [What needs to change]
   - **Priority:** High/Medium/Low

2. **Issue:** [Description]
   - **Fix:** [What needs to change]
   - **Priority:** High/Medium/Low

---

## ✅ Phase 3: Production Deployment

Once testing is complete and UI refinements are done:

### Pre-Production Tasks:

- [ ] All tests passed
- [ ] UI refinements completed
- [ ] Stakeholder approval obtained
- [ ] Backup Supabase database
- [ ] Set `NODE_ENV=production` in Vercel
- [ ] Verify `NEXT_PUBLIC_APP_URL` points to production domain
- [ ] Analytics configured (if needed)

### Production Deployment Steps:

1. **Merge to Main/Master:**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

2. **Vercel Auto-Deploys to Production:**
   - Vercel detects push to `main` branch
   - Triggers production deployment
   - Uses "Production" environment variables

3. **Verify Production:**
   - [ ] Visit production URL
   - [ ] Test landing page
   - [ ] Test waitlist form
   - [ ] Check analytics tracking
   - [ ] Monitor error logs

4. **Post-Deployment:**
   - [ ] Announce to team
   - [ ] Monitor for errors (first 24 hours)
   - [ ] Check Supabase usage
   - [ ] Verify waitlist entries coming in

---

## 🎯 Production Environment Variables

**Ensure these are set for "Production" in Vercel:**

```bash
# Landing mode
NEXT_PUBLIC_LANDING_ONLY=true

# Production URL
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-production-domain.com

# Supabase (same keys as preview)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
DATABASE_URL=your-database-url

# Other
ADMIN_SECRET=your-admin-secret
SENDGRID_FROM_EMAIL=noreply@automet.app
```

---

## 📊 Success Metrics

**Track these after launch:**
- Waitlist signups per day
- Page views (Google Analytics)
- Bounce rate
- Average time on site
- Mobile vs desktop traffic
- Top performing pages

---

## 🐛 Rollback Plan (If Needed)

If something goes wrong in production:

1. **Quick Fix:**
   ```bash
   # Revert to previous working commit
   git revert HEAD
   git push origin main
   ```

2. **Emergency Rollback in Vercel:**
   - Go to Vercel → Deployments
   - Find last working deployment
   - Click "Promote to Production"

---

## 📞 Support Contacts

**If issues arise:**
- **Vercel Support:** vercel.com/support
- **Supabase Support:** supabase.com/support
- **Domain/DNS:** Your registrar support

---

**Current Status:** ✅ Preview working, ready for testing  
**Next Step:** Complete Phase 1 testing and document UI refinements needed

