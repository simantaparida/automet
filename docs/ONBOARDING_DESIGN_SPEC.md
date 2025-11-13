# Onboarding Wizard - Complete Design & Development Specification

## Executive Summary

**Goal**: Take new company from signup → first job created in <10 minutes

**Target Persona**:
- Small service company owner (non-technical)
- Mobile-first technicians
- Web-first Operations/Owner

**Locale**: India (INR, phone-based, English)

**Time-to-Value**: Complete setup and create first job in <10 minutes

---

## 1. USER JOURNEY OVERVIEW

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        NEW USER JOURNEY                          │
└─────────────────────────────────────────────────────────────────┘

1. WELCOME SCREEN
   ↓
2. SIGNUP (Email + Password) [Later: Google OAuth]
   ↓
3. COMPANY DETAILS (Name, Industry, Hours, Currency)
   ↓
4. ADD TEAM (Invite via Phone/Email + Role) [Skippable]
   ↓
5. ADD FIRST CUSTOMER (Name, Address, Contact, Phone)
   ↓
6. CREATE FIRST JOB (Pre-filled customer, assign tech)
   ↓
7. SETUP COMPLETE (CTA: Create job / Explore dashboard)
   ↓
8. DASHBOARD (with Quick Tips sidebar)


┌─────────────────────────────────────────────────────────────────┐
│                    TECHNICIAN INVITE JOURNEY                     │
└─────────────────────────────────────────────────────────────────┘

1. RECEIVE SMS/WhatsApp: "You've been invited to join [Company] on Automet.
                         Tap to join: https://automet.app/join/abc123
                         or use code: 123456"
   ↓
2A. [TAP LINK] → Auto-redirects to /join/abc123
   ↓
2B. [MANUAL ENTRY] → Open app → Enter 6-digit code
   ↓
3. ACCEPT INVITE PAGE (Shows company name, role, who invited)
   ↓
4. SIGNUP/LOGIN (If new user: create account with phone + password)
   ↓
5. REDIRECT TO DASHBOARD (Limited tech view)
```

---

## 2. MOBILE-FIRST SCREEN DESIGNS (Portrait 375px width baseline)

### SCREEN 1: WELCOME

**Route**: `/welcome` or `/`

**Layout**:
```
┌─────────────────────────────────────┐
│                                     │
│         [LOGO: Automet]             │
│                                     │
│    [Illustration: Field workers     │
│     with mobile devices and         │
│     checkmarks]                     │
│                                     │
│  ╔═══════════════════════════════╗  │
│  ║                               ║  │
│  ║  Simplify field operations.   ║  │
│  ║                               ║  │
│  ║  Track jobs, technicians,     ║  │
│  ║  and assets — all in one      ║  │
│  ║  place.                        ║  │
│  ║                               ║  │
│  ╚═══════════════════════════════╝  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     Get started →           │   │
│  └─────────────────────────────┘   │
│                                     │
│  Already have an account? Log in    │
│                                     │
└─────────────────────────────────────┘
```

**Fields**: None

**Actions**:
- **Primary CTA**: "Get started" → Navigate to `/signup`
- **Secondary Link**: "Log in" → Navigate to `/login`

**Validations**: None

**Error States**: None

**Microcopy**:
- Hero: "Simplify field operations. Track jobs, technicians, and assets — all in one place."
- CTA: "Get started"
- Link: "Already have an account? Log in"

---

### SCREEN 2: SIGNUP (Simple Email)

**Route**: `/signup`

**Layout**:
```
┌─────────────────────────────────────┐
│  ← Back                             │
│                                     │
│  Create your account                │
│  ─────────────────────────────────  │
│                                     │
│  Full Name *                        │
│  ┌─────────────────────────────┐   │
│  │ e.g., Rajesh Kumar          │   │
│  └─────────────────────────────┘   │
│                                     │
│  Email *                            │
│  ┌─────────────────────────────┐   │
│  │ e.g., rajesh@sharma.com     │   │
│  └─────────────────────────────┘   │
│                                     │
│  Password *                         │
│  ┌─────────────────────────────┐   │
│  │ ••••••••                    👁  │
│  └─────────────────────────────┘   │
│  At least 8 characters              │
│                                     │
│  Phone (Optional)                   │
│  ┌─────────────────────────────┐   │
│  │ +91 98765 43210             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     Create account          │   │
│  └─────────────────────────────┘   │
│                                     │
│  By creating an account, you agree  │
│  to our Terms of Service and        │
│  Privacy Policy                     │
│                                     │
│  ─── OR ───                         │
│                                     │
│  [G] Continue with Google           │
│  (Coming soon)                      │
│                                     │
└─────────────────────────────────────┘
```

**Fields**:
- **Full Name*** (TEXT, 2-100 chars, required)
- **Email*** (EMAIL, required, unique in auth.users)
- **Password*** (PASSWORD, min 8 chars, required)
- **Phone** (TEL, optional, format: +91 XXXXX XXXXX)

**Actions**:
- **Back arrow**: Navigate to `/welcome`
- **Primary CTA**: "Create account" → POST to Supabase Auth → Create user → Navigate to `/onboarding/company`
- **Google OAuth**: "Continue with Google" (disabled, "Coming soon" badge)

**Validations**:
- Name: Required, 2-100 characters
- Email: Required, valid email format, check uniqueness
- Password: Required, min 8 characters, show strength indicator
- Phone: Optional, valid phone format with country code

**Error States**:
- **Email already exists**: "This email is already registered. Try logging in instead."
- **Weak password**: "Password must be at least 8 characters"
- **Network error**: "Unable to create account. Please check your connection and try again."

**Microcopy**:
- Heading: "Create your account"
- Password helper: "At least 8 characters"
- Terms: "By creating an account, you agree to our Terms of Service and Privacy Policy"

**Analytics Events**:
- `signup_started` (when page loads)
- `signup_completed` (when account created successfully)
- `signup_failed` (with error reason)

---

### SCREEN 3: COMPANY DETAILS

**Route**: `/onboarding/company`

**Layout**:
```
┌─────────────────────────────────────┐
│  Step 1 of 5                    20% │
│  ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                     │
│  Tell us about your company         │
│  ─────────────────────────────────  │
│                                     │
│  Company Name *                     │
│  ┌─────────────────────────────┐   │
│  │ e.g., Sharma Services       │   │
│  └─────────────────────────────┘   │
│                                     │
│  Industry *                         │
│  ┌─────────────────────────────┐   │
│  │ Select industry        ▼    │   │
│  └─────────────────────────────┘   │
│                                     │
│  Working Hours *                    │
│  ┌──────────┐  ┌──────────┐        │
│  │ 09:00 ▼  │  │ 18:00 ▼  │        │
│  └──────────┘  └──────────┘        │
│  From            To                 │
│                                     │
│  Currency *                         │
│  ● Indian Rupee (₹)                 │
│  ○ US Dollar ($)                    │
│  ○ Other                            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Save & continue →          │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Fields**:
- **Company Name*** (TEXT, 2-200 chars, required)
- **Industry*** (SELECT, required)
  - Options: HVAC, Electrical, Plumbing, Elevator/Lift, Fire Safety, Security Systems, IT Services, Facility Management, Other
- **Working Hours*** (TIME, required)
  - From: Default 09:00
  - To: Default 18:00
- **Currency*** (RADIO, required, default: Indian Rupee)
  - Options: Indian Rupee (₹), US Dollar ($), Other

**Actions**:
- **Primary CTA**: "Save & continue" → POST `/api/onboarding/create-organization` → Navigate to `/onboarding/team`

**Validations**:
- Company Name: Required, 2-200 characters
- Industry: Required, must select from dropdown
- Working Hours: Required, 'To' must be after 'From'
- Currency: Required (default pre-selected)

**Error States**:
- **Company name too short**: "Company name must be at least 2 characters"
- **Invalid time range**: "End time must be after start time"
- **Duplicate organization**: "An organization with this name already exists. Try a different name."
- **API error**: "Unable to create organization. Please try again."

**Microcopy**:
- Heading: "Tell us about your company"
- Progress: "Step 1 of 5" (20%)
- CTA: "Save & continue"
- Placeholders: "e.g., Sharma Services"

