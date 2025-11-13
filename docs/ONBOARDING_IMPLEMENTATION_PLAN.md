# Onboarding Wizard - Technical Implementation Plan

## Overview

This document outlines the technical implementation plan for the new onboarding wizard. Read the complete design spec in [ONBOARDING_DESIGN_SPEC.md](./ONBOARDING_DESIGN_SPEC.md).

**Goal**: Replace current 2-step onboarding with comprehensive 5-step wizard that guides users to create their first job.

**Timeline**: 4-week sprint

**Current Status**: Analysis complete, ready to implement

---

## Current State Analysis

### What Exists ✅
- Basic organization creation flow (2 steps)
- Email/password signup via Supabase Auth
- Service role bypass for RLS during onboarding
- Database schema for orgs, users, clients, jobs
- Auto-create user profile trigger

### What's Missing ❌
- Team invite system (no table, no API)
- Customer/job creation during onboarding
- Mobile-first UI design
- Analytics event tracking
- SMS/WhatsApp invite capability
- 6-digit join code system

### What Needs to Change 🔄
- Rename/refactor organization.tsx → company.tsx
- Remove separate profile step
- Update create-organization API with working hours, currency
- Add new onboarding pages (team, customer, job, complete)

---

## Implementation Phases

### Phase 1: Database & Backend (Week 1)

#### 1.1 Create user_invites Table

**File**: `migrations/20251112_001_create_user_invites.sql`

