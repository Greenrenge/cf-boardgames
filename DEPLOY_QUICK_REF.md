# Quick Deployment Reference

## What We've Set Up

✅ **D1 Database Created**

- Database ID: `9398a8ee-0ffc-4279-b223-ab8fb6698395`
- Region: APAC
- Table: `locations` (created via migration)

✅ **Worker Configuration**

- Name: `spyfall-api`
- Durable Objects: Enabled for `GameRoom`
- D1 Binding: Connected to production database
- Fallback: JSON data if D1 unavailable

## Deployment Commands

### Deploy Worker Only

```bash
npm run workers:deploy
```

### Deploy Everything

```bash
./deploy.sh
```

### Check Worker Status

```bash
cd workers && wrangler deployments list
```

### View Worker Logs

```bash
cd workers && wrangler tail
```

## After Worker Deployment

1. **Copy your Worker URL** from the deployment output (e.g., `https://spyfall-api.greenrenge.workers.dev`)

2. **Update environment variables**:
   - For local testing: Update `.env.local`
   - For production: Create `.env.production`

3. **Deploy Frontend** (choose one):

   **Option A: Cloudflare Dashboard** (Easiest)
   - Go to Cloudflare Dashboard → Pages
   - Connect your Git repository
   - Set build command: `npm run build`
   - Set build output: `.next`
   - Add environment variables from step 2

   **Option B: Wrangler CLI**

   ```bash
   npm run build
   npx wrangler pages deploy .next --project-name=spyfall-online
   ```

## Testing Production Deployment

1. **Test Worker Health**:

   ```bash
   curl https://your-worker-url.workers.dev/health
   ```

2. **Test Locations API**:

   ```bash
   curl https://your-worker-url.workers.dev/api/locations
   ```

3. **Test Room Creation**:
   - Open your deployed frontend
   - Create a new room
   - Join with multiple browsers/devices
   - Test all game features

## Environment Variables Needed

### For Production (.env.production)

```bash
NEXT_PUBLIC_API_URL=https://spyfall-api.greenrenge.workers.dev
NEXT_PUBLIC_WS_URL=wss://spyfall-api.greenrenge.workers.dev
```

### For Cloudflare Pages Dashboard

Add these in the Pages project settings:

- `NEXT_PUBLIC_API_URL`: Your Worker URL (https://)
- `NEXT_PUBLIC_WS_URL`: Your Worker URL (wss://)

## Troubleshooting

### "Unauthorized" errors

```bash
wrangler login
```

### "Database not found" errors

The app uses JSON fallback - this is fine!
To use D1, ensure the migration ran successfully.

### WebSocket connection issues

- Check that you're using `wss://` (not `ws://`) in production
- Verify CORS settings in worker allow your frontend domain

### Build errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

## Cost Monitoring

Check your usage at: https://dash.cloudflare.com

Free tier limits (should be plenty):

- Workers: 100,000 requests/day
- Durable Objects: 1 GB storage
- D1: 5 GB storage, 5M reads/day
- Pages: Unlimited requests

## Useful Commands

```bash
# Check Cloudflare account
wrangler whoami

# List all workers
wrangler deployments list

# View D1 databases
wrangler d1 list

# Query D1 database
wrangler d1 execute spyfall-locations --remote --command "SELECT COUNT(*) FROM locations"

# Rollback worker
wrangler rollback <deployment-id>
```

## Next Steps

1. ✅ Worker deployed → Note the URL
2. ⏳ Set environment variables
3. ⏳ Deploy frontend to Pages
4. ⏳ Test the full application
5. ⏳ (Optional) Set up custom domain
6. ⏳ (Optional) Seed D1 database with locations

---

See **DEPLOYMENT.md** for detailed step-by-step instructions.
