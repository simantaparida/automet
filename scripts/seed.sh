#!/bin/bash
# Seed runner script
# Usage: ./scripts/seed.sh

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
  exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}Error: DATABASE_URL not set in .env.local${NC}"
  echo "Please add DATABASE_URL to .env.local"
  echo "You can find it in Supabase Dashboard → Settings → Database → Connection string"
  exit 1
fi

echo -e "${GREEN}Running database seeds...${NC}"

# Find all seed files in order
SEED_FILES=($(ls seeds/*.sql 2>/dev/null | sort))

if [ ${#SEED_FILES[@]} -eq 0 ]; then
  echo -e "${YELLOW}No seed files found in seeds/${NC}"
  exit 0
fi

echo "Found ${#SEED_FILES[@]} seed file(s)"

# Run each seed
for seed in "${SEED_FILES[@]}"; do
  echo -e "\nRunning: ${GREEN}$(basename $seed)${NC}"

  if psql "$DATABASE_URL" -f "$seed" -v ON_ERROR_STOP=1; then
    echo -e "${GREEN}✓ Successfully applied $(basename $seed)${NC}"
  else
    echo -e "${RED}✗ Failed to apply $(basename $seed)${NC}"
    exit 1
  fi
done

echo -e "\n${GREEN}✓ All seeds completed successfully${NC}"
echo -e "\n${YELLOW}Demo credentials:${NC}"
echo "  Email: admin@automet.dev"
echo "  Note: You need to create this user in Supabase Auth Dashboard"
echo "  and use the UUID: 20000000-0000-0000-0000-000000000001"
