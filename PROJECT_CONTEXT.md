# Automet - Project Context & Development Plan

**Last Updated**: November 4, 2025
**Current Stage**: Module 3 - Landing Page & Pre-order System (In Progress)
**Tech Stack**: Next.js 14.2.33 (Pages Router), TypeScript, Supabase, Tailwind CSS
**Repository**: https://github.com/simantaparida/automet (Public)

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack & Architecture](#tech-stack--architecture)
3. [Project Structure](#project-structure)
4. [Completed Modules](#completed-modules)
5. [Current Development Stage](#current-development-stage)
6. [Database Schema](#database-schema)
7. [Key Features Implemented](#key-features-implemented)
8. [Development Guidelines](#development-guidelines)
9. [Known Issues & Fixes](#known-issues--fixes)
10. [Next Steps](#next-steps)

---

## Project Overview

**Automet** is a field service management platform built specifically for Indian AMC (Annual Maintenance Contract) vendors and facility management companies.

### Target Users
- Small contractors (2-10 technicians)
- Growing FM vendors (10-50 technicians)
- Large FM partners (50-200 technicians)

### Core Problem Solved
Indian AMC vendors struggle with:
- Manual job tracking (WhatsApp, Excel, paper)
- Missed billing and forgotten charges (5% revenue loss)
- Delayed payments due to slow invoicing (5% cashflow impact)
- Excessive admin time (30-80 hours/week on paperwork)

### Value Proposition
- 50% reduction in admin time
- 5% revenue recovery through better tracking
- 5% cashflow improvement via faster invoicing
- Mobile-first, offline-capable, built for Indian workflows

---

## Tech Stack & Architecture

### Frontend
- **Framework**: Next.js 14.2.33 (Pages Router - NOT App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 3.x
- **State**: React hooks (useState, useEffect, useContext)
- **PWA**: next-pwa for offline support

### Backend
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email/password, magic links, Google OAuth ready)
- **Storage**: Supabase Storage (for photos, PDFs)
- **Real-time**: Supabase Realtime (for live updates)

### Infrastructure
- **Deployment**: Not yet deployed (local dev only)
- **Version Control**: Git with GitHub (public repository)
- **Branch Strategy**: Git Flow (`main` ← `develop` ← `feature/*`)
- **Environment**:
  - Dev database: Supabase project (configured in `.env.local`)
  - Test database: Separate Supabase project (for testing)
  - Production: Separate Supabase project (when ready)

### Key Architecture Decisions
1. **Pages Router** (not App Router) - Stability and compatibility
2. **No `'use client'` directives** - Pages Router components are client by default
3. **Path aliases**: `@/*` resolves to both `./src/*` and `./*` (tsconfig.json)
4. **Separation of concerns**:
   - `/pages` - Route components
   - `/components` - Reusable UI components
   - `/src/lib` - Business logic (pure functions)
   - `/src/contexts` - React contexts for global state

---

## Open Source Approach

### Why This Repository is Public

**Automet** is developed as an open-source project while being commercially viable. This approach provides multiple benefits:

**For the Project**:
- **Portfolio Value**: Demonstrates real-world full-stack development skills
- **Learning in Public**: Builds reputation and attracts opportunities
- **Free GitHub Features**: Branch protection, environments, and security tools at no cost
- **Community Feedback**: Potential for bug reports and feature suggestions

**For Security**:
- **Secrets Are Safe**: All API keys and credentials are in `.env.local` (gitignored)
- **Data Is Protected**: Row Level Security (RLS) ensures multi-tenant isolation at database level
- **No Vulnerabilities**: Code visibility helps identify security issues early
- **Industry Standard**: Many successful SaaS products are open source (Ghost, Plausible, Cal.com, Supabase itself)

**Business Model**:
- Open source code doesn't mean free service
- Commercial value comes from:
  - Hosted service (deployment, maintenance, uptime)
  - Customer data isolation (each org has separate data)
  - Support and onboarding
  - Premium features and integrations
- Similar to successful open-source SaaS: GitLab, Supabase, PostHog

**License**: MIT (permissive open-source license) - see [LICENSE](LICENSE) file

**Contributions**: Community contributions welcome - see [CONTRIBUTING.md](CONTRIBUTING.md)

---

## Project Structure

```
/Automet
├── .claude/                    # Claude Code configuration
├── .env.example               # Environment variables template
├── .next/                     # Next.js build output (gitignored)
├── components/                # React components
│   └── landing/              # Landing page components
│       ├── Navigation.tsx
│       ├── Hero.tsx
│       ├── ProblemSolution.tsx
│       ├── Features.tsx
│       ├── roi/
│       │   └── ROICalculator.tsx  # Plan-driven ROI calculator with sliders
│       ├── Pricing.tsx
│       ├── BlogPreview.tsx
│       ├── FAQ.tsx
│       ├── Footer.tsx
│       └── PreorderModal.tsx
├── docs/                      # Documentation
│   ├── 01_setup_guide.md
│   ├── 02_supabase_setup.md
│   ├── 03_google_oauth_setup.md
│   ├── 04_razorpay_setup.md
│   ├── 05_migrations_guide.md
│   ├── 06_api_endpoints.md
│   └── 07_architecture.md
├── migrations/                # Database migrations (001-011)
│   ├── 001_create_core_tables.sql
│   ├── 002_create_jobs_and_assignments.sql
│   ├── 003_create_inventory_tables.sql
│   ├── 004_add_triggers_and_functions.sql
│   ├── 005_add_rls_policies.sql
│   ├── 006_auth_enhancements.sql
│   ├── 007_create_billing_tables.sql
│   ├── 008_billing_rls_policies.sql
│   ├── 009_add_clients_notes_column.sql
│   ├── 010_create_blog_posts.sql
│   └── 011_blog_posts_rls.sql
├── pages/                     # Next.js pages (Pages Router)
│   ├── _app.tsx              # App wrapper with AuthProvider
│   ├── index.tsx             # Landing page (public)
│   ├── login.tsx             # Login page
│   ├── signup.tsx            # Signup page
│   ├── dashboard.tsx         # Main dashboard (protected)
│   ├── profile.tsx           # User profile
│   ├── auth/
│   │   └── callback.tsx      # OAuth callback handler
│   ├── api/                  # API routes
│   │   ├── health.ts         # Health check endpoint
│   │   ├── preorder/
│   │   │   ├── create.ts
│   │   │   ├── verify.ts
│   │   │   └── webhook.ts
│   │   ├── blog/
│   │   │   ├── index.ts
│   │   │   └── [slug].ts
│   │   ├── clients/          # Client management APIs
│   │   ├── sites/            # Site management APIs
│   │   ├── assets/           # Asset tracking APIs
│   │   ├── jobs/             # Job management APIs
│   │   ├── inventory/        # Inventory APIs
│   │   └── users/            # User management APIs
│   ├── clients/              # Client pages
│   ├── sites/                # Site pages
│   ├── assets/               # Asset pages
│   ├── jobs/                 # Job pages
│   ├── inventory/            # Inventory pages
│   └── blog/                 # Blog pages
├── scripts/                   # Development scripts
│   ├── migrate.sh            # Run migrations
│   ├── seed.sh               # Seed demo data
│   ├── reset-db.sh           # Reset database (destructive)
│   ├── rollback.sh           # Rollback last migration
│   └── dev.sh                # One-command setup
├── seeds/                     # Seed data scripts
│   ├── 001_subscription_plans.sql
│   ├── 002_demo_organization.sql
│   ├── 003_demo_users.sql
│   ├── 004_demo_data.sql
│   ├── 005_billing_setup.sql
│   └── 006_demo_blog_posts.sql
├── src/
│   ├── components/           # Shared UI components
│   ├── contexts/
│   │   └── AuthContext.tsx   # Authentication context
│   └── lib/
│       ├── supabase.ts       # Supabase client (browser)
│       ├── supabase-server.ts # Supabase client (server)
│       ├── roiCalculator.ts  # ROI calculation logic
│       ├── email.ts          # Email utilities
│       └── validations/      # Validation schemas
├── styles/
│   └── globals.css           # Global styles + Tailwind imports
├── tests/
│   ├── setup.ts              # Jest setup
│   └── roiCalculator.test.ts # ROI calculator unit tests
├── .env.example              # Environment template
├── .env.local                # Local environment (gitignored)
├── .gitignore
├── next.config.js            # Next.js + PWA config
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json             # TypeScript config
└── PROJECT_CONTEXT.md        # This file
```

---

## Completed Modules

### ✅ Module 1: Foundation & Database Setup (Completed)
**Summary**: Core infrastructure, database schema, and development environment.

**Deliverables**:
- ✅ Next.js 14 with TypeScript initialized
- ✅ Supabase projects created (dev + test)
- ✅ Database migrations (001-008) implemented
  - Core tables: organizations, users, clients, sites, assets
  - Jobs & assignments with check-in/out tracking
  - Inventory with serial number support
  - Billing: subscription_plans, billing_customers, payments, usage_counters
  - RLS policies for multi-tenant isolation
  - Triggers for updated_at, audit logging, usage tracking
- ✅ Seed data: Demo organization "Sharma Services" with full dataset
- ✅ Development scripts for migrations, seeding, rollback
- ✅ Documentation: 7 comprehensive guides in `/docs`

**Key Files**:
- Database: `/migrations/001-008_*.sql`
- Seeds: `/seeds/001-005_*.sql`
- Docs: `/docs/01-07_*.md`

---

### ✅ Module 2: Authentication & Session Management (Completed)
**Summary**: Full authentication system with Supabase Auth.

**Deliverables**:
- ✅ AuthContext with React Context API
- ✅ Login page with email/password
- ✅ Signup page with organization creation
- ✅ Magic link authentication (ready)
- ✅ Google OAuth (configured, ready to enable)
- ✅ Protected routes with auth checks
- ✅ Session persistence across page reloads
- ✅ Auth callback handler for OAuth flows

**Key Files**:
- `/src/contexts/AuthContext.tsx` - Main auth logic
- `/pages/login.tsx` - Login UI
- `/pages/signup.tsx` - Signup UI
- `/pages/_app.tsx` - AuthProvider wrapper
- `/pages/auth/callback.tsx` - OAuth callback

**Auth Flow**:
1. User signs up → Creates user + organization + billing_customer
2. User logs in → Sets session cookie
3. Protected pages check `user` from AuthContext
4. Logout clears session

---

### 🚧 Module 3: Landing Page & Pre-order System (In Progress - 90% Complete)

**Summary**: Public-facing landing page with pre-order capability.

**Current Status**: Core landing page complete, ROI calculator redesigned with plan-driven sliders.

**Completed**:
- ✅ Landing page sections:
  - ✅ Navigation (sticky header)
  - ✅ Hero section with CTA
  - ✅ Problem-Solution section
  - ✅ Features showcase
  - ✅ **ROI Calculator** (Plan-driven with sliders, Before/After toggle)
  - ✅ Pricing with 5 tiers (Free, Starter, Growth, Business, Enterprise)
  - ✅ Blog preview (fetches from blog_posts table)
  - ✅ FAQ section
  - ✅ Footer
  - ✅ Pre-order modal (UI ready)
- ✅ Blog system:
  - ✅ Database table: `blog_posts`
  - ✅ RLS policies (migration 011)
  - ✅ Seed data: 6 demo blog posts
  - ✅ API: `/api/blog` (list) and `/api/blog/[slug]` (detail)
  - ✅ Pages: `/blog` (list) and `/blog/[slug]` (detail)
- ✅ Migration 009: Added `notes` column to `clients` table

**In Progress**:
- ⏳ Pre-order payment integration (Razorpay)
  - API endpoints created: `/api/preorder/create.ts`, `/api/preorder/verify.ts`, `/api/preorder/webhook.ts`
  - Need to complete Razorpay integration
- ⏳ Email notifications for pre-orders

**Key Files**:
- `/pages/index.tsx` - Landing page (imports all sections)
- `/components/landing/roi/ROICalculator.tsx` - **REDESIGNED** ROI calculator
- `/src/lib/roiCalculator.ts` - ROI calculation logic (5% recovered revenue, 5% cashflow gain)
- `/components/landing/Pricing.tsx` - Pricing tiers
- `/migrations/010_create_blog_posts.sql` - Blog table
- `/migrations/011_blog_posts_rls.sql` - Blog RLS policies

**ROI Calculator Architecture** (Recently Redesigned):
- **Plan-driven flow**: User selects plan first (Free/Starter/Growth/Business)
- **Auto-population**: Sliders auto-set to suggested values based on plan
- **5 slider inputs**:
  1. Number of Technicians (1 to max based on plan)
  2. Jobs per Technician/Month (10-50)
  3. Average Revenue per Job (₹500-₹5,000)
  4. Admin Hours per Week (5-100)
  5. Monthly Plan Cost (dropdown, drives other defaults)
- **Before/After Toggle**:
  - "Without Automet" shows current losses (reduced revenue, wasted time, missed billing)
  - "With Automet" shows benefits (recovered revenue, time saved, ROI)
- **Revenue Logic**:
  - Without Automet: `Current Revenue = Potential Revenue - 10%` (losing 5% from missed billing + 5% from slow collections)
  - With Automet: `Full Revenue = Potential Revenue` (recovers the lost 10%)
- **Tooltip**: "How is this calculated?" with user-friendly explanations
- **Constants**: ₹200/hour, 50% admin reduction, 5% recovered revenue, 5% cashflow gain

---

## Database Schema

### Core Tables

#### `organizations`
Multi-tenant parent entity. Each organization is isolated via RLS.
- `id` (uuid, PK)
- `name` (text)
- `contact_email`, `contact_phone`
- `created_at`, `updated_at`

#### `users`
All users (owners, coordinators, technicians). Links to Supabase auth.users.
- `id` (uuid, PK, FK → auth.users)
- `organization_id` (uuid, FK → organizations)
- `email`, `name`, `phone`
- `role` (owner | coordinator | technician)
- `is_active` (boolean)
- `created_at`, `updated_at`

#### `clients`
Customer companies.
- `id` (uuid, PK)
- `organization_id` (uuid, FK → organizations)
- `name`, `contact_name`, `contact_email`, `contact_phone`
- `notes` (text) - Added in migration 009
- `is_active` (boolean)
- `created_at`, `updated_at`

#### `sites`
Physical locations where work happens.
- `id` (uuid, PK)
- `organization_id`, `client_id`
- `name`, `address`, `city`, `state`, `pincode`
- `contact_name`, `contact_phone`
- `is_active`
- `created_at`, `updated_at`

#### `assets`
Equipment/machines maintained by technicians.
- `id` (uuid, PK)
- `organization_id`, `site_id`
- `name`, `asset_type`, `brand`, `model`, `serial_number`
- `installation_date`, `warranty_expiry_date`
- `notes`, `is_active`
- `created_at`, `updated_at`

#### `jobs`
Work orders/tickets.
- `id` (uuid, PK)
- `organization_id`, `client_id`, `site_id`, `asset_id` (optional)
- `title`, `description`
- `job_type` (preventive | breakdown | installation | inspection)
- `priority` (low | medium | high | urgent)
- `status` (pending | assigned | in_progress | completed | cancelled)
- `scheduled_date`, `due_date`
- `completion_notes`, `completed_at`
- `created_by` (FK → users)
- `created_at`, `updated_at`

#### `job_assignments`
Which technician is assigned to which job.
- `id` (uuid, PK)
- `organization_id`, `job_id`, `technician_id`
- `status` (assigned | checked_in | checked_out | completed)
- `assigned_at`, `checked_in_at`, `checked_out_at`, `completed_at`
- `notes`

#### `inventory_items`
Spare parts and consumables.
- `id` (uuid, PK)
- `organization_id`
- `name`, `sku`, `description`
- `unit_of_measure`, `current_stock`, `minimum_stock`, `reorder_quantity`
- `unit_cost`, `supports_serial_numbers`
- `is_active`
- `created_at`, `updated_at`

#### `inventory_serial_numbers`
Serial-tracked inventory items.
- `id` (uuid, PK)
- `organization_id`, `inventory_item_id`
- `serial_number` (unique)
- `status` (available | in_use | faulty | returned)
- `job_id` (FK → jobs, when in use)
- `notes`

#### `subscription_plans`
Pricing tiers (Free, Starter, Growth, Business).
- `id` (uuid, PK)
- `name`, `slug`
- `price_inr_monthly`, `price_inr_annual`
- `max_technicians`, `max_jobs_per_month`, `max_sites`
- `features` (jsonb)
- `is_active`

#### `billing_customers`
Customer billing info (one per organization).
- `id` (uuid, PK)
- `organization_id` (FK → organizations, unique)
- `subscription_plan_id` (FK → subscription_plans)
- `subscription_status` (trial | active | past_due | cancelled)
- `current_period_start`, `current_period_end`
- `trial_ends_at`
- `razorpay_customer_id`, `razorpay_subscription_id`

#### `payments`
Payment history.
- `id` (uuid, PK)
- `organization_id`, `billing_customer_id`
- `amount_inr`, `currency`
- `status` (pending | success | failed | refunded)
- `razorpay_order_id`, `razorpay_payment_id`
- `paid_at`, `created_at`

#### `usage_counters`
Track usage against plan limits.
- `id` (uuid, PK)
- `organization_id`
- `month` (date)
- `jobs_created`, `technicians_active`, `sites_active`
- `created_at`, `updated_at`

#### `blog_posts`
Public blog content.
- `id` (uuid, PK)
- `slug` (text, unique)
- `title`, `excerpt`, `content` (markdown)
- `category` (product-updates | industry-insights | best-practices | case-studies)
- `author_name`, `author_avatar_url`
- `cover_image_url`
- `is_published`, `published_at`
- `created_at`, `updated_at`

### RLS Policies
All tables have Row Level Security enabled:
- Organization-level isolation (users can only see their org's data)
- Role-based access (owners can manage users, coordinators assign jobs)
- Public read for blog_posts (if published)

---

## Key Features Implemented

### Authentication & Authorization
- ✅ Email/password signup with automatic org creation
- ✅ Magic link login (ready, not tested)
- ✅ Google OAuth (configured, ready to enable)
- ✅ Session persistence across reloads
- ✅ Protected routes with automatic redirect
- ✅ Role-based access control (RLS policies)

### Landing Page
- ✅ Responsive, mobile-first design
- ✅ SEO-optimized meta tags
- ✅ Sticky navigation with smooth scrolling
- ✅ Hero section with clear CTA
- ✅ Problem-solution framework
- ✅ Feature showcase (6 key features)
- ✅ Interactive ROI calculator with plan-driven sliders
- ✅ Pricing comparison (5 tiers)
- ✅ Blog preview (latest 3 posts)
- ✅ FAQ accordion
- ✅ Footer with links

### ROI Calculator (Redesigned - Nov 3, 2025)
- ✅ Plan-first flow (dropdown at top)
- ✅ 4 slider inputs (auto-populated based on plan)
- ✅ Real-time calculations (useEffect on input changes)
- ✅ Before/After toggle switch
  - "Without Automet" view shows current losses
  - "With Automet" view shows benefits
- ✅ Revenue logic:
  - Without: Shows reduced revenue (losing 10%)
  - With: Shows full revenue (recovered 10%)
- ✅ Tooltip: "How is this calculated?" with explanations
- ✅ Updated constants: 5% recovered revenue, 5% cashflow gain
- ✅ Compact UI with smaller text sizes
- ✅ Mobile responsive

### Blog System
- ✅ Database table with RLS
- ✅ API endpoints (list + detail)
- ✅ Blog listing page
- ✅ Blog detail page with markdown rendering
- ✅ Category filtering
- ✅ SEO meta tags per post
- ✅ 6 demo blog posts seeded

### Database & Migrations
- ✅ 11 migrations covering full schema
- ✅ Audit logging triggers
- ✅ Auto-update triggers (updated_at)
- ✅ Usage counter triggers
- ✅ Comprehensive RLS policies
- ✅ Demo data seeds (Sharma Services organization)

---

## Development Guidelines

### Code Style & Conventions
1. **TypeScript strict mode** - All code must be typed
2. **No `'use client'` directives** - Pages Router doesn't need them
3. **Import aliases**: Use `@/` for imports from `src/` or root
   ```typescript
   import { supabase } from '@/lib/supabase';
   import { AuthProvider } from '@/contexts/AuthContext';
   ```
4. **Component structure**:
   - Functional components only
   - Props interface before component
   - JSDoc comments for complex logic
5. **File naming**:
   - Components: PascalCase (e.g., `ROICalculator.tsx`)
   - Utils: camelCase (e.g., `roiCalculator.ts`)
   - Pages: lowercase/kebab-case (Next.js convention)

### Git Workflow
1. **Branch Strategy**: Git Flow
   - `main` - Production-ready code
   - `develop` - Integration branch (default)
   - `feature/*` - Feature branches (merge to develop)
   - Protected branches: `main` and `develop` (require PR + approval)

2. **Commit messages**: Use conventional commits
   ```
   feat: add ROI calculator with plan-driven sliders
   fix: resolve continuous reload issue in dev server
   docs: add comprehensive project context document
   chore: update dependencies
   ```

3. **Pull Request Flow**:
   - Create feature branch from `develop`
   - Make changes and commit
   - Open PR to `develop` (requires 1 approval)
   - Squash merge to keep history clean
   - Branches auto-delete after merge

4. **Never commit**:
   - `.env.local` (secrets)
   - `.next/` (build output)
   - `node_modules/`
   - Credentials or API keys

### Environment Variables
Required in `.env.local`:
```bash
# Supabase (Dev)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Test Database
TEST_SUPABASE_URL=https://your-test-project.supabase.co
TEST_SUPABASE_ANON_KEY=your-test-anon-key

# Optional: Razorpay (for payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx

# Optional: Email (for notifications)
RESEND_API_KEY=re_xxx
```

### Running the Project

**First-time setup**:
```bash
npm install
chmod +x scripts/*.sh
./scripts/migrate.sh   # Run all migrations
./scripts/seed.sh      # Seed demo data
npm run dev           # Start dev server
```

**Dev server**:
```bash
npm run dev  # Starts on http://localhost:3000
```

**Database operations**:
```bash
./scripts/migrate.sh           # Run pending migrations
./scripts/seed.sh              # Seed demo data
./scripts/rollback.sh          # Rollback last migration
./scripts/reset-db.sh          # DESTRUCTIVE: Reset entire DB
```

**Testing**:
```bash
npm test                       # Run all tests
npm test roiCalculator.test.ts # Run specific test
```

---

## Known Issues & Fixes

### Issue 1: Continuous Page Reload (FIXED - Nov 3, 2025)
**Problem**: Dev server was triggering infinite `client-full-reload` events.

**Root Causes**:
1. `'use client'` directive in Pages Router component (incompatible)
2. Path ambiguity: `@/*` mapped to both `./src/*` and `./*`, causing file watcher conflicts

**Fixes Applied**:
1. ✅ Removed `'use client'` from `/components/landing/roi/ROICalculator.tsx`
2. ✅ Moved `/lib/roiCalculator.ts` → `/src/lib/roiCalculator.ts` to resolve path ambiguity
3. ✅ Cleared `.next` cache and restarted dev server

**Prevention**: Never use `'use client'` in Pages Router; always use `/src/lib` for business logic.

### Issue 2: Blog Posts Permission Error
**Problem**: `/api/blog` returns 500 error: "permission denied for table blog_posts"

**Root Cause**: RLS policies not configured correctly for anonymous access.

**Status**: Known issue, not blocking (blog preview shows loading state gracefully).

**Fix Needed**: Update RLS policy in migration 011 to allow public read access.

### Issue 3: ROI Calculator Values Not Changing (FIXED - Nov 2, 2025)
**Problem**: Input changes didn't update results.

**Root Cause**: Smart defaults were hardcoded, not reactive to user input.

**Fix Applied**: Complete rewrite with plan-driven flow, sliders, and proper useEffect dependencies.

---

## Next Steps

### Immediate (Current Sprint)
1. **Complete Pre-order System**:
   - [ ] Integrate Razorpay payment gateway
   - [ ] Test pre-order flow end-to-end
   - [ ] Add email notifications (via Resend)
   - [ ] Store pre-orders in database

2. **Fix Blog Permission Issue**:
   - [ ] Update RLS policy for `blog_posts` to allow public read
   - [ ] Test `/api/blog` endpoint
   - [ ] Verify blog preview on landing page

3. **Testing**:
   - [ ] Test ROI calculator on mobile devices
   - [ ] Test all landing page sections on various screen sizes
   - [ ] Cross-browser testing (Chrome, Safari, Firefox)

### Module 4: Dashboard & Job Management (Next)
- [ ] Dashboard layout with sidebar navigation
- [ ] Job listing page with filters
- [ ] Job creation form
- [ ] Job detail page with timeline
- [ ] Job assignment to technicians
- [ ] Status updates and completion flow

### Module 5: Mobile App (PWA)
- [ ] Offline job sync
- [ ] Photo capture and upload
- [ ] GPS-based check-in/check-out
- [ ] Signature capture
- [ ] Push notifications

### Module 6: Inventory Management
- [ ] Inventory listing and search
- [ ] Stock tracking
- [ ] Serial number management
- [ ] Low stock alerts
- [ ] Usage tracking per job

### Module 7: Reporting & Analytics
- [ ] Job completion reports
- [ ] Technician performance metrics
- [ ] Revenue analytics
- [ ] Export to PDF/Excel

### Module 8: Billing & Payments
- [ ] Razorpay subscription integration
- [ ] Usage-based billing
- [ ] Invoice generation
- [ ] Payment history

---

## Important Notes for AI Agents

### When Working on This Project:

1. **Always check current branch**: Project uses git, commits should follow conventional commit format.

2. **Pages Router, NOT App Router**:
   - Use `/pages` directory
   - No `'use client'` directives needed
   - No `/app` directory

3. **Path Resolution**:
   - `@/lib/*` resolves to `/src/lib/*` (preferred for business logic)
   - `@/components/*` resolves to `/components/*` (for React components)
   - `@/contexts/*` resolves to `/src/contexts/*`

4. **Database Changes**:
   - Always create migration files (up + down)
   - Number sequentially: `012_description.sql`
   - Test rollback script works
   - Update this document with schema changes

5. **ROI Calculator**:
   - Logic is in `/src/lib/roiCalculator.ts` (pure functions)
   - UI is in `/components/landing/roi/ROICalculator.tsx` (React component)
   - Constants: 5% recovered revenue, 5% cashflow gain
   - Plan-driven: Plan selection drives all defaults

6. **Dev Server**:
   - Runs on http://localhost:3000 (NOT 3002)
   - May need restart after major changes
   - Check `BashOutput` for compilation errors

7. **Testing Changes**:
   - Always test in browser after changes
   - Check mobile responsive design
   - Verify calculations in ROI calculator
   - Test protected routes redirect correctly

8. **File Locations**:
   - Business logic: `/src/lib/`
   - React components: `/components/` or `/src/components/`
   - Pages: `/pages/`
   - API routes: `/pages/api/`
   - Styles: `/styles/globals.css`
   - Database: `/migrations/` and `/seeds/`

---

## Contact & Resources

- **Project Owner**: Simant Parida
- **Dev Environment**: macOS (Darwin 25.0.0)
- **Node Version**: Check `package.json` for engine requirements
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind Docs**: https://tailwindcss.com/docs

---

**End of Document**
*This document should be updated whenever major architectural decisions are made or new modules are completed.*
