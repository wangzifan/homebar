#!/bin/bash

# Quick script to run MyHomeBar locally with mock backend

set -e

echo "========================================="
echo "MyHomeBar Local Development Setup"
echo "========================================="
echo ""

cd frontend

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file for mock backend..."
    cp .env.mock .env
    echo "✓ .env file created"
else
    echo "ℹ️  .env file already exists"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm install
    echo "✓ Dependencies installed"
else
    echo "✓ Dependencies already installed"
fi

echo ""
echo "========================================="
echo "🚀 Starting MyHomeBar..."
echo "========================================="
echo ""
echo "The app will open at: http://localhost:3000"
echo ""
echo "Using: 🎭 Mock Backend (no AWS required)"
echo "- 12 sample cocktail recipes included"
echo "- 24 sample inventory items included"
echo "- Data resets on page refresh"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
