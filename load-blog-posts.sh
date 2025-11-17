#!/bin/bash
# Quick script to load blog posts into database
# Usage: ./load-blog-posts.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}=== Load Blog Posts ===${NC}\n"

# Check if DATABASE_URL is provided
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}ERROR: DATABASE_URL not set${NC}"
  echo ""
  echo "Please run this command with your DATABASE_URL:"
  echo ""
  echo -e "${GREEN}DATABASE_URL='your-connection-string' ./load-blog-posts.sh${NC}"
  echo ""
  echo "Get your connection string from:"
  echo "Supabase Dashboard → Settings → Database → Connection string (Direct connection)"
  echo ""
  exit 1
fi

# Blog seed files to load
BLOG_FILES=(
  "seeds/008_blog_fsm_guide.sql"
  "seeds/009_blog_preventive_maintenance_guide.sql"
)

echo "Loading 2 blog posts..."
echo ""

for seed in "${BLOG_FILES[@]}"; do
  if [ ! -f "$seed" ]; then
    echo -e "${RED}✗ File not found: $seed${NC}"
    continue
  fi

  echo -e "Loading: ${GREEN}$(basename $seed)${NC}"

  if psql "$DATABASE_URL" -f "$seed" -v ON_ERROR_STOP=1 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Successfully loaded $(basename $seed)${NC}\n"
  else
    echo -e "${RED}✗ Failed to load $(basename $seed)${NC}"
    echo -e "${YELLOW}Note: If the error is 'duplicate key', the blog post already exists${NC}\n"
  fi
done

echo -e "${GREEN}✓ Done!${NC}"
echo ""
echo "Visit your blog page to see the posts:"
echo "http://localhost:3000/blog"
