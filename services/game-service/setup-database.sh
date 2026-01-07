#!/bin/bash

# Game Service Database Setup Script
# This script initializes the Prisma database for the game-service

set -e  # Exit on error

echo "🎮 Game Service Database Setup"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the game-service directory."
    exit 1
fi

# Check if .env exists, create from example if not
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Generate Prisma Client
echo "🔨 Generating Prisma Client..."
npm run prisma:generate
echo "✅ Prisma Client generated"

# Check if database exists
if [ -f "prisma/dev.db" ]; then
    echo "⚠️  Database already exists at prisma/dev.db"
    read -p "Do you want to reset it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Removing old database..."
        rm -f prisma/dev.db prisma/dev.db-journal
        echo "📊 Creating new database..."
        npm run prisma:migrate
    else
        echo "⏭️  Skipping database creation"
    fi
else
    echo "📊 Creating database and running migrations..."
    npm run prisma:migrate
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Review the .env file and update if needed"
echo "  2. Run 'npm run dev' to start the service"
echo "  3. Run 'npm run prisma:studio' to browse the database"
echo ""
echo "Documentation:"
echo "  - DATABASE.md - Schema documentation"
echo "  - INTEGRATION_GUIDE.md - How to integrate with existing code"
echo "  - SUMMARY.md - Overview of changes"
echo ""
