# Fix Blog Posts RLS Policy

This guide helps you fix the "permission denied for table blog_posts" error.

## Problem

The blog section fails to load because the Row Level Security (RLS) policy on the `blog_posts` table doesn't allow anonymous (public) access.

## Solution

Apply the updated RLS policy that explicitly allows public access to published blog posts.

## Step 1: Run the Updated Migration

1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the following SQL:

```sql
-- Enable RLS on blog_posts table (if not already enabled)
ALTER TABLE IF EXISTS blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (for re-running migration)
DROP POLICY IF EXISTS "Public can view published posts" ON blog_posts;

-- Allow anonymous and authenticated users to view published posts
-- This policy allows public (unauthenticated) access to published blog posts
CREATE POLICY "Public can view published posts"
  ON blog_posts FOR SELECT
  TO public
  USING (published = true);
```

3. Click **Run** to execute the SQL
4. You should see "Success. No rows returned" if the policy was created successfully

## Step 2: Verify the Policy

Run this query to verify the policy exists:

```sql
-- Check if policy exists
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'blog_posts';
```

You should see a policy named "Public can view published posts" with:
- `roles`: `{public}`
- `cmd`: `SELECT`

## Step 3: Test the API

1. Refresh your browser or restart your dev server
2. Visit your landing page: `http://localhost:3000`
3. Scroll to the blog section - it should now load the blog posts

## Alternative: Use Service Role Key (Quick Fix)

If you need a quick temporary fix while setting up the RLS policy:

1. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in your `.env.local`
2. The blog API will automatically use the service role key which bypasses RLS

**Note:** Using the service role key is fine for blog posts since they're public content, but the RLS policy is the proper long-term solution.

## Troubleshooting

### Still getting "permission denied"?

1. **Check if RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'blog_posts';
   ```
   `rowsecurity` should be `true`

2. **Check if policy exists:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'blog_posts';
   ```

3. **Verify policy allows public role:**
   ```sql
   SELECT policyname, roles, cmd, qual 
   FROM pg_policies 
   WHERE tablename = 'blog_posts';
   ```
   `roles` should include `public` or be empty (which means all roles)

### Policy exists but still not working?

1. **Drop and recreate the policy:**
   ```sql
   DROP POLICY IF EXISTS "Public can view published posts" ON blog_posts;
   CREATE POLICY "Public can view published posts"
     ON blog_posts FOR SELECT
     TO public
     USING (published = true);
   ```

2. **Check if there are conflicting policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'blog_posts';
   ```
   You should only have one SELECT policy for public access.

### Environment variables not set?

Make sure your `.env.local` has:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Optional but recommended
```

---

**Last Updated:** November 2025

