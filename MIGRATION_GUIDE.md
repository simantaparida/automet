# Database Migration Guide

## Missing Column: clients.notes

The `clients` table is missing a `notes` column that is needed for full functionality.

### How to Add the Column

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project (Automet)

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run this SQL**

   ```sql
   -- Add notes column to clients table
   ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT;

   COMMENT ON COLUMN clients.notes IS 'Additional information or special instructions about the client';
   ```

4. **Click "Run"**

5. **Verify**
   - Go to "Table Editor"
   - Select "clients" table
   - You should see the new "notes" column

### Alternative: Use Migration File

If you have `psql` installed, you can run the migration file directly:

```bash
# From the project root
psql "$DATABASE_URL" -f migrations/20251102_009_add_clients_notes_column.sql
```

### After Adding the Column

Once you've added the column, you need to update the API code to include it:

**File: `pages/api/clients/index.ts`**

Change line 17 from:

```typescript
.select('id, name, contact_email, contact_phone, address')
```

To:

```typescript
.select('id, name, contact_email, contact_phone, address, notes')
```

Also update line 36 to include notes:

```typescript
const { name, contact_email, contact_phone, address, notes } = req.body;
```

And add it to the insert (after line 49):

```typescript
notes: notes || null,
```

And in the select (line 53):

```typescript
.select('id, name, contact_email, contact_phone, address, notes')
```

**File: `pages/api/clients/[id].ts`**

Update line 26:

```typescript
.select('id, name, contact_email, contact_phone, address, notes, created_at')
```

Update line 66 and the rest of the PATCH method to include notes.

## Why This Happened

The initial database schema didn't include a `notes` field for clients, but the frontend forms and API were built expecting it. This migration adds the missing column.

## Rollback

If you need to remove the column for any reason:

```sql
ALTER TABLE clients DROP COLUMN IF EXISTS notes;
```

Or use the rollback file:

```bash
psql "$DATABASE_URL" -f migrations/20251102_009_add_clients_notes_column.down.sql
```
