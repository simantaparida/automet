# Pre-Production Launch Plan - Automet Landing Page

**Target Launch Date:** TBD  
**Current Status:** Development Complete, Pre-Production Planning  
**Last Updated:** November 7, 2025

---

## Executive Summary

This document outlines all steps required to safely deploy the Automet landing page to production. The landing page includes:
- Home, Features, Pricing, ROI Calculator, About, Blog, Contact pages
- Waitlist signup with email/SMS notifications
- Contact form with database storage
- Newsletter subscription
- Blog with SEO optimization
- Admin portal for waitlist and contact messages

---

## Phase 1: Technical Audit & Security (Priority: CRITICAL)

### 1.1 Environment Variables Verification
**Status:** ⏳ Pending  
**Owner:** DevOps

- [ ] Verify all required environment variables are set in Vercel Production
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)
  - [ ] `ADMIN_SECRET` (server-side admin auth)
  - [ ] `NEXT_PUBLIC_ADMIN_SECRET` (client-side admin auth)
  - [ ] `NEXT_PUBLIC_APP_URL` (set to production domain)
- [ ] Remove any staging/development URLs from production env vars
- [ ] Verify no `.env.local` files are committed to git
- [ ] Test environment variable loading in production build

**Documentation:** `/VERCEL_DEPLOYMENT_GUIDE.md`

---

### 1.2 Security Scan & Credential Review
**Status:** ⏳ Pending  
**Owner:** Security Lead

- [ ] Run final security scan for exposed credentials
  ```bash
  grep -r "sk-" . --exclude-dir=node_modules
  grep -r "SUPABASE_SERVICE_ROLE_KEY" . --exclude-dir=node_modules
  ```
- [ ] Verify `.gitignore` includes all sensitive files
- [ ] Check for hardcoded API keys, tokens, or passwords
- [ ] Review all `TODO` and `FIXME` comments for security concerns
- [ ] Ensure Supabase RLS policies are correctly configured
- [ ] Test admin portal authentication (should require password)
- [ ] Verify CORS settings in Supabase for production domain

**Critical Files to Review:**
- `VERCEL_DEPLOYMENT_GUIDE.md`
- `LANDING_ONLY_DEPLOYMENT.md`
- All API routes in `pages/api/`
- Middleware configuration

---

### 1.3 Database Migrations
**Status:** ⏳ Pending  
**Owner:** Database Admin

**Migrations to Run (in order):**
1. ✅ `20251107_001_create_contact_messages.sql` - Contact messages table
2. ✅ `20251107_002_add_updated_at_to_blog_posts.sql` - Blog updated_at field
3. ✅ `20251107_003_create_newsletter_subscribers.sql` - Newsletter table
4. ✅ `20251107_004_add_view_count_to_blog_posts.sql` - Blog view tracking
5. ⏳ `20251107_005_seed_job_tracking_blog_post.sql` - Seed first blog post

**Migration Checklist:**
- [ ] Backup production database before running migrations
- [ ] Test each migration in staging environment first
- [ ] Verify RLS policies are created correctly
- [ ] Test CRUD operations for each table
- [ ] Confirm `service_role` has necessary permissions
- [ ] Document rollback procedures for each migration

**Command:**
```sql
-- Run in Supabase SQL Editor (Production)
-- Copy contents from each migration file
```

---

### 1.4 Supabase Configuration
**Status:** ⏳ Pending  
**Owner:** Backend Lead

- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Verify RLS policies for:
  - [ ] `contact_messages` (service_role full access, public insert)
  - [ ] `newsletter_subscribers` (service_role full access, public insert)
  - [ ] `blog_posts` (public read for published posts)
  - [ ] `waitlist` (service_role full access, public insert)
- [ ] Set up database backups (daily at minimum)
- [ ] Configure Supabase Edge Functions if needed
- [ ] Test Supabase connection from production domain
- [ ] Verify email/SMS quotas and rate limits
- [ ] Set up monitoring alerts for database errors

---

## Phase 2: Performance & SEO Optimization

### 2.1 Performance Testing
**Status:** ⏳ Pending  
**Owner:** Frontend Lead

- [ ] Run Lighthouse audit on all pages (target: 90+ scores)
  - [ ] Home page
  - [ ] Features page
  - [ ] Pricing page
  - [ ] ROI Calculator
  - [ ] About page
  - [ ] Blog index
  - [ ] Blog post detail
  - [ ] Contact page
- [ ] Test page load times (target: < 3 seconds on 3G)
- [ ] Verify lazy loading is working for images
- [ ] Check Time to Interactive (TTI)
- [ ] Optimize bundle size if needed
- [ ] Enable Vercel Analytics
- [ ] Test on real mobile devices (iOS Safari, Chrome Android)

