#!/bin/bash
# Project Library Development Setup Script
# This script helps set up the development environment

echo "🚀 Setting up Project Library for local development..."

# Check if Node.js is installed
if command -v node &> /dev/null; then
    echo "✅ Node.js version: $(node --version)"
else
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# SQLite will be used for development
echo "📊 Using SQLite for development database..."
echo "✅ No additional database setup required"

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check if .env files exist
echo "🔧 Checking environment configuration..."

if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found. Creating from example..."
    cp backend/.env.example backend/.env
    echo "📝 Please edit backend/.env with your database credentials"
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "⚠️  Frontend .env.local file not found. Creating from example..."
    cp frontend/.env.example frontend/.env.local
fi

# Type check
echo "🔍 Running type checks..."
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ Type check failed"
    exit 1
fi

echo "✅ Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Run: npm run db:push (to create SQLite database)"
echo "2. Run: npm run seed:admin (to create admin user)"
echo "3. Run: npm run dev"
echo ""
echo "The application will be available at:"
echo "  Frontend: http://localhost:5000"
echo "  Backend:  http://localhost:3000"


