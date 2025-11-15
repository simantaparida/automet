# How to See the UI Changes

## Changes Made:

1. **Breadcrumb Navigation** - Added to detail and edit pages
2. **Desktop Top Header** - Fixed header with search and user actions
3. **Desktop Sidebar** - Already existed, now properly integrated
4. **Bulk Operations** - On Jobs listing page (select mode)

## Where to See Changes:

### ✅ Breadcrumbs (Desktop only, screen width >= 768px):
- **Job Detail Page**: `/jobs/[any-job-id]`
- **Client Detail Page**: `/clients/[any-client-id]`
- **Job Edit Page**: `/jobs/[any-job-id]/edit`
- **Client Edit Page**: `/clients/[any-client-id]/edit`

### ✅ Desktop Top Header (Desktop only):
- Appears on all pages on desktop view (width >= 768px)
- Shows: Logo, Search bar, Dark mode toggle, Profile menu

### ✅ Bulk Operations (All screen sizes):
- **Jobs Listing Page**: `/jobs`
- Look for the "Select" button next to the priority filter
- Click it to enter select mode and see checkboxes on jobs

## Troubleshooting:

### If you don't see changes:

1. **Check your screen width**:
   - Open browser DevTools (F12 or Cmd+Option+I)
   - Check viewport width in the top bar
   - Make sure it's >= 768px for desktop features

2. **Hard refresh your browser**:
   - Mac: `Cmd + Shift + R`
   - Windows/Linux: `Ctrl + Shift + R`
   - This clears cache and reloads fresh code

3. **Restart dev server**:
   ```bash
   # Stop current server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

4. **Navigate to the right pages**:
   - Breadcrumbs are on **detail** pages, not listing pages
   - Example: `/jobs/[id]` NOT `/jobs`
   - Need a valid job/client ID to see detail pages

5. **Check browser console for errors**:
   - Open DevTools Console
   - Look for any red error messages
   - Share errors if found

## Quick Test:

1. Go to `/jobs` page (listing)
2. Click on any job to go to `/jobs/[id]` (detail page)
3. If screen width >= 768px, you should see:
   - Top header at the very top
   - Sidebar on the left
   - Breadcrumb below the header (showing: Dashboard > Jobs > Job Title)
4. Click "Edit Job" button to see breadcrumb with 3 levels

