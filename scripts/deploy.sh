#!/bin/bash

echo "🚀 Hosana Housing - Vercel Deployment"
echo "======================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel
echo "🔐 Logging in to Vercel..."
vercel login

# Link project
echo "🔗 Linking project..."
vercel link

# Pull environment variables
echo "📥 Pulling environment variables..."
vercel env pull

# Build locally
echo "🔨 Building project..."
npm run build

# Deploy to production
echo "🌍 Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo "📍 Check your Vercel dashboard for the URL"