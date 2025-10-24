# Implementation Plan: Spyfall Online - Thai Edition

**Branch**: `001-spyfall-online` | **Date**: 2025-10-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-spyfall-online/spec.md`

## Summary

Build a real-time multiplayer social deduction game (Spyfall) as a web application with Thai localization. Players create/join rooms via room codes, receive secret role assignments, communicate via real-time chat, and vote to identify the spy. The application uses Next.js for the frontend, Cloudflare Workers for serverless backend, Cloudflare Durable Objects for real-time state management, D1 (SQLite) for persistent data, R2 for static assets, and localStorage for session persistence. The architecture supports pluggable game types (Spyfall first, Werewolf next).

## Technical Context

**Language/Version**: TypeScript 5.x / JavaScript ES2022  
**Primary Dependencies**: 
- Frontend: Next.js 14, React 18, Tailwind CSS 3.x
- Backend: Cloudflare Workers, Hono (lightweight web framework)
- Real-time: Cloudflare Durable Objects (WebSocket support)
- Storage: Cloudflare D1 (SQLite), Cloudflare R2 (object storage)

**Storage**: 
- Persistent data: Cloudflare D1 (SQLite) for locations, game configs
- Real-time state: Durable Objects (in-memory with persistence)
- Session: Browser localStorage for player name/preferences
- Static assets: Cloudflare R2 for images (location photos, UI assets)

**Testing**: Playground-driven validation (no test suites per constitution)

**Target Platform**: 
- Deployment: Cloudflare Pages (frontend) + Cloudflare Workers (backend)
- Client: Modern browsers (Chrome, Firefox, Safari, Edge) + Mobile web

**Project Type**: Web application (Next.js frontend + Cloudflare Workers backend)

**Performance Goals**: 
- Real-time message delivery: <500ms latency
- Player join/leave updates: <1s propagation
- Room creation: <5s end-to-end
- Support 100 concurrent rooms (10 players each = 1000 concurrent users)
- Timer synchronization: <2s drift across clients

**Constraints**: 
- Cloudflare Workers: 128MB memory limit, 50ms CPU time (soft limit)
- Durable Objects: 128MB memory per object, WebSocket connections capped at 10,000/object
- D1: SQLite limits (no full-text search, max 10GB database)
- R2: Standard object storage latency (10-100ms for assets)
- No backend server required (fully serverless)
- Mobile-responsive UI (no horizontal scroll on phones)

**Scale/Scope**: 
- Initial: 100 concurrent rooms, 1000 concurrent players
- Growth target: 1000 rooms, 10,000 players (requires Durable Objects scaling)
- Locations: 100 Thai locations across 3 difficulty levels
- Games: 2 game types (Spyfall + Werewolf planned)
- UI: ~15-20 React components, 8-10 pages/views

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Do Less, Get Works**: Feature implements only core game mechanics (room, chat, voting, roles). No analytics, user accounts, leaderboards, or advanced features.
- [x] **Playground Over Tests**: Deployed playground on Cloudflare Pages for multi-device/browser testing of all user stories.
- [x] **Declarative Style**: React components, Tailwind utility classes, config-driven location/role data, WebSocket message handlers as pure event processors.
- [x] **Consistent Code Style**: Prettier for TypeScript/React, ESLint for code quality, Next.js conventions.
- [x] **Readability First**: Clear component names, simple state management, avoid complex abstractions, descriptive function names.

*All principles met. No complexity tracking required.*

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── playground.md        # Working demo/examples showing feature works
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/                          # Next.js 14 App Router
├── (game)/                   # Game layouts
│   ├── room/
│   │   └── [code]/
│   │       └── page.tsx      # Game room UI
│   └── layout.tsx
├── api/                      # Next.js API routes (proxy to Workers)
│   └── [...path]/route.ts
├── page.tsx                  # Home page (create/join room)
├── layout.tsx                # Root layout
└── globals.css               # Tailwind imports

components/                   # React components
├── game/
│   ├── RoleCard.tsx          # Show role assignment
│   ├── LocationReference.tsx # Location + roles list (non-spies)
│   ├── ChatPanel.tsx         # Real-time chat
│   ├── PlayerList.tsx        # Show all players + status
│   ├── VotingInterface.tsx   # Vote for spy
│   ├── SpyGuess.tsx          # Spy location guess UI
│   └── GameTimer.tsx         # Countdown timer
├── room/
│   ├── CreateRoom.tsx        # Room creation form
│   ├── JoinRoom.tsx          # Join room form
│   └── Lobby.tsx             # Pre-game lobby
└── ui/                       # Reusable UI components
    ├── Button.tsx
    ├── Input.tsx
    └── Card.tsx

lib/                          # Shared utilities
├── websocket.ts              # WebSocket client
├── storage.ts                # localStorage helpers
├── game-logic.ts             # Game state helpers
└── types.ts                  # TypeScript types

data/
└── locations.json            # 100 Thai locations + roles

public/                       # Static assets
└── images/                   # R2-served location images

workers/                      # Cloudflare Workers backend
├── src/
│   ├── index.ts              # Main worker entry
│   ├── durable-objects/
│   │   └── GameRoom.ts       # Durable Object for room state
│   ├── handlers/
│   │   ├── room.ts           # Room CRUD handlers
│   │   ├── game.ts           # Game logic handlers
│   │   └── websocket.ts      # WebSocket message handlers
│   ├── models/
│   │   ├── Room.ts           # Room entity
│   │   ├── Player.ts         # Player entity
│   │   └── GameState.ts      # Game state entity
│   └── db/
│       └── schema.sql        # D1 database schema
└── wrangler.toml             # Cloudflare config

migrations/                   # D1 migrations
└── 0001_initial_schema.sql

package.json                  # Dependencies
tsconfig.json                 # TypeScript config
next.config.js                # Next.js config
tailwind.config.js            # Tailwind config
.prettierrc                   # Prettier config
.eslintrc.json                # ESLint config
```

