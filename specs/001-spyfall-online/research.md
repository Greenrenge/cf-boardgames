# Research: Spyfall Online - Thai Edition

**Date**: 2025-10-24  
**Feature**: Real-time multiplayer game on Cloudflare platform

## Technology Decisions

### 1. Frontend Framework: Next.js 14 + React 18

**Decision**: Use Next.js 14 with App Router for the frontend

**Rationale**:
- **Server Components**: Reduce client bundle size for initial page loads
- **Static Generation**: Home page and non-dynamic content can be pre-rendered
- **API Routes**: Simple proxy layer to Cloudflare Workers
- **Image Optimization**: Built-in optimization for location images
- **TypeScript Support**: First-class TypeScript integration
- **Developer Experience**: Hot reload, fast refresh, excellent tooling

**Alternatives Considered**:
- **Pure React (Vite)**: Simpler but loses SSR/SSG benefits and image optimization
- **SvelteKit**: Smaller bundle but less ecosystem maturity and team familiarity
- **Remix**: Strong server-side focus but over-engineered for this use case

**Best Practices**:
- Use App Router (not Pages Router) for modern Next.js patterns
- Keep components small and focused (single responsibility)
- Use Server Components by default, Client Components only when needed (interactivity, WebSocket)
- Colocate components with their routes when possible

---

### 2. Styling: Tailwind CSS 3.x

**Decision**: Use Tailwind CSS for styling with utility-first approach

**Rationale**:
- **Consistency**: Enforces design system through utility classes
- **Minimal CSS**: No custom CSS files, all styling in JSX
- **Responsive**: Mobile-first responsive utilities built-in
- **Performance**: PurgeCSS removes unused styles automatically
- **Developer Speed**: No context switching between HTML and CSS files

**Alternatives Considered**:
- **CSS Modules**: More traditional but requires separate files and naming conventions
- **Styled Components**: Runtime CSS-in-JS has performance overhead
- **Vanilla CSS**: Requires manual consistency enforcement

**Best Practices**:
- Configure Tailwind theme for project-specific colors, spacing
- Use `@apply` sparingly (only for repeated patterns)
- Prefer composition over custom classes
- Use Tailwind's built-in responsive breakpoints

---

### 3. Backend: Cloudflare Workers + Hono

**Decision**: Use Cloudflare Workers with Hono framework for HTTP handlers

**Rationale**:
- **Serverless**: No server management, auto-scaling
- **Edge Computing**: Low latency worldwide (deployed to 275+ locations)
- **Cost Effective**: Free tier: 100k requests/day, paid tier very affordable
- **Integrated Platform**: D1, R2, Durable Objects all in same ecosystem
- **Hono Framework**: Lightweight (~12KB), Express-like API, fast routing

**Alternatives Considered**:
- **Node.js + Express**: Requires server management, higher latency
- **Vercel Edge Functions**: Locked into Vercel, less flexible than Cloudflare
- **AWS Lambda**: Higher cold start times, more complex configuration

**Best Practices**:
- Keep worker entry point minimal (routing only)
- Separate handlers by domain (room, game, websocket)
- Use environment variables for configuration
- Handle errors gracefully with proper status codes

---

### 4. Real-Time: Cloudflare Durable Objects

**Decision**: Use Durable Objects for room state and WebSocket connections

**Rationale**:
- **Strong Consistency**: Each room is a single Durable Object with transactional state
- **WebSocket Support**: Built-in WebSocket handling with automatic connection management
- **Global Coordination**: Each room exists in exactly one location, preventing split-brain
- **Automatic Hibernation**: Inactive objects sleep to save resources
- **Request Routing**: Cloudflare routes requests to the correct object automatically

**Alternatives Considered**:
- **Redis Pub/Sub**: Requires separate Redis instance, additional cost/complexity
- **WebSocket API Gateway**: AWS-specific, higher latency, more complex setup
- **Pusher/Ably**: Third-party services, additional cost, data leaves Cloudflare network

**Best Practices**:
- One Durable Object per game room (not per player)
- Store room ID as object name for predictable routing
- Keep in-memory state minimal (player list, game phase, current turn)
- Persist critical state to D1 for recovery
- Implement heartbeat/ping-pong for connection health
- Clean up disconnected players after timeout

