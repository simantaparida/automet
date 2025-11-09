# Admin Portal Setup Guide

## Quick Access

**Main Admin Portal**: https://yourdomain.com/admin

This is your single entry point to access all admin functionality!

## What's Included

### 1. Main Dashboard (`/admin`)
- Central hub for all admin functions
- Quick access cards to Waitlist and Contact Messages
- Beautiful, intuitive interface
- Single login for everything

### 2. Waitlist Management (`/admin/waitlist`)
- View all waitlist signups
- Stats: Total, Email Confirmed, Paid
- Filter and search capabilities
- Export options

### 3. Contact Messages (`/admin/contact-messages`)
- View all contact form submissions
- Stats: Total, New, In Progress, Resolved
- Status management workflow
- Reply via email functionality

## Authentication Setup

### Required Environment Variable

Add this to your `.env.local` AND Vercel:

```env
NEXT_PUBLIC_ADMIN_SECRET=your_secure_admin_password_here
```

⚠️ **Important Notes**:
- Must use `NEXT_PUBLIC_` prefix so it's available in the browser
- Choose a strong password (min 12 characters recommended)
- Same password works for all admin pages
- Stored in sessionStorage after login

### How It Works

1. User navigates to `/admin`
2. Enters admin password
3. Password is compared with `NEXT_PUBLIC_ADMIN_SECRET`
4. On success, password stored in sessionStorage
5. User can access all admin sections
6. Logout clears sessionStorage

## Features

### Password Security
- ✅ Show/Hide password toggle on all login forms
- ✅ Shared authentication across all admin pages
- ✅ Session persists until browser closes or logout
- ✅ Auto-redirect to login if not authenticated

### Navigation
- ✅ Shared `AdminNav` component across all pages
- ✅ Active page highlighting
- ✅ Quick "Back to Site" link
- ✅ Dashboard link from any admin page

### Responsive Design
- ✅ Icons on mobile, full labels on desktop
- ✅ Touch-friendly on tablets
- ✅ Optimized for all screen sizes

## Admin Pages Overview

### `/admin` - Main Dashboard
**Features:**
- Welcome screen with overview
- Large action cards for Waitlist and Contact Messages
- Quick access section
- Logout button

### `/admin/waitlist` - Waitlist Management
**Features:**
- Total signups, email confirmed, and paid stats
- Full table view with all waitlist data
- Filter by email confirmation and payment status
- Sort and search capabilities
- Export functionality

### `/admin/contact-messages` - Contact Messages
**Features:**
- Total, new, in progress, and resolved stats
- Filter by status
- Expandable message cards
- Status workflow: New → In Progress → Resolved → Archived
- Reply via email button
- Internal notes capability

## Database Setup

Run this SQL in Supabase SQL Editor:

```sql
-- This creates the contact_messages table
-- (Copy from migrations/20251107_001_create_contact_messages.sql)
```

## Security Considerations

⚠️ **Current Implementation**:
- Uses simple password authentication via environment variable
- Suitable for MVP/staging with 1-2 admins
- Password transmitted in browser (HTTPS recommended)

🔒 **For Production**:
- Implement proper role-based access control (RBAC)
- Use Supabase Auth with admin roles
- Add audit logging for admin actions
- Implement rate limiting on admin login
- Consider 2FA for sensitive operations

## Troubleshooting

### "Invalid password" error
**Solution**: Ensure `NEXT_PUBLIC_ADMIN_SECRET` is set in:
1. `.env.local` for local development
2. Vercel environment variables for production
3. Redeploy after adding environment variable

### Can't access admin pages
**Solution**: 
1. Check console for errors
2. Verify environment variable is set
3. Try clearing sessionStorage: `sessionStorage.clear()`
4. Hard refresh the page (Cmd+Shift+R or Ctrl+Shift+R)

### Migration fails
**Solution**:
1. Ensure `update_updated_at_column()` function exists
2. Run migration `20251101_004_triggers_and_functions.sql` first
3. Or use the updated migration that includes the function

## Quick Start

1. **Set admin password**:
   ```bash
   # Add to .env.local
   echo "NEXT_PUBLIC_ADMIN_SECRET=my_secure_password" >> .env.local
   ```

2. **Run migration**:
   - Open Supabase SQL Editor
   - Copy SQL from `migrations/20251107_001_create_contact_messages.sql`
   - Run it

3. **Access admin**:
   - Navigate to: http://localhost:3000/admin
   - Enter your password
   - Start managing!

4. **Deploy to Vercel**:
   - Add `NEXT_PUBLIC_ADMIN_SECRET` to Vercel environment variables
   - Redeploy
   - Access: https://yourdomain.com/admin

## Support

Need help? Email: support@automet.app

