-- Migration: Create core tables (organizations, users, clients, sites, assets)
-- Created: 2025-11-01
-- Description: Foundation tables for multi-tenant organization structure

BEGIN;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ORGANIZATIONS TABLE
-- ============================================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 200),
  slug TEXT UNIQUE NOT NULL CHECK (slug ~* '^[a-z0-9-]+$'),
  settings JSONB DEFAULT '{}':

:jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);

COMMENT ON TABLE organizations IS 'Vendor companies using Automet';
COMMENT ON COLUMN organizations.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN organizations.settings IS 'Org-specific configuration (timezone, currency, etc.)';

-- ============================================================================
-- USERS TABLE (extends auth.users)
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  email_confirmed BOOLEAN DEFAULT FALSE NOT NULL,
  google_provider_id TEXT UNIQUE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'coordinator', 'technician')),
  profile_photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT users_org_role_check CHECK (org_id IS NOT NULL)
);

CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_provider_id ON users(google_provider_id) WHERE google_provider_id IS NOT NULL;
CREATE INDEX idx_users_role ON users(org_id, role);

COMMENT ON TABLE users IS 'Application users (extends Supabase auth.users)';
COMMENT ON COLUMN users.email_confirmed IS 'Email verification status - gates critical actions';
COMMENT ON COLUMN users.google_provider_id IS 'Google OAuth subject ID for linking accounts';
COMMENT ON COLUMN users.role IS 'Org-specific role: owner (admin), coordinator (manager), technician (field worker)';

-- ============================================================================
-- CLIENTS TABLE
-- ============================================================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 200),
  contact_email TEXT CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  contact_phone TEXT CHECK (char_length(contact_phone) <= 20),
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clients_org_id ON clients(org_id);
CREATE INDEX idx_clients_name ON clients(org_id, name);

COMMENT ON TABLE clients IS 'AMC customers of the vendor organization';
COMMENT ON COLUMN clients.contact_email IS 'Primary contact email for billing/notifications';

-- ============================================================================
-- SITES TABLE
-- ============================================================================
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 200),
  address TEXT NOT NULL,
  gps_lat NUMERIC(10, 7) CHECK (gps_lat >= -90 AND gps_lat <= 90),
  gps_lng NUMERIC(10, 7) CHECK (gps_lng >= -180 AND gps_lng <= 180),
  metadata JSONB DEFAULT '{}

'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sites_client_id ON sites(client_id);
CREATE INDEX idx_sites_org_id ON sites(org_id);
CREATE INDEX idx_sites_gps ON sites(gps_lat, gps_lng) WHERE gps_lat IS NOT NULL AND gps_lng IS NOT NULL;

COMMENT ON TABLE sites IS 'Physical locations where assets are installed';
COMMENT ON COLUMN sites.org_id IS 'Denormalized for RLS performance';
COMMENT ON COLUMN sites.gps_lat IS 'Latitude for navigation';
COMMENT ON COLUMN sites.gps_lng IS 'Longitude for navigation';
COMMENT ON COLUMN sites.metadata IS 'Site-specific data (floor, building, gate code, etc.)';

-- ============================================================================
-- ASSETS TABLE
-- ============================================================================
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (char_length(asset_type) >= 2 AND char_length(asset_type) <= 100),
  model TEXT,
  serial_number TEXT,
  install_date DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assets_site_id ON assets(site_id);
CREATE INDEX idx_assets_org_id ON assets(org_id);
CREATE INDEX idx_assets_type ON assets(org_id, asset_type);
CREATE INDEX idx_assets_serial_number ON assets(org_id, serial_number) WHERE serial_number IS NOT NULL;

COMMENT ON TABLE assets IS 'Equipment/machinery being serviced (fire extinguishers, HVAC, generators, etc.)';
COMMENT ON COLUMN assets.asset_type IS 'Type of asset: fire_extinguisher, hvac, generator, ups, etc.';
COMMENT ON COLUMN assets.serial_number IS 'Manufacturer serial number';
COMMENT ON COLUMN assets.metadata IS 'Asset-specific fields (capacity, fuel type, last inspection, etc.)';

COMMIT;
