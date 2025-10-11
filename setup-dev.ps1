# Project Library Development Setup Script
# This script helps set up the development environment

Write-Host "🚀 Setting up Project Library for local development..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# SQLite will be used for development
Write-Host "📊 Using SQLite for development database..." -ForegroundColor Yellow
Write-Host "✅ No additional database setup required" -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Check if .env files exist
Write-Host "🔧 Checking environment configuration..." -ForegroundColor Yellow

if (!(Test-Path "backend/.env")) {
    Write-Host "⚠️  Backend .env file not found. Creating from example..." -ForegroundColor Yellow
    Copy-Item "backend/.env.example" "backend/.env"
    Write-Host "📝 Please edit backend/.env with your database credentials" -ForegroundColor Cyan
}

if (!(Test-Path "frontend/.env.local")) {
    Write-Host "⚠️  Frontend .env.local file not found. Creating from example..." -ForegroundColor Yellow
    Copy-Item "frontend/.env.example" "frontend/.env.local"
}

# Type check
Write-Host "🔍 Running type checks..." -ForegroundColor Yellow
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Type check failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Development environment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npm run db:push (to create SQLite database)" -ForegroundColor White
Write-Host "2. Run: npm run seed:admin (to create admin user)" -ForegroundColor White
Write-Host "3. Run: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "The application will be available at:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:3000" -ForegroundColor White


