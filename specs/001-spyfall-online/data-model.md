# Data Model: Spyfall Online - Thai Edition

**Date**: 2025-10-24  
**Feature**: Real-time multiplayer game entities and relationships

## Entity Definitions

### 1. Room

Represents a game session where players gather to play.

**Attributes**:
- `code` (string, 6 chars, alphanumeric, unique): Room identifier for joining (e.g., "A3X9K2")
- `hostPlayerId` (string, UUID): ID of player who created the room
- `gameType` (enum): Type of game ("spyfall" | "werewolf")
- `difficulty` (array of enums): Selected difficulty levels (["easy"] | ["medium"] | ["hard"] | ["easy", "medium"] etc.)
- `timerDuration` (number, 5-15): Round duration in minutes
- `phase` (enum): Current game phase ("lobby" | "playing" | "voting" | "spy_guess" | "results")
- `players` (array of Player IDs): List of player UUIDs in this room
- `createdAt` (timestamp): Room creation time
- `lastActivityAt` (timestamp): Last activity for cleanup

**Validation Rules**:
- `code` must be unique across all rooms
- `code` must be exactly 6 characters, alphanumeric
- `hostPlayerId` must exist in `players` array
- `players` array must have 4-10 elements during game phase
- `timerDuration` must be between 5 and 15 (inclusive)
- `difficulty` array must not be empty
- `phase` must be a valid enum value

**State Transitions**:
```
lobby → playing (when host starts game with 4-10 players)
playing → voting (when timer expires or host triggers vote)
voting → spy_guess (if spy not eliminated)
voting → results (if spy eliminated)
spy_guess → results (after spy guesses or skips)
results → lobby (when host starts new round)
```

**Relationships**:
- Has many Players (1-to-many)
- Has one GameState (1-to-1, optional, only during active game)

---

### 2. Player

Represents a participant in a room.

**Attributes**:
- `id` (string, UUID): Unique player identifier (generated client-side)
- `name` (string, 1-20 chars): Display name
- `roomCode` (string, 6 chars): Current room the player is in
- `connectionStatus` (enum): "connected" | "disconnected" | "reconnecting"
- `score` (number, default 0): Total points across all rounds
- `role` (string, optional): Current role in active game (null in lobby)
- `isHost` (boolean): Whether this player is the room host
- `joinedAt` (timestamp): When player joined the room
- `lastSeenAt` (timestamp): Last activity for disconnect detection

**Validation Rules**:
- `name` must be 1-20 characters, trimmed
- `name` duplicates in same room are appended with (2), (3), etc.
- `roomCode` must reference an existing room
- `score` must be non-negative
- `role` is null unless `phase` is "playing" | "voting" | "spy_guess"

**State Transitions**:
```
connected → disconnected (on WebSocket close, network failure)
disconnected → reconnecting (on reconnection attempt within 2 min)
reconnecting → connected (on successful reconnection)
disconnected → removed (after 2 min timeout)
```

**Relationships**:
- Belongs to one Room (many-to-1)
- Can send many Messages (1-to-many)
- Can cast many Votes (1-to-many)

---

### 3. GameState

Represents the current round of gameplay.

**Attributes**:
- `roomCode` (string, 6 chars): Room this game state belongs to
- `roundNumber` (number, starts at 1): Current round index
- `selectedLocation` (object): The chosen location for this round
  - `id` (string): Location ID
  - `name` (string): Thai location name
  - `difficulty` (enum): easy | medium | hard
  - `roles` (array of strings): List of possible roles at this location
- `assignments` (map): Player ID → Assignment
  - `playerId` (string, UUID)
  - `role` (string): "spy" | specific role name
  - `location` (string | null): Location name (null for spy)
- `spyPlayerId` (string, UUID): ID of the spy player
- `currentTurn` (number, 0-indexed): Index of player whose turn it is
- `timerStartedAt` (timestamp): When the round timer started
- `timerEndsAt` (timestamp): When the timer will expire
- `messages` (array of Message): Chat history for this round
- `votes` (array of Vote): Votes cast during voting phase
- `spyGuess` (string | null): Location name guessed by spy (if applicable)

**Validation Rules**:
- `selectedLocation` must be from locations database
- `assignments` map must have entry for every player in room
- Exactly one player must have role "spy"
- `spyPlayerId` must match the player assigned "spy" role
- `currentTurn` must be valid player index (0 to players.length - 1)
- `timerEndsAt` must be after `timerStartedAt`
- `messages` must be ordered by timestamp
- `votes` can only exist when phase is "voting"

**Relationships**:
- Belongs to one Room (1-to-1)
- References one Location (many-to-1)
- Has many Messages (1-to-many)
- Has many Votes (1-to-many)

---

### 4. Location

Represents a Spyfall location with roles. Stored in D1 (persistent).

**Attributes**:
- `id` (string, UUID): Unique location identifier
- `nameTh` (string): Location name in Thai
- `difficulty` (enum): "easy" | "medium" | "hard"
- `roles` (JSON array of strings): List of 7-10 possible roles at this location
- `imageUrl` (string, URL): R2 URL to location image