**Analytics Events**:
- `company_details_viewed`
- `company_details_completed` (with industry, currency metadata)
- `company_details_failed` (with error reason)

**API Integration**:
```typescript
POST /api/onboarding/create-organization
{
  organizationName: string,
  industry: string,
  workingHours: { from: string, to: string },
  currency: string
}

Response:
{
  success: boolean,
  organization: {
    id: string,
    name: string,
    slug: string,
    settings: object
  }
}
```

---

### SCREEN 4: ADD TEAM (Invite Rows)

**Route**: `/onboarding/team`

**Layout**:
```
┌─────────────────────────────────────┐
│  Step 2 of 5                    40% │
│  ████████░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                     │
│  Invite your team                   │
│  ─────────────────────────────────  │
│  Add technicians and coordinators.  │
│  You can skip this and add them     │
│  later from Settings.               │
│                                     │
│  Team Member 1                      │
│  ┌─────────────────────────────┐   │
│  │ Name                        │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ +91 98765 43210             │   │
│  └─────────────────────────────┘   │
│  Phone or email                     │
│  ┌─────────────────────────────┐   │
│  │ Role                    ▼   │   │
│  └─────────────────────────────┘   │
│  [× Remove]                         │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ + Add another team member   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Send invites →             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Skip for now                       │
│                                     │
└─────────────────────────────────────┘
```

**Fields** (per team member row):
- **Name** (TEXT, 2-100 chars, required if row is filled)
- **Phone or Email** (TEXT, required if row is filled)
  - Accept either phone (+91 format) or email
- **Role** (SELECT, required if row is filled)
  - Options: Technician, Coordinator

**Actions**:
- **"+ Add another team member"**: Add new empty row (max 10 rows)
- **"× Remove"**: Remove row
- **Primary CTA**: "Send invites" → POST `/api/onboarding/invite-team` → Navigate to `/onboarding/customer`
- **Secondary Link**: "Skip for now" → Navigate to `/onboarding/customer`

**Validations**:
- At least one complete row OR skip
- Name: 2-100 characters if row is filled
- Phone/Email: Valid phone (+91 XXXXX XXXXX) or valid email format
- Role: Must select Technician or Coordinator
- Phone validation: Must be unique across existing users and pending invites

**Error States**:
- **Invalid phone**: "Please enter a valid phone number with country code (e.g., +91 98765 43210)"
- **Invalid email**: "Please enter a valid email address"
- **Missing role**: "Please select a role for each team member"
- **Duplicate contact**: "This phone/email is already registered or invited"
- **Invite send failure**: "Unable to send invite to [name]. Please check the contact details and try again."

**Microcopy**:
- Heading: "Invite your team"
- Subheading: "Add technicians and coordinators. You can skip this and add them later from Settings."
- Progress: "Step 2 of 5" (40%)
- CTA: "Send invites"
- Link: "Skip for now"
- Helper: "Phone or email"

**SMS/WhatsApp Invite Message**:
```
You've been invited to join [Company Name] on Automet.

Tap to join: https://automet.app/join/abc123
or use code: 123456

Invited by: [Owner Name]
Role: [Technician/Coordinator]
```

**Analytics Events**:
- `team_invite_viewed`
- `team_invite_sent` (with count, role breakdown)
- `team_invite_skipped`
- `team_invite_failed` (with error reason)

**API Integration**:
```typescript
POST /api/onboarding/invite-team
{
  invites: [
    {
      name: string,
      contact: string, // phone or email
      contactType: 'phone' | 'email',
      role: 'technician' | 'coordinator'
    }
  ]
}

Response:
{
  success: boolean,
  invitesSent: number,
  invitesFailed: [
    { contact: string, reason: string }
  ]
}
```

---

### SCREEN 5: ADD FIRST CUSTOMER

**Route**: `/onboarding/customer`

**Layout**:
```
┌─────────────────────────────────────┐
│  Step 3 of 5                    60% │
│  ████████████░░░░░░░░░░░░░░░░░░░░   │
│                                     │
│  Add your first customer            │
│  ─────────────────────────────────  │
│  Create a customer to assign jobs.  │
│                                     │
│  Customer Name *                    │
│  ┌─────────────────────────────┐   │
│  │ e.g., Prestige Apartments   │   │
│  └─────────────────────────────┘   │
│                                     │
│  Address *                          │
│  ┌─────────────────────────────┐   │
│  │ 123 MG Road, Bangalore      │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Contact Person                     │
│  ┌─────────────────────────────┐   │
│  │ e.g., Mr. Ravi Kumar        │   │
│  └─────────────────────────────┘   │
│                                     │
│  Phone                              │
│  ┌─────────────────────────────┐   │
│  │ +91 98765 43210             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Save customer →            │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Fields**:
- **Customer Name*** (TEXT, 2-200 chars, required)
- **Address*** (TEXTAREA, required)
- **Contact Person** (TEXT, optional)
- **Phone** (TEL, optional, format: +91 XXXXX XXXXX)

**Actions**:
- **Primary CTA**: "Save customer" → POST `/api/onboarding/create-customer` → Navigate to `/onboarding/job`

**Validations**:
- Customer Name: Required, 2-200 characters
- Address: Required, not empty
- Contact Person: Optional, 2-100 characters if filled
- Phone: Optional, valid phone format if filled

**Error States**:
- **Name too short**: "Customer name must be at least 2 characters"
- **Missing address**: "Please enter the customer's address"
- **Invalid phone**: "Please enter a valid phone number"
- **API error**: "Unable to create customer. Please try again."

**Microcopy**:
- Heading: "Add your first customer"
- Subheading: "Create a customer to assign jobs."
- Progress: "Step 3 of 5" (60%)
- CTA: "Save customer"
- Placeholders: "e.g., Prestige Apartments"

**Analytics Events**:
- `first_customer_viewed`
- `first_customer_created` (with has_contact_person, has_phone metadata)
- `first_customer_failed` (with error reason)

**API Integration**:
```typescript
POST /api/onboarding/create-customer
{
  name: string,
  address: string,
  contactPerson?: string,
  phone?: string
}