**Structure Decision**: Web application structure with Next.js frontend and Cloudflare Workers backend. Next.js App Router for routing, Tailwind for styling, Durable Objects for real-time state. Frontend and backend coexist in monorepo with clear separation: `app/` and `components/` for UI, `workers/` for backend. No traditional backend server - fully serverless on Cloudflare platform.

---

## Planning Phases Status

### ✅ Phase 0: Research (Complete)

**Artifact**: [research.md](./research.md)

**Decisions Made**:
- Frontend: Next.js 14 + React 18 + Tailwind CSS
- Backend: Cloudflare Workers + Hono framework
- Real-time: Durable Objects with WebSocket
- Storage: D1 (config), Durable Objects (game state), localStorage (session), R2 (images)
- Protocol: WebSocket with JSON messages
- Deployment: Cloudflare Pages + Workers

**Key Trade-offs**:
- Vendor lock-in to Cloudflare (accepted for simplicity and performance)
- D1 beta status (accepted - stable enough for production)
- No traditional database for game state (Durable Objects handle it)

---

### ✅ Phase 1: Design & Contracts (Complete)

**Artifacts**:
- [data-model.md](./data-model.md) - Entity definitions and relationships
- [contracts/websocket.md](./contracts/websocket.md) - WebSocket protocol
- [contracts/http-api.md](./contracts/http-api.md) - HTTP API specification
- [quickstart.md](./quickstart.md) - Development setup guide

**Entities Defined**:
- Room (game session)
- Player (participant)
- GameState (current round)
- Location (Thai places with roles)
- Message (chat)
- Vote (suspicion)

**API Contracts**:
- 14 WebSocket message types (client→server and server→client)
- 4 HTTP endpoints (room creation, info, locations, health)
- Error handling, rate limiting, CORS, caching

**Constitution Re-check** ✅:
- **Do Less, Get Works**: Only core mechanics, no speculative features
- **Playground Over Tests**: Detailed manual testing checklist in quickstart
- **Declarative Style**: React components, config-driven locations, event-driven WebSocket
- **Consistent Code Style**: Prettier + ESLint configured
- **Readability First**: Clear naming, simple state management, no complex abstractions

---

## Next Steps

**Ready for Implementation**: All planning complete!

Use `/speckit.tasks` command to generate detailed task list organized by user story priority.
