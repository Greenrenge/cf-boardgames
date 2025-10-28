# WebSocket Contract: Location Images & Player Scaling

**Version**: 2.0 (extends existing v1.x contract)  
**Date**: 2025-10-28  
**Protocol**: WebSocket over HTTPS

## New Message Types

### 1. ROOM_CONFIG_UPDATE (Client → Server)

Host updates room configuration (player capacity or spy count).

**Direction**: Client → Server  
**Timing**: Lobby phase only (locked during active game)  
**Authorization**: Host only

**Message Structure**:

```typescript
{
  type: 'ROOM_CONFIG_UPDATE',
  payload: {
    maxPlayers?: number,  // 4-20, optional (update only if provided)
    spyCount?: number     // 1-3, optional (update only if provided)
  },
  timestamp: number
}
```

**Validation Rules**:

- `maxPlayers` MUST be 4-20 (inclusive)
- `maxPlayers` MUST NOT be less than current player count
- `spyCount` MUST be 1-3 (inclusive)
- `spyCount * 3` MUST be <= current player count
- Only host can send this message
- Only allowed in lobby phase

**Success Response** (Broadcast to all):

```typescript
{
  type: 'ROOM_STATE',
  payload: {
    // ... existing fields
    maxPlayers: number,
    spyCount: number
  },
  timestamp: number
}
```

**Error Response** (To sender only):

```typescript
{
  type: 'ERROR',
  payload: {
    message: 'Cannot reduce capacity below current player count' |
             'Need at least 9 players for 3 spies' |
             'Only host can modify room configuration' |
             'Cannot change configuration during active game'
  },
  timestamp: number
}
```

---

## Modified Message Types

### 2. ROOM_STATE (Server → Client) - EXTENDED

Broadcast when room state changes. Now includes configuration fields.

**Direction**: Server → All Clients  
**Timing**: On player join/leave, config change, phase change

**Message Structure** (NEW FIELDS ADDED):

```typescript
{
  type: 'ROOM_STATE',
  payload: {
    players: Player[],
    hostId: string,
    phase: 'lobby' | 'playing' | 'voting' | 'spy_guess' | 'results',

    // NEW: Room configuration
    maxPlayers: number,          // Default: 10 for backward compat
    currentPlayerCount: number,   // Computed from players.length
    spyCount: number              // Default: 1 for backward compat
  },
  timestamp: number
}
```

**Backward Compatibility**:

- Old clients ignore unknown fields
- New fields have sensible defaults (10, 1)
- Existing behavior unchanged if fields not present

---

### 3. YOUR_ROLE (Server → Client) - EXTENDED

Sent to each player when game starts. Now supports multiple spies.

**Direction**: Server → Individual Client  
**Timing**: Game start only

**Message Structure** (CLARIFIED FOR MULTI-SPY):

```typescript
// For spy players (1-3 spies per game)
{
  type: 'YOUR_ROLE',
  payload: {
    isSpy: true,
    location: null,
    role: null,

    // NEW: Spy count info (for context, spies still don't know each other)
    totalSpies: number  // e.g., "There are 2 spies total" (including you)
  },
  timestamp: number
}

// For non-spy players (unchanged)
{
  type: 'YOUR_ROLE',
  payload: {
    isSpy: false,
    location: string,  // Thai location name
    role: string,      // Thai role name

    // NEW: Duplicate role indicator
    isDuplicateRole: boolean  // true if location had fewer roles than players
  },
  timestamp: number
}
```

**Notes**:

