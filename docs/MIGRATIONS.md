# Database Migrations Guide

This guide covers running, rolling back, and managing database migrations for Automet.

## Overview

Migrations are versioned SQL files that modify the database schema. Each migration has:
- **Up migration** (`*.sql`) - Applies changes
- **Down migration** (`*.down.sql`) - Reverts changes

---

## Migration Files

Located in `/migrations/`:

```
migrations/
├── 20251101_001_create_core_tables.sql
├── 20251101_001_create_core_tables.down.sql
├── 20251101_002_create_jobs_and_assignments.sql
├── 20251101_002_create_jobs_and_assignments.down.sql
├── ...
```

### Naming Convention

```
YYYYMMDD_NNN_description.sql
```

- `YYYYMMDD` - Date (e.g., `20251101` for Nov 1, 2025)
- `NNN` - Sequential number (001, 002, ...)
- `description` - Brief description (e.g., `create_core_tables`)

---

## Running Migrations

### First Time Setup

```bash
./scripts/migrate.sh
```

This runs all pending migrations in order.

### Check Migration Status

```bash
# List applied migrations
psql $DATABASE_URL -c "SELECT * FROM schema_migrations ORDER BY version;"
```

(If you implement migration tracking table)

---

## Rolling Back Migrations

### Rollback Last Migration

```bash
./scripts/rollback.sh
```

This runs the corresponding `.down.sql` file for the last applied migration.

### Rollback Specific Migration

```bash
# Manually run the down migration
psql $DATABASE_URL -f migrations/20251101_003_create_inventory_tables.down.sql
```

### Rollback All (Nuclear Option)

```bash
./scripts/reset-db.sh
```

⚠️ **WARNING:** This drops **ALL tables** and re-runs migrations from scratch. **Use only in development!**

---

## Creating New Migrations

### Step 1: Create Migration File

```bash
# Example: Add a new column to jobs table
touch migrations/20251115_009_add_estimated_hours_to_jobs.sql
touch migrations/20251115_009_add_estimated_hours_to_jobs.down.sql
```

### Step 2: Write Up Migration

File: `migrations/20251115_009_add_estimated_hours_to_jobs.sql`

```sql
-- Migration: Add estimated_hours to jobs
-- Created: 2025-11-15

BEGIN;

-- Add column
ALTER TABLE jobs
ADD COLUMN estimated_hours NUMERIC(5,2) DEFAULT 0;

-- Add check constraint
ALTER TABLE jobs
ADD CONSTRAINT jobs_estimated_hours_positive CHECK (estimated_hours >= 0);

-- Add index if needed for queries
CREATE INDEX idx_jobs_estimated_hours ON jobs(estimated_hours)
WHERE estimated_hours > 0;

COMMIT;
```

### Step 3: Write Down Migration

File: `migrations/20251115_009_add_estimated_hours_to_jobs.down.sql`

```sql
-- Rollback: Remove estimated_hours from jobs
-- Created: 2025-11-15

BEGIN;

-- Drop index
DROP INDEX IF EXISTS idx_jobs_estimated_hours;

-- Remove constraint
ALTER TABLE jobs
DROP CONSTRAINT IF EXISTS jobs_estimated_hours_positive;

-- Drop column
ALTER TABLE jobs
DROP COLUMN IF EXISTS estimated_hours;

COMMIT;
```

### Step 4: Test Migration

```bash
# Run migration
./scripts/migrate.sh

# Verify changes in Supabase SQL Editor
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'jobs'
AND column_name = 'estimated_hours';

# Test rollback
./scripts/rollback.sh

# Verify column is gone
```

### Step 5: Re-apply and Commit

```bash
# Re-apply migration
./scripts/migrate.sh

# Commit to Git
git add migrations/
git commit -m "migrations: add estimated_hours to jobs table"
```

---

## Migration Best Practices

### DO ✅

1. **Use transactions** (`BEGIN` / `COMMIT`) for atomicity
2. **Make migrations idempotent** (use `IF EXISTS`, `IF NOT EXISTS`)
3. **Test rollback** before committing
4. **Add comments** explaining why (not just what)
5. **Use descriptive names** for constraints, indexes
6. **Keep migrations small** (one logical change per file)
7. **Backup production** before running migrations

### DON'T ❌

1. **Don't modify existing migrations** once merged to main
2. **Don't drop tables/columns** without data migration plan
3. **Don't use database-specific syntax** without documenting
4. **Don't forget indexes** for foreign keys and query columns
5. **Don't skip down migrations** (always provide rollback)
6. **Don't run destructive migrations** without approval

