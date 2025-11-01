#!/bin/bash
# Rollback last migration
# Usage: ./scripts/rollback.sh [migration_number]

set -e

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

# If specific migration provided, rollback that one
if [ -n "$1" ]; then
  MIGRATION_FILE="migrations/$1.down.sql"
  if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}Error: Rollback file not found: $MIGRATION_FILE${NC}"
    exit 1
  fi
else
  # Find the last migration
  LAST_MIGRATION=$(ls migrations/*.sql 2>/dev/null | grep -v '\.down\.sql$' | sort -r | head -n1)

  if [ -z "$LAST_MIGRATION" ]; then
    echo -e "${YELLOW}No migrations found to rollback${NC}"
    exit 0
  fi

  MIGRATION_FILE="${LAST_MIGRATION%.sql}.down.sql"

  if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}Error: Rollback file not found: $MIGRATION_FILE${NC}"
    exit 1
  fi
fi

echo -e "${YELLOW}Rolling back: $(basename $MIGRATION_FILE)${NC}"

# Confirm
read -p "Are you sure? (y/N): " confirmation
if [[ ! "$confirmation" =~ ^[Yy]$ ]]; then
  echo "Rollback cancelled"
  exit 0
fi

# Execute rollback
if psql "$DATABASE_URL" -f "$MIGRATION_FILE" -v ON_ERROR_STOP=1; then
  echo -e "${GREEN}✓ Rollback successful${NC}"
else
  echo -e "${RED}✗ Rollback failed${NC}"
  exit 1
fi
