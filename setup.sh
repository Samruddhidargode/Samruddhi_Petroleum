#!/bin/bash
# Samruddhi Petroleum - Automated Setup Script (Mac/Linux)
# Run with: bash setup.sh

echo "========================================"
echo "SAMRUDDHI PETROLEUM SETUP SCRIPT"
echo "========================================"
echo ""

# Check Node.js
echo "[1/5] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "✗ Node.js not found. Please install from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo "✓ Node.js $NODE_VERSION found"
echo "✓ npm $NPM_VERSION found"
echo ""

# Check PostgreSQL
echo "[2/5] Checking PostgreSQL installation..."
if command -v psql &> /dev/null; then
    PG_VERSION=$(psql --version)
    echo "✓ PostgreSQL found: $PG_VERSION"
else
    echo "⚠ PostgreSQL might not be installed or not in PATH"
    echo "  Please ensure PostgreSQL is running on localhost:5432"
fi
echo ""

# Install Backend
echo "[3/5] Installing backend dependencies..."
cd backend || exit 1
npm install
if [ $? -ne 0 ]; then
    echo "✗ Backend installation failed"
    exit 1
fi
echo "✓ Backend dependencies installed"

# Generate Prisma
echo "  Generating Prisma client..."
npm run prisma:generate
if [ $? -ne 0 ]; then
    echo "✗ Prisma generation failed"
    exit 1
fi
echo "✓ Prisma client generated"

# Setup .env
if [ ! -f .env ]; then
    echo "  Creating .env from .env.example..."
    cp .env.example .env
    echo "✓ .env created (configure if needed)"
else
    echo "✓ .env already exists"
fi

cd ..
echo ""

# Install Frontend
echo "[4/5] Installing frontend dependencies..."
cd frontend || exit 1
npm install
if [ $? -ne 0 ]; then
    echo "✗ Frontend installation failed"
    exit 1
fi
echo "✓ Frontend dependencies installed"
cd ..
echo ""

# Database Migration
echo "[5/5] Setting up database schema..."
cd backend || exit 1
echo "  Running Prisma migrations..."
npm run prisma:migrate
echo "✓ Database schema created"
cd ..
echo ""

echo "========================================"
echo "✓ SETUP COMPLETE!"
echo "========================================"
echo ""
echo "NEXT STEPS:"
echo "1. Open Terminal 1 and run:"
echo "   cd backend && npm run dev"
echo ""
echo "2. Open Terminal 2 and run:"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Open browser and go to:"
echo "   http://localhost:5174"
echo ""
echo "4. Login with test credentials:"
echo "   Admin: bhalchandrard / Bhalchandra@74"
echo "   DSM:   DSM001 / DSM@123"
echo ""
echo "For detailed instructions, see SETUP.md"
echo ""
