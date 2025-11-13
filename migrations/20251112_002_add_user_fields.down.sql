-- Rollback: Remove full_name and phone from users table

-- Drop constraint
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_full_name_length;

-- Drop columns
ALTER TABLE users
DROP COLUMN IF EXISTS phone;

ALTER TABLE users
DROP COLUMN IF EXISTS full_name;