**Validation Rules**:
- `nameTh` must be unique
- `roles` array must have 7-10 elements
- `difficulty` must be one of the three enums
- `imageUrl` must be valid HTTPS URL

**Examples**:
```json
{
  "id": "loc-001",
  "nameTh": "ชายหาด",
  "difficulty": "easy",
  "roles": ["นักท่องเที่ยว", "ไลฟ์การ์ด", "พนักงานขายอาหาร", "เด็กเล่นน้ำ", "ช่างภาพ", "ผู้ขายของที่ระลึก", "คนนวดแผนไทย"],
  "imageUrl": "https://r2.example.com/locations/beach.webp"
}
```

**Relationships**:
- Can be selected by many GameStates (1-to-many)

---

### 5. Message

Represents a chat message in a game round.

**Attributes**:
- `id` (string, UUID): Unique message identifier
- `roomCode` (string, 6 chars): Room this message belongs to
- `roundNumber` (number): Round index this message was sent in
- `playerId` (string, UUID): Player who sent the message
- `playerName` (string): Display name (denormalized for display)
- `content` (string, 1-500 chars): Message text
- `isTurnIndicator` (boolean): Whether this message is marked as "turn question"
- `timestamp` (number, Unix ms): When message was sent

**Validation Rules**:
- `content` must be 1-500 characters
- `roomCode` must reference existing room
- `playerId` must reference existing player
- `timestamp` must be in the past or present

**Relationships**:
- Belongs to one Room (many-to-1)
- Belongs to one Player (many-to-1)
- Belongs to one GameState/Round (many-to-1)

---

### 6. Vote

Represents a player's vote for who they think is the spy.

**Attributes**:
- `id` (string, UUID): Unique vote identifier
- `roomCode` (string, 6 chars): Room this vote belongs to
- `roundNumber` (number): Round index
- `voterId` (string, UUID): Player casting the vote
- `suspectId` (string, UUID | "skip"): Player being voted for, or "skip" for abstain
- `timestamp` (number, Unix ms): When vote was cast

**Validation Rules**:
- `voterId` must reference existing player in room
- `suspectId` must reference existing player in room or be "skip"
- `voterId` and `suspectId` can be the same (self-vote allowed)
- Each voter can only vote once per round

**Relationships**:
- Belongs to one Room (many-to-1)
- Belongs to one GameState/Round (many-to-1)
- References two Players: voter and suspect (many-to-1 each)

---

## Data Storage Strategy

### Durable Objects (In-Memory + Persistence)

**What Lives Here**:
- Room entity (active rooms only)
- Player entities (currently connected players)
- GameState entity (current round state)
- Messages (current round only)
- Votes (current round only)
- WebSocket connections

**Why**:
- Strong consistency per room
- Low-latency reads/writes
- Real-time synchronization
- Automatic cleanup on object hibernation

**Persistence**:
- Durable Objects have built-in persistence (survives restarts)
- Critical state (room, players, game state) persisted automatically
- Messages and votes kept in memory for current round, discarded after round ends

---

### Cloudflare D1 (SQLite)

**What Lives Here**:
- Locations table (100 Thai locations)
- Game configs (timer ranges, player limits, scoring rules)

**Why**:
- Read-heavy data (locations queried every game start)
- Needs filtering (by difficulty level)
- Edge-cached reads for low latency
- Persistent across all rooms and time

**Schema**:
```sql
CREATE TABLE locations (
  id TEXT PRIMARY KEY,
  name_th TEXT NOT NULL UNIQUE,
  difficulty TEXT NOT NULL CHECK(difficulty IN ('easy', 'medium', 'hard')),
  roles TEXT NOT NULL, -- JSON array
  image_url TEXT NOT NULL
);

CREATE INDEX idx_difficulty ON locations(difficulty);

CREATE TABLE game_configs (
  game_type TEXT PRIMARY KEY,
  min_players INTEGER NOT NULL,
  max_players INTEGER NOT NULL,
  min_timer INTEGER NOT NULL,
  max_timer INTEGER NOT NULL,
  scoring_rules TEXT NOT NULL -- JSON object
);
```

---

### Browser localStorage

**What Lives Here**:
- Player session: `{ playerId, playerName, lastRoomCode }`

**Why**:
- No backend session management
- Player name persistence across sessions
- Quick rejoin to last room
- Privacy-friendly (no server-side tracking)

**Format**:
```typescript
interface SpyfallSession {
  playerId: string;      // UUID
  playerName: string;    // Display name
  lastRoomCode: string;  // Most recent room
}
```

---

### Cloudflare R2

**What Lives Here**:
- Location images (WebP format)

**Why**:
- Static assets
- CDN distribution
- Zero egress cost

**Path Structure**: `/locations/{location-id}.webp`

---

## Data Flow Examples

### Example 1: Player Joins Room

