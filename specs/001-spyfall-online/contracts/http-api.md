# HTTP API Contract

**Version**: 1.0.0  
**Base URL**: `https://api.spyfall.example.com`  
**Format**: JSON

## Authentication

No authentication required. Anonymous gameplay only. Player identification via UUID in localStorage.

---

## Endpoints

### 1. Create Room

Create a new game room.

**Endpoint**: `POST /api/rooms`

**Request Body**:
```json
{
  "hostPlayerId": "uuid-123",
  "hostPlayerName": "Alice",
  "gameType": "spyfall"
}
```

**Response** (201 Created):
```json
{
  "roomCode": "ABC123",
  "hostPlayerId": "uuid-123",
  "gameType": "spyfall",
  "createdAt": "2025-10-24T10:00:00Z",
  "websocketUrl": "wss://api.spyfall.example.com/room/ABC123"
}
```

**Errors**:
- `400 Bad Request`: Invalid request body
- `500 Internal Server Error`: Room creation failed

---

### 2. Get Room Info

Get public information about a room (before joining).

**Endpoint**: `GET /api/rooms/{roomCode}`

**Response** (200 OK):
```json
{
  "roomCode": "ABC123",
  "gameType": "spyfall",
  "playerCount": 3,
  "maxPlayers": 10,
  "phase": "lobby",
  "isJoinable": true
}
```

**Errors**:
- `404 Not Found`: Room doesn't exist
- `500 Internal Server Error`: Server error

---

### 3. Get Locations

Get list of locations for a game type (used for spy guess UI).

**Endpoint**: `GET /api/locations?gameType={gameType}&difficulty={difficulty}`

**Query Parameters**:
- `gameType` (required): "spyfall" | "werewolf"
- `difficulty` (optional): Comma-separated list "easy,medium,hard" (defaults to all)

**Response** (200 OK):
```json
{
  "locations": [
    {
      "id": "loc-001",
      "nameTh": "ชายหาด",
      "difficulty": "easy",
      "imageUrl": "https://r2.example.com/locations/beach.webp"
    },
    {
      "id": "loc-002",
      "nameTh": "ร้านกาแฟ",
      "difficulty": "easy",
      "imageUrl": "https://r2.example.com/locations/cafe.webp"
    }
  ]
}
```

**Errors**:
- `400 Bad Request`: Invalid game type or difficulty
- `500 Internal Server Error`: Database error

---

### 4. Health Check

Check if API is operational.

**Endpoint**: `GET /api/health`

**Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2025-10-24T10:00:00Z",
  "version": "1.0.0"
}
```

---

## Error Response Format

All errors follow this structure:

```json
{
  "error": {
    "code": "ROOM_NOT_FOUND",
    "message": "Room with code ABC123 does not exist",
    "details": {}
  }
}
```

**Common Error Codes**:
- `INVALID_REQUEST`: Malformed request
- `ROOM_NOT_FOUND`: Room doesn't exist
- `ROOM_FULL`: Room at capacity
- `INVALID_GAME_TYPE`: Unsupported game type
- `INTERNAL_ERROR`: Server error

---

## Rate Limiting

- **Room Creation**: 10 requests per minute per IP
- **Get Room Info**: 100 requests per minute per IP
- **Get Locations**: 100 requests per minute per IP (cached at edge)

**Rate Limit Headers**:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1698172860
```

**429 Too Many Requests Response**:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please wait 30 seconds.",
    "details": {
      "retryAfter": 30
    }
  }
}
```

---

## CORS Headers

All endpoints return CORS headers for browser access:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Caching

- **Get Locations**: Cached at Cloudflare edge for 1 hour
- **Get Room Info**: No caching (real-time data)
- **Health Check**: Cached for 1 minute

**Cache Headers**:
```
Cache-Control: public, max-age=3600
CDN-Cache-Control: public, max-age=3600
```