**Durable Objects Pattern**:
```typescript
export class GameRoom {
  state: DurableObjectState;
  sessions: Map<WebSocket, PlayerSession>;
  
  async fetch(request: Request) {
    // Handle WebSocket upgrade
    if (request.headers.get("Upgrade") === "websocket") {
      const [client, server] = Object.values(new WebSocketPair());
      this.handleSession(server);
      return new Response(null, { status: 101, webSocket: client });
    }
    // Handle HTTP requests (state queries, admin commands)
    return handleHTTP(request);
  }
  
  handleSession(websocket: WebSocket) {
    websocket.accept();
    // Track session, broadcast to all
  }
}
```

---

### 5. Persistent Storage: Cloudflare D1 (SQLite)

**Decision**: Use D1 for persistent data (locations, game configs)

**Rationale**:
- **Integrated**: Part of Cloudflare Workers platform
- **Global Replication**: Reads from edge, writes to primary
- **Cost Effective**: Free tier: 5GB storage, 5M rows read/day
- **SQL Interface**: Standard SQLite dialect, familiar
- **Low Latency**: Edge-cached reads for location data

**Alternatives Considered**:
- **PostgreSQL (Neon/Supabase)**: Overkill for this use case, external dependency
- **MongoDB Atlas**: NoSQL not needed, external network calls
- **JSON files in R2**: Query-able but not queryable with SQL

**Best Practices**:
- Use D1 for read-heavy data (locations, game configs)
- Durable Objects for write-heavy real-time state (player positions, votes)
- Create indexes for frequently queried fields (location difficulty level)
- Use prepared statements for security
- Keep schema simple (no complex joins)

**Schema Design**:
- `locations` table: id, name_th, difficulty, roles (JSON), image_url
- `game_configs` table: game_type, timer_range, player_limits
- Room state lives in Durable Objects, not D1

---

### 6. Static Assets: Cloudflare R2

**Decision**: Use R2 for storing location images

**Rationale**:
- **S3-Compatible**: Standard object storage API
- **Zero Egress Fees**: No bandwidth charges (unlike AWS S3)
- **CDN Integration**: Automatic edge caching via Cloudflare CDN
- **Cost Effective**: $0.015/GB storage, $0 egress

**Alternatives Considered**:
- **AWS S3**: Expensive egress fees ($0.09/GB)
- **Next.js public folder**: Limited to build-time assets, not dynamic uploads
- **External CDN**: Additional service to manage

**Best Practices**:
- Serve images through public R2 bucket or Workers route
- Use image compression (WebP format)
- Set appropriate cache headers (1 year for immutable assets)
- Organize by path: `/locations/{id}/{image}.webp`

---

### 7. Session Management: localStorage

**Decision**: Use browser localStorage for player name and session resumption

**Rationale**:
- **Simplicity**: No backend session management, no cookies, no auth
- **Constitution Aligned**: "Do Less, Get Works" - simplest solution
- **Privacy Friendly**: No server-side user tracking
- **Offline Capable**: Name persists even if server unavailable

**Alternatives Considered**:
- **Cookies**: Over-engineered for this simple use case
- **Session Tokens**: Requires backend session store, unnecessary complexity
- **OAuth/Auth0**: Way too complex for anonymous gameplay

