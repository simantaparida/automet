#!/bin/bash
# Migration runner script
# Usage: ./scripts/migrate.sh [--dry-run]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
else
  echo -e "${RED}Error: .env.local file not found${NC}"
  echo "Please copy .env.example to .env.local and fill in your credentials"
  exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  if [ -z "$SUPABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL or SUPABASE_URL not set in .env.local${NC}"
    exit 1
  fi
  # Construct DATABASE_URL from SUPABASE_URL if not provided
  echo -e "${YELLOW}Warning: DATABASE_URL not set. You may need to set it manually for migrations.${NC}"
  echo "You can find it in Supabase Dashboard → Settings → Database → Connection string"
  exit 1
fi

DRY_RUN=false
if [ "$1" == "--dry-run" ]; then
  DRY_RUN=true
  echo -e "${YELLOW}Running in DRY-RUN mode (no changes will be made)${NC}"
fi

echo -e "${GREEN}Running database migrations...${NC}"

# Find all migration files (*.sql, not *.down.sql)
MIGRATION_FILES=($(ls migrations/*.sql 2>/dev/null | grep -v '\.down\.sql$' | sort))

if [ ${#MIGRATION_FILES[@]} -eq 0 ]; then
  echo -e "${YELLOW}No migration files found in migrations/${NC}"
  exit 0
fi

echo "Found ${#MIGRATION_FILES[@]} migration(s)"

# Run each migration
for migration in "${MIGRATION_FILES[@]}"; do
  echo -e "\nApplying: ${GREEN}$(basename $migration)${NC}"

  if [ "$DRY_RUN" == true ]; then
    echo -e "${YELLOW}[DRY-RUN] Would execute: psql \$DATABASE_URL -f $migration${NC}"
  else
    if psql "$DATABASE_URL" -f "$migration" -v ON_ERROR_STOP=1; then
      echo -e "${GREEN}✓ Successfully applied $(basename $migration)${NC}"
    else
      echo -e "${RED}✗ Failed to apply $(basename $migration)${NC}"
      echo -e "${YELLOW}To rollback, run: psql \$DATABASE_URL -f ${migration%.sql}.down.sql${NC}"
      exit 1
    fi
  fi
done

echo -e "\n${GREEN}✓ All migrations completed successfully${NC}"
