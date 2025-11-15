# Test Login Profiles

This document describes the test user accounts created for testing the role switch feature.

## Creating Test Users

To create the test users, visit:

**URL:** `/test-users/create`

Or navigate to: `http://localhost:3000/test-users/create`

Click the **"Create Test Users"** button. This will:

1. Create a test organization (if it doesn't exist)
2. Create three test users in Supabase Auth
3. Create corresponding entries in the `public.users` table
4. Assign appropriate roles to each user

## Test Credentials

Once created, you can log in with these credentials:

### 👑 Owner
- **Email:** `owner@automet.test`
- **Password:** `TestOwner123!`
- **Role:** `owner`
- **Permissions:** Full access to all features, can switch to any role

### 👔 Coordinator
- **Email:** `coordinator@automet.test`
- **Password:** `TestCoordinator123!`
- **Role:** `coordinator`
- **Permissions:** Can manage jobs, clients, sites, assets, inventory. Can switch to Technician role.

### 🔧 Technician
- **Email:** `technician@automet.test`
- **Password:** `TestTechnician123!`
- **Role:** `technician`
- **Permissions:** Read-only access, can only see assigned jobs. Cannot switch roles.

## Creating Test Data

After creating test users, you'll need to create dummy data to test the features:

**URL:** `/test-users/seed-data`

Or navigate to: `http://localhost:3000/test-users/seed-data`

Click the **"Seed Test Data"** button. This will create:

- **5 Clients** - Test customers
- **12 Sites** - Physical locations
- **15 Assets** - Equipment at sites
- **12 Jobs** - Work orders with various statuses and priorities (some assigned to technician)
- **10 Inventory Items** - Stock items for jobs

**Note:** This data is created for the test organization automatically. Some jobs are assigned to the test technician user, so when you log in as a technician, you'll see those assigned jobs.

## Testing Role Switch Feature

1. **Log in as Owner or Coordinator** (they can switch roles)
2. **Open the Role Switch dropdown** in the top header (next to your profile)
3. **Select "View as Technician"** (or Coordinator if you're Owner)
4. **Verify the following:**
   - Role badge appears at the top showing "Viewing as: [Role]"
   - Jobs list filters based on the active role (Technician sees only assigned jobs)
   - "New" buttons are hidden when viewing as Technician
   - Bulk actions are hidden when viewing as Technician
   - Data refreshes automatically when role changes

## API Endpoints

### Create Test Users

**POST** `/api/test-users/create`

**Note:** This endpoint only works in development mode. It's blocked in production.

### Seed Test Data

**POST** `/api/test-users/seed-data`

**Note:** This endpoint only works in development mode. It's blocked in production.

Creates dummy data (clients, sites, assets, jobs, inventory) for the test organization.

**Request Body:** None required

**Response:**
```json
{
  "success": true,
  "message": "Created 3 test user(s). 0 error(s).",
  "organizationId": "uuid",
  "users": [
    {
      "email": "owner@automet.test",
      "role": "owner",
      "password": "TestOwner123!",
      "status": "success",
      "userId": "uuid"
    },
    // ... more users
  ]
}
```

## Manual Creation (Alternative)

If the API endpoint doesn't work, you can manually create users:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Enter email and password
4. Note the user ID (UUID)
5. Run the SQL seed file: `seeds/003_seed_users.sql`
6. Update the user IDs in the SQL file to match the auth.users IDs

## Troubleshooting

### "Supabase Admin client not available"
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
- The service role key should start with `eyJ` (JWT format)

### "User already exists"
- The endpoint uses `upsert`, so it will update existing users
- You can safely run it multiple times

### "Failed to create auth user"
- Check that email provider is enabled in Supabase Dashboard
- Verify the service role key has admin permissions
- Check Supabase project logs for detailed errors

## Security Notes

⚠️ **These test users are for development/testing only!**

- Passwords are simple for testing purposes
- Users are auto-confirmed (no email verification needed)
- Do NOT use these credentials in production
- The API endpoint is blocked in production builds

