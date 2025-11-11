# Admin Contact Messages Setup Guide

## Overview
Contact form submissions are now stored in the database AND sent via email for redundancy.

## Database Migration

### Run Migration
```bash
# Apply migration to create contact_messages table
psql $DATABASE_URL -f migrations/20251107_001_create_contact_messages.sql
```

### Rollback (if needed)
```bash
# Remove contact_messages table
psql $DATABASE_URL -f migrations/20251107_001_create_contact_messages.down.sql
```

## Features

### Database Table: `contact_messages`
- **Fields**: id, name, email, topic, message, status, notes, timestamps
- **Statuses**: `new`, `in_progress`, `resolved`, `archived`
- **Topics**: pricing, features, technical, demo, partnership, other
- **RLS Enabled**: Public can insert, authenticated users can read/update

### Contact Form Flow
1. User submits contact form on website
2. Message is stored in `contact_messages` table
3. Email notification sent to `support@automet.app`
4. Admin can view and manage messages at `/admin/contact-messages`

## Admin Panel Access

### URLs
- **Waitlist**: https://yourdomain.com/admin/waitlist
- **Contact Messages**: https://yourdomain.com/admin/contact-messages

### Authentication
Both admin pages use the same authentication:
- Password: Your `ADMIN_SECRET` environment variable
- Stored in session storage after login
- Shared across both admin pages

### Admin Navigation
A shared navigation bar (`AdminNav`) provides:
- Quick switching between Waitlist and Contact Messages
- "Back to Site" link
- Consistent branding

## Admin Contact Messages Dashboard

### Features
1. **Stats Overview**:
   - Total Messages
   - New (unread)
   - In Progress
   - Resolved

2. **Filtering**:
   - Filter by status: All, New, In Progress, Resolved, Archived

3. **Message Details**:
   - Click any message to expand full details
   - View: name, email, topic, message, timestamps
   - Update status with one click
   - Reply via email button (opens mailto link)

4. **Status Management**:
   - New → In Progress → Resolved → Archived
   - One-click status updates
   - Auto-tracks resolved timestamp

## API Endpoints

### GET `/api/admin/contact-messages`
- **Headers**: `X-Admin-Secret: <your-admin-secret>`
- **Returns**: All contact messages + stats
- **Response**:
  ```json
  {
    "success": true,
    "data": [...],
    "stats": {
      "total": 10,
      "new": 3,
      "in_progress": 2,
      "resolved": 5
    }
  }
  ```

### PATCH `/api/admin/contact-messages`
- **Headers**: `X-Admin-Secret: <your-admin-secret>`
- **Body**:
  ```json
  {
    "id": "uuid",
    "status": "resolved",
    "notes": "Optional internal notes"
  }
  ```
- **Returns**: Updated message

## Environment Variables Required

```env
# In .env.local or Vercel
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_SECRET=your-admin-password
SUPPORT_EMAIL=support@automet.app (optional, defaults to support@automet.app)
```

## Security Notes

⚠️ **Important**:
- Admin pages use simple password authentication via `ADMIN_SECRET`
- Not suitable for production use with multiple admins
- For production, implement proper role-based access control via Supabase Auth
- RLS policies ensure only authenticated users can read contact messages
- Public can only INSERT (submit contact forms)

## Next Steps

1. Run the migration on your Supabase database
2. Set `ADMIN_SECRET` in your environment variables
3. Access `/admin/contact-messages` with your admin password
4. Start managing contact form submissions!

## Troubleshooting

**Migration fails**:
- Check DATABASE_URL is set correctly
- Ensure you have superuser privileges on Supabase
- Try running migration directly in Supabase SQL Editor

**Can't see messages**:
- Verify `NEXT_PUBLIC_SUPABASE_URL` is set
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check browser console for errors
- Verify RLS policies are enabled

**Emails not sending**:
- Check `SUPPORT_EMAIL` is set (or defaults to support@automet.app)
- Verify email service is configured in `lib/email.ts`
- Messages are still stored in DB even if email fails

