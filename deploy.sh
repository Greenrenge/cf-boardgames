#!/bin/bash

# Spyfall Online - Quick Deployment Script
# This script helps deploy both the worker and frontend

set -e

echo "🚀 Deploying Spyfall Online to Cloudflare..."

# Check if wrangler is logged in
if ! wrangler whoami &> /dev/null; then
  echo "❌ Not logged in to Cloudflare. Run 'wrangler login' first."
  exit 1
fi

echo "✓ Logged in to Cloudflare"

# Deploy Worker
echo ""
echo "📦 Deploying Cloudflare Worker..."
cd workers
wrangler deploy
cd ..

# Get worker URL
echo ""
echo "✅ Worker deployed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Note your Worker URL from above (e.g., https://spyfall-api.your-account.workers.dev)"
echo "2. Create .env.production with:"
echo "   NEXT_PUBLIC_API_URL=https://spyfall-api.your-account.workers.dev"
echo "   NEXT_PUBLIC_WS_URL=wss://spyfall-api.your-account.workers.dev"
echo "3. Deploy frontend:"
echo "   - Via Cloudflare Dashboard: Connect your Git repo"
echo "   - Via CLI: npm run build && npx wrangler pages deploy .next --project-name=spyfall-online"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions"
