# HTTP API Contract: Location Images & Player Scaling

**Version**: 2.0 (extends existing REST API)  
**Date**: 2025-10-28  
**Base URL**: `/api` (Cloudflare Workers)

## Modified Endpoints

### 1. POST /rooms - EXTENDED

Create a new game room with optional configuration.

**Request**:

```http
POST /api/rooms
Content-Type: application/json

{
  "hostPlayerId": "uuid-v4",
  "hostPlayerName": "Alice",
  "gameType": "spyfall",

  // NEW: Optional configuration
  "maxPlayers": 15,  // Optional, default: 10, range: 4-20
  "spyCount": 2      // Optional, default: 1, range: 1-3
}
```

**Response (201 Created)**:

```json
{
  "success": true,
  "roomCode": "ABC123",
  "config": {
    "maxPlayers": 15,
    "spyCount": 2,
    "minPlayers": 4
  }
}
```

**Response (400 Bad Request)**:

```json
{
  "success": false,
  "error": "Max players must be between 4 and 20"
}
```

**Validation**:

- `maxPlayers`: 4-20 (inclusive)
- `spyCount`: 1-3 (inclusive)
- `hostPlayerId`: required UUID
- `hostPlayerName`: required, 1-20 characters
- `gameType`: must be "spyfall"

---

### 2. GET /rooms/:code - EXTENDED

Get room information including current configuration.

**Request**:

```http
GET /api/rooms/ABC123
```

**Response (200 OK)**:

```json
{
  "success": true,
  "room": {
    "code": "ABC123",
    "hostPlayerId": "uuid-v4",
    "gameType": "spyfall",
    "phase": "lobby",
    "createdAt": 1698765432000,

    // NEW: Configuration fields
    "maxPlayers": 15,
    "currentPlayerCount": 8,
    "spyCount": 2,

    "players": [
      /* ... */
    ]
  }
}
```

**Response (404 Not Found)**:

```json
{
  "success": false,
  "error": "Room not found"
}
```

---

### 3. PATCH /rooms/:code/config - NEW

Update room configuration (host only, lobby only).

**Request**:

```http
PATCH /api/rooms/ABC123/config
Content-Type: application/json
Authorization: Bearer <hostPlayerId>

{
  "maxPlayers": 20,  // Optional
  "spyCount": 3      // Optional
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "config": {
    "maxPlayers": 20,
    "spyCount": 3,
    "currentPlayerCount": 12
  }
}
```

**Response (403 Forbidden)**:

```json
{
  "success": false,
  "error": "Only host can modify configuration"
}
```

**Response (400 Bad Request)**:

```json
{
  "success": false,
  "error": "Cannot reduce capacity below current player count (12 players currently in room)"
}
```

**Validation**:

- Authorization: `hostPlayerId` must match room host
- Phase: Room must be in "lobby" phase
- `maxPlayers >= currentPlayerCount`
- `spyCount * 3 <= currentPlayerCount`
- `maxPlayers`: 4-20
- `spyCount`: 1-3

---

## No Changes Needed

The following existing endpoints remain unchanged:

- `POST /rooms/:code/join` - Join still checks capacity via room state
- `POST /rooms/:code/leave` - Leave behavior unchanged
- `POST /rooms/:code/start` - Start validates spy count automatically
- `GET /locations` - Location data unchanged (images already in data)

---

## Example Flows

### Create Room with Custom Configuration

```http
POST /api/rooms
Content-Type: application/json

{
  "hostPlayerId": "host-123",
  "hostPlayerName": "Alice",
  "gameType": "spyfall",
  "maxPlayers": 20,
  "spyCount": 3
}
```

Response:

```json
{
  "success": true,
  "roomCode": "XYZ789",
  "config": {
    "maxPlayers": 20,
    "spyCount": 3,
    "minPlayers": 4
  }
}
```

---

### Attempt to Join Full Room

```http
POST /api/rooms/XYZ789/join
Content-Type: application/json

{
  "playerId": "player-456",
  "playerName": "Bob"
}
```

Response (if room is full):

```json
{
  "success": false,
  "error": "Room is full (20/20 players)",
  "currentPlayerCount": 20,
  "maxPlayers": 20
}
```

---

### Update Configuration Mid-Lobby

```http
PATCH /api/rooms/XYZ789/config
Content-Type: application/json
Authorization: Bearer host-123

{
  "maxPlayers": 18
}
```

Response:

```json
{
  "success": true,
  "config": {
    "maxPlayers": 18,
    "spyCount": 3,
    "currentPlayerCount": 12
  }
}
```

---

### Try to Update During Active Game

```http
PATCH /api/rooms/XYZ789/config
Content-Type: application/json
Authorization: Bearer host-123

{
  "spyCount": 2
}
```

Response:

```json
{
  "success": false,
  "error": "Cannot change configuration during active game",
  "currentPhase": "playing"
}
```

---

## Status Codes

| Code | Meaning               | Usage                                  |
| ---- | --------------------- | -------------------------------------- |
| 200  | OK                    | Successful GET/PATCH                   |
| 201  | Created               | Successful room creation               |
| 400  | Bad Request           | Invalid parameters, validation failure |
| 403  | Forbidden             | Non-host attempting config change      |
| 404  | Not Found             | Room doesn't exist                     |
| 409  | Conflict              | Room full, config locked, etc.         |
| 500  | Internal Server Error | Durable Object failure                 |

---

## Error Response Format

All error responses follow this structure:

```typescript
{
  success: false,
  error: string,           // Human-readable message
  code?: string,           // Machine-readable error code (optional)
  details?: any            // Additional context (optional)
}
```

Examples:

```json
{
  "success": false,
  "error": "Spy count too high for current player count",
  "code": "INSUFFICIENT_PLAYERS",
  "details": {
    "spyCount": 3,
    "requiredPlayers": 9,
    "currentPlayers": 7
  }
}
```

---

## Rate Limiting

No changes to existing rate limits:

- Room creation: 5 per minute per IP
- Join attempts: 10 per minute per IP
- Config updates: 20 per minute per room (prevent spam)

---

## CORS Headers

No changes - existing CORS policy applies:

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Authentication

Simple player ID-based auth (unchanged):

- Host operations require `Authorization: Bearer <hostPlayerId>` header
- Player ID validated against room state
- No JWT or OAuth (simplicity for MVP)

---

## Caching

Room state responses:

```http
Cache-Control: no-cache, no-store, must-revalidate
```

Location data (images):

```http
Cache-Control: public, max-age=31536000, immutable
```

(Already handled by R2 bucket configuration)
