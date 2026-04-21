#!/usr/bin/env powershell
# Samruddhi Petroleum - Automated Setup Script (Windows PowerShell)
# Run with: powershell -ExecutionPolicy Bypass -File setup.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SAMRUDDHI PETROLEUM SETUP SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "[1/5] Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version
$npmVersion = npm --version

if ($nodeVersion) {
    Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
    Write-Host "✓ npm $npmVersion found" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check PostgreSQL
Write-Host "[2/5] Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version 2>$null
    if ($pgVersion) {
        Write-Host "✓ PostgreSQL found: $pgVersion" -ForegroundColor Green
    } else {
        Write-Host "⚠ PostgreSQL might not be installed or not in PATH" -ForegroundColor Yellow
        Write-Host "  Please ensure PostgreSQL is running on localhost:5432" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ PostgreSQL check skipped" -ForegroundColor Yellow
}

Write-Host ""

# Install Backend
Write-Host "[3/5] Installing backend dependencies..." -ForegroundColor Yellow
Push-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Backend installation failed" -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green

# Generate Prisma
Write-Host "  Generating Prisma client..." -ForegroundColor Cyan
npm run prisma:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Prisma generation failed" -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "✓ Prisma client generated" -ForegroundColor Green

# Setup .env
if (-not (Test-Path .env)) {
    Write-Host "  Creating .env from .env.example..." -ForegroundColor Cyan
    Copy-Item .env.example .env
    Write-Host "✓ .env created (configure if needed)" -ForegroundColor Green
} else {
    Write-Host "✓ .env already exists" -ForegroundColor Green
}

Pop-Location

Write-Host ""

# Install Frontend
Write-Host "[4/5] Installing frontend dependencies..." -ForegroundColor Yellow
Push-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend installation failed" -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
Pop-Location

Write-Host ""

# Database Migration
Write-Host "[5/5] Setting up database schema..." -ForegroundColor Yellow
Push-Location backend
Write-Host "  Running Prisma migrations..." -ForegroundColor Cyan
npm run prisma:migrate
Write-Host "✓ Database schema created" -ForegroundColor Green
Pop-Location

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Open Terminal 1 and run:" -ForegroundColor White
Write-Host "   cd backend && npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Open Terminal 2 and run:" -ForegroundColor White
Write-Host "   cd frontend && npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Open browser and go to:" -ForegroundColor White
Write-Host "   http://localhost:5174" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Login with test credentials:" -ForegroundColor White
Write-Host "   Admin: bhalchandrard / Bhalchandra@74" -ForegroundColor Yellow
Write-Host "   DSM:   DSM001 / DSM@123" -ForegroundColor Yellow
Write-Host ""
Write-Host "For detailed instructions, see SETUP.md" -ForegroundColor Cyan
Write-Host ""
