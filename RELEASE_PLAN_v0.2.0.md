# 🚀 Automet v0.2.0 Release Plan

**Version**: 0.2.0 - User Authentication & Core Application
**Target Release**: December 2025
**Current Version**: v0.1.0 (Landing Page & Admin Portal)
**Date Created**: November 11, 2025

---

## 📊 Current State Analysis (v0.1.0)

### ✅ What's Live in Production

**Landing Page & Marketing:**
- ✅ Homepage with hero, features, problem-solution
- ✅ Pricing page with plan comparison
- ✅ Features page
- ✅ About page
- ✅ Contact form
- ✅ Blog system with SEO optimization
- ✅ Waitlist/pre-order form
- ✅ ROI Calculator
- ✅ Terms of Service & Privacy Policy

**Admin Portal:**
- ✅ Admin dashboard (password protected)
- ✅ Waitlist viewer
- ✅ Contact messages viewer
- ✅ Basic analytics integration

**Infrastructure:**
- ✅ Production Supabase database (`automet-prod`)
- ✅ Development Supabase database (`automet-dev`)
- ✅ Vercel deployment pipeline
- ✅ GitHub CI/CD (6 workflows)
- ✅ Environment separation (dev/prod)
- ✅ Vercel Analytics & Speed Insights

### ⚠️ What's NOT Live (Skeleton/Incomplete)

**Application Pages (Exist but Not Functional):**
- ⚠️ `/login` - UI exists, Supabase Auth not fully wired
- ⚠️ `/signup` - UI exists, no email confirmation flow
- ⚠️ `/dashboard` - Skeleton UI only
- ⚠️ `/profile` - Basic UI, no real functionality
- ⚠️ `/clients/*` - CRUD UI exists, needs auth integration
- ⚠️ `/sites/*` - CRUD UI exists, needs auth integration
- ⚠️ `/assets/*` - CRUD UI exists, needs auth integration
- ⚠️ `/jobs/*` - CRUD UI exists, needs auth integration
- ⚠️ `/inventory/*` - CRUD UI exists, needs auth integration

**Missing Core Features:**
- ❌ User authentication (Google OAuth + Email)
- ❌ Organization signup/onboarding
- ❌ Multi-tenant data isolation enforcement
- ❌ Role-based access control (owner/coordinator/technician)
- ❌ Mobile app (PWA exists but not functional)
- ❌ Offline support
- ❌ Payment integration (Razorpay)

---

## 🎯 v0.2.0 Goals

### Primary Objective
**Make the application fully functional for the first real customer**

Build authentication, onboarding, and connect existing CRUD pages to make them production-ready for a single pilot organization.

### Success Criteria
- ✅ User can sign up with Google OAuth or email
- ✅ Organization onboarding flow complete
- ✅ User can log in and access dashboard
- ✅ All CRUD pages (clients, sites, assets, jobs, inventory) work end-to-end
- ✅ RLS policies enforced (org isolation)
- ✅ Role-based permissions working
- ✅ 1 pilot customer can use the app successfully

---

## 📋 v0.2.0 Feature Breakdown

### Phase 1: Authentication & Onboarding (Week 1-2)

#### 1.1 Google OAuth Integration
**Priority**: 🔴 Critical
**Effort**: 2-3 days

- [ ] Enable Google OAuth in Supabase Auth
- [ ] Configure Google OAuth Console (already documented)
- [ ] Update `/login` page with Google sign-in button
- [ ] Implement OAuth callback handler
- [ ] Store user profile data
- [ ] Handle OAuth errors gracefully

**Files to modify:**
- `pages/login.tsx`
- `pages/auth/callback.tsx`
- `src/contexts/AuthContext.tsx`
- `src/lib/supabase.ts`

#### 1.2 Email/Password Authentication
**Priority**: 🟡 High
**Effort**: 2 days

- [ ] Implement email/password signup
- [ ] Add email confirmation flow
- [ ] Create password reset flow
- [ ] Add email verification status checks
- [ ] Implement "Resend confirmation email" feature

**Files to modify:**
- `pages/signup.tsx`
- `pages/login.tsx`
- New: `pages/auth/verify-email.tsx`
- New: `pages/auth/reset-password.tsx`

#### 1.3 Organization Onboarding Flow
**Priority**: 🔴 Critical
**Effort**: 3-4 days

