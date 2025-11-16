#!/bin/bash

echo "🔧 Fixing Next.js Build Error..."
echo ""

# Step 1: Stop any running dev servers
echo "1️⃣  Stopping any running dev servers..."
pkill -f "next dev" 2>/dev/null || true
echo "   ✓ Stopped"

# Step 2: Pull latest changes
echo ""
echo "2️⃣  Pulling latest changes from remote..."
git pull origin claude/analyze-codebase-01BUQjiFyGYYCLZ3Yd6HnVxc
echo "   ✓ Updated"

# Step 3: Clean everything
echo ""
echo "3️⃣  Cleaning build artifacts and dependencies..."
rm -rf .next
rm -rf node_modules
echo "   ✓ Cleaned"

# Step 4: Install dependencies
echo ""
echo "4️⃣  Installing dependencies (this may take a few minutes)..."
npm install
echo "   ✓ Installed"

# Step 5: Start dev server
echo ""
echo "5️⃣  Starting development server..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎉 Setup complete! Starting dev server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run dev
