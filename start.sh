#!/bin/bash
# =============================================
# OTV Card Maker - Localhost Startup Script
# =============================================

echo ""
echo "🚀 OTV Card Maker - Starting..."
echo "================================"

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found! Install from: https://nodejs.org"
  exit 1
fi

NODE_VER=$(node -v)
echo "✅ Node.js: $NODE_VER"

# Check npm
if ! command -v npm &> /dev/null; then
  echo "❌ npm not found!"
  exit 1
fi
echo "✅ npm: $(npm -v)"

# Create .env if missing
if [ ! -f ".env" ]; then
  echo "📝 .env file not found — creating from template..."
  cp .env.example .env
  echo "✅ .env created! Edit it to add your Canva API keys if needed."
fi

# Install dependencies if node_modules missing
if [ ! -d "node_modules" ]; then
  echo ""
  echo "📦 Installing dependencies (first time only)..."
  npm install
  echo "✅ Dependencies installed!"
fi

echo ""
echo "================================"
echo "🌐 Starting server on: http://localhost:5000"
echo "📌 Press Ctrl+C to stop"
echo "================================"
echo ""

npm run dev
