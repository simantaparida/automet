# Automet - Setup Instructions

## Quick Start Guide

Your Automet MVP has **Module 1 (Database)** and **Module 2 (Authentication)** complete! Follow these steps to get everything running.

---

## ✅ Current Status

- **Database**: Connected with demo data (10 jobs, 3 clients, 8 sites, 10 assets, 8 inventory items)
- **Server**: Running at http://localhost:3000
- **Module 1**: Complete (Database schema, migrations, RLS policies, demo data)
- **Module 2**: Complete (Authentication system with email/password and Google OAuth)

---

## 🚀 Setup Steps

### Step 1: Run the Auth Trigger (REQUIRED)

This creates a database trigger that automatically creates a `public.users` record when someone signs up.

1. Go to [Supabase Dashboard](https://app.supabase.com/project/dogzgbppyiokvipvsgln)
2. Navigate to **SQL Editor**
3. Open the file `CREATE_AUTH_TRIGGER.sql` from your project
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click **Run**

You should see: "Success. No rows returned"

---

### Step 2: Configure Google OAuth (Optional)

**In Supabase Dashboard:**

1. Go to **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Toggle to **Enable**
4. Enter your Google OAuth credentials:
   - **Client ID**: Get from your `.env.local` file (NEXT_PUBLIC_GOOGLE_CLIENT_ID)
   - **Client Secret**: Get from your `.env.local` file (GOOGLE_CLIENT_SECRET)
5. Click **Save**

**In Google Cloud Console:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   ```
   https://dogzgbppyiokvipvsgln.supabase.co/auth/v1/callback
   ```
5. Click **Save**

---

### Step 3: (Optional) Disable Email Confirmation for Development

To skip email verification during signup (recommended for development):

1. In Supabase Dashboard → **Authentication** → **Settings**
2. Scroll to **Auth Confirmation Settings**
3. **Uncheck** "Enable email confirmations"
4. Click **Save**

---

### Step 4: Create Your First User

**Option A: Via Signup Page (Recommended)**

1. Go to http://localhost:3000/signup
2. Enter:
   - Email: Your email
   - Password: At least 6 characters
   - Confirm Password: Same as above
3. Click "Sign up with Email"
4. If email confirmation is disabled, you can login immediately
5. If enabled, check your email and click the confirmation link

**Option B: Via Supabase Dashboard**

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Enter:
   - Email: `test@example.com`
   - Password: `Test123!`
   - Auto Confirm User: **Yes**
4. Click **Create user**
5. The trigger will automatically create a `public.users` record

---

### Step 5: (Optional) Add Demo Users for Display

Run `ADD_DEMO_USERS_MANUAL.sql` in Supabase SQL Editor to add 4 demo users.

**Note**: These users are for display only and cannot log in (no `auth.users` records).

---

## 🔐 Test Authentication

### Test Login
1. Go to http://localhost:3000
2. You'll be redirected to `/login`
3. Enter your credentials
4. Click "Sign in with Email"
5. Should redirect to `/dashboard`

### Test Google OAuth (if configured)
1. Go to http://localhost:3000/login
2. Click "Continue with Google"
3. Select your Google account
4. Should redirect to `/dashboard`

### Test Protected Routes
1. Open http://localhost:3000/dashboard
2. If not logged in, should redirect to `/login`
3. After logging in, you can access `/dashboard`

### Test Sign Out
1. Click "Sign Out" button on dashboard
2. Should redirect to `/login`
3. Try accessing `/dashboard` again - should redirect to login

---

## 📁 File Structure

```
Automet/
├── pages/
│   ├── index.tsx                    # Smart redirect (→ login or dashboard)
│   ├── login.tsx                    # Login page
│   ├── signup.tsx                   # Signup page
│   ├── dashboard.tsx                # Protected dashboard
│   └── auth/
│       └── callback.tsx             # OAuth callback
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx          # Auth state management
│   ├── components/
│   │   └── ProtectedRoute.tsx       # Protected route wrapper
│   └── lib/
│       ├── supabase.ts              # Browser client
│       └── supabase-server.ts       # Server clients
├── migrations/                       # Database migrations (already run)
├── seeds/                            # Demo data (already run)
├── CREATE_AUTH_TRIGGER.sql          # ⚠️ MUST RUN THIS
├── ADD_DEMO_USERS_MANUAL.sql        # Optional demo users
└── MODULE_2_SUMMARY.md              # Detailed Module 2 docs
```

---

## 🎯 Available Pages

- **/** - Home (redirects to login or dashboard)
- **/login** - Login page (email/password + Google OAuth)
- **/signup** - User registration
- **/dashboard** - Protected dashboard (requires login)
- **/auth/callback** - OAuth callback handler
- **/api/health** - Health check endpoint
- **/api/verify-data** - Database verification endpoint

---

## 🔧 Troubleshooting

### Issue: Can't log in after signup
**Solution**: Check if email confirmation is required. Either:
- Disable it in Supabase Dashboard → Authentication → Settings
- Or check your email for confirmation link

### Issue: Google OAuth not working
**Check**:
- Google provider is enabled in Supabase Dashboard
- Redirect URI in Google Console matches: `https://dogzgbppyiokvipvsgln.supabase.co/auth/v1/callback`
- Client ID and Secret are correct in Supabase

### Issue: User created but can't access data
**Solution**: Make sure you ran `CREATE_AUTH_TRIGGER.sql`. This creates the `public.users` record automatically.

### Issue: "org_id cannot be null" error
**Solution**: The trigger automatically assigns new users to org_id `10000000-0000-0000-0000-000000000001`. If you see this error, the trigger wasn't run properly.

---

## 📊 Database Schema

The users table has these columns:
- `id` - UUID (matches auth.users.id)
- `email` - Text (unique, email format)
- `email_confirmed` - Boolean
- `google_provider_id` - Text (for Google OAuth)
- `org_id` - UUID (references organizations)
- `role` - Text ('owner', 'coordinator', or 'technician')
- `profile_photo_url` - Text (optional)
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Note**: There is NO `full_name` or `phone` column in the MVP schema.

---

## 🎨 Color Palette

The Automet design system uses a color palette inspired by the flag colors. All colors are defined in `tailwind.config.js` and should be used consistently across the application.

### Primary Colors

- **Primary**: `#EF7722` (Vibrant Orange)
  - Used for: Primary buttons, links, highlights, brand elements
  - Tailwind class: `bg-primary`, `text-primary`, `border-primary`
  - Full scale available: `primary-50` through `primary-950`

- **Secondary**: `#FFB84D` (Lighter Golden Orange)
  - Used for: Secondary accents, hover states, complementary elements
  - Tailwind class: `bg-secondary`, `text-secondary`, `border-secondary`
  - Full scale available: `secondary-50` through `secondary-950`

- **Accent Blue**: `#3B82F6` (Medium Blue)
  - Used for: Accent elements, informational highlights
  - Tailwind class: `bg-accent-blue`, `text-accent-blue`, `accent-blue`

### Usage Guidelines

1. **No Gradients**: All buttons and UI elements use solid colors (no `bg-gradient-to-r` classes)
2. **Primary for CTAs**: Use `bg-primary` for all primary call-to-action buttons
3. **Consistent Hover States**: Use `hover:bg-primary/90` or `hover:text-primary/80` for interactive elements
4. **Accessibility**: Ensure sufficient contrast ratios (WCAG AA minimum)

### Example Usage

```tsx
// Primary button
<button className="bg-primary text-white hover:bg-primary/90">
  Join Waitlist
</button>

// Primary link
<a className="text-primary hover:text-primary/80">
  Learn More
</a>

// Secondary accent
<div className="bg-secondary/10 text-secondary">
  New Feature
</div>
```

**Color Configuration**: See `tailwind.config.js` for the complete color scale definitions.

---

## 🎉 What's Working

✅ Email/Password authentication
✅ Google OAuth sign-in
✅ User registration with validation
✅ Protected routes
✅ Auto-refresh sessions
✅ Sign out functionality
✅ Loading states & error handling
✅ Auto-create user records on signup
✅ Dashboard with statistics
✅ Smart redirects

---

## 📝 Next Steps (Module 3)

After completing setup, you can start building Module 3 features:

1. **Job Management UI**
   - List jobs with filters
   - Create/edit jobs
   - Assign technicians
   - Mark as completed

2. **Client & Site Management**
   - View clients and sites
   - Add new clients
   - Manage GPS locations

3. **Asset Management**
   - View assets by site
   - Track maintenance history

4. **Inventory Management**
   - View inventory
   - Track stock levels
   - Reorder alerts

---

## 🆘 Need Help?

- Check `MODULE_2_SUMMARY.md` for detailed documentation
- Review Supabase logs in Dashboard → Logs
- Check browser console for errors (F12)
- Verify `.env.local` has all required variables

---

**Module 2 Status: ✅ COMPLETE**

Your authentication system is ready to use!