```sql
CREATE TABLE user_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  name TEXT NOT NULL CHECK (length(name) >= 2 AND length(name) <= 100),
  contact TEXT NOT NULL,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('phone', 'email')),
  role TEXT NOT NULL CHECK (role IN ('technician', 'coordinator')),

  invite_code TEXT UNIQUE NOT NULL CHECK (invite_code ~ '^[0-9]{6}$'),
  invite_token TEXT UNIQUE NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'cancelled', 'expired')),

  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_invites_org_id ON user_invites(org_id);
CREATE INDEX idx_user_invites_invite_code ON user_invites(invite_code)
  WHERE status = 'pending';
CREATE INDEX idx_user_invites_invite_token ON user_invites(invite_token)
  WHERE status = 'pending';
CREATE INDEX idx_user_invites_status ON user_invites(org_id, status);
CREATE INDEX idx_user_invites_expires_at ON user_invites(expires_at)
  WHERE status = 'pending';

-- RLS Policies
ALTER TABLE user_invites ENABLE ROW LEVEL SECURITY;

-- Owners/coordinators can view invites in their org
CREATE POLICY "Users can view invites in their org"
  ON user_invites FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM users WHERE id = auth.uid()
    )
  );

-- Owners/coordinators can create invites
CREATE POLICY "Owners and coordinators can create invites"
  ON user_invites FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid()
        AND role IN ('owner', 'coordinator')
        AND email_confirmed = true
    )
  );

-- Owners/coordinators can update invites (resend, cancel)
CREATE POLICY "Owners and coordinators can update invites"
  ON user_invites FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid()
        AND role IN ('owner', 'coordinator')
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_user_invites_updated_at
  BEFORE UPDATE ON user_invites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Rollback file**: `migrations/20251112_001_create_user_invites.down.sql`

```sql
DROP TRIGGER IF EXISTS update_user_invites_updated_at ON user_invites;
DROP TABLE IF EXISTS user_invites CASCADE;
```

#### 1.2 Create API Endpoints

**File**: `pages/api/onboarding/invite-team.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { sendSMS } from '@/lib/sms';
import { sendEmail } from '@/lib/email';
import { generateInviteCode, generateInviteToken } from '@/lib/invite';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createPagesServerClient<Database>({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { invites } = req.body;

    if (!invites || !Array.isArray(invites) || invites.length === 0) {
      return res.status(400).json({ error: 'Invalid invites data' });
    }

    // Get user's org_id
    const { data: userData } = await supabase
      .from('users')
      .select('org_id, full_name, organizations(name)')
      .eq('id', session.user.id)
      .single();

    if (!userData?.org_id) {
      return res.status(400).json({ error: 'User not part of organization' });
    }

    const serviceRoleSupabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const inviteDetails = [];
    const invitesFailed = [];

    for (const invite of invites) {
      try {
        const inviteCode = generateInviteCode();
        const inviteToken = generateInviteToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Create invite record
        const { data: inviteRecord, error: inviteError } = await serviceRoleSupabase
          .from('user_invites')
          .insert({
            org_id: userData.org_id,
            invited_by: session.user.id,
            name: invite.name,
            contact: invite.contact,
            contact_type: invite.contactType,
            role: invite.role,
            invite_code: inviteCode,
            invite_token: inviteToken,
            expires_at: expiresAt.toISOString()
          })
          .select()
          .single();

        if (inviteError) throw inviteError;

        // Send invite via SMS or email
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/join/${inviteToken}`;
        const message = `You've been invited to join ${userData.organizations.name} on Automet.\n\nTap to join: ${inviteLink}\nor use code: ${inviteCode}\n\nInvited by: ${userData.full_name || 'Your manager'}\nRole: ${invite.role}`;

        if (invite.contactType === 'phone') {
          await sendSMS(invite.contact, message);
        } else {
          await sendEmail(invite.contact, {
            subject: `You're invited to join ${userData.organizations.name} on Automet`,
            body: message
          });
        }

        inviteDetails.push({
          id: inviteRecord.id,
          name: invite.name,
          contact: invite.contact,
          role: invite.role,
          inviteCode,
          inviteLink,
          expiresAt: expiresAt.toISOString()
        });
      } catch (error: any) {
        invitesFailed.push({
          contact: invite.contact,
          reason: error.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      invitesSent: inviteDetails.length,
      inviteDetails,
      invitesFailed
    });
  } catch (error: any) {
    console.error('Invite team error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

**File**: `pages/api/onboarding/create-customer.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createPagesServerClient<Database>({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { name, address, contactPerson, phone } = req.body;

    if (!name || !address) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get user's org_id
    const { data: userData } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', session.user.id)
      .single();

    if (!userData?.org_id) {
      return res.status(400).json({ error: 'User not part of organization' });
    }

    // Create customer
    const { data: customer, error: customerError } = await supabase
      .from('clients')
      .insert({
        org_id: userData.org_id,
        name,
        address,
        contact_person: contactPerson,
        contact_phone: phone
      })
      .select()
      .single();

    if (customerError) {
      console.error('Customer creation error:', customerError);
      return res.status(500).json({ error: customerError.message });
    }

    return res.status(200).json({
      success: true,
      customer
    });
  } catch (error: any) {
    console.error('Create customer error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

**File**: `pages/api/onboarding/create-job.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createPagesServerClient<Database>({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { customerId, title, technicianId, scheduledAt } = req.body;

    if (!customerId || !title || !scheduledAt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get user's org_id
    const { data: userData } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', session.user.id)
      .single();

    if (!userData?.org_id) {
      return res.status(400).json({ error: 'User not part of organization' });
    }

    // Create job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        org_id: userData.org_id,
        client_id: customerId,
        title,
        status: 'scheduled',
        scheduled_at: scheduledAt
      })
      .select()
      .single();

    if (jobError) {
      console.error('Job creation error:', jobError);
      return res.status(500).json({ error: jobError.message });
    }

    // If technician assigned, create job assignment
    if (technicianId) {
      const { error: assignmentError } = await supabase
        .from('job_assignments')
        .insert({
          job_id: job.id,
          user_id: technicianId,
          is_primary: true
        });

      if (assignmentError) {
        console.error('Assignment error:', assignmentError);
        // Don't fail the whole request if assignment fails
      }
    }

    return res.status(200).json({
      success: true,
      job
    });
  } catch (error: any) {
    console.error('Create job error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

**File**: `pages/api/invites/accept.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createPagesServerClient<Database>({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { code, token } = req.body;

    if (!code && !token) {
      return res.status(400).json({ error: 'Must provide code or token' });
    }

    const serviceRoleSupabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Find invite
    let query = serviceRoleSupabase
      .from('user_invites')
      .select('*')
      .eq('status', 'pending');

    if (code) {
      query = query.eq('invite_code', code);
    } else {
      query = query.eq('invite_token', token);
    }

    const { data: invite, error: inviteError } = await query.single();

    if (inviteError || !invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Invite expired' });
    }

    // Update user with org_id and role
    const { error: userError } = await serviceRoleSupabase
      .from('users')
      .update({
        org_id: invite.org_id,
        role: invite.role
      })
      .eq('id', session.user.id);

    if (userError) {
      console.error('User update error:', userError);
      return res.status(500).json({ error: userError.message });
    }

    // Mark invite as accepted
    await serviceRoleSupabase
      .from('user_invites')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by: session.user.id
      })
      .eq('id', invite.id);

    // Get organization details
    const { data: org } = await serviceRoleSupabase
      .from('organizations')
      .select('id, name')
      .eq('id', invite.org_id)
      .single();

    return res.status(200).json({
      success: true,
      organization: org,
      role: invite.role,
      redirectTo: '/dashboard'
    });
  } catch (error: any) {
    console.error('Accept invite error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

**File**: `pages/api/invites/verify/[token].ts`

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Invalid token' });
    }

    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: invite, error } = await supabase
      .from('user_invites')
      .select('*, organizations(name), users!invited_by(full_name)')
      .eq('invite_token', token)
      .eq('status', 'pending')
      .single();

    if (error || !invite) {
      return res.status(404).json({
        success: false,
        error: 'Invite not found'
      });
    }

    const isExpired = new Date(invite.expires_at) < new Date();

    return res.status(200).json({
      success: true,
      invite: {
        organizationName: invite.organizations.name,
        role: invite.role,
        invitedBy: invite.users.full_name || 'Your manager',
        expiresAt: invite.expires_at,
        isExpired
      }
    });
  } catch (error: any) {
    console.error('Verify invite error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

#### 1.3 Create Helper Utilities

**File**: `lib/invite.ts`

```typescript
import crypto from 'crypto';

export function generateInviteCode(): string {
  // Generate 6-digit random number
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateInviteToken(): string {
  // Generate UUID v4
  return crypto.randomUUID();
}
```

**File**: `lib/sms.ts`

```typescript
// Example with Twilio - replace with your SMS provider
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS(to: string, body: string): Promise<void> {
  try {
    await client.messages.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      body
    });
  } catch (error) {
    console.error('SMS send error:', error);
    throw error;
  }
}
```

**File**: `lib/email.ts`

```typescript
// Example with Resend - replace with your email provider
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
  to: string,
  { subject, body }: { subject: string; body: string }
): Promise<void> {
  try {
    await resend.emails.send({
      from: 'Automet <noreply@automet.app>',
      to,
      subject,
      text: body
    });
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}
```

**File**: `lib/analytics.ts`

```typescript
// Example with Mixpanel - replace with your analytics provider
import mixpanel from 'mixpanel-browser';

if (typeof window !== 'undefined') {
  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '');
}

export function trackEvent(
  event: string,
  properties?: Record<string, any>
): void {
  if (typeof window !== 'undefined') {
    mixpanel.track(event, {
      ...properties,
      timestamp: new Date().toISOString()
    });
  }
}

export function identifyUser(userId: string, traits?: Record<string, any>): void {
  if (typeof window !== 'undefined') {
    mixpanel.identify(userId);
    if (traits) {
      mixpanel.people.set(traits);
    }
  }
}
```

---

### Phase 2: Frontend Components (Week 2)

#### 2.1 Update Signup Page

**File**: `pages/signup.tsx` (Update existing)

Add phone field (optional) and analytics tracking.

#### 2.2 Create Onboarding Pages

**File**: `pages/onboarding/welcome.tsx` (NEW)

Simple welcome screen with "Get started" CTA.

**File**: `pages/onboarding/company.tsx` (Rename from organization.tsx)

Update with working hours and currency fields.

**File**: `pages/onboarding/team.tsx` (NEW)

Dynamic form with add/remove rows for team invites.

**File**: `pages/onboarding/customer.tsx` (NEW)

Simple form for first customer creation.

**File**: `pages/onboarding/job.tsx` (NEW)

Pre-filled job creation form with customer from previous step.

**File**: `pages/onboarding/complete.tsx` (Rename from success.tsx)

Success screen with summary and CTAs.

#### 2.3 Create Invite Join Flow

**File**: `pages/join/[code].tsx` (NEW)

Handle invite acceptance via link or manual code entry.

#### 2.4 Create Settings Pages

**File**: `pages/settings/team.tsx` (NEW)

Team management dashboard with active members and pending invites.

---

### Phase 3: Mobile-First Styling (Week 3)

#### 3.1 Design System Components

Create reusable components with mobile-first responsive design:

- `components/onboarding/ProgressBar.tsx`
- `components/onboarding/InviteRow.tsx`
- `components/onboarding/QuickTipsSidebar.tsx`
- `components/forms/*` (form components)
- `components/ui/*` (buttons, inputs, etc.)

#### 3.2 Global Styles

Update global CSS with design tokens:
- Typography scale
- Color palette
- Spacing system
- Responsive breakpoints

---

### Phase 4: Testing & Analytics (Week 4)

#### 4.1 Integration Testing

Test complete flow:
1. Signup → Company → Team → Customer → Job → Complete
2. Invite send → Accept (via link and code)
3. Settings team management

#### 4.2 Analytics Implementation

Implement all 34 events from spec.

#### 4.3 Error Handling

Add comprehensive error handling and user feedback.

#### 4.4 Performance Optimization

- Code splitting
- Image optimization
- API response caching
- Loading states

---

## Files to Modify

### Database
- ✅ `migrations/20251112_001_create_user_invites.sql` (NEW)
- ✅ `migrations/20251112_001_create_user_invites.down.sql` (NEW)

### API Routes
- 🔄 `pages/api/onboarding/create-organization.ts` (UPDATE - add working hours, currency)
- ✅ `pages/api/onboarding/invite-team.ts` (NEW)
- ✅ `pages/api/onboarding/create-customer.ts` (NEW)
- ✅ `pages/api/onboarding/create-job.ts` (NEW)
- ✅ `pages/api/invites/accept.ts` (NEW)
- ✅ `pages/api/invites/verify/[token].ts` (NEW)

### Pages
- 🔄 `pages/signup.tsx` (UPDATE - add phone field, analytics)
- ✅ `pages/onboarding/welcome.tsx` (NEW)
- 🔄 `pages/onboarding/organization.tsx` → `pages/onboarding/company.tsx` (RENAME + UPDATE)
- ❌ `pages/onboarding/profile.tsx` (DELETE - merged into company)
- ✅ `pages/onboarding/team.tsx` (NEW)
- ✅ `pages/onboarding/customer.tsx` (NEW)
- ✅ `pages/onboarding/job.tsx` (NEW)
- 🔄 `pages/onboarding/success.tsx` → `pages/onboarding/complete.tsx` (RENAME + UPDATE)
- ✅ `pages/join/[code].tsx` (NEW)
- ✅ `pages/settings/team.tsx` (NEW)

### Utilities
- ✅ `lib/invite.ts` (NEW)
- ✅ `lib/sms.ts` (NEW)
- ✅ `lib/email.ts` (NEW)
- ✅ `lib/analytics.ts` (NEW)

### Components
- ✅ Multiple new components in `components/onboarding/` and `components/forms/`

---

## Environment Variables

Add to `.env.local`:

```bash
# SMS Provider (Twilio example)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# Email Provider (Resend example)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Analytics (Mixpanel example)
NEXT_PUBLIC_MIXPANEL_TOKEN=xxxxxxxxxxxxx

# App URL
NEXT_PUBLIC_APP_URL=https://automet.app
```

---

## Dependencies to Install

```bash
npm install --save twilio resend mixpanel-browser react-hook-form zod @hookform/resolvers
```

---

## Testing Checklist

### Unit Tests
- [ ] Invite code generation (6 digits, unique)
- [ ] Invite token generation (UUID format)
- [ ] Form validation schemas (Zod)
- [ ] SMS/email formatting

### Integration Tests
- [ ] Complete onboarding flow (5 steps)
- [ ] Invite send → accept flow
- [ ] Team management operations
- [ ] API error handling

### E2E Tests (Playwright)
- [ ] Mobile signup flow
- [ ] Desktop settings management
- [ ] Invite acceptance (link click)
- [ ] Invite acceptance (manual code)

---

## Deployment Checklist

### Pre-Deployment
- [ ] Run all tests
- [ ] Database migration applied
- [ ] Environment variables set
- [ ] SMS/email provider configured
- [ ] Analytics tracking verified

### Post-Deployment
- [ ] Monitor error logs
- [ ] Check analytics events firing
- [ ] Test invite sending (SMS/email)
- [ ] Verify mobile responsiveness
- [ ] Test on multiple devices

---

## Rollback Plan

If issues arise:

1. **Database**: Run rollback migration
   ```bash
   psql -f migrations/20251112_001_create_user_invites.down.sql
   ```

2. **Code**: Revert to previous onboarding flow
   - Keep old files as backup (`*.backup.tsx`)
   - Switch routing to old pages

3. **Monitoring**: Watch metrics for 24 hours post-rollback

---

## Success Criteria

### Week 1 (Backend)
- [ ] Database migration successful
- [ ] All API endpoints implemented and tested
- [ ] SMS/email sending works

### Week 2 (Frontend)
- [ ] All 8 onboarding pages functional
- [ ] Invite join flow works
- [ ] Settings team management works

### Week 3 (Design)
- [ ] Mobile-first design applied
- [ ] Responsive on all breakpoints
- [ ] Accessibility checks pass

### Week 4 (Polish)
- [ ] All analytics events tracking
- [ ] Error handling complete
- [ ] Performance benchmarks met
- [ ] Ready for production

---

## Next Steps

1. **Review this plan** with team
2. **Create Jira tickets** for each phase
3. **Set up development environment** (SMS/email test accounts)
4. **Begin Phase 1** (Database & Backend)
5. **Daily standups** to track progress

---

## Questions & Support

- **Design Questions**: Refer to [ONBOARDING_DESIGN_SPEC.md](./ONBOARDING_DESIGN_SPEC.md)
- **Technical Questions**: Contact tech lead
- **Analytics Questions**: Contact product team

**Last Updated**: 2025-11-11
**Version**: 1.0