Response:
{
  success: boolean,
  customer: {
    id: string,
    name: string,
    address: string
  }
}
```

---

### SCREEN 6: CREATE FIRST JOB (Simplified)

**Route**: `/onboarding/job`

**Layout**:
```
┌─────────────────────────────────────┐
│  Step 4 of 5                    80% │
│  ████████████████░░░░░░░░░░░░░░░░   │
│                                     │
│  Create your first job              │
│  ─────────────────────────────────  │
│  Assign a job to see Automet in     │
│  action.                            │
│                                     │
│  Customer                           │
│  ┌─────────────────────────────┐   │
│  │ ✓ Prestige Apartments       │   │
│  └─────────────────────────────┘   │
│  (Pre-filled from previous step)    │
│                                     │
│  Job Title *                        │
│  ┌─────────────────────────────┐   │
│  │ Sample Maintenance Visit    │   │
│  └─────────────────────────────┘   │
│  (Pre-filled, editable)             │
│                                     │
│  Assign Technician                  │
│  ┌─────────────────────────────┐   │
│  │ Select technician       ▼   │   │
│  └─────────────────────────────┘   │
│  (Shows invited team members or     │
│   "No technicians yet - assign      │
│    later from dashboard")           │
│                                     │
│  Schedule                           │
│  ┌─────────────────────────────┐   │
│  │ Tomorrow, 10:00 AM      ▼   │   │
│  └─────────────────────────────┘   │
│  (Default: Next working day)        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Create & assign job →      │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Fields**:
- **Customer** (PRE-FILLED, disabled, shows customer from previous step)
- **Job Title*** (TEXT, pre-filled: "Sample Maintenance Visit", editable, required)
- **Assign Technician** (SELECT, optional)
  - Options: List of invited technicians (if any) or "Assign later"
- **Schedule** (DATETIME, default: Next working day at 10:00 AM, required)

**Actions**:
- **Primary CTA**: "Create & assign job" → POST `/api/onboarding/create-job` → Navigate to `/onboarding/complete`

**Validations**:
- Job Title: Required, 1-200 characters
- Schedule: Required, must be in the future

**Error States**:
- **Empty title**: "Please enter a job title"
- **Past schedule**: "Scheduled time must be in the future"
- **API error**: "Unable to create job. Please try again."

**Microcopy**:
- Heading: "Create your first job"
- Subheading: "Assign a job to see Automet in action."
- Progress: "Step 4 of 5" (80%)
- CTA: "Create & assign job"
- Helper: "(Pre-filled from previous step)"
- No tech available: "No technicians yet - assign later from dashboard"

**Analytics Events**:
- `first_job_viewed`
- `first_job_created` (with has_technician_assigned, schedule_time metadata)
- `first_job_failed` (with error reason)

**API Integration**:
```typescript
POST /api/onboarding/create-job
{
  customerId: string,
  title: string,
  technicianId?: string,
  scheduledAt: string // ISO 8601
}

Response:
{
  success: boolean,
  job: {
    id: string,
    title: string,
    status: string,
    scheduledAt: string
  }
}
```

---

### SCREEN 7: SETUP COMPLETE

**Route**: `/onboarding/complete`

**Layout**:
```
┌─────────────────────────────────────┐
│  Step 5 of 5                   100% │
│  ████████████████████████████████   │
│                                     │
│         [✓ Success Icon]            │
│                                     │
│  Setup complete!                    │
│  ─────────────────────────────────  │
│                                     │
│  You've successfully set up your    │
│  organization. Your first job is    │
│  ready to go!                       │
│                                     │
│  ╔═══════════════════════════════╗  │
│  ║ Next Steps:                   ║  │
│  ║                               ║  │
│  ║ ✓ Company created             ║  │
│  ║ ✓ Team invited (2 members)    ║  │
│  ║ ✓ First customer added        ║  │
│  ║ ✓ First job created           ║  │
│  ║                               ║  │
│  ╚═══════════════════════════════╝  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  View my first job →        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Explore dashboard          │   │
│  └─────────────────────────────┘   │
│                                     │
│  Need help? Check out Quick Tips → │
│                                     │
└─────────────────────────────────────┘
```

**Fields**: None

**Actions**:
- **Primary CTA**: "View my first job" → Navigate to `/jobs/[firstJobId]`
- **Secondary CTA**: "Explore dashboard" → Navigate to `/dashboard`
- **Tertiary Link**: "Check out Quick Tips" → Show tips sidebar or navigate to `/help`

**Validations**: None

**Error States**: None

**Microcopy**:
- Heading: "Setup complete!"
- Subheading: "You've successfully set up your organization. Your first job is ready to go!"
- Progress: "Step 5 of 5" (100%)
- CTAs: "View my first job", "Explore dashboard"
- Link: "Need help? Check out Quick Tips"
- Summary items:
  - "✓ Company created"
  - "✓ Team invited (X members)" [dynamic count]
  - "✓ First customer added"
  - "✓ First job created"

**Analytics Events**:
- `onboarding_completed` (with total_time, team_invited_count, metadata)
- `first_job_viewed_clicked`
- `explore_dashboard_clicked`
- `quick_tips_clicked`

---

### SCREEN 8: QUICK TIPS / PROGRESS SIDEBAR

**Route**: Sidebar component shown on `/dashboard` after onboarding

**Layout**:
```
┌─────────────────────────────────────┐
│  Quick Tips                      [×]│
│  ─────────────────────────────────  │
│                                     │
│  ☐ Add more customers               │
│     Grow your client base           │
│                                     │
│  ☐ Create job sites                 │
│     Track customer locations        │
│                                     │
│  ☐ Add assets for tracking          │
│     Monitor equipment maintenance   │
│                                     │
│  ☐ Invite more team members         │
│     Go to Settings > Team           │
│                                     │
│  ☐ Set up billing                   │
│     Manage subscriptions            │
│                                     │
│  [Hide tips]                        │
│                                     │
└─────────────────────────────────────┘
```

**Fields**: None (checklist items)

**Actions**:
- **[×] Close**: Collapse sidebar
- **Checklist items**: Click to navigate to relevant section
- **"Hide tips"**: Dismiss permanently (store in user preferences)

**Validations**: None

**Microcopy**:
- Heading: "Quick Tips"
- Items:
  - "Add more customers" → "Grow your client base"
  - "Create job sites" → "Track customer locations"
  - "Add assets for tracking" → "Monitor equipment maintenance"
  - "Invite more team members" → "Go to Settings > Team"
  - "Set up billing" → "Manage subscriptions"

**Analytics Events**:
- `quick_tips_viewed`
- `quick_tips_item_clicked` (with item name)
- `quick_tips_dismissed`

---

## 3. WEB DASHBOARD VERSIONS FOR OWNER

### SETTINGS > ORGANIZATION

**Route**: `/settings/organization`

**Layout** (Desktop 1024px+):
```
┌──────────────────────────────────────────────────────────────────┐
│  Settings                                                         │
├─────────────┬────────────────────────────────────────────────────┤
│             │  Organization Settings                             │
│ Organization│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ Team        │                                                    │
│ Billing     │  Company Name                                      │
│ Profile     │  ┌──────────────────────────────────────────────┐ │
│             │  │ Sharma Services                              │ │
│             │  └──────────────────────────────────────────────┘ │
│             │                                                    │
│             │  Slug                                              │
│             │  ┌──────────────────────────────────────────────┐ │
│             │  │ sharma-services                              │ │
│             │  └──────────────────────────────────────────────┘ │
│             │  https://automet.app/sharma-services              │
│             │                                                    │
│             │  Industry                                          │
│             │  ┌──────────────────────────────────────────────┐ │
│             │  │ HVAC                                     ▼   │ │
│             │  └──────────────────────────────────────────────┘ │
│             │                                                    │
│             │  Working Hours                                     │
│             │  ┌────────────┐  ┌────────────┐                   │
│             │  │ 09:00  ▼   │  │ 18:00  ▼   │                   │
│             │  └────────────┘  └────────────┘                   │
│             │  From              To                              │
│             │                                                    │
│             │  Currency                                          │
│             │  ● Indian Rupee (₹)                                │
│             │  ○ US Dollar ($)                                   │
│             │                                                    │
│             │  ┌──────────────────────────────────────────────┐ │
│             │  │  Save changes                                │ │
│             │  └──────────────────────────────────────────────┘ │
│             │                                                    │
│             │  ─────────────────────────────────────────────────│
│             │                                                    │
│             │  Danger Zone                                       │
│             │                                                    │
│             │  Delete Organization                               │
│             │  This action cannot be undone. All data will be   │
│             │  permanently deleted.                              │
│             │                                                    │
│             │  [Delete Organization]                             │
│             │                                                    │
└─────────────┴────────────────────────────────────────────────────┘
```

**Fields**:
- **Company Name** (TEXT, editable)
- **Slug** (TEXT, read-only, displayed with full URL)
- **Industry** (SELECT, editable)
- **Working Hours** (TIME, editable)
- **Currency** (RADIO, editable)

**Actions**:
- **"Save changes"**: Update organization settings
- **"Delete Organization"**: Show confirmation modal → Delete organization (requires password re-entry)

**Validations**:
- Same as onboarding company details

**Analytics Events**:
- `org_settings_viewed`
- `org_settings_updated`
- `org_delete_requested`
- `org_deleted`

---

### SETTINGS > TEAM MANAGEMENT

**Route**: `/settings/team`

**Layout** (Desktop 1024px+):
```
┌──────────────────────────────────────────────────────────────────┐
│  Settings                                                         │
├─────────────┬────────────────────────────────────────────────────┤
│             │  Team Management                    [+ Invite Team]│
│ Organization│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ Team        │                                                    │
│ Billing     │  Active Members (3)                                │
│ Profile     │                                                    │
│             │  ┌────────────────────────────────────────────────┐│
│             │  │ Rajesh Kumar (You)                           │ ││
│             │  │ rajesh@sharma.com                 Owner      │ ││
│             │  │ Joined Nov 10, 2025                          │ ││
│             │  └────────────────────────────────────────────────┘│
│             │                                                    │
│             │  ┌────────────────────────────────────────────────┐│
│             │  │ Amit Patel                                   │ ││
│             │  │ +91 98765 43210              Technician    ⋮│ ││
│             │  │ Joined Nov 11, 2025                          │ ││
│             │  │  [Edit]  [Change Role]  [Remove]             │ ││
│             │  └────────────────────────────────────────────────┘│
│             │                                                    │
│             │  ┌────────────────────────────────────────────────┐│
│             │  │ Priya Sharma                                 │ ││
│             │  │ priya@example.com            Coordinator   ⋮│ ││
│             │  │ Joined Nov 11, 2025                          │ ││
│             │  │  [Edit]  [Change Role]  [Remove]             │ ││
│             │  └────────────────────────────────────────────────┘│
│             │                                                    │
│             │  Pending Invites (2)                               │
│             │                                                    │
│             │  ┌────────────────────────────────────────────────┐│
│             │  │ Rahul Verma                                  │ ││
│             │  │ +91 98765 00000              Technician    ⋮│ ││
│             │  │ Invited Nov 11, 2025 • Expires in 5 days    │ ││
│             │  │  [Resend Invite]  [Cancel Invite]            │ ││
│             │  └────────────────────────────────────────────────┘│
│             │                                                    │
│             │  ┌────────────────────────────────────────────────┐│
│             │  │ Neha Singh                                   │ ││
│             │  │ neha@example.com             Coordinator   ⋮│ ││
│             │  │ Invited Nov 11, 2025 • Expires in 5 days    │ ││
│             │  │  [Resend Invite]  [Cancel Invite]            │ ││
│             │  └────────────────────────────────────────────────┘│
│             │                                                    │
└─────────────┴────────────────────────────────────────────────────┘
```

**Sections**:
1. **Active Members**: List of users in the organization
2. **Pending Invites**: List of sent invites that haven't been accepted

**Actions**:
- **"+ Invite Team"**: Open invite modal (same as onboarding team screen)
- **"Edit"**: Edit user details (name, contact)
- **"Change Role"**: Open role dropdown to change user role
- **"Remove"**: Remove user from organization (show confirmation)
- **"Resend Invite"**: Send invite SMS/email again
- **"Cancel Invite"**: Delete pending invite

**Validations**:
- Cannot remove yourself if you're the only owner
- Cannot change your own role if you're the only owner

**Analytics Events**:
- `team_management_viewed`
- `team_member_edited`
- `team_member_role_changed`
- `team_member_removed`
- `invite_resent`
- `invite_cancelled`

---

### SETTINGS > PENDING INVITES (Modal)

**Layout** (Modal overlay):
```
┌──────────────────────────────────────────────────────────────────┐
│                                                              [×] │
│  Pending Invites (2)                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Rahul Verma                                              │ │ │
│  │ +91 98765 00000                           Technician      │ │ │
│  │                                                            │ │ │
│  │ Invited: Nov 11, 2025 at 10:30 AM                         │ │ │
│  │ Expires: Nov 18, 2025 (5 days remaining)                  │ │ │
│  │                                                            │ │ │
│  │ Invite Code: 123456                          [Copy Code]  │ │ │
│  │ Invite Link: https://automet.app/join/abc123 [Copy Link] │ │ │
│  │                                                            │ │ │
│  │  [Resend SMS]  [Resend Email]  [Cancel Invite]            │ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Neha Singh                                               │ │ │
│  │ neha@example.com                          Coordinator      │ │ │
│  │                                                            │ │ │
│  │ Invited: Nov 11, 2025 at 10:32 AM                         │ │ │
│  │ Expires: Nov 18, 2025 (5 days remaining)                  │ │ │
│  │                                                            │ │ │
│  │ Invite Code: 654321                          [Copy Code]  │ │ │
│  │ Invite Link: https://automet.app/join/xyz789 [Copy Link] │ │ │
│  │                                                            │ │ │
│  │  [Resend Email]  [Cancel Invite]                          │ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    [Close]                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Fields**: None (display only)

**Actions**:
- **"Copy Code"**: Copy 6-digit invite code to clipboard
- **"Copy Link"**: Copy invite URL to clipboard
- **"Resend SMS"**: Send invite SMS again
- **"Resend Email"**: Send invite email again
- **"Cancel Invite"**: Delete pending invite (show confirmation)
- **"Close"**: Close modal

**Analytics Events**:
- `pending_invites_viewed`
- `invite_code_copied`
- `invite_link_copied`
- `invite_resent_sms`
- `invite_resent_email`

---

## 4. ANNOTATED UI SPEC

### Global Design Tokens

**Typography**:
- **Headings**: Inter / System Font, 600 weight
  - H1: 28px / 1.75rem
  - H2: 24px / 1.5rem
  - H3: 20px / 1.25rem
- **Body**: Inter / System Font, 400 weight
  - Body: 16px / 1rem
  - Small: 14px / 0.875rem
  - Tiny: 12px / 0.75rem

**Colors**:
- **Primary**: #2563eb (Blue 600)
- **Success**: #16a34a (Green 600)
- **Error**: #dc2626 (Red 600)
- **Warning**: #f59e0b (Amber 500)
- **Gray Scale**:
  - Gray 900: #111827
  - Gray 700: #374151
  - Gray 600: #4b5563
  - Gray 500: #6b7280
  - Gray 400: #9ca3af
  - Gray 300: #d1d5db
  - Gray 200: #e5e7eb
  - Gray 100: #f3f4f6
  - Gray 50: #f9fafb

**Spacing**:
- **Base unit**: 4px
- **Scale**: 4, 8, 12, 16, 24, 32, 40, 48, 64px

**Border Radius**:
- **Small**: 4px
- **Medium**: 8px
- **Large**: 12px
- **Full**: 9999px (pills)

**Shadows**:
- **Small**: 0 1px 2px rgba(0,0,0,0.05)
- **Medium**: 0 2px 10px rgba(0,0,0,0.1)
- **Large**: 0 4px 20px rgba(0,0,0,0.15)

### Component Specifications

#### Button - Primary
```css
padding: 12px 24px
background: #2563eb
color: #ffffff
border: none
border-radius: 8px
font-size: 16px
font-weight: 500
cursor: pointer
transition: background 0.2s

:hover {
  background: #1d4ed8
}

:disabled {
  background: #9ca3af
  cursor: not-allowed
}
```

#### Button - Secondary
```css
padding: 12px 24px
background: #ffffff
color: #374151
border: 1px solid #d1d5db
border-radius: 8px
font-size: 16px
font-weight: 500
cursor: pointer
transition: all 0.2s

:hover {
  background: #f9fafb
  border-color: #9ca3af
}
```

#### Input Field
```css
width: 100%
padding: 10px 12px
border: 1px solid #d1d5db
border-radius: 8px
font-size: 16px
color: #111827
background: #ffffff
transition: border-color 0.2s

:focus {
  outline: none
  border-color: #2563eb
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1)
}

