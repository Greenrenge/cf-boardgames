# WebSocket Protocol Contract

**Version**: 1.0.0  
**Transport**: WebSocket over HTTPS  
**Format**: JSON messages

## Connection

### Endpoint

```
wss://api.spyfall.example.com/room/{roomCode}
```

### Connection Flow

1. Client connects to WebSocket endpoint with room code
2. Server accepts connection or rejects (if room doesn't exist)
3. Client sends `JOIN` message with player details
4. Server validates and broadcasts `PLAYER_JOINED` to all clients
5. Connection stays open for duration of gameplay
6. Server sends `PING` every 30 seconds, client responds with `PONG`
7. On disconnect, server broadcasts `PLAYER_LEFT` to remaining clients

---

## Message Format

All messages follow this structure:

```typescript
interface WebSocketMessage {
  type: string; // Message type identifier
  payload: unknown; // Message-specific data
  timestamp: number; // Unix timestamp in milliseconds
  playerId?: string; // UUID of player (for client→server messages)
}
```

---

## Client → Server Messages

### 1. JOIN - Join Room

Player joins a room with their details.

**Message**:

```json
{
  "type": "JOIN",
  "payload": {
    "playerId": "uuid-123",
    "playerName": "Alice",
    "roomCode": "ABC123"
  },
  "timestamp": 1698172800000
}
```

**Validation**:

- `playerId` must be valid UUID
- `playerName` must be 1-20 characters
- `roomCode` must exist
- Room must not be full (max 10 players)

**Response**: Server broadcasts `PLAYER_JOINED` to all clients

---

### 2. START_GAME - Start Game Round

Host starts a new game round.

**Message**:

```json
{
  "type": "START_GAME",
  "payload": {
    "difficulty": ["easy", "medium"],
    "timerDuration": 10
  },
  "timestamp": 1698172800000,
  "playerId": "uuid-host"
}
```

**Validation**:

- Must be sent by room host
- Room must be in "lobby" phase
- Must have 4-10 players
- `difficulty` must be non-empty array of valid levels
- `timerDuration` must be 5-15

**Response**: Server broadcasts `GAME_STARTED` and sends individual `ROLE_ASSIGNMENT` messages

---

### 3. CHAT - Send Chat Message

Player sends a chat message.

**Message**:

```json
{
  "type": "CHAT",
  "payload": {
    "content": "Are you at the beach?",
    "isTurnIndicator": true
  },
  "timestamp": 1698172800000,
  "playerId": "uuid-123"
}
```

**Validation**:

- `content` must be 1-500 characters
- Player must be in room
- Game must be active (phase "playing" or "voting")

**Response**: Server broadcasts `MESSAGE` to all clients

---

### 4. VOTE - Cast Vote

Player votes for who they think is the spy.

**Message**:

```json
{
  "type": "VOTE",
  "payload": {
    "suspectId": "uuid-456"
  },
  "timestamp": 1698172800000,
  "playerId": "uuid-123"
}
```

**Validation**:

- Room must be in "voting" phase
- `suspectId` must be valid player ID or "skip"
- Player can only vote once per round

**Response**: Server broadcasts `VOTE_CAST` (count only, not who they voted for)

---

### 5. SPY_GUESS - Spy Guesses Location

Spy attempts to guess the location.

**Message**:

```json
{
  "type": "SPY_GUESS",
  "payload": {
    "locationId": "loc-001"
  },
  "timestamp": 1698172800000,
  "playerId": "uuid-spy"
}
```

**Validation**:

- Must be sent by the spy
- Room must be in "spy_guess" phase
- `locationId` must be a valid location ID

**Response**: Server broadcasts `SPY_GUESS_RESULT`

---

### 6. LEAVE - Leave Room

Player voluntarily leaves the room.

**Message**:

```json
{
  "type": "LEAVE",
  "payload": {},
  "timestamp": 1698172800000,
  "playerId": "uuid-123"
}
```

**Validation**:

- Player must be in room

**Response**: Server broadcasts `PLAYER_LEFT`

---

### 7. PONG - Keep-Alive Response

Client responds to server's PING.

**Message**:

```json
{
  "type": "PONG",
  "payload": {},
  "timestamp": 1698172800000,
  "playerId": "uuid-123"
}
```

**Validation**: None

**Response**: None (server updates lastSeenAt)

---

## Server → Client Messages

### 1. PLAYER_JOINED - Player Joined Room

Broadcast when a player joins.

**Message**:

```json
{
  "type": "PLAYER_JOINED",
  "payload": {
    "player": {
      "id": "uuid-123",
      "name": "Alice",
      "isHost": false,
      "score": 0,
      "connectionStatus": "connected"
    }
  },
  "timestamp": 1698172800000
}
```

---

### 2. PLAYER_LEFT - Player Left Room

Broadcast when a player leaves or disconnects.

**Message**:

```json
{
  "type": "PLAYER_LEFT",
  "payload": {
    "playerId": "uuid-123",
    "reason": "disconnected"
  },
  "timestamp": 1698172800000
}
```

---

### 3. GAME_STARTED - Game Round Started

Broadcast when host starts a game.

**Message**:

```json
{
  "type": "GAME_STARTED",
  "payload": {
    "phase": "playing",
    "roundNumber": 1,
    "timerEndsAt": 1698173400000,
    "playerOrder": ["uuid-1", "uuid-2", "uuid-3"],
    "currentTurn": 0
  },
  "timestamp": 1698172800000
}
```

---

### 4. ROLE_ASSIGNMENT - Private Role Assignment

Sent individually to each player (not broadcast).

**Message to Spy**:

```json
{
  "type": "ROLE_ASSIGNMENT",
  "payload": {
    "role": "spy",
    "location": null
  },
  "timestamp": 1698172800000
}
```

**Message to Non-Spy**:

```json
{
  "type": "ROLE_ASSIGNMENT",
  "payload": {
    "role": "นักท่องเที่ยว",
    "location": {
      "name": "ชายหาด",
      "roles": ["นักท่องเที่ยว", "ไลฟ์การ์ด", "พนักงานขายอาหาร", "..."]
    }
  },
  "timestamp": 1698172800000
}
```

---

### 5. MESSAGE - Chat Message

Broadcast chat message to all players.

**Message**:

```json
{
  "type": "MESSAGE",
  "payload": {
    "id": "msg-001",
    "playerId": "uuid-123",
    "playerName": "Alice",
    "content": "Are you at the beach?",
    "isTurnIndicator": true,
    "timestamp": 1698172800000
  },
  "timestamp": 1698172800000
}
```

---

### 6. PHASE_CHANGE - Game Phase Changed

Broadcast when game phase changes.

**Message**:

```json
{
  "type": "PHASE_CHANGE",
  "payload": {
    "phase": "voting",
    "reason": "timer_expired"
  },
  "timestamp": 1698172800000
}
```

---

### 7. VOTE_CAST - Vote Registered

Broadcast when a player votes (doesn't reveal who they voted for).

**Message**:

```json
{
  "type": "VOTE_CAST",
  "payload": {
    "voterId": "uuid-123",
    "votesRemaining": 3
  },
  "timestamp": 1698172800000
}
```

---

### 8. VOTING_RESULTS - Voting Complete

Broadcast voting results.

**Message**:

```json
{
  "type": "VOTING_RESULTS",
  "payload": {
    "eliminatedPlayerId": "uuid-456",
    "wasSpy": true,
    "voteCount": 5,
    "scores": {
      "uuid-123": 1,
      "uuid-456": 0,
      "uuid-789": 1
    }
  },
  "timestamp": 1698172800000
}
```

---

### 9. SPY_GUESS_RESULT - Spy Guess Result

Broadcast spy's guess result.

**Message**:

```json
{
  "type": "SPY_GUESS_RESULT",
  "payload": {
    "spyPlayerId": "uuid-spy",
    "guessedLocation": "ชายหาด",
    "actualLocation": "ร้านกาแฟ",
    "wasCorrect": false,
    "scores": {
      "uuid-123": 1,
      "uuid-456": 1,
      "uuid-spy": 0
    }
  },
  "timestamp": 1698172800000
}
```

---

### 10. TIMER_TICK - Timer Update

Broadcast every second during gameplay (optional - client can calculate locally).

**Message**:

```json
{
  "type": "TIMER_TICK",
  "payload": {
    "remainingSeconds": 567
  },
  "timestamp": 1698172800000
}
```

---

### 11. PLAYER_RECONNECTED - Player Rejoined

Broadcast when a disconnected player reconnects.

**Message**:

```json
{
  "type": "PLAYER_RECONNECTED",
  "payload": {
    "playerId": "uuid-123",
    "playerName": "Alice"
  },
  "timestamp": 1698172800000
}
```

---

### 12. HOST_CHANGED - Host Transferred

Broadcast when host leaves and host role transfers.

**Message**:

```json
{
  "type": "HOST_CHANGED",
  "payload": {
    "newHostId": "uuid-456",
    "reason": "previous_host_left"
  },
  "timestamp": 1698172800000
}
```

---

### 13. ERROR - Error Occurred

Sent to specific client when their action fails.

**Message**:

```json
{
  "type": "ERROR",
  "payload": {
    "code": "ROOM_FULL",
    "message": "Room is full (10/10 players)",
    "details": {}
  },
  "timestamp": 1698172800000
}
```

**Error Codes**:

- `ROOM_NOT_FOUND`: Room code doesn't exist
- `ROOM_FULL`: Room at capacity
- `NOT_HOST`: Action requires host privileges
- `INVALID_PHASE`: Action not allowed in current phase
- `INVALID_PLAYER_COUNT`: Need 4-10 players to start
- `ALREADY_VOTED`: Player already voted this round
- `NOT_SPY`: Spy guess attempted by non-spy
- `INVALID_LOCATION`: Location ID doesn't exist

---

### 14. PING - Keep-Alive Check

Sent every 30 seconds to check connection health.

**Message**:

```json
{
  "type": "PING",
  "payload": {},
  "timestamp": 1698172800000
}
```

**Expected Response**: Client should respond with `PONG`

---

## Connection Error Handling

### Client Disconnection

1. Server detects WebSocket close event
2. Server marks player as `connectionStatus: "disconnected"`
3. Server broadcasts `PLAYER_LEFT` with `reason: "disconnected"`
4. Server starts 2-minute timeout
5. If player reconnects within 2 minutes:
   - Server restores player state
   - Server broadcasts `PLAYER_RECONNECTED`
6. If timeout expires:
   - Server removes player from room
   - If player was host, transfer host to next player

### Client Reconnection

1. Client detects disconnection
2. Client attempts reconnection with exponential backoff (1s, 2s, 4s, 8s, 16s)
3. Client sends `JOIN` message with same `playerId`
4. Server recognizes returning player (playerId match)
5. Server sends full game state to reconnecting client
6. Server broadcasts `PLAYER_RECONNECTED`

### Reconnection State Sync

When client reconnects, server sends:

```json
{
  "type": "STATE_SYNC",
  "payload": {
    "room": {
      /* full room state */
    },
    "players": [
      /* all players */
    ],
    "gameState": {
      /* current game state */
    },
    "messages": [
      /* recent messages */
    ]
  },
  "timestamp": 1698172800000
}
```

---

## Best Practices

### Client Implementation

- Implement exponential backoff for reconnection (max 30s)
- Show "Reconnecting..." UI during connection loss
- Buffer messages locally during disconnection, send on reconnect
- Validate all outgoing messages before sending
- Handle `ERROR` messages gracefully with user-friendly alerts
- Implement heartbeat timeout (disconnect if no PING received in 60s)

### Server Implementation

- Validate all incoming messages strictly
- Rate limit messages per player (prevent spam)
- Broadcast efficiently (don't send redundant state)
- Clean up disconnected players after timeout
- Handle concurrent messages with locks/queues
- Log errors but don't expose internals to clients