1. Client reads `playerId` and `playerName` from localStorage
2. Client sends WebSocket message: `{ type: 'JOIN', payload: { roomCode, playerId, playerName } }`
3. Durable Object receives message
4. Durable Object validates roomCode exists, capacity not exceeded
5. Durable Object creates Player entity in memory
6. Durable Object broadcasts to all WebSockets: `{ type: 'PLAYER_JOINED', payload: player }`
7. All clients update their Player List UI

---

### Example 2: Game Start

1. Host clicks "Start Game" button
2. Client sends: `{ type: 'START_GAME' }`
3. Durable Object validates: host is requesting, 4-10 players present, phase is "lobby"
4. Durable Object queries D1 for locations matching selected difficulty levels
5. Durable Object randomly selects one location
6. Durable Object randomly assigns one player as spy
7. Durable Object randomly assigns roles to non-spy players from location's role list
8. Durable Object creates GameState entity
9. Durable Object updates Room phase to "playing"
10. Durable Object broadcasts: `{ type: 'GAME_STARTED', payload: gameState }` (excluding role assignments)
11. Durable Object sends individual messages to each player with their private role: `{ type: 'ROLE_ASSIGNMENT', payload: { role, location? } }`

---

### Example 3: Chat Message

1. Player types message and presses send
2. Client sends: `{ type: 'CHAT', payload: { content, isTurnIndicator } }`
3. Durable Object validates: player is in room, game is active
4. Durable Object creates Message entity
5. Durable Object adds message to GameState.messages array
6. Durable Object broadcasts: `{ type: 'MESSAGE', payload: message }`
7. All clients append message to chat UI

---

### Example 4: Voting

1. Voting phase begins (timer expired or host triggered)
2. Durable Object broadcasts: `{ type: 'PHASE_CHANGE', payload: { phase: 'voting' } }`
3. Each player selects a suspect and clicks "Vote"
4. Client sends: `{ type: 'VOTE', payload: { suspectId } }`
5. Durable Object creates Vote entity
6. Durable Object broadcasts: `{ type: 'VOTE_CAST', payload: { voterId, voteCount } }` (doesn't reveal who they voted for)
7. When all players voted (or voting timeout):
   - Durable Object tallies votes
   - Durable Object determines player with most votes
   - If spy eliminated: Update scores (+1 to non-spies), phase → "results"
   - If spy not eliminated: Phase → "spy_guess"
8. Durable Object broadcasts: `{ type: 'VOTING_RESULTS', payload: { eliminatedPlayerId, wasSpy, scores } }`

---

## Data Retention & Cleanup

### Active Rooms (Durable Objects)
- **Retention**: While any player is connected OR last activity < 5 minutes
- **Cleanup**: Durable Object hibernates (sleeps) after all players disconnect and 5 min timeout
- **Recovery**: Room can be "revived" if player reconnects within 5 min (Durable Object wakes up)

### Historical Data
- **Messages**: Discarded after round ends (not persisted to D1)
- **Votes**: Discarded after round ends
- **Scores**: Kept in Player entity for duration of room session, then discarded

### Locations (D1)
- **Retention**: Permanent
- **Updates**: Only via migrations/admin updates

---

## Scalability Considerations

### Horizontal Scaling
- Each room is an independent Durable Object → rooms scale horizontally automatically
- 1000 rooms × 10 players = 10,000 concurrent players
- Cloudflare routes requests to correct Durable Object globally

### Per-Room Limits
- Max 10 players per room (enforced by validation)
- Max ~10,000 WebSocket connections per Durable Object (we use max 10)
- 128MB memory per Durable Object (sufficient for room state + 10 players)

### Database Scaling
- D1 reads are edge-cached → low latency globally
- D1 writes (locations) are rare (only during setup)
- 100 locations × ~1KB each = 100KB total (trivial size)

### Read vs Write Patterns
- **High-frequency writes**: Player state, messages, votes → Durable Objects
- **High-frequency reads**: Game state queries → Durable Objects (in-memory)
- **Low-frequency reads**: Locations → D1 (edge-cached)
- **No frequent writes to D1**: All game state is ephemeral

---

## Summary

**Storage Distribution**:
- 🔴 **Hot path (real-time)**: Durable Objects (room, players, game state, messages, votes, WebSockets)
- 🔵 **Cold path (config)**: D1 (locations, game configs)
- 🟢 **Client-side**: localStorage (player session)
- 🟡 **Static assets**: R2 (location images)

**Key Design Decisions**:
1. **No traditional database for game state**: Durable Objects handle all real-time state
2. **D1 only for config data**: Read-heavy, infrequently updated, globally replicated
3. **No user accounts**: localStorage session sufficient for anonymous gameplay
4. **Ephemeral messages**: Not persisted beyond round (reduces storage costs)
5. **Room-based isolation**: Each room is independent, no cross-room queries needed

**Constitution Alignment**:
- ✅ **Do Less**: Minimal entities, no unnecessary persistence
- ✅ **Declarative**: Data structures drive behavior (location roles, game configs)
- ✅ **Readable**: Clear entity names, simple relationships, well-documented
