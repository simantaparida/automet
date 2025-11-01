#!/bin/bash
# Database reset script (DESTRUCTIVE!)
# Usage: ./scripts/reset-db.sh

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
else
  echo -e "${RED}Error: .env.local file not found${NC}"
  exit 1
fi

if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}Error: DATABASE_URL not set in .env.local${NC}"
  exit 1
fi

# Confirmation prompt
echo -e "${RED}⚠️  WARNING: This will DELETE ALL DATA in your database!${NC}"
echo -e "${YELLOW}This action cannot be undone.${NC}"
echo ""
read -p "Are you sure you want to reset the database? (type 'yes' to confirm): " confirmation

if [ "$confirmation" != "yes" ]; then
  echo -e "${YELLOW}Reset cancelled.${NC}"
  exit 0
fi

echo -e "\n${GREEN}Resetting database...${NC}"

# Drop all tables (in reverse dependency order)
echo -e "${YELLOW}Dropping all tables...${NC}"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<EOF
BEGIN;

-- Drop tables in reverse order
DROP TABLE IF EXISTS usage_counters CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS org_subscriptions CASCADE;
DROP TABLE IF EXISTS billing_customers CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS inventory_audit_log CASCADE;
DROP TABLE IF EXISTS inventory_issuances CASCADE;
DROP TABLE IF EXISTS inventory_instances CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS job_check_events CASCADE;
DROP TABLE IF EXISTS job_media CASCADE;
DROP TABLE IF EXISTS job_assignments CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS sites CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Drop functions and triggers
DROP FUNCTION IF EXISTS increment_usage_counter() CASCADE;
DROP FUNCTION IF EXISTS validate_job_status_transition() CASCADE;
DROP FUNCTION IF EXISTS log_inventory_issuance() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

COMMIT;
EOF

echo -e "${GREEN}✓ All tables dropped${NC}"

# Re-run migrations
echo -e "\n${GREEN}Re-running migrations...${NC}"
./scripts/migrate.sh

echo -e "\n${GREEN}✓ Database reset complete${NC}"
echo -e "${YELLOW}Run ./scripts/seed.sh to populate demo data${NC}"
