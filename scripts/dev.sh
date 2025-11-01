#!/bin/bash
# One-command development setup
# Usage: ./scripts/dev.sh [local|start]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

MODE=${1:-local}

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════╗"
echo "║                                           ║"
echo "║      Automet Development Setup            ║"
echo "║                                           ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo -e "${YELLOW}⚠️  .env.local not found${NC}"
  echo "Copying .env.example to .env.local..."
  cp .env.example .env.local
  echo -e "${RED}Please fill in your credentials in .env.local and run this script again${NC}"
  exit 1
fi

if [ "$MODE" == "local" ]; then
  echo -e "${GREEN}Running full local setup...${NC}\n"

  # Install dependencies if node_modules doesn't exist
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}\n"
  fi

  # Run migrations
  echo -e "${YELLOW}Running migrations...${NC}"
  if ./scripts/migrate.sh; then
    echo -e "${GREEN}✓ Migrations complete${NC}\n"
  else
    echo -e "${RED}✗ Migrations failed${NC}"
    echo -e "${YELLOW}Make sure DATABASE_URL is set in .env.local${NC}"
    exit 1
  fi

  # Run seeds
  echo -e "${YELLOW}Running seeds...${NC}"
  if ./scripts/seed.sh; then
    echo -e "${GREEN}✓ Seeds complete${NC}\n"
  else
    echo -e "${YELLOW}Seeds failed (this is okay if already seeded)${NC}\n"
  fi

  # Start dev server
  echo -e "${GREEN}Starting development server...${NC}\n"
  npm run dev

elif [ "$MODE" == "start" ]; then
  echo -e "${GREEN}Starting development server (skip setup)...${NC}\n"
  npm run dev

else
  echo -e "${RED}Unknown mode: $MODE${NC}"
  echo "Usage: ./scripts/dev.sh [local|start]"
  echo "  local - Full setup (install deps, run migrations/seeds, start server)"
  echo "  start - Just start the server"
  exit 1
fi
