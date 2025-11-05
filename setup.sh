#!/bin/bash

# LabTracker Quick Setup Script
# This script sets up the entire application in one command

echo "🚀 LabTracker Quick Setup"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Install dependencies
echo -e "${BLUE}📦 Step 1: Installing dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Root dependencies already installed or failed${NC}"
fi
echo ""

# Step 2: Generate Prisma Client
echo -e "${BLUE}🔧 Step 2: Generating Prisma client...${NC}"
cd server
npx prisma generate
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Prisma generate failed - you may need to run this manually${NC}"
fi
echo ""

# Step 3: Create database
echo -e "${BLUE}💾 Step 3: Creating database and running migrations...${NC}"
npx prisma migrate dev --name init
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Migration failed - database may already exist${NC}"
fi
echo ""

# Step 4: Seed database
echo -e "${BLUE}🌱 Step 4: Seeding database with sample data...${NC}"
npx prisma db seed
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Seeding failed - data may already exist${NC}"
fi
echo ""

cd ..

# Done
echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "🎯 Next Steps:"
echo "  1. Run 'npm run dev' to start both frontend and backend"
echo "  2. Open http://localhost:5173 in your browser"
echo "  3. Login with: sarah.chen@biolab.edu / password123"
echo ""
echo "📚 Demo Accounts:"
echo "  • PI/Lab Manager: sarah.chen@biolab.edu"
echo "  • Postdoc: michael.rodriguez@biolab.edu"
echo "  • Grad Student: emily.zhang@biolab.edu"
echo "  • Password for all: password123"
echo ""
echo "🤖 Optional: Add your ANTHROPIC_API_KEY to server/.env for AI features"
echo ""
echo -e "${GREEN}Happy Lab Managing! 🧬🔬${NC}"
