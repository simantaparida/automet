# Troubleshooting Preorders Table Permission Issues

## Quick Fix: Run This SQL in Supabase

If you're getting "permission denied for table preorders", run this SQL in your Supabase SQL Editor:

```sql
-- Step 1: Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'preorders';

-- Step 2: Drop existing policies (if any)
DROP POLICY IF EXISTS "Anyone can insert into preorders" ON preorders;
DROP POLICY IF EXISTS "Users can view preorders by email" ON preorders;
DROP POLICY IF EXISTS "Public can insert preorders" ON preorders;
DROP POLICY IF EXISTS "Public can view preorders" ON preorders;

-- Step 3: Enable RLS
ALTER TABLE preorders ENABLE ROW LEVEL SECURITY;

-- Step 4: Create public insert policy (for waitlist signup)
CREATE POLICY "Public can insert into preorders"
  ON preorders
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Step 5: Create public select policy (for confirmation pages)
CREATE POLICY "Public can view preorders"
  ON preorders
  FOR SELECT
  TO public
  USING (true);

-- Step 6: Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'preorders';
```

## Alternative: Disable RLS (Not Recommended but Works)

If you want to disable RLS entirely for the preorders table:

```sql
ALTER TABLE preorders DISABLE ROW LEVEL SECURITY;
```

**Note:** This is less secure but will work. The public policy approach above is better.

## Check Service Role Key

Make sure your `.env.local` has the service role key:

```bash
# Check if these are set
echo $SUPABASE_SERVICE_ROLE_KEY

# In your .env.local file, you should have:
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # This should start with eyJ
```

## Verify the Fix

After running the SQL:

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Test the form submission

3. Check the server logs for detailed error messages

4. If it still fails, check the browser console and server terminal for the exact error

## Common Issues

### Issue 1: Service Role Key Not Set
**Error:** "Service role key not configured"
**Fix:** Add `SUPABASE_SERVICE_ROLE_KEY` to your `.env.local` file

### Issue 2: RLS Policy Syntax Error
**Error:** "permission denied for table preorders"
**Fix:** Run the SQL above to recreate the policies correctly

### Issue 3: Policy Not Applied
**Error:** Still getting permission denied
**Fix:** 
1. Verify policies exist: Run the check query in Step 6 above
2. Make sure you saved the SQL in Supabase
3. Try disabling RLS temporarily to test