- [ ] Create organization signup form
- [ ] Generate unique organization slug
- [ ] Create first user as "owner"
- [ ] Pre-populate organization settings
- [ ] Welcome email with getting started guide
- [ ] Redirect to dashboard after onboarding

**New pages:**
- `pages/onboarding/organization.tsx`
- `pages/onboarding/profile.tsx`
- `pages/onboarding/success.tsx`

#### 1.4 Authentication Middleware & Guards
**Priority**: 🔴 Critical
**Effort**: 2 days

- [ ] Implement `middleware.ts` for route protection
- [ ] Add `ProtectedRoute` component
- [ ] Redirect unauthenticated users to `/login`
- [ ] Redirect authenticated users away from `/login`
- [ ] Handle email confirmation gates

**Files to modify:**
- `middleware.ts` (exists, needs enhancement)
- `src/components/ProtectedRoute.tsx` (exists, needs work)

---

### Phase 2: Dashboard & Navigation (Week 2-3)

#### 2.1 Functional Dashboard
**Priority**: 🔴 Critical
**Effort**: 3-4 days

- [ ] Replace skeleton with real data
- [ ] Show stats: Total clients, jobs this month, pending jobs
- [ ] Recent jobs list (last 10)
- [ ] Quick actions (Add Job, Add Client, etc.)
- [ ] Welcome message for new users
- [ ] Mobile-responsive layout

**Files to modify:**
- `pages/dashboard.tsx`
- New API: `pages/api/dashboard/stats.ts`

#### 2.2 Bottom Navigation (Mobile)
**Priority**: 🟡 High
**Effort**: 1-2 days

- [ ] Implement mobile bottom nav
- [ ] Active state indicators
- [ ] Badge for pending items
- [ ] Hide on desktop

**Files to modify:**
- `src/components/BottomNav.tsx` (exists, enhance)

#### 2.3 Profile Management
**Priority**: 🟡 High
**Effort**: 2 days

- [ ] View and edit user profile
- [ ] Upload profile photo (Supabase Storage)
- [ ] Change password
- [ ] Update email (with re-verification)
- [ ] Logout functionality

**Files to modify:**
- `pages/profile.tsx`
- New API: `pages/api/profile/upload-photo.ts`

---

### Phase 3: Make Existing CRUD Pages Functional (Week 3-4)

All these pages have UI but need:
- ✅ Auth integration (use real logged-in user)
- ✅ RLS enforcement
- ✅ Org isolation (can only see own org data)
- ✅ Role-based permissions

#### 3.1 Clients Management
**Priority**: 🔴 Critical
**Effort**: 2 days

- [ ] Connect to authenticated user's org
- [ ] Implement create/read/update/delete
- [ ] Add client notes
- [ ] List all clients with search/filter
- [ ] Mobile-optimized views

**Files to modify:**
- `pages/clients/index.tsx`
- `pages/clients/new.tsx`
- `pages/clients/[id].tsx`
- `pages/clients/[id]/edit.tsx`
- `pages/api/clients/*.ts`

#### 3.2 Sites Management
**Priority**: 🔴 Critical
**Effort**: 2 days

- [ ] Link sites to clients
- [ ] GPS coordinates input (Google Maps integration?)
- [ ] Site metadata (floor, building, access codes)
- [ ] List sites by client
- [ ] Mobile-optimized views

**Files to modify:**
- `pages/sites/index.tsx`
- `pages/sites/new.tsx`
- `pages/sites/[id].tsx`
- `pages/sites/[id]/edit.tsx`
- `pages/api/sites/*.ts`

#### 3.3 Assets Management
**Priority**: 🔴 Critical
**Effort**: 2 days

- [ ] Link assets to sites
- [ ] Asset type dropdown
- [ ] Serial number tracking
- [ ] Installation date tracking
- [ ] Asset metadata (capacity, warranty, etc.)
- [ ] Mobile-optimized views

**Files to modify:**
- `pages/assets/index.tsx`
- `pages/assets/new.tsx`
- `pages/assets/[id].tsx`
- `pages/assets/[id]/edit.tsx`
- `pages/api/assets/*.ts`

#### 3.4 Jobs Management
**Priority**: 🔴 Critical
**Effort**: 3-4 days

- [ ] Create jobs (scheduled/urgent)
- [ ] Assign to technicians
- [ ] Job status workflow (scheduled → in_progress → completed)
- [ ] Upload photos (Supabase Storage)
- [ ] Digital signatures
- [ ] Job checklist templates
- [ ] Filter by status, date, client, technician

