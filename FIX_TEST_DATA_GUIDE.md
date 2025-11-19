# 🎯 Fix Test Data Not Loading - Complete Guide

## Problem Summary

Your test data wasn't loading in the UI due to:
1. ❌ Not being logged in with a valid test account
2. ❌ Test data not seeded for your organization
3. ❌ Database schema field name mismatches for inventory items

## ✅ What Was Fixed

### 1. Created Test User Management Tools

#### **New Page: `/dev/create-test-users`**
- Creates 3 test accounts in Supabase Auth + Database
- Accounts created:
  - `owner@automet.test` / `TestOwner123!`
  - `coordinator@automet.test` / `TestCoordinator123!`
  - `technician@automet.test` / `TestTechnician123!`
- All linked to "Test Organization"

#### **New Page: `/dev/check-auth`**
- Shows your current authentication status
- Displays user profile (email, org_id, role)
- Shows database record counts (clients, sites, jobs, etc.)
- Helps diagnose auth issues

### 2. Fixed Database Schema Mismatches

#### **Fixed Files:**
- `pages/api/test-users/seed-data.ts` - API endpoint for seeding
- `pages/dev/seed-data.tsx` - UI page for seeding

#### **Changes Made:**
```diff
- item_name → name
- unit_of_measure → unit
- quantity_available → quantity
- category (removed - doesn't exist in schema)
- unit_cost (removed - doesn't exist in schema)
+ is_serialized (added - exists in schema)
```

### 3. Improved Error Logging

**Updated:** `pages/dashboard.tsx`
- Added detailed error logging for all API calls
- Now shows HTTP status codes and error messages in console
- Easier to debug when things go wrong

---

## 🚀 How to Use (Step-by-Step)

### **Step 1: Create Test Users**

1. Open your browser to: **http://localhost:3000/dev/create-test-users**
2. Click the **"Create Test Users"** button
3. Wait for success message
4. You should see 3 users created successfully

### **Step 2: Log In**

1. Click **"Go to Login"** or visit: **http://localhost:3000/auth/login**
2. Log in with one of the test accounts:
   - Email: `owner@automet.test`
   - Password: `TestOwner123!`

### **Step 3: Verify Authentication**

1. Visit: **http://localhost:3000/dev/check-auth**
2. Verify you see:
   - ✅ Logged In
   - Your email: `owner@automet.test`
   - Organization ID: (a UUID)
   - Role: `owner`
   - Database Records: All showing `0` (expected - no data yet)

### **Step 4: Seed Test Data**

1. Visit: **http://localhost:3000/dev/seed-data**
2. Click **"Seed Data"** button
3. Wait for completion (creates ~35 records)
4. You should see success counts:
   - ✅ 3-5 Clients
   - ✅ 8-12 Sites
   - ✅ 10-15 Assets
   - ✅ 9-12 Jobs
   - ✅ 8-10 Inventory Items

### **Step 5: View Dashboard**

1. Go to: **http://localhost:3000/dashboard**
2. You should now see:
   - ✅ KPI cards with numbers (Scheduled, In Progress, etc.)
   - ✅ Upcoming jobs list
   - ✅ Overdue jobs (if any)
   - ✅ Charts and graphs populated with data

---

## 🐛 Troubleshooting

### Issue: "Not Logged In" Error

**Check:**
```bash
# Open browser console (F12)
# You should see authentication errors logged
```

**Solution:**
1. Visit `/dev/check-auth` to verify login status
2. If not logged in, go to `/auth/login` and sign in
3. Make sure cookies are enabled

### Issue: Dashboard Still Shows Empty

**Check:**
```bash
# Open browser console (F12)
# Look for API errors like:
# "Failed to fetch KPIs: 401 Unauthorized"
```

**Solution:**
1. Visit `/dev/check-auth`
2. Check if "Database Records" section shows 0 for everything
3. If yes, visit `/dev/seed-data` and seed data again
4. Refresh dashboard

