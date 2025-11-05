# Google OAuth Console Setup Guide

This guide will help you set up Google OAuth for Automet, allowing users to sign in with their Google accounts.

## Prerequisites

- A Google account
- Access to Google Cloud Console

---

## Step 1: Create Google Cloud Project

### 1.1 Go to Google Cloud Console

Visit [https://console.cloud.google.com](https://console.cloud.google.com)

### 1.2 Create New Project

1. Click the project dropdown (top-left, next to "Google Cloud")
2. Click **"New Project"**
3. Fill in:
   - **Project name**: `Automet`
   - **Organization**: (leave as default or select your org)
   - **Location**: (leave as default)
4. Click **"Create"**
5. Wait for project creation (~30 seconds)
6. Select the new project from the dropdown

---

## Step 2: Enable Required APIs

### 2.1 Enable Google+ API (for profile info)

1. In the search bar, type **"Google+ API"**
2. Click on **"Google+ API"** from results
3. Click **"Enable"**
4. Wait for activation

**Note:** While Google+ is deprecated, the API is still used for fetching user profile data.

### 2.2 Verify Other APIs

The following should be enabled by default:

- **Google Identity Toolkit API** (for auth)
- **Cloud Resource Manager API**

If not, enable them from the API Library.

---

## Step 3: Configure OAuth Consent Screen

This is what users see when they sign in with Google.

### 3.1 Navigate to OAuth Consent Screen

1. From the left menu, go to **"APIs & Services"** → **"OAuth consent screen"**

### 3.2 Choose User Type

- Select **"External"** (unless you have a Google Workspace account)
- Click **"Create"**

### 3.3 Fill in App Information

#### OAuth consent screen tab:

| Field                                 | Value                                                         |
| ------------------------------------- | ------------------------------------------------------------- |
| **App name**                          | `Automet`                                                     |
| **User support email**                | `admin@automet.dev` (or your email)                           |
| **App logo**                          | (Optional - upload a 120x120px logo)                          |
| **Application home page**             | `http://localhost:3000` (dev) or `https://automet.app` (prod) |
| **Application privacy policy link**   | (Optional - add later)                                        |
| **Application terms of service link** | (Optional - add later)                                        |
| **Authorized domains**                | Add: `automet.app` (when you have a domain)                   |
| **Developer contact information**     | `admin@automet.dev`                                           |

Click **"Save and Continue"**

### 3.4 Configure Scopes

1. Click **"Add or Remove Scopes"**
2. Select these scopes:
   - ✅ `.../auth/userinfo.email` - See your primary Google Account email
   - ✅ `.../auth/userinfo.profile` - See your personal info
   - ✅ `openid` - Associate you with your personal info on Google
3. Click **"Update"**
4. Click **"Save and Continue"**

### 3.5 Add Test Users (Development Mode)

In development mode, only test users can sign in.

1. Click **"Add Users"**
2. Add email addresses (one per line):
   ```
   admin@automet.dev
   your.email@gmail.com
   developer@example.com
   ```
3. Click **"Add"**
4. Click **"Save and Continue"**

### 3.6 Review Summary

- Review all settings
- Click **"Back to Dashboard"**

**Note:** Your app will remain in "Testing" mode. To make it public, you'll need to submit for verification later (not needed for MVP).

---

## Step 4: Create OAuth Credentials

### 4.1 Navigate to Credentials

1. From the left menu, go to **"APIs & Services"** → **"Credentials"**

### 4.2 Create OAuth Client ID

1. Click **"+ Create Credentials"** → **"OAuth client ID"**
2. Select **Application type**: **"Web application"**
3. Fill in:

| Field    | Value                |
| -------- | -------------------- |
| **Name** | `Automet Web Client` |

#### Authorized JavaScript origins:

Click **"+ Add URI"** and add these:

```
http://localhost:3000
https://automet.app
```

(Add production domain when ready)

#### Authorized redirect URIs:

Click **"+ Add URI"** and add these:

```
http://localhost:3000/auth/callback
https://automet.app/auth/callback
https://<your-supabase-project-id>.supabase.co/auth/v1/callback
```

**Important:** Replace `<your-supabase-project-id>` with your actual Supabase project reference ID.

**To find your Supabase project reference ID:**

1. Go to Supabase Dashboard → Settings → General
2. Copy the **Reference ID** (e.g., `abcdefghijklm`)
3. The callback URL will be: `https://abcdefghijklm.supabase.co/auth/v1/callback`

4. Click **"Create"**

### 4.3 Save Your Credentials

A dialog will appear with:

- **Client ID**: `123456789-xxxxx.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxx...`

**Copy both values immediately!**

---

## Step 5: Add Credentials to Environment

### 5.1 Add to .env.local

Open `.env.local` and add:

```bash
GOOGLE_CLIENT_ID=123456789-xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx...
```

⚠️ **Never commit these to Git!** (`.env.local` is in `.gitignore`)

### 5.2 Add to Vercel (Production)

When deploying to Vercel:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add:
   - `GOOGLE_CLIENT_ID` → (your client ID)
   - `GOOGLE_CLIENT_SECRET` → (your client secret)
3. Select environments: **Production**, **Preview**, **Development**
4. Click **"Save"**

---

## Step 6: Configure Supabase

Now link Google OAuth to your Supabase project:

### 6.1 Enable Google Provider in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your **automet-dev** project
3. Go to **Authentication** → **Providers**
4. Find **Google** and toggle it **ON**
5. Paste:
   - **Client ID**: (from Step 4.3)
   - **Client Secret**: (from Step 4.3)
6. Click **"Save"**

### 6.2 Update Authorized Redirect URIs

Make sure the Supabase callback URL is added to Google Console:

1. Go back to Google Cloud Console → Credentials
2. Click on **"Automet Web Client"**
3. Under **Authorized redirect URIs**, verify this is present:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
4. If missing, add it and click **"Save"**

---

## Step 7: Test Google OAuth

### 7.1 Start Your Dev Server

```bash
npm run dev
```

### 7.2 Initiate Google Sign-In

In your app, click the "Sign in with Google" button.

**Expected flow:**

1. Redirects to Google consent screen
2. Shows "Automet wants to access your Google Account"
3. Lists requested scopes (email, profile)
4. Click **"Continue"** (or "Allow")
5. Redirects back to `http://localhost:3000/auth/callback`
6. User is logged in!

### 7.3 Verify in Supabase

1. Go to Supabase → **Authentication** → **Users**
2. You should see your Google-authenticated user
3. Check that:
   - Email is populated
   - Provider is `google`
   - `raw_user_meta_data` contains profile info

---

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Cause:** The redirect URI doesn't match what's configured in Google Console.

**Fix:**

1. Check the error message for the exact URI being used
2. Go to Google Console → Credentials → Edit OAuth client
3. Add the exact URI (including `https://`, port, and path)
4. Save and try again

### Error: "Access blocked: This app's request is invalid"

**Cause:** OAuth consent screen not configured properly.

**Fix:**

1. Go to OAuth consent screen
2. Ensure "User support email" is filled
3. Add at least one authorized domain
4. Save changes

### Error: "This app isn't verified"

**Expected behavior** during development. Users will see a warning:

1. Click **"Advanced"**
2. Click **"Go to Automet (unsafe)"**
3. Continue sign-in

**To remove warning (later):**

- Submit app for Google verification (requires domain ownership, privacy policy, etc.)

### Users not in test list can't sign in

**Expected** in Testing mode.

**Options:**

1. Add them to Test Users list (OAuth consent screen → Test users)
2. OR publish the app (requires verification)

### User data not syncing to Supabase

**Check:**

1. Supabase Auth logs: **Logs** → **Auth Logs**
2. Verify Google provider is enabled in Supabase
3. Check that Client ID/Secret are correct in Supabase
4. Verify user email matches test user list

---

## Security Best Practices

✅ **DO:**

- Keep Client Secret in server environment only (never expose to client)
- Use HTTPS in production
- Rotate secrets periodically
- Enable 2FA on your Google account
- Limit scopes to only what's needed (email, profile, openid)

❌ **DON'T:**

- Commit `.env.local` to Git
- Share Client Secret publicly
- Use same credentials for dev and production (create separate OAuth clients)
- Request unnecessary scopes

---

## Next Steps

- ✅ Google OAuth configured
- ✅ Credentials added to `.env.local` and Supabase
- ✅ Test users can sign in

**Continue to:**

- [Razorpay Setup](./RAZORPAY_SETUP.md)
- [Complete Setup Guide](./SETUP.md)

---

## Useful Links

- [Google Cloud Console](https://console.cloud.google.com)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) - Test OAuth flows
- [Google Identity Platform Docs](https://developers.google.com/identity)
- [Supabase Auth with Google Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
