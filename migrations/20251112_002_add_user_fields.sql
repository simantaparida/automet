-- Migration: Add full_name and phone to users table
-- Date: 2025-11-12

-- Add full_name column (required) with temporary default
ALTER TABLE users
ADD COLUMN IF NOT EXISTS full_name TEXT NOT NULL DEFAULT '';

-- Add phone column (optional)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Populate full_name for existing users (derive from email)
UPDATE users
SET full_name = COALESCE(
  INITCAP(SPLIT_PART(email, '@', 1)),  -- Use email username, capitalized
  'User'
)
WHERE full_name = '' OR full_name IS NULL;

-- Add check constraint for full_name length (now that all rows have valid data)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_full_name_length'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT users_full_name_length
    CHECK (length(full_name) >= 2 AND length(full_name) <= 100);
  END IF;
END $$;

-- Add comments
COMMENT ON COLUMN users.full_name IS 'User full name (required, 2-100 characters)';
COMMENT ON COLUMN users.phone IS 'User phone number with country code (optional, e.g., +91 98765 43210)';
