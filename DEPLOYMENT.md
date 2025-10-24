# Spyfall Online - Deployment Guide

This guide will walk you through deploying the Spyfall Online game to Cloudflare.

## Prerequisites

1. **Cloudflare Account** - Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI** - Already installed in this project
3. **Cloudflare Login** - Run `wrangler login` if not already logged in

## Deployment Steps

### Step 1: Authenticate with Cloudflare

```bash
cd workers
wrangler login
```

This will open a browser window for you to authorize Wrangler.

### Step 2: Create D1 Database (Production)

```bash
wrangler d1 create spyfall-locations
```

**Important**: Copy the output which will look like:

```toml
[[d1_databases]]
binding = "DB"
database_name = "spyfall-locations"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Update `workers/wrangler.toml` with the real `database_id` (replace `"local-db-id"`).

### Step 3: Create Database Tables

Create a migration file to set up the locations table:

```bash
wrangler d1 execute spyfall-locations --remote --command "
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  nameTh TEXT NOT NULL,
  nameEn TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK(difficulty IN ('easy', 'medium', 'hard')),
  roles TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"
```

### Step 4: Seed Location Data (Optional)

If you want to use D1 instead of the JSON fallback, seed the data:

```bash
# You'll need to create a migration script or manually insert data
# For now, the app works fine with the JSON fallback
```

### Step 5: Deploy Cloudflare Worker

```bash
npm run workers:deploy
```

This will deploy your backend API and WebSocket server. Note the deployed URL (e.g., `https://spyfall-api.your-account.workers.dev`).

### Step 6: Update Environment Variables

Create a `.env.production` file in the root directory:

```bash
# Production API URL (from Step 5)
NEXT_PUBLIC_API_URL=https://spyfall-api.your-account.workers.dev
NEXT_PUBLIC_WS_URL=wss://spyfall-api.your-account.workers.dev
```

### Step 7: Deploy Frontend to Cloudflare Pages

#### Option A: Via Cloudflare Dashboard (Recommended)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
2. Click "Create a project" → "Connect to Git"
3. Select your repository: `Greenrenge/cf-boardgames`
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `/` (or leave empty)
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your Worker URL from Step 5
   - `NEXT_PUBLIC_WS_URL`: Your Worker WSS URL from Step 5
6. Click "Save and Deploy"

#### Option B: Via Wrangler CLI

```bash
# Build the Next.js app
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy .next --project-name=spyfall-online
```

### Step 8: Configure Custom Domain (Optional)

1. In Cloudflare Dashboard → Pages → Your Project → Custom domains
2. Add your custom domain (e.g., `spyfall.yourdomain.com`)
3. Update DNS records as instructed

## Post-Deployment Checklist

- [ ] Worker is deployed and accessible
- [ ] D1 database is created and linked
- [ ] Frontend is deployed to Pages
- [ ] Environment variables are set correctly
- [ ] WebSocket connections work (test in browser console)
- [ ] Game creation and joining works
- [ ] All game phases work correctly

## Troubleshooting

### WebSocket Connection Issues

If WebSocket connections fail:

1. Check that `NEXT_PUBLIC_WS_URL` uses `wss://` (not `ws://`)
2. Verify the Worker URL is correct
3. Check browser console for errors

### Database Errors

If you see "no such table: locations":

- This is expected - the app uses JSON fallback
- To fix, run the migration from Step 3
- Or continue using JSON fallback (works fine)

### CORS Issues

If you get CORS errors:

- Check that Worker includes CORS headers (already configured in `workers/src/index.ts`)
- Verify the frontend URL matches what's expected

## Monitoring

- **Worker Logs**: `wrangler tail` (while in workers directory)
- **Analytics**: Cloudflare Dashboard → Workers & Pages → Analytics
- **D1 Database**: Use `wrangler d1 execute spyfall-locations --remote --command "SELECT * FROM locations"`

## Environment URLs

After deployment, you'll have:

- **Worker API**: `https://spyfall-api.your-account.workers.dev`
- **Frontend**: `https://spyfall-online.pages.dev` (or your custom domain)

## Cost Estimate

Cloudflare's free tier is very generous:

- **Workers**: 100,000 requests/day (free)
- **Durable Objects**: 1 GB storage (free)
- **D1**: 5 GB storage, 5 million reads/day (free)
- **Pages**: Unlimited requests (free)

Your app should stay well within free tier limits unless you get significant traffic.

## Updating the Deployment

### Update Worker:

```bash
npm run workers:deploy
```

### Update Frontend:

- If using Git integration: Just push to your repository
- If using CLI: Run `npx wrangler pages deploy .next --project-name=spyfall-online`

## Rollback

If something goes wrong:

```bash
# List deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback [deployment-id]
```

---

**Need help?** Check the [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/) or [Pages Docs](https://developers.cloudflare.com/pages/).