**Best Practices**:
- Store: `{ playerName, lastRoomCode, playerId }`
- Generate client-side UUID as playerId for reconnection
- Clear on explicit "logout" or "new name"
- Validate on server (don't trust client data blindly)

**Storage Pattern**:
```typescript
// Save
localStorage.setItem('spyfall-session', JSON.stringify({
  playerName: 'John',
  playerId: crypto.randomUUID(),
  lastRoomCode: 'ABC123'
}));

// Load
const session = JSON.parse(localStorage.getItem('spyfall-session') || '{}');
```

---

### 8. Real-Time Protocol: WebSocket + JSON Messages

**Decision**: Use WebSocket with JSON-formatted messages for real-time communication

**Rationale**:
- **Bidirectional**: Server push and client requests in same connection
- **Low Latency**: Persistent connection, no HTTP overhead per message
- **Simple**: JSON serialization, no binary protocols needed
- **Browser Native**: Built-in WebSocket API, no libraries required

**Alternatives Considered**:
- **Server-Sent Events (SSE)**: Unidirectional, requires separate HTTP for client→server
- **Long Polling**: Higher latency, more server load
- **gRPC-Web**: Overkill, binary protocol complexity not needed

**Best Practices**:
- Structured message format: `{ type: 'ACTION', payload: {...} }`
- Client sends: `JOIN`, `CHAT`, `VOTE`, `START_GAME`
- Server sends: `PLAYER_JOINED`, `PLAYER_LEFT`, `MESSAGE`, `GAME_STATE`, `TIMER_TICK`
- Include timestamp in every message
- Implement reconnection logic with exponential backoff
- Send ping/pong every 30s to keep connection alive

**Message Format**:
```typescript
type Message = {
  type: string;
  payload: unknown;
  timestamp: number;
  playerId?: string;
};

// Example
{
  type: 'CHAT',
  payload: { message: 'Are you at the beach?', from: 'Alice' },
  timestamp: 1698172800000,
  playerId: 'uuid-123'
}
```

---

### 9. TypeScript Configuration

**Decision**: Strict TypeScript configuration with shared types

**Rationale**:
- **Type Safety**: Catch errors at compile time
- **Shared Types**: Frontend and backend use same type definitions
- **Better DX**: Autocomplete, refactoring support
- **Documentation**: Types serve as inline documentation

**Best Practices**:
- Enable strict mode in tsconfig.json
- Share types between frontend/backend via `lib/types.ts`
- Use discriminated unions for message types
- Avoid `any`, use `unknown` when type is truly unknown

---

### 10. Deployment Strategy

**Decision**: 
- Frontend: Cloudflare Pages (connected to Git)
- Backend: Cloudflare Workers (via Wrangler CLI)

**Rationale**:
- **Git Integration**: Auto-deploy on push to main branch
- **Preview Deploys**: Every PR gets a preview URL
- **Zero Config**: Cloudflare auto-detects Next.js
- **Global CDN**: Instant worldwide distribution
- **Free Tier**: Generous limits for hobby projects

**Best Practices**:
- Use Wrangler for local development (`wrangler dev`)
- Separate environments: dev, staging, production
- Environment variables via Wrangler secrets
- CI/CD: GitHub Actions for automated deployments

---

## Technical Risks & Mitigations

### Risk 1: Durable Objects Cold Starts
**Risk**: First request to inactive room has ~100ms latency  
**Mitigation**: Keep rooms active with periodic ping if players present; acceptable for lobby phase

### Risk 2: WebSocket Connection Limits
**Risk**: Durable Objects limit ~10,000 connections per object  
**Mitigation**: One room = max 10 players, so 1 room = 10 connections; can support 1000 rooms per object (way beyond our scale)

### Risk 3: D1 Write Latency
**Risk**: D1 writes go to primary region, can be 50-200ms  
**Mitigation**: Use D1 only for read-heavy data (locations); real-time state in Durable Objects memory

### Risk 4: localStorage Limitations
**Risk**: Users can clear localStorage, losing session  
**Mitigation**: Acceptable trade-off for simplicity; users can re-enter name and rejoin with room code

### Risk 5: Mobile Browser WebSocket Stability
**Risk**: Mobile browsers may close WebSocket on background  
**Mitigation**: Implement reconnection logic; show "reconnecting..." UI; mark player as disconnected after 2min

---

## Performance Optimization Strategies

1. **Code Splitting**: Next.js automatic code splitting by route
2. **Image Optimization**: Next.js Image component with WebP format
3. **Caching**: Cloudflare CDN caches static assets and D1 reads
4. **Lazy Loading**: Load game components only after room joined
5. **WebSocket Batching**: Batch multiple state updates into single message
6. **Durable Objects Hibernation**: Inactive rooms sleep automatically

---

## Development Workflow

1. **Local Development**:
   - Frontend: `npm run dev` (Next.js dev server on :3000)
   - Backend: `wrangler dev` (local Workers on :8787)
   - Database: `wrangler d1 execute --local` (local SQLite)

2. **Testing**:
   - Playground: Deploy to Cloudflare Pages preview URL
   - Multi-device: Test with multiple browsers/devices
   - WebSocket: Browser DevTools → Network → WS tab

3. **Deployment**:
   - Frontend: Push to Git → Cloudflare Pages auto-deploys
   - Backend: `wrangler deploy` → deploys to Cloudflare Workers
   - Database: `wrangler d1 migrations apply` → runs migrations

---

## Summary

**Stack**: Next.js + React + Tailwind + Cloudflare Workers + Durable Objects + D1 + R2

**Strengths**:
- ✅ Fully serverless, zero ops
- ✅ Global edge deployment
- ✅ Cost-effective (free tier sufficient for MVP)
- ✅ Simple architecture (no microservices, no Kubernetes)
- ✅ Constitution-compliant (minimal, declarative, readable)

**Trade-offs**:
- ⚠️ Vendor lock-in to Cloudflare (acceptable for simplicity gain)
- ⚠️ D1 is beta (but stable enough for production per Cloudflare docs)
- ⚠️ No traditional database migrations (D1 migrations are simpler)

**Confidence**: HIGH - Well-established patterns, proven at scale, good documentation
