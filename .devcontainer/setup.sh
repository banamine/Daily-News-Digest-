#!/usr/bin/env bash
set -e

echo "🚀 Starting Codespaces Prebuild Setup..."

# 1. Install Node.js dependencies
echo "📦 Installing Node dependencies..."
npm ci || npm install

# 2. Install Python dependencies for daily_news.py
echo "🐍 Installing Python dependencies..."
pip install --upgrade pip
pip install feedparser requests jinja2 beautifulsoup4 google-genai playwright || true

# 3. Pre-install Playwright browsers for Alex Jones Live scraper
echo "🎭 Pre-installing Playwright Chromium browser..."
python3 -m playwright install chromium --with-deps || true

# 4. Prepare output directories
echo "📁 Preparing output directories..."
mkdir -p output/current output/archive

# 5. Build application
echo "⚡ Building application server..."
npm run build

echo "✅ Codespaces Prebuild Setup Completed Successfully!"
