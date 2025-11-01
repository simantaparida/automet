# Architecture Overview

System design and architecture for Automet Field Job & Asset Tracker.

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Tech Stack](#tech-stack)
3. [Database Schema](#database-schema)
4. [Authentication Flow](#authentication-flow)
5. [Authorization (RLS)](#authorization-rls)
6. [Payment Flow](#payment-flow)
7. [Offline Support](#offline-support)
8. [Security](#security)
9. [Deployment](#deployment)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │  Browser   │  │   Mobile   │  │    PWA     │           │
│  │   (Web)    │  │  (WebView) │  │ (Installed)│           │
│  └────────────┘  └────────────┘  └────────────┘           │
│         │                │                │                 │
│         └────────────────┴────────────────┘                 │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Pages (SSR)          │  API Routes (Serverless)     │  │
│  │  - /jobs              │  - /api/v1/jobs              │  │
│  │  - /inventory         │  - /api/v1/inventory         │  │
│  │  - /billing           │  - /api/webhooks/razorpay    │  │
│  │  - /auth/callback     │  - /api/seed/run             │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
  │  Supabase   │  │  Razorpay   │  │   Vercel    │
  │  - Auth     │  │  - Payments │  │  - Hosting  │
  │  - Database │  │  - Webhooks │  │  - Edge     │
  │  - Storage  │  │  - Subscr.  │  │  - CDN      │
  └─────────────┘  └─────────────┘  └─────────────┘
```

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router + Pages Router hybrid)
- **Language**: TypeScript (strict mode)
- **UI**: React 18
- **Styling**: TailwindCSS (future)
- **State**: React Context + Supabase Realtime
- **PWA**: next-pwa with Service Workers
- **Offline**: localForage (IndexedDB wrapper)

### Backend
- **API**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL (Supabase managed)
- **Authentication**: Supabase Auth (Google OAuth + Email)
- **Storage**: Supabase Storage (S3-compatible)
- **ORM**: Supabase JS Client (auto-generated types)

### Payments
- **Gateway**: Razorpay (India-focused)
- **Methods**: Cards, UPI, Netbanking, Wallets
- **Subscriptions**: Razorpay Plans + Webhooks

### DevOps
- **Hosting**: Vercel (Next.js optimized)
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics + Sentry (optional)
- **Region**: Asia South (Mumbai) for lowest latency

### Testing
- **Unit/Integration**: Jest + React Testing Library
- **E2E**: Playwright (mobile viewport support)
- **API**: Supertest (future)
- **DB**: Supabase test project

---

## Database Schema

### Entity Relationship Diagram

```
organizations
    ├── users (1:N)
    ├── clients (1:N)
    │   └── sites (1:N)
    │       └── assets (1:N)
    ├── jobs (1:N)
    │   ├── job_assignments (1:N)
    │   ├── job_media (1:N)
    │   └── job_check_events (1:N)
    ├── inventory_items (1:N)
    │   ├── inventory_instances (1:N) [opt-in for serialized]
    │   ├── inventory_issuances (1:N)
    │   └── inventory_audit_log (1:N)
    ├── org_subscriptions (1:N)
    ├── billing_customers (1:1)
    ├── payments (1:N)
    └── usage_counters (1:N)
```

### Core Tables

#### organizations
- Primary entity for multi-tenancy
- Each vendor company = 1 org
- Settings stored as JSONB (flexible config)

#### users
- Links to Supabase Auth (`auth.users`)
- One user → one org (for MVP)
- Role: `owner`, `coordinator`, `technician`
- Email verification enforced

#### clients
- AMC customers of the vendor
- Belongs to organization
- Contact info for invoicing (future)

#### sites
- Physical locations where assets are installed
- Belongs to client + org (denormalized for RLS)
- GPS coordinates for navigation

#### assets
- Equipment being serviced (fire extinguishers, HVAC, generators)
- Belongs to site + org
- Metadata JSONB for asset-specific fields

#### jobs
- Work orders assigned to technicians
- Status: `scheduled` → `in_progress` → `completed`
- Links to client, site, asset (optional)

#### job_assignments
- Assignment history (who was assigned when)
- Supports reassignments
- `is_primary` flag for main assignee

#### inventory_items
- Consumables/tools tracked at org level
- Quantity-based by default
- `is_serialized = true` enables serial number tracking

---

## Authentication Flow

### Sign-Up Flow (Email)

```
User                  Next.js              Supabase Auth
  │                      │                      │
  ├─ POST /auth/signup ─→│                      │
  │                      ├─ signUp(email, pwd)─→│
  │                      │                      ├─ Create user
  │                      │                      ├─ Send confirm email
  │                      │←─────── session ─────┤
  │                      │                      │
  │←─ Redirect to /verify─┤                     │
  │                      │                      │
  ├─ Click email link ───┼──────────────────────→│
  │                      │                      ├─ Verify email
  │                      │                      ├─ Set email_confirmed
  │                      │                      │
  │←─ Redirect to /dashboard ───────────────────┤
```

### Sign-In Flow (Google OAuth)

```
User                  Next.js              Supabase Auth       Google
  │                      │                      │                │
  ├─ Click "Google" ─────→│                      │                │
  │                      ├─ signInWithOAuth ────→│                │
  │                      │                      ├─ Redirect ─────→│
  │                      │                      │                │
  │←──────────── Google Consent Screen ─────────────────────────┤
  │                      │                      │                │
  ├─ Authorize ──────────┼──────────────────────┼───────────────→│
  │                      │                      │←─ Code ────────┤
  │                      │                      ├─ Exchange token │
  │                      │←─────── session ─────┤                │
  │←─ Redirect to /dashboard ─┤                 │                │
```

---

## Authorization (RLS)

### Row Level Security Policies

All tables have RLS enabled. Policies enforce:

#### Org Isolation
```sql
-- Example: jobs table
CREATE POLICY "Users can only see jobs in their org"
ON jobs FOR SELECT
USING (
  org_id IN (
    SELECT org_id FROM users WHERE id = auth.uid()
  )
);
```

#### Role-Based Access

| Role | Jobs | Inventory | Billing |
|------|------|-----------|---------|
| `owner` | Full CRUD | Full CRUD | Read/Write |
| `coordinator` | Full CRUD | Full CRUD | Read-only |
| `technician` | Read + Update assigned | Read-only | No access |

#### Email Verification Gate

```sql
-- Example: INSERT policy
CREATE POLICY "Only verified users can create jobs"
ON jobs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND email_confirmed = true
    AND role IN ('owner', 'coordinator')
  )
);
```

### Service Role Bypass

Webhooks and server-side operations use `service_role` key to bypass RLS:

```typescript
// Server-side only
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Bypasses RLS
);
```

⚠️ **Never expose service_role key to client!**

---

## Payment Flow

### Subscription Flow (Razorpay)

```
User             Next.js API        Razorpay          Supabase
 │                   │                 │                 │
 ├─ Choose Plan ─────→│                 │                 │
 │                   ├─ Create Customer→│                 │
 │                   │←─ customer_id ───┤                 │
 │                   ├─ Create Subscription→│             │
 │                   │←─ subscription_id ───┤             │
 │                   │                 │                 │
 │←─ Show Checkout ──┤                 │                 │
 │                   │                 │                 │
 ├─ Complete Payment ─────────────────→│                 │
 │                   │                 ├─ Charge card    │
 │                   │                 ├─ Webhook ──────→│
 │                   │                 │                 ├─ Update DB
 │                   │                 │                 │  (subscription
 │                   │                 │                 │   status = active)
 │←─ Redirect to success ──────────────┤                 │
```

### Webhook Signature Verification

```typescript
const crypto = require('crypto');

const signature = req.headers['x-razorpay-signature'];
const body = JSON.stringify(req.body);

const expectedSignature = crypto
  .createHmac('sha256', process.env.RZ_WEBHOOK_SECRET)
  .update(body)
  .digest('hex');

if (signature !== expectedSignature) {
  throw new Error('Invalid webhook signature');
}
```

---

## Offline Support

### Architecture

```
┌─────────────────────────────────────────────┐
│             Browser (PWA)                   │
│  ┌─────────────────────────────────────┐   │
│  │   React Components                  │   │
│  └───────────────┬─────────────────────┘   │
│                  │                          │
│  ┌───────────────▼─────────────────────┐   │
│  │   Sync Manager (Queue)              │   │
│  │  - Queues writes when offline       │   │
│  │  - Syncs when online                │   │
│  └───────────────┬─────────────────────┘   │
│                  │                          │
│  ┌───────────────▼─────────────────────┐   │
│  │   LocalForage (IndexedDB)           │   │
│  │  - Cached jobs, inventory           │   │
│  │  - Pending uploads (images)         │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Offline Queue

```typescript
interface QueuedAction {
  id: string;
  type: 'update_job' | 'upload_media';
  payload: any;
  timestamp: number;
  retries: number;
}
```

### Sync Strategy

1. **Optimistic UI**: Show changes immediately
2. **Queue writes**: Store in IndexedDB
3. **Retry on reconnect**: Process queue when online
4. **Conflict resolution**: Last-write-wins (simple MVP approach)

---

## Security

### Checklist

✅ **Authentication**
- Email verification required
- Google OAuth configured
- Secure session management (httpOnly cookies)

✅ **Authorization**
- RLS on all tables
- Role-based access control
- Org isolation enforced

✅ **API Security**
- Service role key server-side only
- Webhook signature verification
- Input validation (Zod schemas)
- Rate limiting (future)

✅ **Data Security**
- No raw card data stored
- Signed URLs for storage (10min TTL)
- HTTPS enforced in production
- SQL injection prevention (parameterized queries)

✅ **Secrets Management**
- `.env.local` gitignored
- GitHub Secrets for CI
- Vercel Environment Variables for production

---

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Setup

1. **Vercel Dashboard** → Project → **Settings** → **Environment Variables**
2. Add all secrets from `.env.example`
3. Select environments: Production, Preview, Development

### Build Settings

- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 20.x

### Custom Domain

1. Add domain in Vercel: `automet.app`
2. Update DNS records (Vercel provides instructions)
3. Update Supabase redirect URLs
4. Update Google OAuth redirect URLs
5. Update Razorpay webhook URL

---

## Monitoring & Observability

### Vercel Analytics

- Page views, Core Web Vitals
- Serverless function metrics
- Automatically enabled

### Sentry (Optional)

```bash
npm install @sentry/nextjs
```

Track:
- Client-side errors
- Server-side errors
- API route failures
- Performance bottlenecks

---

## Scaling Considerations

### Current (MVP)

- Single Supabase region (Asia South)
- Vercel serverless functions (auto-scale)
- Free tier: ~50k MAU

### Future Optimizations

- **Database**: Read replicas, connection pooling
- **Caching**: Redis for frequently accessed data
- **CDN**: Edge caching for static assets
- **Search**: Algolia/Typesense for full-text search
- **Analytics**: Separate analytics DB (ClickHouse)

---

## Development Workflow

```bash
# Local development
npm run dev           # http://localhost:3000

# Run tests
npm test              # Unit + integration
npm run test:e2e      # Playwright E2E

# Database
./scripts/migrate.sh  # Run migrations
./scripts/seed.sh     # Seed demo data
./scripts/reset-db.sh # Reset (destructive)

# Code quality
npm run lint          # ESLint
npm run typecheck     # TypeScript
npm run prettier      # Format code
```

---

## Future Enhancements (Post-MVP)

- [ ] Client portal (view jobs, invoices)
- [ ] PDF report generation
- [ ] WhatsApp notifications (India-specific)
- [ ] Multilingual support (Hindi, regional languages)
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native or Flutter)
- [ ] IoT integration (asset sensors)

---

For API details, see [API Documentation](./API.md).
