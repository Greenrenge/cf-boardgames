# Quickstart Guide: Spyfall Online

**Last Updated**: 2025-10-24  
**Target Audience**: Developers setting up the project locally

## Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Cloudflare Account**: Free tier sufficient
- **Wrangler CLI**: Cloudflare Workers development tool
- **Git**: For version control

---

## Project Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd cf-boardgames
git checkout 001-spyfall-online
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Wrangler globally (if not already installed)
npm install -g wrangler
```

### 3. Configure Cloudflare

```bash
# Login to Cloudflare
wrangler login

# Verify login
wrangler whoami
```

### 4. Set Up Environment Variables

Create `.env.local` for Next.js:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_WS_URL=ws://localhost:8787
```

### 5. Initialize Cloudflare Services

```bash
# Create D1 database (local for development)
wrangler d1 create spyfall-db-dev

# Create R2 bucket (production only - local uses mock)
wrangler r2 bucket create spyfall-images
```

### 6. Run Database Migrations

```bash
# Apply migrations to local D1
wrangler d1 migrations apply spyfall-db-dev --local

# Seed with location data
wrangler d1 execute spyfall-db-dev --local --file=migrations/seed-locations.sql
```

---

## Local Development

### Terminal 1: Start Backend (Cloudflare Workers)

```bash
cd workers
wrangler dev --local --persist
```

This starts:

- Cloudflare Workers on `http://localhost:8787`
- Durable Objects (in-memory)
- D1 (local SQLite)

### Terminal 2: Start Frontend (Next.js)

```bash
npm run dev
```

This starts:

- Next.js dev server on `http://localhost:3000`
- Hot reload enabled
- TypeScript type checking

### Open in Browser

Navigate to `http://localhost:3000`

---

## Development Workflow

### Test Multi-Player Locally

1. Open `http://localhost:3000` in your main browser
2. Enter name "Player 1" and click "Create Room"
3. Copy the room code shown
4. Open 3-4 incognito windows
5. In each window, enter different names and paste room code
6. In first window (host), click "Start Game" once 4+ players joined
7. Each window will show different roles
8. Test chat, voting, and other features

### View WebSocket Messages

Open browser DevTools:

1. Go to Network tab
2. Filter by "WS" (WebSockets)
3. Click on the WebSocket connection
4. View Messages tab to see real-time communication

### Test Mobile View

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone or Android device
4. Test responsive layout

---

## Testing Guidelines

Since we use **Playground Over Tests** (per constitution):

### Manual Testing Checklist

**User Story 1: Create/Join Room**

- [ ] Create room generates unique 6-char code
- [ ] Join room with valid code succeeds
- [ ] Join with invalid code shows error
- [ ] Player list updates in real-time when others join
- [ ] Host badge shows on first player
- [ ] Name duplicates get (2), (3) appended

**User Story 2: Play Spyfall Round**

- [ ] Start game assigns roles (1 spy, others non-spy)
- [ ] Spy sees "You are the spy" with no location
- [ ] Non-spies see location + specific role + reference sheet
- [ ] Chat messages appear on all clients within 1 second
- [ ] Turn indicator shows on relevant messages
- [ ] Timer counts down synchronously across clients
- [ ] Voting phase activates when timer expires
- [ ] Vote results reveal eliminated player
- [ ] Scores update correctly based on outcome

**User Story 3: Spy Guess**

- [ ] Spy guess interface shows if spy survives voting
- [ ] Only spy sees location selection list
- [ ] Correct guess awards spy 2 points
- [ ] Incorrect guess awards non-spies 1 point each

**User Story 4: Multi-Round**

- [ ] Scores persist across rounds
- [ ] New round assigns new roles and location
- [ ] Previous chat cleared for new round
- [ ] Leaderboard shows cumulative scores

**User Story 5: Pluggable Games**

- [ ] Game type selection shows on room creation
- [ ] Werewolf option shows as "Coming Soon"
- [ ] Code structure separates game logic from room logic

**Edge Cases**

- [ ] Disconnect mid-game: Player marked disconnected
- [ ] Reconnect within 2 min: Player state restored
- [ ] Host disconnect: Host transfers to next player
- [ ] Room full (10 players): 11th player rejected
- [ ] Invalid room code: Clear error message
- [ ] Start game with <4 players: Button disabled
- [ ] Timer expires during voting: Auto-submit remaining votes
- [ ] Voting tie: No elimination, proceed to spy guess
- [ ] localStorage persistence: Name saved for next visit

---

## Project Structure Navigation

### Frontend (Next.js)

