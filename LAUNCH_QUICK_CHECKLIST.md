# Launch Quick Checklist - Critical Items

**Target:** Production Launch  
**Focus:** Must-complete items before going live

---

## 🔴 CRITICAL (Must Complete)

### Security & Environment
- [ ] Run security scan for exposed credentials
- [ ] Verify all Vercel production environment variables are set
- [ ] Test admin portal authentication (password protected)
- [ ] Verify Supabase RLS policies are enabled
- [ ] Remove all hardcoded API keys/secrets

### Database
- [ ] Run all 5 migrations in production Supabase (in order)
- [ ] Test database connections from production
- [ ] Verify RLS policies allow service_role operations
- [ ] Set up daily database backups

### Testing
- [ ] Test waitlist form (end-to-end)
- [ ] Test contact form (end-to-end)
- [ ] Test newsletter signup
- [ ] Verify emails/notifications are sent
- [ ] Test admin panels (waitlist, contact messages)
- [ ] Test on mobile devices (iOS Safari, Chrome Android)

### DNS & Domain
- [ ] Point domain to Vercel production
- [ ] Verify SSL certificate is active (HTTPS)
- [ ] Test www redirect
- [ ] Set up email DNS records (SPF, DKIM)

---

## 🟡 HIGH PRIORITY (Should Complete)

### Performance
- [ ] Run Lighthouse audit (target 90+ on all pages)
- [ ] Test page load speed on 3G connection
- [ ] Verify images are lazy loading
- [ ] Enable Vercel Analytics

### SEO
- [ ] Verify meta titles/descriptions on all pages
- [ ] Submit sitemap to Google Search Console
- [ ] Test Open Graph images on social media
- [ ] Set up Google Analytics 4

### Legal
- [ ] Create Privacy Policy page
- [ ] Create Terms of Service page
- [ ] Add cookie consent if using tracking cookies

### Monitoring
- [ ] Set up error tracking (Sentry or similar)
- [ ] Set up uptime monitoring
- [ ] Configure email alerts for critical errors
- [ ] Test error reporting

---

## 🟢 MEDIUM PRIORITY (Nice to Have)

### Content
- [ ] Proofread all pages for typos
- [ ] Verify all dates mention "Q1 2026"
- [ ] Check phone number formatting
- [ ] Verify social media links work

### Marketing
- [ ] Prepare launch announcement posts
- [ ] Schedule social media content
- [ ] Create press release
- [ ] Notify existing contacts

### Analytics
- [ ] Set up conversion tracking goals
- [ ] Configure UTM parameters
- [ ] Set up Facebook Pixel (if running ads)

---

## Pre-Launch 24-Hour Checklist

**Day Before Launch:**
- [ ] Code freeze (no new features)
- [ ] Final testing in staging
- [ ] Backup database
- [ ] Inform team of launch timeline
- [ ] Prepare incident response plan

**Launch Day:**
- [ ] Deploy to production
- [ ] Verify critical flows work
- [ ] Make launch announcements
- [ ] Monitor error logs closely
- [ ] Be available for support

**Day After Launch:**
- [ ] Review analytics
- [ ] Check error rates
- [ ] Respond to support inquiries
- [ ] Monitor performance metrics

---

## Quick Commands

```bash
# Security scan
grep -r "sk-" . --exclude-dir=node_modules
grep -r "SUPABASE_SERVICE_ROLE_KEY" . --exclude-dir=node_modules

# Build production
npm run build

# Deploy to production
vercel --prod

# Check logs
vercel logs
```

---

## Emergency Contacts

- **Technical Issues:** [Your Name/Number]
- **Support Email:** info@automet.app
- **WhatsApp:** +91 89087 12386

---

## Rollback Plan

If something goes wrong:
1. Go to Vercel dashboard
2. Find previous working deployment
3. Click "Promote to Production"
4. Investigate issue in staging before redeploying

---

**Reference:** See `PRE_PRODUCTION_LAUNCH_PLAN.md` for detailed checklist