**Files to modify:**
- `pages/jobs/index.tsx`
- `pages/jobs/new.tsx`
- `pages/jobs/[id].tsx`
- `pages/jobs/[id]/edit.tsx`
- `pages/api/jobs/*.ts`
- New: `pages/api/jobs/[id]/upload-photo.ts`

#### 3.5 Inventory Management (Optional for v0.2.0)
**Priority**: 🟢 Medium
**Effort**: 2-3 days

- [ ] Add/edit inventory items
- [ ] Track quantity
- [ ] Low stock alerts
- [ ] Optional: Serial number tracking
- [ ] Issue to technicians

**Files to modify:**
- `pages/inventory/index.tsx`
- `pages/inventory/new.tsx`
- `pages/inventory/[id].tsx`
- `pages/inventory/[id]/edit.tsx`
- `pages/api/inventory/*.ts`

---

### Phase 4: Role-Based Access Control (Week 4)

#### 4.1 Implement Role Permissions
**Priority**: 🔴 Critical
**Effort**: 2-3 days

**Owner:**
- Full access to everything
- Can invite users
- Can manage billing (future)
- Can delete organization (future)

**Coordinator:**
- Create/edit clients, sites, assets, jobs
- Assign jobs to technicians
- View all reports
- Cannot manage users or billing

**Technician:**
- View assigned jobs only
- Update job status
- Upload photos/signatures
- Check in/out
- Cannot create clients or assign jobs

**Implementation:**
- [ ] Create `src/lib/permissions.ts`
- [ ] Add role checks to API routes
- [ ] Show/hide UI elements based on role
- [ ] Test each role thoroughly

---

### Phase 5: Polish & UX Improvements (Week 5)

#### 5.1 Error Handling & Loading States
**Priority**: 🟡 High
**Effort**: 2 days

- [ ] Loading skeletons for all pages
- [ ] Error boundaries
- [ ] Toast notifications for success/error
- [ ] Empty states with helpful CTAs
- [ ] Form validation with clear messages

#### 5.2 Mobile Optimization
**Priority**: 🟡 High
**Effort**: 2-3 days

- [ ] Test all flows on mobile
- [ ] Fix layout issues
- [ ] Touch-friendly buttons
- [ ] Mobile keyboard handling
- [ ] Responsive tables

#### 5.3 Performance Optimization
**Priority**: 🟢 Medium
**Effort**: 1-2 days

- [ ] Add React.memo where needed
- [ ] Optimize images
- [ ] Code splitting for large pages
- [ ] Cache API responses where appropriate

---

## 🗓️ Development Timeline

### Week 1-2: Authentication Foundation
- Google OAuth integration
- Email/password signup
- Organization onboarding
- Auth middleware & route guards

**Milestone**: User can sign up and log in

---

### Week 2-3: Dashboard & Navigation
- Functional dashboard with stats
- Profile management
- Bottom navigation for mobile

**Milestone**: Authenticated users see personalized dashboard

---

### Week 3-4: CRUD Functionality
- Connect Clients, Sites, Assets, Jobs to auth
- Implement RLS enforcement
- Make all CRUD operations work
- Test multi-org isolation

**Milestone**: Users can manage clients, sites, assets, and jobs

---

### Week 4: RBAC & Permissions
- Implement role-based access
- Test owner, coordinator, technician roles
- Lock down API routes by role

**Milestone**: Different roles see different features

---

### Week 5: Polish & Testing
- Error handling
- Mobile testing
- Performance optimization
- Bug fixes
- UAT with pilot customer

**Milestone**: v0.2.0 ready for pilot deployment

---

## 📦 v0.2.0 Deliverables

### Core Features
- ✅ Google OAuth authentication
- ✅ Email/password authentication
- ✅ Organization onboarding
- ✅ Functional dashboard
- ✅ Profile management
- ✅ Clients CRUD (with auth)
- ✅ Sites CRUD (with auth)
- ✅ Assets CRUD (with auth)
- ✅ Jobs CRUD (with auth)
- ✅ Role-based permissions (3 roles)
- ✅ Mobile-responsive UI
- ✅ Multi-tenant data isolation (RLS)

### Documentation
- ✅ User onboarding guide
- ✅ API documentation updates
- ✅ Role permissions matrix
- ✅ Development setup guide

### Testing
- ✅ All CRUD operations tested
- ✅ RLS policies verified
- ✅ Role permissions tested
- ✅ Mobile testing on iOS/Android
- ✅ UAT with 1 pilot customer

