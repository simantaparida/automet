#!/bin/bash
# Batch upload all blog SQL files from ready-to-upload folder
# Usage: DATABASE_URL='your-url' ./scripts/upload-blogs.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Blog Batch Upload ===${NC}\n"

# Check if DATABASE_URL is provided
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}ERROR: DATABASE_URL not set${NC}"
  echo ""
  echo "Please run this command with your DATABASE_URL:"
  echo ""
  echo -e "${GREEN}DATABASE_URL='your-connection-string' ./scripts/upload-blogs.sh${NC}"
  echo ""
  echo "Get your connection string from:"
  echo "Supabase Dashboard → Settings → Database → Connection string (Direct connection)"
  echo ""
  exit 1
fi

# Find all SQL files in ready-to-upload and seeds folders
BLOG_FILES=()

# Check ready-to-upload folder
if [ -d "blogs/ready-to-upload" ]; then
  while IFS= read -r -d '' file; do
    BLOG_FILES+=("$file")
  done < <(find blogs/ready-to-upload -name "*.sql" -print0 2>/dev/null)
fi

# Check seeds folder for blog files
while IFS= read -r -d '' file; do
  BLOG_FILES+=("$file")
done < <(find seeds -name "*blog*.sql" -print0 2>/dev/null)

if [ ${#BLOG_FILES[@]} -eq 0 ]; then
  echo -e "${YELLOW}No blog SQL files found${NC}"
  echo ""
  echo "Checked locations:"
  echo "  - blogs/ready-to-upload/*.sql"
  echo "  - seeds/*blog*.sql"
  exit 0
fi

echo -e "Found ${GREEN}${#BLOG_FILES[@]}${NC} blog SQL file(s) to upload"
echo ""

# Ask for confirmation
echo -e "${YELLOW}Files to upload:${NC}"
for file in "${BLOG_FILES[@]}"; do
  echo "  - $(basename $file)"
done
echo ""

read -p "Continue with upload? [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Upload cancelled"
  exit 0
fi

echo ""

# Upload each file
SUCCESS_COUNT=0
SKIP_COUNT=0
FAIL_COUNT=0

for file in "${BLOG_FILES[@]}"; do
  filename=$(basename "$file")
  echo -e "Uploading: ${BLUE}$filename${NC}"

  if psql "$DATABASE_URL" -f "$file" -v ON_ERROR_STOP=1 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Success${NC}\n"
    ((SUCCESS_COUNT++))

    # Move to uploaded archive if from ready-to-upload
    if [[ "$file" == blogs/ready-to-upload/* ]]; then
      mkdir -p blogs/uploaded
      mv "$file" "blogs/uploaded/$filename"
      echo -e "  ${YELLOW}→ Moved to blogs/uploaded/${NC}\n"
    fi
  else
    # Check if it's a duplicate key error (already exists)
    if psql "$DATABASE_URL" -f "$file" 2>&1 | grep -q "duplicate key"; then
      echo -e "${YELLOW}⊘ Already exists (skipped)${NC}\n"
      ((SKIP_COUNT++))
    else
      echo -e "${RED}✗ Failed${NC}\n"
      ((FAIL_COUNT++))
    fi
  fi
done

# Summary
echo -e "${BLUE}=== Upload Summary ===${NC}\n"
echo -e "  ${GREEN}✓ Uploaded:${NC} $SUCCESS_COUNT"
echo -e "  ${YELLOW}⊘ Skipped:${NC}  $SKIP_COUNT (already exist)"
echo -e "  ${RED}✗ Failed:${NC}   $FAIL_COUNT"
echo ""

if [ $SUCCESS_COUNT -gt 0 ]; then
  echo -e "${GREEN}✓ Done! Visit your blog page to see the posts:${NC}"
  echo "  http://localhost:3000/blog"
  echo ""
fi

if [ $FAIL_COUNT -gt 0 ]; then
  echo -e "${RED}Some uploads failed. Check the errors above.${NC}"
  exit 1
fi