```
app/
├── page.tsx              # Home page: Create/Join room
├── room/[code]/page.tsx  # Game room UI
└── api/                  # API route proxies (optional)

components/
├── game/                 # Game-specific components
│   ├── RoleCard.tsx
│   ├── ChatPanel.tsx
│   ├── VotingInterface.tsx
│   └── ...
└── room/                 # Room management components
    ├── CreateRoom.tsx
    ├── JoinRoom.tsx
    └── Lobby.tsx

lib/
├── websocket.ts          # WebSocket client logic
├── storage.ts            # localStorage helpers
└── types.ts              # Shared TypeScript types
```

### Backend (Cloudflare Workers)

```
workers/src/
├── index.ts              # Worker entry point
├── durable-objects/
│   └── GameRoom.ts       # Room state + WebSocket handling
├── handlers/
│   ├── room.ts           # Room HTTP handlers
│   └── game.ts           # Game logic
└── db/
    └── schema.sql        # D1 schema
```

---

## Common Commands

### Frontend

```bash
# Development
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Lint code
npm run lint

# Format code
npm run format
```

### Backend

```bash
# Local development
wrangler dev --local --persist

# Deploy to production
wrangler deploy

# View logs
wrangler tail

# Execute SQL
wrangler d1 execute spyfall-db-dev --local --command="SELECT * FROM locations"

# Run migrations
wrangler d1 migrations apply spyfall-db-dev --local
```

---

## Deployment

### Deploy Frontend (Cloudflare Pages)

**Option 1: Git Integration (Recommended)**

1. Push code to GitHub
2. Connect repository to Cloudflare Pages
3. Configure build:
   - Build command: `npm run build`
   - Build output: `.next`
   - Framework preset: Next.js
4. Every push auto-deploys

**Option 2: Manual Deploy**

```bash
npm run build
npx wrangler pages deploy .next
```

### Deploy Backend (Cloudflare Workers)

```bash
cd workers
wrangler deploy
```

### Run Production Migrations

```bash
wrangler d1 migrations apply spyfall-db-prod --remote
```

---

## Troubleshooting

### WebSocket Connection Fails

**Problem**: Can't connect to WebSocket  
**Solution**:

- Check if Workers dev server is running (`wrangler dev`)
- Verify `NEXT_PUBLIC_WS_URL` points to correct port
- Check browser console for errors

### D1 Database Not Found

**Problem**: `Error: Database not found`  
**Solution**:

```bash
wrangler d1 create spyfall-db-dev
# Copy database ID to wrangler.toml
wrangler d1 migrations apply spyfall-db-dev --local
```

### Hot Reload Not Working

**Problem**: Changes not reflecting  
**Solution**:

- For frontend: Restart `npm run dev`
- For backend: Restart `wrangler dev`
- Clear browser cache (Ctrl+Shift+R)

### Port Already in Use

**Problem**: `Error: Port 3000 is already in use`  
**Solution**:

```bash
# Find and kill process using port
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Durable Objects State Corrupted

**Problem**: Room state seems broken  
**Solution**:

```bash
# Stop wrangler dev
# Delete local state: rm -rf .wrangler/state
# Restart wrangler dev
```

---

## Environment-Specific Notes

### Development (Local)

- D1 uses local SQLite file (`.wrangler/state/d1/`)
- R2 uses filesystem mock (no actual bucket needed)
- WebSockets work via local Workers
- No real Cloudflare edge network

### Staging (Cloudflare)

- Separate D1 database: `spyfall-db-staging`
- Separate R2 bucket: `spyfall-images-staging`
- Environment variables via Wrangler secrets
- Preview URLs for each deployment

### Production (Cloudflare)

- Production D1: `spyfall-db-prod`
- Production R2: `spyfall-images`
- Custom domain configured
- CDN caching enabled
- Rate limiting active

---

## Next Steps

1. ✅ Set up local development environment (you are here)
2. 📝 Review specification: `specs/001-spyfall-online/spec.md`
3. 📝 Review data model: `specs/001-spyfall-online/data-model.md`
4. 📝 Review contracts: `specs/001-spyfall-online/contracts/`
5. 🛠️ Start implementation: Use `/speckit.tasks` to generate task list
6. 🎮 Build playground: Test each user story as you implement
7. 🚀 Deploy to staging: Test with real users
8. 🎉 Ship to production!

---

## Need Help?

- Constitution principles: `.specify/memory/constitution.md`
- Research decisions: `specs/001-spyfall-online/research.md`
- WebSocket protocol: `specs/001-spyfall-online/contracts/websocket.md`
- HTTP API: `specs/001-spyfall-online/contracts/http-api.md`

Happy coding! 🎲
