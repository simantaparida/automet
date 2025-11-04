# Landing Page Database Migrations

## Run These Migrations in Supabase SQL Editor

### Step 1: Create Preorders Table

Go to Supabase Dashboard → SQL Editor → New Query

**Copy and paste this SQL:**

```sql
-- Migration: Create preorders table for landing page pre-order system
-- Created: 2025-11-03

BEGIN;

CREATE TABLE preorders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_name TEXT NOT NULL CHECK (char_length(org_name) >= 2 AND char_length(org_name) <= 200),
  contact_name TEXT NOT NULL CHECK (char_length(contact_name) >= 2 AND char_length(contact_name) <= 100),
  email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone TEXT CHECK (char_length(phone) <= 20),
  tech_count INTEGER CHECK (tech_count > 0),
  city TEXT,
  plan_interest TEXT CHECK (plan_interest IN ('free', 'pro', 'enterprise')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_id TEXT,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  email_confirmed BOOLEAN DEFAULT FALSE,
  confirmation_token TEXT UNIQUE,
  token_expires_at TIMESTAMPTZ,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_preorders_email ON preorders(email);
CREATE INDEX idx_preorders_confirmation_token ON preorders(confirmation_token) WHERE confirmation_token IS NOT NULL;
CREATE INDEX idx_preorders_email_confirmed ON preorders(email_confirmed);
CREATE INDEX idx_preorders_payment_status ON preorders(payment_status);
CREATE INDEX idx_preorders_created_at ON preorders(created_at DESC);

COMMIT;
```

Click **Run**.

### Step 2: Create Blog Posts Table

**Copy and paste this SQL:**

```sql
-- Migration: Create blog_posts table for landing page blog section
-- Created: 2025-11-03

BEGIN;

CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL CHECK (slug ~* '^[a-z0-9-]+$'),
  title TEXT NOT NULL CHECK (char_length(title) >= 5 AND char_length(title) <= 200),
  excerpt TEXT CHECK (char_length(excerpt) <= 500),
  content TEXT NOT NULL,
  cover_image_url TEXT,
  author_name TEXT DEFAULT 'Automet Team',
  category TEXT CHECK (category IN ('product-updates', 'industry-insights', 'best-practices', 'case-studies')),
  tags TEXT[],
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published, published_at DESC);
CREATE INDEX idx_blog_posts_category ON blog_posts(category) WHERE published = TRUE;
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC) WHERE published = TRUE;

COMMIT;
```

Click **Run**.

### Step 3: Seed Demo Blog Posts

**Copy the entire content from** `seeds/006_demo_blog_posts.sql` and run it in SQL Editor.

### Step 4: Verify

Run this query to verify:

```sql
SELECT
  'preorders' as table_name,
  COUNT(*) as row_count
FROM preorders
UNION ALL
SELECT
  'blog_posts' as table_name,
  COUNT(*) as row_count
FROM blog_posts;
```

You should see:
- preorders: 0 rows (empty, waiting for signups)
- blog_posts: 3 rows (demo content)

## Done! ✅

Now proceed with the landing page development.