:error {
  border-color: #dc2626
}

::placeholder {
  color: #9ca3af
}
```

#### Select Dropdown
```css
width: 100%
padding: 10px 12px
border: 1px solid #d1d5db
border-radius: 8px
font-size: 16px
color: #111827
background: #ffffff url('chevron-down.svg') no-repeat right 12px center
appearance: none
cursor: pointer

:focus {
  outline: none
  border-color: #2563eb
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1)
}
```

#### Progress Bar
```css
/* Container */
width: 100%
height: 6px
background: #e5e7eb
border-radius: 3px
overflow: hidden

/* Fill */
height: 100%
background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)
border-radius: 3px
transition: width 0.3s ease
```

#### Error Message
```css
padding: 12px 16px
margin-bottom: 16px
background: #fee2e2
color: #991b1b
border-radius: 8px
font-size: 14px
border-left: 4px solid #dc2626
```

#### Success Message
```css
padding: 12px 16px
margin-bottom: 16px
background: #dcfce7
color: #166534
border-radius: 8px
font-size: 14px
border-left: 4px solid #16a34a
```

---

## 5. DEVELOPER HANDOFF

### A. API ENDPOINTS

#### 1. Create Organization

**Endpoint**: `POST /api/onboarding/create-organization`

**Description**: Creates organization and user profile after signup

**Authentication**: Required (session-based)

**Request**:
```typescript
{
  organizationName: string,     // 2-200 chars
  industry: string,              // from dropdown
  workingHours: {
    from: string,                // HH:MM format
    to: string                   // HH:MM format
  },
  currency: string               // 'INR' | 'USD' | 'OTHER'
}
```

**Response - Success (200)**:
```typescript
{
  success: true,
  organization: {
    id: string,                  // UUID
    name: string,
    slug: string,                // URL-friendly
    settings: {
      industry: string,
      working_hours: {
        from: string,
        to: string
      },
      currency: string
    },
    created_at: string           // ISO 8601
  }
}
```

**Response - Error (400/500)**:
```typescript
{
  success: false,
  error: string                  // Error message
}
```

**Business Logic**:
- Generate unique slug from organization name
- If slug collision, append number (e.g., sharma-services-2)
- Use service_role to bypass RLS during creation
- Create organization first, then user profile
- If user creation fails, rollback organization
- Set user role to 'owner'

---

#### 2. Invite Team

**Endpoint**: `POST /api/onboarding/invite-team`

**Description**: Send invites to team members via SMS/Email

**Authentication**: Required (must be owner or coordinator)

**Request**:
```typescript
{
  invites: [
    {
      name: string,              // 2-100 chars
      contact: string,           // phone (+91...) or email
      contactType: 'phone' | 'email',
      role: 'technician' | 'coordinator'
    }
  ]
}
```

**Response - Success (200)**:
```typescript
{
  success: true,
  invitesSent: number,
  inviteDetails: [
    {
      id: string,                // invite UUID
      name: string,
      contact: string,
      role: string,
      inviteCode: string,        // 6-digit code
      inviteLink: string,        // https://automet.app/join/...
      expiresAt: string          // ISO 8601 (7 days from now)
    }
  ],
  invitesFailed: [
    {
      contact: string,
      reason: string
    }
  ]
}
```

**Response - Error (400/500)**:
```typescript
{
  success: false,
  error: string
}
```

**Business Logic**:
- Generate 6-digit numeric invite code (unique)
- Generate invite token (UUID) for URL
- Store invite in `user_invites` table
- Set expiry to 7 days from now
- Send SMS if contactType is 'phone'
- Send email if contactType is 'email'
- SMS/WhatsApp message template:
  ```
  You've been invited to join [Company] on Automet.

  Tap to join: https://automet.app/join/[token]
  or use code: [6-digit-code]

  Invited by: [Owner Name]
  Role: [Technician/Coordinator]
  ```

---

#### 3. Create Customer

**Endpoint**: `POST /api/onboarding/create-customer`

**Description**: Create first customer during onboarding

**Authentication**: Required (must be owner or coordinator)

**Request**:
```typescript
{
  name: string,                  // 2-200 chars
  address: string,               // required
  contactPerson?: string,        // optional, 2-100 chars
  phone?: string                 // optional, +91 format
}
```

**Response - Success (200)**:
```typescript
{
  success: true,
  customer: {
    id: string,                  // UUID
    name: string,
    address: string,
    contactPerson?: string,
    phone?: string,
    created_at: string           // ISO 8601
  }
}
```

**Response - Error (400/500)**:
```typescript
{
  success: false,
  error: string
}
```

**Business Logic**:
- Create entry in `clients` table
- Associate with user's org_id
- Validate phone format if provided

---

#### 4. Create Job

**Endpoint**: `POST /api/onboarding/create-job`

**Description**: Create first job during onboarding

**Authentication**: Required (must be owner or coordinator)

**Request**:
```typescript
{
  customerId: string,            // UUID from previous step
  title: string,                 // 1-200 chars
  technicianId?: string,         // UUID, optional
  scheduledAt: string            // ISO 8601, must be future
}
```

**Response - Success (200)**:
```typescript
{
  success: true,
  job: {
    id: string,                  // UUID
    title: string,
    status: 'scheduled',
    customerId: string,
    technicianId?: string,
    scheduledAt: string,         // ISO 8601
    created_at: string           // ISO 8601
  }
}
```

**Response - Error (400/500)**:
```typescript
{
  success: false,
  error: string
}
```

**Business Logic**:
- Create entry in `jobs` table
- Set status to 'scheduled'
- If technicianId provided, create entry in `job_assignments`
- Validate scheduledAt is in the future
- Increment jobs_created_count in usage_counters

---

#### 5. Accept Invite

**Endpoint**: `POST /api/invites/accept`

**Description**: Accept invite using join code or token

**Authentication**: Required (new user must sign up first)

**Request**:
```typescript
{
  code?: string,                 // 6-digit code
  token?: string                 // invite token from URL
}
// Must provide either code or token
```

**Response - Success (200)**:
```typescript
{
  success: true,
  organization: {
    id: string,
    name: string
  },
  role: string,                  // 'technician' | 'coordinator'
  redirectTo: string             // '/dashboard'
}
```

**Response - Error (400/500)**:
```typescript
{
  success: false,
  error: string                  // 'Invalid code', 'Invite expired', etc.
}
```

**Business Logic**:
- Lookup invite by code or token
- Check if invite is expired (> 7 days)
- Check if invite is already accepted
- Update user record with org_id and role
- Mark invite as accepted
- Delete invite record

---

#### 6. Verify Invite

**Endpoint**: `GET /api/invites/verify/:token`

**Description**: Get invite details before accepting

**Authentication**: Not required

**Request**: None (token in URL)

**Response - Success (200)**:
```typescript
{
  success: true,
  invite: {
    organizationName: string,
    role: string,
    invitedBy: string,           // Owner name
    expiresAt: string,           // ISO 8601
    isExpired: boolean
  }
}
```

**Response - Error (404)**:
```typescript
{
  success: false,
  error: 'Invite not found'
}
```

---

### B. DATA MODEL SKETCH

#### New Table: user_invites

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

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'cancelled', 'expired')),

  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_invites_org_id ON user_invites(org_id);
CREATE INDEX idx_user_invites_invite_code ON user_invites(invite_code) WHERE status = 'pending';
CREATE INDEX idx_user_invites_invite_token ON user_invites(invite_token) WHERE status = 'pending';
CREATE INDEX idx_user_invites_status ON user_invites(org_id, status);
CREATE INDEX idx_user_invites_expires_at ON user_invites(expires_at) WHERE status = 'pending';

COMMENT ON TABLE user_invites IS 'Team member invitations with SMS/email codes';
COMMENT ON COLUMN user_invites.invite_code IS '6-digit numeric code for manual entry';
COMMENT ON COLUMN user_invites.invite_token IS 'UUID token for invite link';
COMMENT ON COLUMN user_invites.expires_at IS 'Invite expires after 7 days';
```