**Tools:**
- Google Lighthouse
- PageSpeed Insights
- WebPageTest
- Vercel Analytics

---

### 2.2 SEO Checklist
**Status:** ⏳ Pending  
**Owner:** Marketing Lead

- [ ] Verify all pages have unique meta titles and descriptions
- [ ] Test Open Graph images on Twitter/Facebook/LinkedIn
- [ ] Submit XML sitemap to Google Search Console
  - [ ] `/blog-sitemap.xml` (blog posts)
  - [ ] Add main sitemap for all pages
- [ ] Verify canonical URLs on all pages
- [ ] Check robots.txt configuration
- [ ] Test Schema.org markup with Google Rich Results Test
- [ ] Ensure all images have descriptive alt text
- [ ] Test internal linking structure
- [ ] Verify 404 page works and is helpful
- [ ] Set up Google Search Console
- [ ] Set up Google Analytics 4

**Critical URLs to Test:**
- https://automet.in
- https://automet.in/features
- https://automet.in/pricing
- https://automet.in/blog
- https://automet.in/contact

---

### 2.3 Mobile Responsiveness
**Status:** ⏳ Pending  
**Owner:** Frontend Lead

- [ ] Test all pages on iPhone SE (375px)
- [ ] Test all pages on iPhone 12/13/14 (390px)
- [ ] Test all pages on iPad (768px)
- [ ] Test all pages on Desktop (1920px)
- [ ] Verify touch targets are at least 44x44px
- [ ] Test forms on mobile (keyboard doesn't overlap inputs)
- [ ] Test navigation menu on all breakpoints
- [ ] Verify images don't overflow on small screens
- [ ] Test table of contents on mobile (blog posts)

---

## Phase 3: Content & Copy Review

### 3.1 Content Audit
**Status:** ⏳ Pending  
**Owner:** Content Lead

- [ ] Proofread all copy for spelling and grammar
- [ ] Verify all dates are correct (Q1 2026 launch)
- [ ] Check phone number formatting (+91 89087 12386)
- [ ] Verify email addresses (info@automet.app)
- [ ] Test all external links (LinkedIn, X, Instagram, Facebook)
- [ ] Verify business address (JP Nagar, Bengaluru)
- [ ] Check brand consistency (Automet vs automet vs AUTOMET)
- [ ] Review tone and voice across all pages
- [ ] Verify CTAs are clear and actionable

---

### 3.2 Legal & Compliance
**Status:** ⏳ Pending  
**Owner:** Legal Counsel

- [ ] Privacy Policy page (GDPR compliant)
- [ ] Terms of Service page
- [ ] Cookie consent banner (if using cookies)
- [ ] Data retention policy documented
- [ ] Email opt-in consent language
- [ ] Contact form consent checkbox
- [ ] Verify company registration details
- [ ] Add legal disclaimers where needed
- [ ] Review DPDPA (India) compliance

**Pages to Create:**
- `/privacy-policy`
- `/terms-of-service`
- `/cookie-policy` (if needed)

---

## Phase 4: Analytics & Tracking

### 4.1 Analytics Setup
**Status:** ⏳ Pending  
**Owner:** Marketing Lead

- [ ] Set up Google Analytics 4
  - [ ] Track page views
  - [ ] Track button clicks (CTAs)
  - [ ] Track form submissions
  - [ ] Track scroll depth
- [ ] Set up Facebook Pixel (if running ads)
- [ ] Set up LinkedIn Insight Tag (if running ads)
- [ ] Configure UTM parameter tracking
- [ ] Set up conversion goals
  - [ ] Waitlist signup
  - [ ] Contact form submission
  - [ ] Newsletter subscription
  - [ ] WhatsApp link clicks
- [ ] Test all tracking events

---

### 4.2 Error Tracking & Monitoring
**Status:** ⏳ Pending  
**Owner:** DevOps

- [ ] Set up Sentry or similar error tracking
- [ ] Configure error alerts (email/Slack)
- [ ] Set up uptime monitoring (Pingdom, UptimeRobot)
- [ ] Configure log aggregation
- [ ] Set up performance monitoring
- [ ] Create runbook for common errors
- [ ] Test error reporting with sample errors

---

## Phase 5: Email & Communication Setup

### 5.1 Email Infrastructure
**Status:** ⏳ Pending  
**Owner:** DevOps

- [ ] Verify email sending is configured
  - [ ] Waitlist confirmation emails
  - [ ] Contact form notifications
  - [ ] Newsletter welcome emails
- [ ] Set up SPF records for domain
- [ ] Set up DKIM records
- [ ] Set up DMARC policy
- [ ] Test email deliverability (inbox, not spam)
- [ ] Verify email templates are mobile-responsive
- [ ] Set up email bounce handling
- [ ] Configure unsubscribe links

**Email Provider:** TBD (Resend, SendGrid, AWS SES?)

---

### 5.2 SMS/WhatsApp Setup
**Status:** ⏳ Pending  
**Owner:** Operations Lead

- [ ] Verify WhatsApp Business account setup
- [ ] Test WhatsApp link (https://wa.me/918908712386)
- [ ] Set up WhatsApp message templates
- [ ] Configure auto-replies for common questions
- [ ] Train team on WhatsApp response protocols
- [ ] Document response time SLAs

---

## Phase 6: Admin & Operations

### 6.1 Admin Portal Testing
**Status:** ⏳ Pending  
**Owner:** Operations Lead

- [ ] Test admin login (`/admin`)
- [ ] Verify password authentication works
- [ ] Test waitlist management (`/admin/waitlist`)
  - [ ] View all submissions
  - [ ] Filter by date/plan/status
  - [ ] Export to CSV
  - [ ] Update status
- [ ] Test contact messages (`/admin/contact-messages`)
  - [ ] View all messages
  - [ ] Mark as resolved
  - [ ] Delete spam
- [ ] Verify admin secret is secure and not exposed
- [ ] Document admin processes for team
- [ ] Create training materials for admin users

---

### 6.2 Customer Support Setup
**Status:** ⏳ Pending  
**Owner:** Customer Success

- [ ] Create FAQ document for support team
- [ ] Set up support ticket system (optional)
- [ ] Define response time SLAs
- [ ] Create email templates for common responses
- [ ] Document escalation procedures
- [ ] Set up support@automet.app alias
- [ ] Train support team on product features

---

## Phase 7: DNS & Domain Configuration

### 7.1 Domain Setup
**Status:** ⏳ Pending  
**Owner:** DevOps

- [ ] Purchase domain (automet.in - already owned?)
- [ ] Configure DNS records
  - [ ] A record pointing to Vercel
  - [ ] CNAME for www subdomain
  - [ ] MX records for email
  - [ ] TXT records for email authentication (SPF, DKIM, DMARC)
- [ ] Set up SSL certificate (automatic with Vercel)
- [ ] Test HTTPS redirect (http → https)
- [ ] Test www redirect (www → non-www or vice versa)
- [ ] Verify domain propagation

---

### 7.2 Vercel Production Deployment
**Status:** ⏳ Pending  
**Owner:** DevOps

- [ ] Create production Vercel project
- [ ] Link GitHub repository
- [ ] Set production environment variables
- [ ] Configure production domain (automet.in)
- [ ] Enable Vercel Analytics
- [ ] Configure deployment protection (optional)
- [ ] Set up preview deployments for PRs
- [ ] Test production build
- [ ] Verify no 404 errors on critical pages

---

## Phase 8: Marketing & Launch Prep

### 8.1 Social Media Setup
**Status:** ⏳ Pending  
**Owner:** Marketing Lead

- [ ] Verify all social media profiles are live
  - [x] LinkedIn: https://www.linkedin.com/company/automethq/
  - [x] X (Twitter): https://x.com/Automet359944
  - [x] Instagram: https://www.instagram.com/automet.app/
  - [x] Facebook: https://www.facebook.com/people/Automet/61583698070965/
- [ ] Post launch announcement content
- [ ] Schedule social media posts
- [ ] Prepare email announcement for existing contacts
- [ ] Create launch graphics and assets

---

### 8.2 PR & Outreach
**Status:** ⏳ Pending  
**Owner:** Marketing Lead

- [ ] Draft press release
- [ ] Identify tech/startup publications for outreach
- [ ] Prepare founder story/interview materials
- [ ] Create pitch deck for investors/partners
- [ ] Reach out to industry influencers
- [ ] Post on Product Hunt (optional)
- [ ] Submit to startup directories

---

## Phase 9: Testing & QA

### 9.1 Manual Testing Checklist
**Status:** ⏳ Pending  
**Owner:** QA Lead

**Test on each page:**
- [ ] Home page
  - [ ] Hero CTA works
  - [ ] Features section loads
  - [ ] Pricing cards display
  - [ ] Testimonials show
  - [ ] FAQ expands/collapses
  - [ ] Footer links work
- [ ] Features page
  - [ ] All feature cards display
  - [ ] "Revealing Soon" labels show
  - [ ] CTA buttons work
- [ ] Pricing page
  - [ ] All pricing tiers show
  - [ ] "Join Waitlist" opens modal with pre-selected tier
  - [ ] Toggle between monthly/annual works
- [ ] ROI Calculator
  - [ ] Inputs accept valid data
  - [ ] Calculations are accurate
  - [ ] Results display correctly
  - [ ] Mobile smooth scroll works
- [ ] About page
  - [ ] Social media links work
  - [ ] Company info is accurate
  - [ ] CTAs work
- [ ] Blog
  - [ ] Blog posts load
  - [ ] Filters work
  - [ ] Search works
  - [ ] Categories filter correctly
  - [ ] Pagination works
- [ ] Blog Post Detail
  - [ ] Content renders correctly
  - [ ] Table of Contents works
  - [ ] Related articles show
  - [ ] Newsletter signup works
  - [ ] Social sharing works
  - [ ] View count increments
- [ ] Contact page
  - [ ] All contact methods work
  - [ ] Map displays correctly
  - [ ] WhatsApp link opens
  - [ ] Phone number is clickable
  - [ ] Email copy works

---

### 9.2 Form Testing
**Status:** ⏳ Pending  
**Owner:** QA Lead

- [ ] **Waitlist Form**
  - [ ] Name validation works
  - [ ] Email validation works
  - [ ] Phone number validation works (country code dropdown)
  - [ ] Company field accepts input
  - [ ] Plan selection works
  - [ ] Form submission succeeds
  - [ ] Confirmation page displays
  - [ ] Data appears in admin panel
  - [ ] Email confirmation sent
  
- [ ] **Contact Form**
  - [ ] Name validation works
  - [ ] Email validation works
  - [ ] Topic dropdown works
  - [ ] Message validation works (min 10 chars)
  - [ ] Form submission succeeds
  - [ ] Success message displays
  - [ ] Data appears in admin panel
  - [ ] Email notification sent
  
- [ ] **Newsletter Signup**
  - [ ] Email validation works
  - [ ] Submission succeeds
  - [ ] Success message displays
  - [ ] Data stored in database
  - [ ] Welcome email sent (if configured)

---

### 9.3 Cross-Browser Testing
**Status:** ⏳ Pending  
**Owner:** QA Lead

Test on:
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Phase 10: Backup & Rollback Plan

### 10.1 Backup Strategy
**Status:** ⏳ Pending  
**Owner:** DevOps

- [ ] Database backups configured (daily)
- [ ] Code versioning in GitHub (done)
- [ ] Document backup restoration procedure
- [ ] Test backup restoration in staging
- [ ] Set up backup monitoring/alerts

---

### 10.2 Rollback Plan
**Status:** ⏳ Pending  
**Owner:** DevOps

**If deployment fails:**
1. Immediately revert to previous Vercel deployment
2. Check Vercel deployment logs for errors
3. Review Sentry for error reports
4. Test in staging before redeploying

**Critical Issues:**
- Database migration failure → rollback migration
- Environment variable issues → update in Vercel dashboard
- Build failures → check Next.js build logs

**Rollback Commands:**
```bash
# Via Vercel CLI
vercel rollback

# Via Vercel Dashboard
# Deployments → Previous deployment → Promote to Production
```

---

## Phase 11: Launch Day Checklist

### 11.1 Pre-Launch (T-24 hours)
**Status:** ⏳ Pending

- [ ] Final code freeze
- [ ] Run all tests in staging
- [ ] Verify all environment variables
- [ ] Test all critical user flows
- [ ] Backup database
- [ ] Inform team of launch timeline
- [ ] Prepare incident response team
- [ ] Set up war room (Slack channel)

---

### 11.2 Launch (T-0)
**Status:** ⏳ Pending

- [ ] Merge `develop` → `main` branch
- [ ] Deploy to production
- [ ] Verify deployment succeeded
- [ ] Test critical flows on production
- [ ] Enable monitoring alerts
- [ ] Make launch announcements
- [ ] Post on social media
- [ ] Send email to waitlist (if exists)
- [ ] Monitor error logs closely

---

### 11.3 Post-Launch (T+24 hours)
**Status:** ⏳ Pending

- [ ] Monitor performance metrics
- [ ] Review error logs
- [ ] Check analytics data
- [ ] Respond to support inquiries
- [ ] Review conversion rates
- [ ] Check database health
- [ ] Verify backups are running
- [ ] Conduct team retrospective

---

## Phase 12: Post-Launch Monitoring

### 12.1 Week 1 Monitoring
**Status:** ⏳ Pending

**Daily checks:**
- [ ] Error rate (target: < 0.1%)
- [ ] Page load time (target: < 3s)
- [ ] Uptime (target: 99.9%)
- [ ] Form submission success rate (target: > 95%)
- [ ] Conversion rate (waitlist signups)

**Weekly checks:**
- [ ] SEO ranking changes
- [ ] Social media engagement
- [ ] Email deliverability
- [ ] Support ticket volume

---

### 12.2 Week 2-4 Optimization
**Status:** ⏳ Pending

- [ ] A/B test CTAs
- [ ] Optimize underperforming pages
- [ ] Improve SEO based on Search Console data
- [ ] Refine user flows based on analytics
- [ ] Address common support questions

---

## Risk Assessment

### Critical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Database migration fails | High | Low | Test in staging, have rollback plan |
| Environment variables incorrect | High | Medium | Triple-check before deploy |
| Email deliverability issues | Medium | Medium | Test with multiple providers, set up SPF/DKIM |
| Performance issues on mobile | Medium | Low | Run Lighthouse audits, test on real devices |
| Security vulnerability | Critical | Low | Run security scans, follow best practices |
| DNS propagation delays | Low | Medium | Set up DNS 24h before launch |

---

## Success Metrics (Week 1)

- [ ] **Uptime:** 99.9%
- [ ] **Page Load Time:** < 3 seconds
- [ ] **Error Rate:** < 0.1%
- [ ] **Waitlist Signups:** TBD target
- [ ] **Contact Form Submissions:** TBD target
- [ ] **Newsletter Subscribers:** TBD target
- [ ] **Lighthouse Score:** > 90 (all categories)
- [ ] **Organic Traffic:** Baseline established
- [ ] **Social Media Reach:** TBD target

---

## Team Responsibilities

| Role | Responsible Person | Key Tasks |
|------|-------------------|-----------|
| Project Manager | TBD | Overall coordination, timeline management |
| DevOps Lead | TBD | Deployment, monitoring, infrastructure |
| Frontend Lead | TBD | Performance optimization, UI polish |
| Backend Lead | TBD | Database, API, integrations |
| QA Lead | TBD | Testing, bug reporting |
| Marketing Lead | TBD | Launch campaigns, content |
| Content Lead | TBD | Copy review, blog posts |
| Customer Success | TBD | Support setup, documentation |
| Legal Counsel | TBD | Privacy policy, terms of service |

---

## Timeline

**Estimated Timeline:** 2-3 weeks

| Phase | Duration | Start Date | End Date |
|-------|----------|------------|----------|
| Technical Audit | 3 days | TBD | TBD |
| Performance & SEO | 2 days | TBD | TBD |
| Content Review | 2 days | TBD | TBD |
| Analytics Setup | 1 day | TBD | TBD |
| Testing & QA | 5 days | TBD | TBD |
| Launch Prep | 2 days | TBD | TBD |
| **Launch Day** | 1 day | **TBD** | **TBD** |

---

## Contact Information

**Emergency Contacts:**
- Technical Lead: [Name] - [Phone/Email]
- DevOps: [Name] - [Phone/Email]
- Customer Support: info@automet.app, +91 89087 12386

**Escalation Path:**
1. Support Team → Technical Lead
2. Technical Lead → Founder
3. Founder → External Consultant (if needed)

---

## Next Steps

1. **Immediate Actions:**
   - Review this document with the team
   - Assign owners to each phase
   - Set launch target date
   - Create project management board (Notion/Asana/Jira)

2. **This Week:**
   - Complete technical audit
   - Run security scan
   - Set up analytics
   - Create legal pages

3. **Next Week:**
   - Complete testing
   - Set up monitoring
   - Configure DNS
   - Prepare marketing materials

4. **Launch Week:**
   - Final QA
   - Deploy to production
   - Launch announcements
   - Monitor closely

---

## Appendix

### A. Useful Commands

```bash
# Build production locally
npm run build

# Start production server locally
npm start

# Run linter
npm run lint

# Type check
npm run type-check

# Security audit
npm audit

# Deploy to Vercel (production)
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

### B. Useful Links

- **GitHub Repository:** https://github.com/simantaparida/automet
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://app.supabase.com
- **Production URL:** https://automet.in (TBD)
- **Staging URL:** TBD

### C. Documentation References

- `/VERCEL_DEPLOYMENT_GUIDE.md`
- `/LANDING_ONLY_DEPLOYMENT.md`
- `/ENV_FILES_EXPLAINED.md`
- `/BLOG_UX_SEO_ANALYSIS.md`
- `/BLOG_SEO_IMPROVEMENTS_IMPLEMENTED.md`

---

**Document Version:** 1.0  
**Last Updated:** November 7, 2025  
**Next Review:** Pre-Launch (T-24 hours)

