-- Migration: Update contact_messages schema for new contact form
-- Created: 2025-11-08
-- Description: Add company/phone fields and make email/topic/message optional

BEGIN;

-- Add new columns for company and phone details
ALTER TABLE contact_messages
  ADD COLUMN company TEXT,
  ADD COLUMN country_code TEXT,
  ADD COLUMN phone TEXT;

-- Provide defaults for existing records
UPDATE contact_messages
SET
  company = COALESCE(company, 'Unknown Company'),
  country_code = COALESCE(country_code, '+91'),
  phone = COALESCE(phone, '+910000000000');

-- Relax previous required field constraints
ALTER TABLE contact_messages
  DROP CONSTRAINT IF EXISTS contact_messages_email_check,
  DROP CONSTRAINT IF EXISTS contact_messages_topic_check,
  DROP CONSTRAINT IF EXISTS contact_messages_message_check;

ALTER TABLE contact_messages
  ALTER COLUMN email DROP NOT NULL,
  ALTER COLUMN topic DROP NOT NULL,
  ALTER COLUMN message DROP NOT NULL;

-- Enforce new constraints on newly added columns
ALTER TABLE contact_messages
  ALTER COLUMN company SET NOT NULL,
  ALTER COLUMN country_code SET NOT NULL,
  ALTER COLUMN phone SET NOT NULL;

ALTER TABLE contact_messages
  ADD CONSTRAINT contact_messages_company_length CHECK (
    char_length(company) BETWEEN 2 AND 200
  ),
  ADD CONSTRAINT contact_messages_country_code_format CHECK (
    country_code ~ '^\\+\\d{1,4}$'
  ),
  ADD CONSTRAINT contact_messages_phone_format CHECK (
    phone ~ '^\\+\\d{1,4}\\d{7,15}$'
  ),
  ADD CONSTRAINT contact_messages_email_format CHECK (
    email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'
  ),
  ADD CONSTRAINT contact_messages_topic_allowed CHECK (
    topic IS NULL OR topic IN ('pricing', 'features', 'technical', 'demo', 'partnership', 'other')
  ),
  ADD CONSTRAINT contact_messages_message_length CHECK (
    message IS NULL OR char_length(message) BETWEEN 10 AND 5000
  );

-- Document new fields
COMMENT ON COLUMN contact_messages.company IS 'Company name supplied through contact form';
COMMENT ON COLUMN contact_messages.country_code IS 'Dialing code selected by visitor';
COMMENT ON COLUMN contact_messages.phone IS 'Phone number including country code';

COMMIT;