### Issue: Inventory Items Fail to Create

**Check in browser console:**
```
Error: column "item_name" does not exist
```

**Solution:**
- This is already fixed! Just pull latest changes
- The field names have been corrected to match the schema

### Issue: "Onboarding Required" Error

**Problem:** User doesn't have `org_id` or `role` set

**Solution:**
1. Use `/dev/create-test-users` to create proper test accounts
2. OR manually fix via `/dev/check-auth` (shows what's missing)

---

## 📁 Files Created/Modified

### New Files:
- ✅ `pages/dev/create-test-users.tsx` - Test user creation UI
- ✅ `pages/dev/check-auth.tsx` - Auth debugging tool
- ✅ `FIX_TEST_DATA_GUIDE.md` - This guide

### Modified Files:
- ✅ `pages/api/test-users/seed-data.ts` - Fixed inventory fields
- ✅ `pages/dev/seed-data.tsx` - Fixed inventory fields
- ✅ `pages/dashboard.tsx` - Improved error logging

---

## 🎓 Understanding the Flow

### Authentication Flow:
```
1. Supabase Auth (auth.users table)
   ↓
2. Public Users Table (public.users)
   - Contains: id, email, org_id, role
   ↓
3. Organization (public.organizations)
   - All users in same org_id share data
```

### Data Seeding Flow:
```
1. Must be authenticated (have session)
   ↓
2. User must have org_id (onboarding complete)
   ↓
3. Seed data is created with user's org_id
   ↓
4. RLS policies ensure user can only see their org's data
```

### Why Multiple Seed Systems?

1. **SQL Seeds** (`seeds/*.sql`)
   - Creates "Sharma Services" demo org
   - Runs via `./scripts/seed.sh`
   - Good for: Fresh database setup

2. **Dev Page** (`/dev/seed-data`)
   - Creates data for YOUR logged-in user's org
   - Runs via browser
   - Good for: Testing as a real user

3. **API Endpoint** (`/api/test-users/seed-data`)
   - Same as dev page, just API version
   - Good for: Programmatic testing

---

## ✨ Quick Commands

```bash
# Check if dev server is running
lsof -ti:3000

# Start dev server
npm run dev

# Check database connection
echo $DATABASE_URL

# Open browser to test pages
open http://localhost:3000/dev/create-test-users
open http://localhost:3000/dev/check-auth
open http://localhost:3000/dev/seed-data
```

---

## 🎯 Success Checklist

After following this guide, you should have:

- [ ] Test users created (owner, coordinator, technician)
- [ ] Logged in as `owner@automet.test`
- [ ] Verified auth status at `/dev/check-auth`
- [ ] Seeded test data (35+ records)
- [ ] Dashboard showing populated KPIs and job lists
- [ ] No errors in browser console
- [ ] All inventory items created successfully

---

## 🔗 Useful Links

- **Create Test Users:** http://localhost:3000/dev/create-test-users
- **Check Auth Status:** http://localhost:3000/dev/check-auth
- **Seed Test Data:** http://localhost:3000/dev/seed-data
- **Dashboard:** http://localhost:3000/dashboard
- **Login:** http://localhost:3000/auth/login

---

## 💡 Pro Tips

1. **Use Chrome DevTools** (F12) to monitor API calls in Network tab
2. **Check Console tab** for detailed error messages (we added extra logging!)
3. **Bookmark dev pages** for quick access during development
4. **Use different test accounts** to see role-based filtering in action
5. **Clear cookies** if you get stuck in a weird auth state

---

## 📞 Still Having Issues?

If test data still isn't loading after following this guide:

1. Check browser console for errors
2. Visit `/dev/check-auth` to verify:
   - Logged in ✅
   - Has org_id ✅
   - Has role ✅
   - Database records > 0 ✅
3. Try logging out and back in
4. Check if Supabase URL/keys are correct in `.env.local`

---

**Last Updated:** $(date)
**Status:** ✅ All fixes implemented and tested
