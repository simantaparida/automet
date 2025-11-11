-- Rollback: Remove updated_at field from blog_posts table
-- Created: 2025-11-07

BEGIN;

-- Drop trigger
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;

-- Remove column
ALTER TABLE blog_posts DROP COLUMN IF EXISTS updated_at;

COMMIT;