#### Modified Table: organizations (add settings fields)

```sql
-- No schema change needed; use existing JSONB settings column:
-- settings = {
--   "industry": "hvac",
--   "working_hours": {
--     "from": "09:00",
--     "to": "18:00"
--   },
--   "currency": "INR"
-- }
```

#### Modified Table: users (add onboarding metadata)

```sql
-- Add metadata column if not exists (already exists based on profile.tsx)
ALTER TABLE users ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Onboarding completion tracking:
-- metadata = {
--   "onboarding_completed": true,
--   "onboarding_completed_at": "2025-11-11T10:30:00Z",
--   "onboarding_team_invited_count": 2,
--   "onboarding_time_seconds": 420
-- }
```

---

### C. ANALYTICS EVENTS TO TRACK

#### Event Schema

All events should follow this structure:

```typescript
{
  event: string,                 // Event name
  user_id: string,               // UUID
  org_id?: string,               // UUID (if applicable)
  timestamp: string,             // ISO 8601
  properties: object             // Event-specific metadata
}
```

#### Event List

**Signup & Onboarding Flow**:
1. `signup_started` - User lands on signup page
2. `signup_completed` - User successfully creates account
   - Properties: `{ method: 'email' | 'google' }`
3. `signup_failed` - Signup attempt failed
   - Properties: `{ error: string }`

4. `company_details_viewed` - User lands on company details page
5. `company_details_completed` - User completes company setup
   - Properties: `{ industry: string, currency: string }`