---

## 🎯 Success Metrics for v0.2.0

### Technical Metrics
- [ ] 100% of authenticated pages work
- [ ] 0 RLS policy bypass vulnerabilities
- [ ] <3s page load time (Speed Insights)
- [ ] >90 Lighthouse performance score
- [ ] 0 critical bugs in production

### Business Metrics
- [ ] 1 pilot customer onboarded
- [ ] 10+ jobs created by pilot customer
- [ ] 5+ clients/sites added by pilot customer
- [ ] Pilot customer feedback collected
- [ ] NPS score from pilot: >7

---

## 🚫 Out of Scope for v0.2.0

These features are deferred to future releases:

### v0.3.0 - Mobile PWA & Offline
- ❌ Offline job sync
- ❌ Service worker implementation
- ❌ Background sync
- ❌ Push notifications
- ❌ Install prompts

### v0.4.0 - Payments & Subscriptions
- ❌ Razorpay integration
- ❌ Subscription management
- ❌ Usage tracking/limits
- ❌ Invoicing
- ❌ Payment webhooks

### v0.5.0 - Advanced Features
- ❌ Preventive maintenance scheduling
- ❌ AMC contract management
- ❌ Reports & analytics
- ❌ Bulk job creation
- ❌ WhatsApp notifications
- ❌ PDF report generation

---

## 🛠️ Technical Debt to Address

### Critical
- [ ] Replace simple admin password with proper auth
- [ ] Add API rate limiting
- [ ] Implement proper logging (Sentry?)
- [ ] Add database indexes for performance

### Important
- [ ] Upgrade to Next.js App Router (future)
- [ ] Replace deprecated @supabase/auth-helpers
- [ ] Add E2E tests (Playwright)
- [ ] Improve TypeScript types (no any)

### Nice to Have
- [ ] Add Storybook for components
- [ ] Set up visual regression testing
- [ ] Improve error messages
- [ ] Add performance monitoring

---

## 📚 Resources Needed

### Development Environment
- ✅ Supabase dev project (already have)
- ✅ Supabase prod project (already have)
- ✅ Vercel account (already have)
- ✅ GitHub repository (already have)
- ⚠️ Google OAuth Console (configured but may need updates)

### External Services
- [ ] Email service (Resend or SendGrid) - for transactional emails
- [ ] Google Maps API (optional) - for site GPS entry
- [ ] SMS service (optional) - for notifications

### Time Estimate
- **Development**: 4-5 weeks (1 developer)
- **Testing & QA**: 1 week
- **Total**: 5-6 weeks

---

## 🎉 Post-Release Plan

### Immediate (Week 1 after release)
- [ ] Monitor analytics and errors
- [ ] Collect pilot customer feedback
- [ ] Fix critical bugs
- [ ] Update documentation based on feedback

### Short-term (Month 1)
- [ ] Onboard 2-3 more pilot customers
- [ ] Iterate on UX based on feedback
- [ ] Plan v0.3.0 features
- [ ] Start building payment integration

---

## 📝 Notes & Considerations

### Key Assumptions
1. Pilot customer is willing to test on production
2. Email service (Resend) is set up for transactional emails
3. Google OAuth is approved and working
4. Existing CRUD UI is usable (may need minor tweaks)

### Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| RLS policies have bypass vulnerabilities | 🔴 High | Thorough security testing, use Supabase RLS validator |
| Authentication flow is complex | 🟡 Medium | Follow Supabase best practices, extensive testing |
| Pilot customer finds critical UX issues | 🟡 Medium | Weekly check-ins, fast iteration cycles |
| Database performance issues | 🟢 Low | Add indexes proactively, monitor query performance |

### Dependencies
- Supabase Auth configured correctly
- Email service working
- Google OAuth approved
- Vercel deployment pipeline stable

---

## ✅ Pre-Development Checklist

Before starting v0.2.0 development:

- [x] v0.1.0 deployed to production
- [x] Production database migrated
- [x] Vercel environment variables set
- [ ] Google OAuth Console configured and tested
- [ ] Email service (Resend) account created
- [ ] Pilot customer identified and committed
- [ ] This release plan reviewed and approved

---

**Plan Created**: November 11, 2025
**Next Review**: Start of Week 1 development
**Status**: ✅ Ready to start development

---

**Questions or need clarification?** Update this document as the plan evolves!
