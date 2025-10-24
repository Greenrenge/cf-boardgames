# User Story 1 Playground: Create and Join Game Rooms

## Overview

This playground is for testing the room creation and joining functionality with real-time player synchronization.

## What's Implemented

### Components

- **CreateRoom** (`components/room/CreateRoom.tsx`): Name input, room creation with API integration
- **JoinRoom** (`components/room/JoinRoom.tsx`): Name and room code input, room validation
- **PlayerList** (`components/room/PlayerList.tsx`): Real-time player display with connection status
- **Lobby** (`components/room/Lobby.tsx`): Room code display, player list, start game button (host only)

### Pages

- **Home** (`app/page.tsx`): Landing page with create/join options
- **Game Room** (`app/(game)/room/[code]/page.tsx`): WebSocket-connected room with real-time updates

### Infrastructure

- **WebSocket Client** (`lib/websocket.ts`): Connection management, auto-reconnect with exponential backoff
- **Storage Utilities** (`lib/storage.ts`): localStorage session management
- **API Routes**:
  - `POST /api/rooms` - Create new room
  - `GET /api/rooms/[code]` - Get room info

## Testing Scenarios

### Scenario 1: Create Room (Single Player)

1. Run the Next.js dev server: `npm run dev`
2. Open browser at `http://localhost:3000`
3. In **Create Room** section:
   - Enter your name (e.g., "Alice")
   - Click "สร้างห้อง" (Create Room)
4. **Expected Result**:
   - Redirects to `/room/[CODE]` where CODE is 6-character alphanumeric
   - Lobby shows room code with copy button
   - Player list shows you as host (yellow "เจ้าห้อง" badge)
   - Connection indicator is green
   - Start button disabled with message "ต้องมีผู้เล่น 3-8 คน"

### Scenario 2: Join Room (Multi-Player)

1. Open **second browser tab** (or incognito window) at `http://localhost:3000`
2. In **Join Room** section:
   - Enter different name (e.g., "Bob")
   - Enter room code from tab 1
   - Click "เข้าร่วม" (Join)
3. **Expected Results**:
   - Tab 2: Redirects to same room, shows 2 players
   - Tab 1: Player list **automatically updates** to show Bob joined
   - Both tabs show correct connection status (green dots)
   - Tab 1 (host) still has start button disabled (need 3 players minimum)

### Scenario 3: Multi-Player Sync (3+ Players)

1. Open **third tab** and join with name "Charlie"
2. **Expected Results**:
   - All 3 tabs show 3 players in player list
   - Host tab now shows enabled "เริ่มเกม" (Start Game) button
   - Non-host tabs show "รอเจ้าห้องเริ่มเกม..." (Waiting for host)
3. Close Charlie's tab
4. **Expected Results** (within 2 minutes):
   - Tabs 1 & 2 show Charlie's connection status changes to offline (gray dot)
   - After 2min timeout: Charlie removed from player list
   - Host button disabled again (only 2 players)

### Scenario 4: Host Transfer

1. Close Alice's tab (original host)
2. **Expected Results**:
   - Bob's tab shows Bob is now host (yellow badge appears)
   - Start button becomes available on Bob's tab (if 3+ players)

### Scenario 5: Error Handling

1. Try joining non-existent room code "ABCDEF"
   - **Expected**: Error message "ไม่พบห้องนี้" (Room not found)
2. Try joining full room (simulate by checking 8-player limit in code)
   - **Expected**: Error message "ห้องเต็มแล้ว" (Room full)
3. Disconnect internet and create room
   - **Expected**: Error message about connection failure

### Scenario 6: Room Code Sharing

1. In lobby, click copy button next to room code
2. **Expected**: Room code copied to clipboard
3. Paste into join form - should work seamlessly

## Prerequisites

### Backend (Cloudflare Workers)

Must be running on `localhost:8787`:

```bash
cd workers
wrangler dev
```

### Frontend (Next.js)

Must be running on `localhost:3000`:

```bash
npm run dev
```

### Environment Variables

Create `.env.local` if not exists:

```
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_WS_URL=ws://localhost:8787
```

## Current Limitations

1. **No actual game start**: Start button sends WebSocket message but game doesn't begin yet (US2)
2. **No location selection**: Default settings used (all difficulties, 8min timer)
3. **No chat**: Room is lobby-only until US2
4. **No voting/spy mechanics**: Game logic comes in US2-3

## Success Criteria

✅ **Must Pass**:

- Create room generates unique 6-char code
- Join room validates code exists
- Real-time player list sync across all tabs
- Connection status updates (online/offline)
- Host badge transfers on disconnect
- 2-minute disconnect timeout works
- Room code copy-to-clipboard works
- Error messages display correctly

✅ **Nice to Have**:

- Reconnection with exponential backoff works smoothly
- No visible lag in player list updates
- Thai language displays correctly in all browsers
- Mobile responsive layout works

## Debugging Tips

### WebSocket Issues

Check browser console for:

```
[WebSocket] Connected
[WebSocket] Sent: JOIN {...}
[WebSocket] Received: PLAYER_JOINED {...}
```

### API Issues

Check Network tab for:

- `POST /api/rooms` → 200 OK with roomCode
- `GET /api/rooms/[CODE]` → 200 OK with room info

### State Issues

Check localStorage in DevTools:

```
spyfall_session: {
  "playerId": "uuid-here",
  "playerName": "Alice",
  "lastRoomCode": "ABC123"
}
```

## Next Steps

After US1 passes all scenarios:

1. Mark T026-T050 as complete in tasks.md
2. Create playground for **User Story 2** (gameplay)
3. Implement game start logic, role assignment, timer

---

**Status**: Ready for testing ✅  
**Last Updated**: Phase 3 completion  
**Dependencies**: Cloudflare Workers running, Next.js running