6. `company_details_failed` - Company creation failed
   - Properties: `{ error: string }`

7. `team_invite_viewed` - User lands on team invite page
8. `team_invite_sent` - User sends team invites
   - Properties: `{ invite_count: number, technician_count: number, coordinator_count: number }`
9. `team_invite_skipped` - User skips team invite step
10. `team_invite_failed` - Invite sending failed
    - Properties: `{ error: string, failed_count: number }`

11. `first_customer_viewed` - User lands on customer creation page
12. `first_customer_created` - User creates first customer
    - Properties: `{ has_contact_person: boolean, has_phone: boolean }`
13. `first_customer_failed` - Customer creation failed
    - Properties: `{ error: string }`

14. `first_job_viewed` - User lands on job creation page
15. `first_job_created` - User creates first job
    - Properties: `{ has_technician_assigned: boolean, scheduled_hours_from_now: number }`
16. `first_job_failed` - Job creation failed
    - Properties: `{ error: string }`

17. `onboarding_completed` - User completes entire onboarding flow
    - Properties: `{ total_time_seconds: number, team_invited_count: number, first_job_created: boolean }`

**Invite Journey**:
18. `invite_sent` - Invite sent to team member
    - Properties: `{ invite_id: string, contact_type: 'phone' | 'email', role: string }`
19. `invite_link_clicked` - Invite link clicked (via URL tracking)
    - Properties: `{ invite_id: string, source: 'sms' | 'email' | 'direct' }`
20. `invite_accepted` - Invite accepted by recipient
    - Properties: `{ invite_id: string, acceptance_method: 'code' | 'link', time_to_accept_hours: number }`
21. `invite_expired` - Invite expired without acceptance (background job)
    - Properties: `{ invite_id: string }`

**Dashboard & Post-Onboarding**:
22. `dashboard_viewed` - User lands on dashboard
    - Properties: `{ is_first_visit: boolean }`
23. `quick_tips_viewed` - Quick tips sidebar shown
24. `quick_tips_item_clicked` - Quick tip item clicked
    - Properties: `{ item: string }`
25. `quick_tips_dismissed` - User dismisses quick tips

**Team Management**:
26. `team_management_viewed` - User opens team management page
27. `team_member_role_changed` - User changes team member role
    - Properties: `{ user_id: string, old_role: string, new_role: string }`
28. `team_member_removed` - User removes team member
    - Properties: `{ user_id: string, role: string }`
29. `invite_resent` - User resends invite
    - Properties: `{ invite_id: string, method: 'sms' | 'email' }`
30. `invite_cancelled` - User cancels pending invite
    - Properties: `{ invite_id: string }`

**Settings**:
31. `org_settings_viewed` - User opens organization settings
32. `org_settings_updated` - User updates org settings
    - Properties: `{ fields_changed: string[] }`
33. `org_delete_requested` - User clicks delete organization
34. `org_deleted` - Organization deleted

---

### D. IMPLEMENTATION NOTES

#### Authentication Flow
- Use Supabase Auth for signup/login
- Support email/password (phase 1) and Google OAuth (phase 2)
- Store session in cookies for SSR support
- Redirect logic:
  - If not authenticated: → `/login`
  - If authenticated but no org_id: → `/onboarding/company`
  - If authenticated with org_id: → `/dashboard`

#### SMS/WhatsApp Integration
- **Phase 1**: Use SMS gateway (e.g., Twilio, MSG91, Exotel)
- **Phase 2**: WhatsApp Business API for invites
- **Fallback**: Email if SMS fails
- **Rate Limiting**: Max 10 invites per hour per organization

#### Invite Code Generation
```typescript
function generateInviteCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateInviteToken(): string {
  return crypto.randomUUID();
}
```

#### Offline Support (for Technician Join Flow)
- Use Service Worker to cache join page
- Queue invite acceptance if offline
- Show "Invite will be accepted when you're back online" message
- Sync when connection restored

#### Mobile Responsiveness Breakpoints
```css
/* Mobile-first (default) */
@media (min-width: 375px) { /* Base mobile */ }

/* Tablet */
@media (min-width: 768px) { /* Tablet portrait */ }

/* Desktop */
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1280px) { /* Large desktop */ }
```

#### Form Validation Library
- Use React Hook Form for form state management
- Zod for schema validation
- Example:
```typescript
const companySchema = z.object({
  organizationName: z.string().min(2).max(200),
  industry: z.enum(['hvac', 'electrical', ...]),
  workingHours: z.object({
    from: z.string().regex(/^\d{2}:\d{2}$/),
    to: z.string().regex(/^\d{2}:\d{2}$/)
  }).refine(data => data.to > data.from, {
    message: "End time must be after start time"
  }),
  currency: z.enum(['INR', 'USD', 'OTHER'])
});
```

#### Error Handling
- Use toast notifications for transient errors
- Inline error messages for form validation
- Global error boundary for unexpected errors
- Log errors to analytics platform (e.g., Sentry)

---

## 6. ACCEPTANCE CRITERIA CHECKLIST

### User Journey
- [ ] New user can complete entire onboarding flow in <10 minutes
- [ ] User can skip team invites and proceed to customer creation
- [ ] User is redirected correctly based on authentication and org status
- [ ] User receives confirmation at each step (visual feedback)
- [ ] Progress bar shows correct percentage at each step

### Company Setup
- [ ] User can create organization with name, industry, hours, currency
- [ ] Slug is generated automatically and handles collisions
- [ ] User cannot proceed without filling required fields
- [ ] Error messages are clear and actionable
- [ ] Company details are saved to database correctly

### Team Invites
- [ ] User can add multiple team members (up to 10)
- [ ] User can remove team member rows before sending
- [ ] User can skip team invites entirely
- [ ] Invites are sent via SMS for phone contacts
- [ ] Invites are sent via email for email contacts
- [ ] Invite contains 6-digit code and clickable link
- [ ] Invite expires after 7 days
- [ ] Duplicate phone/email validation works correctly

### Invite Acceptance (Technician)
- [ ] Technician can click invite link and land on accept page
- [ ] Technician can manually enter 6-digit code
- [ ] Technician can see company name and role before accepting
- [ ] Technician must sign up/login before accepting
- [ ] Technician is added to organization with correct role
- [ ] Expired invites show appropriate error message

### Customer Creation
- [ ] User can create customer with name, address, contact, phone
- [ ] Customer is saved to database with org_id
- [ ] User cannot proceed without filling required fields
- [ ] Customer data is carried forward to job creation

### Job Creation
- [ ] Customer field is pre-filled from previous step
- [ ] Job title has default value ("Sample Maintenance Visit")
- [ ] User can assign technician from invite list (if any)
- [ ] User can schedule job for future date/time
- [ ] Default schedule is next working day at 10:00 AM
- [ ] Job is created with status 'scheduled'
- [ ] Job assignment is created if technician assigned

### Completion & Dashboard
- [ ] User sees setup complete screen with summary
- [ ] Summary shows dynamic counts (team invited, etc.)
- [ ] User can click "View my first job" to see job details
- [ ] User can click "Explore dashboard" to go to dashboard
- [ ] Quick tips sidebar appears on first dashboard visit
- [ ] Quick tips can be dismissed permanently

### Settings (Post-Onboarding)
- [ ] Owner can view organization settings
- [ ] Owner can update company name, industry, hours, currency
- [ ] Owner can view team management page
- [ ] Owner can see active members and pending invites
- [ ] Owner can resend invites
- [ ] Owner can cancel pending invites
- [ ] Owner can change team member roles
- [ ] Owner can remove team members (except last owner)

### Mobile Responsiveness
- [ ] All screens render correctly on 375px width (mobile)
- [ ] All screens render correctly on 768px width (tablet)
- [ ] All screens render correctly on 1024px+ width (desktop)
- [ ] Touch targets are at least 44x44px on mobile
- [ ] Forms are easy to fill on mobile keyboards
- [ ] No horizontal scrolling on any screen size

### Analytics
- [ ] All 34 events are tracked correctly
- [ ] Event properties match specification
- [ ] Events fire at correct times (not duplicate/missing)
- [ ] User_id and org_id are included where applicable
- [ ] Timestamps are in ISO 8601 format