---

## Production Migration Checklist

Before running migrations in production:

- [ ] **Backup database**
  ```bash
  pg_dump -h db.xxxxx.supabase.co -U postgres -F c automet > backup_$(date +%Y%m%d_%H%M%S).dump
  ```

- [ ] **Test on staging** environment first

- [ ] **Review migration SQL** for:
  - Table locks (use `CONCURRENTLY` for indexes)
  - Long-running queries
  - Data loss potential

- [ ] **Notify team** of upcoming migration

- [ ] **Schedule during low-traffic** window

- [ ] **Have rollback plan** ready

- [ ] **Monitor application** for errors after migration

- [ ] **Verify data integrity**:
  ```sql
  -- Example: Check row counts
  SELECT COUNT(*) FROM jobs;
  ```

---

## Handling Failed Migrations

### If Migration Fails Mid-Run

1. **Check error message**:
   ```bash
   # Look for specific SQL error
   psql $DATABASE_URL -f migrations/20251115_009_*.sql
   ```

2. **Identify the issue**:
   - Syntax error → Fix SQL
   - Constraint violation → Migrate data first
   - Deadlock → Retry during low traffic

3. **Rollback if partially applied**:
   ```bash
   ./scripts/rollback.sh
   ```

4. **Fix the migration** file

5. **Re-run**:
   ```bash
   ./scripts/migrate.sh
   ```

### If Rollback Fails

If `.down.sql` doesn't work:

1. **Manual rollback** via SQL Editor:
   ```sql
   -- Example: Manually drop table
   DROP TABLE IF EXISTS new_table CASCADE;
   ```

2. **Restore from backup** (last resort):
   ```bash
   pg_restore -h db.xxxxx.supabase.co -U postgres -d automet backup.dump
   ```

---

## Database Backup & Restore

### Backup (Before Migrations)

#### Schema only:
```bash
pg_dump -h db.xxxxx.supabase.co -U postgres -s automet > schema_backup.sql
```

#### Data only:
```bash
pg_dump -h db.xxxxx.supabase.co -U postgres -a automet > data_backup.sql
```

#### Full backup:
```bash
pg_dump -h db.xxxxx.supabase.co -U postgres -F c automet > full_backup.dump
```

### Restore

```bash
pg_restore -h db.xxxxx.supabase.co -U postgres -d automet full_backup.dump
```

---

## Migration Tracking (Future Enhancement)

Consider implementing a `schema_migrations` table:

```sql
CREATE TABLE schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);
```

Then update `migrate.sh` to:
1. Check which migrations are already applied
2. Run only pending migrations
3. Record each migration in `schema_migrations`

---

## Troubleshooting

### "relation already exists"

**Cause:** Migration already partially applied.

**Fix:**
- Use `IF NOT EXISTS` in CREATE statements
- Or manually drop the object and re-run

### "permission denied"

**Cause:** Using wrong database user or insufficient permissions.

**Fix:**
- Ensure `DATABASE_URL` uses `postgres` user
- Check Supabase project has not paused (free tier)

### "could not serialize access due to concurrent update"

**Cause:** Another transaction is modifying the same rows.

**Fix:**
- Run migrations during low-traffic window
- Use `LOCK TABLE` if necessary
- Retry the migration

### Migrations run in production but not locally

**Cause:** Local and production databases are out of sync.

**Fix:**
```bash
# Reset local DB to match production schema
./scripts/reset-db.sh
./scripts/migrate.sh
./scripts/seed.sh
```

---

## Migration Scripts Reference

### `./scripts/migrate.sh`

Runs all pending migrations.

**Usage:**
```bash
./scripts/migrate.sh              # Run all migrations
./scripts/migrate.sh --dry-run    # Preview without applying
```

### `./scripts/rollback.sh`

Rolls back the last migration.

**Usage:**
```bash
./scripts/rollback.sh
```

### `./scripts/reset-db.sh`

⚠️ **DESTRUCTIVE:** Drops all tables and re-runs migrations.

**Usage:**
```bash
./scripts/reset-db.sh   # Prompts for confirmation
```

---

## Next Steps

- Read [API Documentation](./API.md)
- Review [Architecture Overview](./ARCHITECTURE.md)
- Learn about [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

---

## Useful Commands

```bash
# Connect to database
psql $DATABASE_URL

# List all tables
\dt

# Describe table schema
\d jobs

# Show indexes
\di

# Show foreign keys
SELECT * FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY';

# Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```