- Spies do NOT receive list of other spy IDs (game balance)
- `totalSpies` field helps spies understand game dynamics
- `isDuplicateRole` is informational only (doesn't affect gameplay)

---

### 4. GAME_STARTED (Server → All) - EXTENDED

Broadcast when host starts game. Now includes spy count for context.

**Direction**: Server → All Clients  
**Timing**: When host clicks "Start Game"

**Message Structure** (NEW FIELD ADDED):

```typescript
{
  type: 'GAME_STARTED',
  payload: {
    locationId: string,
    timerDuration: number,
    totalPlayers: number,

    // NEW: Number of spies in this game
    spyCount: number  // 1-3, informs players of game variant
  },
  timestamp: number
}
```

**Purpose**: Players can see "This game has 2 spies" for strategic planning

---

### 5. VOTING_RESULTS (Server → All) - EXTENDED

Results of voting phase. Now handles multiple eliminated players.

**Direction**: Server → All Clients  
**Timing**: After voting phase completes

**Message Structure** (MODIFIED FOR MULTI-SPY):

```typescript
{
  type: 'VOTING_RESULTS',
  payload: {
    eliminatedPlayerIds: string[],  // Can be 0-N players (whoever got most votes)
    wasSpies: boolean[],             // Corresponding spy status for each eliminated
    allSpiesCaught: boolean,         // NEW: true if all spies eliminated
    remainingSpyCount: number,       // NEW: spies still in game (0-3)
    voteCounts: Record<string, number>
  },
  timestamp: number
}
```

**Game Flow**:

- If `allSpiesCaught === true` → Non-spies win, game ends
- If `remainingSpyCount > 0` → Proceed to SPY_GUESS phase
- Scoring updated based on `allSpiesCaught` status

---

### 6. SPY_GUESS_RESULT (Server → All) - MODIFIED

Spy's location guess result. Now indicates which spy made the guess (if multiple).

**Direction**: Server → All Clients  
**Timing**: After spy submits location guess

**Message Structure** (CLARIFIED):

```typescript
{
  type: 'SPY_GUESS_RESULT',
  payload: {
    spyPlayerId: string,        // Which spy made the guess (first to submit)
    guessedLocationId: string,
    correctLocationId: string,
    wasCorrect: boolean,

    // NEW: Multi-spy context
    otherSpyIds: string[]      // Other spies who didn't get to guess
  },
  timestamp: number
}
```

**Multi-Spy Rule**: Only first spy to submit guess gets to try (prevents unfair advantage)

---

## Connection Flow

### Room Creation with Configuration

```
Client                          Server
   |                               |
   |-- CREATE_ROOM ---------------> |
   |   {maxPlayers: 15, spyCount: 2}|
   |                               |
   | <-- ROOM_CREATED ------------ |
   |   {code: "ABC123"}            |
   |                               |
   | <-- ROOM_STATE --------------- |
   |   {maxPlayers: 15, spyCount: 2}|
```

### Game Start with Multiple Spies

```
Host                   Server                  All Clients
  |                       |                          |
  |-- START_GAME -------> |                          |
  |                       |                          |
  |                       |--- GAME_STARTED -------> | (spyCount: 2)
  |                       |                          |
  |                       |--- YOUR_ROLE(spy) -----> Spy 1 (totalSpies: 2)
  |                       |--- YOUR_ROLE(spy) -----> Spy 2 (totalSpies: 2)
  |                       |--- YOUR_ROLE(nonspy) --> Others (16 players)
```

### Capacity Full Scenario

```
Client                          Server
   |                               |
   |-- JOIN_ROOM (16th player) --> |
   |                               |
   | <-- ERROR -------------------- |
   |   "Room is full (15/15)"      |
```

---

## Error Codes

New error messages for this feature:

| Code                             | Message                                             | Trigger                             |
| -------------------------------- | --------------------------------------------------- | ----------------------------------- |
| `ROOM_FULL`                      | "Room is full ({current}/{max} players)"            | Join when at capacity               |
| `CAPACITY_TOO_LOW`               | "Cannot reduce capacity below current player count" | Host sets maxPlayers < currentCount |
| `INSUFFICIENT_PLAYERS_FOR_SPIES` | "Need at least {required} players for {n} spies"    | spyCount \* 3 > playerCount         |
| `NOT_HOST`                       | "Only host can modify room configuration"           | Non-host sends ROOM_CONFIG_UPDATE   |
| `CONFIG_LOCKED`                  | "Cannot change configuration during active game"    | Config change outside lobby         |
| `INVALID_MAX_PLAYERS`            | "Max players must be between 4 and 20"              | Out of range value                  |
| `INVALID_SPY_COUNT`              | "Spy count must be between 1 and 3"                 | Out of range value                  |

---

## Backward Compatibility

**Old Clients (v1.x)**:

- Ignore new fields in ROOM_STATE, GAME_STARTED, etc.
- Default to maxPlayers=10, spyCount=1 behavior
- Cannot configure new settings (use defaults)
- Can still join rooms created by new clients
- Can still play games with new spy counts (just don't see indicators)

**New Clients (v2.x)**:

- Support all new configuration options
- Handle rooms created by old clients (defaults applied)
- Display capacity/spy count UI conditionally (if fields present)

**Migration Strategy**:

- No version negotiation needed (graceful degradation)
- Server always sends all fields (backward compatible)
- Clients use feature detection (`if (payload.maxPlayers)`)

---

## Message Size Estimates

| Message                     | Typical Size | Max Size   |
| --------------------------- | ------------ | ---------- |
| ROOM_CONFIG_UPDATE          | ~50 bytes    | ~80 bytes  |
| ROOM_STATE (20 players)     | ~800 bytes   | ~1.2 KB    |
| YOUR_ROLE                   | ~80 bytes    | ~150 bytes |
| VOTING_RESULTS (20 players) | ~400 bytes   | ~600 bytes |

**Bandwidth Impact**: Negligible - new fields add <100 bytes per message