### Performance
- [ ] Onboarding pages load in <2 seconds
- [ ] API calls return in <1 second (median)
- [ ] No layout shifts (CLS < 0.1)
- [ ] Images are optimized and lazy-loaded
- [ ] Forms respond instantly to input (<100ms)

### Security
- [ ] All API routes require authentication (except invite verify)
- [ ] RLS policies prevent cross-org data access
- [ ] Invite codes are random and unique
- [ ] Passwords meet minimum requirements (8 chars)
- [ ] Session tokens are httpOnly cookies
- [ ] CSRF protection enabled

### Accessibility
- [ ] All form fields have labels
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Error messages are announced by screen readers
- [ ] Color contrast meets WCAG AA standards (4.5:1)
- [ ] Focus indicators are visible

### Error Handling
- [ ] Network errors show user-friendly messages
- [ ] Validation errors appear inline
- [ ] API errors are logged to monitoring system
- [ ] User can retry failed operations
- [ ] Loading states prevent duplicate submissions

---

## 7. SUCCESS METRICS (First 30 Days)

### Primary Metrics

**1. Onboarding Completion Rate**
- **Target**: ≥70% of signups complete full onboarding
- **Measurement**:
  ```
  Completion Rate = (onboarding_completed events / signup_completed events) * 100
  ```
- **Success Criteria**: 70% or higher indicates good UX
- **Red Flag**: <50% suggests friction in onboarding flow

**Breakdown by Step**:
- Signup → Company Details: ≥90%
- Company Details → Team Invite: ≥85%
- Team Invite → Customer: ≥80% (accounting for skips)
- Customer → Job: ≥85%
- Job → Complete: ≥90%

---

**2. Time to First Job Created**
- **Target**: Median time <10 minutes
- **Measurement**:
  ```
  Time = first_job_created.timestamp - signup_completed.timestamp
  ```
- **Success Criteria**:
  - p50 (median): ≤10 minutes
  - p90: ≤20 minutes
- **Red Flag**: p50 >15 minutes suggests onboarding is too long

**Breakdown**:
- Signup → Company: <2 minutes
- Company → Team: <3 minutes (or skip)
- Team → Customer: <2 minutes
- Customer → Job: <2 minutes
- Job → Complete: <1 minute

---

**3. Team Invite Acceptance Rate**
- **Target**: ≥50% of invites accepted within 7 days
- **Measurement**:
  ```
  Acceptance Rate = (invite_accepted events / invite_sent events) * 100
  ```
- **Success Criteria**: 50% or higher indicates good invite UX
- **Red Flag**: <30% suggests invite message/flow issues

**Time to Accept**:
- p50 (median): <24 hours
- p90: <72 hours

**By Contact Type**:
- Phone/SMS: ≥60% (higher due to immediacy)
- Email: ≥40% (lower due to email overload)

---

### Secondary Metrics

**4. Signup Method Distribution**
- Email/Password: Expected 100% (Google OAuth in phase 2)
- Track for future comparison

**5. Team Invite Skip Rate**
- **Target**: <30% skip team invite step
- **Measurement**: `team_invite_skipped / team_invite_viewed * 100`
- Indicates whether owners see value in team invites

**6. Invite Resend Rate**
- **Target**: <10% of invites require resend
- **Measurement**: `invite_resent / invite_sent * 100`
- High resend rate suggests delivery or clarity issues

**7. First Job Assignment Rate**
- **Target**: ≥40% of first jobs have technician assigned
- **Measurement**: `first_job_created (with has_technician_assigned=true) / first_job_created * 100`
- Indicates whether team invite flow is successful

**8. Quick Tips Engagement**
- **Target**: ≥60% view quick tips, ≥20% click at least one item
- **Measurement**:
  - View Rate: `quick_tips_viewed / dashboard_viewed * 100`
  - Engagement Rate: `quick_tips_item_clicked / quick_tips_viewed * 100`

**9. Mobile vs Desktop Signups**
- Track device type (mobile, tablet, desktop)
- Expected: 60% mobile, 40% desktop (based on target persona)

**10. Geographic Distribution**
- Track signups by city/state (from IP or user input)
- Validate India-first focus

---

### Cohort Analysis (Weekly Cohorts)

Track retention by signup week:
- **Week 1 Retention**: % of users who return in first week
  - Target: ≥50%
- **Active Usage**: % of users who create ≥1 additional job in first week
  - Target: ≥30%

---

### Funnel Drop-off Analysis

Identify where users abandon onboarding:
```
Signup (100%)
  ↓ -10%
Company Details (90%)
  ↓ -5%
Team Invite (85%)
  ↓ -5%
Customer (80%)
  ↓ -5%
Job (75%)
  ↓ -5%
Complete (70%)
```

**Red Flags**:
- >15% drop-off at any single step
- >10% drop-off at Customer or Job step (indicates confusion)

---

### Error Rate Monitoring

Track error events:
- `signup_failed`: <5% of signup attempts
- `company_details_failed`: <3% of submissions
- `team_invite_failed`: <5% of invite sends
- `first_customer_failed`: <2% of submissions
- `first_job_failed`: <2% of submissions

High error rates indicate technical issues or validation problems.

---

### Dashboard & Reporting

**Weekly Dashboard** (First 30 Days):
```
┌─────────────────────────────────────────────────────────────┐
│ ONBOARDING METRICS - Week of Nov 10, 2025                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ PRIMARY METRICS                                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                             │
│ Onboarding Completion Rate:      74% ✓ (Target: 70%)      │
│ Time to First Job (Median):       8m 32s ✓ (Target: <10m) │
│ Invite Acceptance Rate:          52% ✓ (Target: 50%)      │
│                                                             │
│ SECONDARY METRICS                                           │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                             │
│ Team Invite Skip Rate:           28% ✓ (Target: <30%)     │
│ First Job Assignment Rate:       42% ✓ (Target: >40%)     │
│ Quick Tips Engagement:           65% viewed, 23% clicked   │
│                                                             │
│ SIGNUPS THIS WEEK                                           │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                             │
│ Total Signups:                   45                        │
│ Completed Onboarding:            33 (74%)                  │
│ Mobile Signups:                  27 (60%)                  │
│                                                             │
│ FUNNEL DROP-OFF                                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                             │
│ Signup:              45 (100%)                              │
│ Company Details:     42 (93%)   ↓ -7%                      │
│ Team Invite:         38 (84%)   ↓ -9%                      │
│ Customer:            36 (80%)   ↓ -5%                      │
│ Job:                 34 (76%)   ↓ -6%                      │
│ Complete:            33 (74%)   ↓ -3%                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Action Items Based on Metrics

**If Completion Rate <70%**:
- Analyze funnel drop-off by step
- Review error logs for technical issues
- Conduct user interviews to identify friction
- A/B test simplified steps

**If Time to First Job >10 minutes**:
- Identify slowest steps (from event timestamps)
- Reduce required fields
- Pre-fill more data
- Simplify copy/instructions

**If Invite Acceptance Rate <50%**:
- Review SMS/email message copy
- Test different call-to-action phrasing
- Check delivery rates (SMS gateway)
- Add reminder notifications (after 24h)

---

## 8. NEXT STEPS & PHASE 2 FEATURES

### Phase 1 Priorities (MVP - Weeks 1-4)
1. ✅ Complete mobile-first onboarding flow (8 screens)
2. ✅ Implement invite system (SMS + 6-digit code)
3. ✅ Build web dashboard (Settings > Team)
4. ✅ Set up analytics tracking (34 events)
5. ✅ Deploy and monitor metrics

### Phase 2 Enhancements (Weeks 5-8)
1. **Google OAuth Integration**
   - Add "Continue with Google" button
   - Handle OAuth callback
   - Merge accounts if email exists

2. **WhatsApp Invites**
   - WhatsApp Business API integration
   - Rich message templates with images
   - Delivery status tracking

3. **Phone-Based Signup (OTP)**
   - SMS OTP verification
   - Phone number as primary identifier
   - Email optional for technicians

4. **Onboarding Customization**
   - Industry-specific templates
   - Pre-filled job types by industry
   - Custom fields per industry

5. **Invite Reminders**
   - Automatic reminder after 24 hours
   - Resend invite button in dashboard
   - Expiry warning (1 day before)

### Phase 3 Advanced Features (Weeks 9-12)
1. **Multi-language Support**
   - Hindi translation
   - Language switcher
   - Localized date/time formats

2. **Bulk Invite Import**
   - CSV upload for team members
   - Excel template download
   - Validation and preview

3. **Onboarding Video Tutorial**
   - Embedded video in welcome screen
   - Step-by-step guide
   - Skip option

4. **Referral Program**
   - Invite other companies
   - Referral tracking
   - Incentives (free months, features)

5. **Progressive Profiling**
   - Collect additional data over time
   - Show completion percentage
   - Unlock features as profile completes

---

## APPENDIX A: FILE STRUCTURE

```
/pages
  /onboarding
    welcome.tsx              # Screen 1: Welcome
    company.tsx              # Screen 3: Company details (replaces organization.tsx)
    team.tsx                 # Screen 4: Add team (NEW)
    customer.tsx             # Screen 5: Add first customer (NEW)
    job.tsx                  # Screen 6: Create first job (NEW)
    complete.tsx             # Screen 7: Setup complete (replaces success.tsx)

  /api
    /onboarding
      create-organization.ts # Update with working hours, currency
      invite-team.ts         # NEW: Send invites
      create-customer.ts     # NEW: Create customer
      create-job.ts          # NEW: Create job

    /invites
      accept.ts              # NEW: Accept invite
      verify/[token].ts      # NEW: Verify invite

  /settings
    organization.tsx         # Web: Org settings
    team.tsx                 # Web: Team management

  /join
    [code].tsx               # NEW: Join via invite code/link

  signup.tsx                 # Screen 2: Signup (update with phone field)

/components
  /onboarding
    ProgressBar.tsx          # Progress indicator
    InviteRow.tsx            # Team member invite row
    QuickTipsSidebar.tsx     # Quick tips component

  /forms
    CompanyDetailsForm.tsx
    TeamInviteForm.tsx
    CustomerForm.tsx
    JobForm.tsx

/lib
  analytics.ts               # Analytics tracking helper
  invite.ts                  # Invite code/token generation
  sms.ts                     # SMS sending helper
  validation.ts              # Form validation schemas (Zod)

/migrations
  20251112_001_create_user_invites.sql        # NEW: User invites table
  20251112_001_create_user_invites.down.sql   # Rollback

/types
  onboarding.ts              # TypeScript types for onboarding
  analytics.ts               # Analytics event types
```

---

## APPENDIX B: MICROCOPY REFERENCE

All user-facing text in one place for easy reference and translation:

### Welcome Screen
- Heading: "Simplify field operations. Track jobs, technicians, and assets — all in one place."
- CTA: "Get started"
- Link: "Already have an account? Log in"

### Signup Screen
- Heading: "Create your account"
- Fields: "Full Name", "Email", "Password", "Phone (Optional)"
- Password helper: "At least 8 characters"
- CTA: "Create account"
- Terms: "By creating an account, you agree to our Terms of Service and Privacy Policy"
- OAuth: "Continue with Google (Coming soon)"

### Company Details Screen
- Heading: "Tell us about your company"
- Progress: "Step 1 of 5" (20%)
- Fields: "Company Name", "Industry", "Working Hours", "Currency"
- Helper: "From", "To"
- CTA: "Save & continue"

### Team Invite Screen
- Heading: "Invite your team"
- Subheading: "Add technicians and coordinators. You can skip this and add them later from Settings."
- Progress: "Step 2 of 5" (40%)
- Fields: "Name", "Phone or email", "Role"
- CTA: "Send invites"
- Link: "Skip for now"
- Button: "+ Add another team member", "× Remove"

### Customer Screen
- Heading: "Add your first customer"
- Subheading: "Create a customer to assign jobs."
- Progress: "Step 3 of 5" (60%)
- Fields: "Customer Name", "Address", "Contact Person", "Phone"
- CTA: "Save customer"

### Job Screen
- Heading: "Create your first job"
- Subheading: "Assign a job to see Automet in action."
- Progress: "Step 4 of 5" (80%)
- Fields: "Customer", "Job Title", "Assign Technician", "Schedule"
- Helper: "(Pre-filled from previous step)", "No technicians yet - assign later from dashboard"
- CTA: "Create & assign job"

### Complete Screen
- Heading: "Setup complete!"
- Subheading: "You've successfully set up your organization. Your first job is ready to go!"
- Progress: "Step 5 of 5" (100%)
- Summary: "✓ Company created", "✓ Team invited (X members)", "✓ First customer added", "✓ First job created"
- CTA: "View my first job", "Explore dashboard"
- Link: "Need help? Check out Quick Tips"

### Quick Tips Sidebar
- Heading: "Quick Tips"
- Items:
  - "Add more customers" → "Grow your client base"
  - "Create job sites" → "Track customer locations"
  - "Add assets for tracking" → "Monitor equipment maintenance"
  - "Invite more team members" → "Go to Settings > Team"
  - "Set up billing" → "Manage subscriptions"
- Button: "Hide tips"

### SMS/WhatsApp Invite
```
You've been invited to join [Company Name] on Automet.

Tap to join: https://automet.app/join/abc123
or use code: 123456

Invited by: [Owner Name]
Role: [Technician/Coordinator]
```

### Error Messages
- "This email is already registered. Try logging in instead."
- "Password must be at least 8 characters"
- "Unable to create account. Please check your connection and try again."
- "Company name must be at least 2 characters"
- "End time must be after start time"
- "An organization with this name already exists. Try a different name."
- "Please enter a valid phone number with country code (e.g., +91 98765 43210)"
- "Please enter a valid email address"
- "Please select a role for each team member"
- "This phone/email is already registered or invited"
- "Unable to send invite to [name]. Please check the contact details and try again."
- "Customer name must be at least 2 characters"
- "Please enter the customer's address"
- "Please enter a job title"
- "Scheduled time must be in the future"

---

## APPENDIX C: DESIGN ASSETS

### Logo & Branding
- Logo: Automet wordmark (blue #2563eb)
- Icon: Simplified AM monogram
- Favicon: 16x16, 32x32, 64x64 PNG

### Illustrations
- Welcome screen: Field workers with mobile devices (line art style, blue accent)
- Success screen: Checkmark in circle (green #16a34a)

### Icons (Feather Icons)
- Check: ✓ (success, completed items)
- X: × (remove, close)
- Chevron Down: ▼ (dropdowns)
- Plus: + (add items)
- Arrow Right: → (CTAs)
- Eye: 👁 (password toggle)
- Calendar: 📅 (date picker)
- Clock: 🕐 (time picker)
- User: 👤 (user profile)
- Users: 👥 (team)
- Briefcase: 💼 (jobs)
- MapPin: 📍 (locations)
- Settings: ⚙️ (settings)

### Color Palette
- Primary: #2563eb (Blue 600)
- Primary Dark: #1d4ed8 (Blue 700)
- Success: #16a34a (Green 600)
- Error: #dc2626 (Red 600)
- Warning: #f59e0b (Amber 500)
- Gray Scale: See Design Tokens above

---

## CONCLUSION

This specification provides a complete blueprint for implementing a mobile-first, India-focused onboarding wizard that takes users from signup to first job creation in <10 minutes.

**Key Success Factors**:
1. **Mobile-first design**: 60% of users will sign up on mobile
2. **Minimal friction**: Skip options, pre-filled data, smart defaults
3. **Clear value**: Users create first job as part of onboarding
4. **Team collaboration**: SMS invites with 6-digit codes for technicians
5. **Data-driven**: 34 analytics events to measure and optimize

**Next Steps**:
1. Review this spec with design and engineering teams
2. Create high-fidelity mockups in Figma (optional)
3. Set up analytics infrastructure (Mixpanel, Amplitude, or PostHog)
4. Implement Phase 1 features in 4-week sprint
5. Launch to beta users and monitor metrics
6. Iterate based on data and feedback

**Questions? Contact**: [Your Name/Team]
**Last Updated**: 2025-11-11
**Version**: 1.0
