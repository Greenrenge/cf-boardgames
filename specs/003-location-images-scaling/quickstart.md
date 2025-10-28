# Quickstart: Location Images & Player Scaling

**Feature**: 003-location-images-scaling  
**Date**: 2025-10-28  
**Audience**: Developers implementing this feature

## Overview

This guide shows how to implement and test location image display and player scaling features. Follow these steps in order for a smooth implementation path.

---

## Prerequisites

- Node.js 20+ and npm installed
- Cloudflare account with Wrangler CLI configured
- Existing Spyfall project cloned and set up
- Familiar with Next.js and React basics

---

## Phase 1: Frontend - Location Image Display (P1)

### Step 1.1: Create LocationImage Component

Create `components/game/LocationImage.tsx`:

```tsx
interface LocationImageProps {
  imageUrl: string;
  locationName: string;
  className?: string;
}

export function LocationImage({ imageUrl, locationName, className = '' }: LocationImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <div className={`relative aspect-[3/2] w-full ${className}`}>
      {/* Loading skeleton */}
      {status === 'loading' && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}
      
      {/* Error fallback */}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <p className="text-gray-600 font-medium">{locationName}</p>
        </div>
      )}
      
      {/* Image */}
      <img
        src={imageUrl}
        alt={locationName}
        loading="lazy"
        className={`
          w-full h-full object-cover rounded-lg shadow-md
          transition-opacity duration-300
          ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}
        `}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
    </div>
  );
}
```

### Step 1.2: Update RoleCard for Non-Spy

Modify `components/game/RoleCard.tsx`:

```tsx
import { LocationImage } from './LocationImage';

export function RoleCard({ assignment, locations }) {
  if (assignment.isSpy) {
    // Spy view (we'll update in Phase 2)
    return <div>You are the Spy!</div>;
  }
  
  // Non-spy view with location image
  const location = locations.find(loc => loc.nameTh === assignment.location);
  
  return (
    <div className="space-y-4">
      {location && (
        <LocationImage 
          imageUrl={location.imageUrl}
          locationName={location.nameTh}
        />
      )}
      
      <div className="text-center">
        <h3 className="text-xl font-bold">{assignment.location}</h3>
        <p className="text-lg text-gray-600">{assignment.role}</p>
      </div>
    </div>
  );
}
```

### Step 1.3: Test Non-Spy Image Display

**Manual Test**:
1. Run `npm run dev`
2. Create a room and start a game with 4+ players
3. Open role card as non-spy player
4. Verify:
   - ✓ Image loads and displays at 3:2 ratio
   - ✓ Image scales to full width on mobile/desktop
   - ✓ Loading skeleton shows while loading
   - ✓ Text fallback appears if image breaks

**Test on Different Devices**:
- Mobile (375px width): 2-column grid
- Tablet (768px width): 3-column grid
- Desktop (1440px width): 4-column grid

---

## Phase 2: Frontend - Spy Location Browser (P2)

### Step 2.1: Create SpyLocationBrowser Component

Create `components/game/SpyLocationBrowser.tsx`:

```tsx
import { LocationImage } from './LocationImage';

interface Location {
  id: string;
  nameTh: string;
  imageUrl: string;
  difficulty: string;
}

export function SpyLocationBrowser({ locations }: { locations: Location[] }) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  
  // Sort alphabetically
  const sortedLocations = [...locations].sort((a, b) => 
    a.nameTh.localeCompare(b.nameTh, 'th')
  );
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-red-50 border-b">
        <h3 className="text-lg font-bold text-red-600">
          คุณคือสปาย - เลือกดูสถานที่ทั้งหมด
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedLocations.map(location => (
            <button
              key={location.id}
              onClick={() => setSelectedLocation(location)}
              className="text-left hover:scale-105 transition-transform"
            >
              <LocationImage 
                imageUrl={location.imageUrl}
                locationName={location.nameTh}
              />
              <p className="mt-2 text-sm font-medium text-center">
                {location.nameTh}
              </p>
              <p className="text-xs text-gray-500 text-center">
                {location.difficulty}
              </p>
            </button>
          ))}
        </div>
      </div>
      
      {/* Enlarged view modal */}
      {selectedLocation && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedLocation(null)}
        >
          <div className="max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <LocationImage 
              imageUrl={selectedLocation.imageUrl}
              locationName={selectedLocation.nameTh}
              className="mb-4"
            />
            <h4 className="text-white text-2xl font-bold text-center">
              {selectedLocation.nameTh}
            </h4>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Step 2.2: Update RoleCard for Spy

Modify `components/game/RoleCard.tsx`:

```tsx
import { SpyLocationBrowser } from './SpyLocationBrowser';

export function RoleCard({ assignment, locations }) {
  if (assignment.isSpy) {
    return <SpyLocationBrowser locations={locations} />;
  }
  
  // ... non-spy code from Phase 1
}
```

### Step 2.3: Test Spy Image Browser

**Manual Test**:
1. Start a game where you are the spy
2. Open role card
3. Verify:
   - ✓ All 70+ locations load in grid
   - ✓ Scroll is smooth (60fps)
   - ✓ Images load lazily as you scroll
   - ✓ Click enlarges image in modal
   - ✓ Locations sorted alphabetically (Thai)

**Performance Test**:
- Open DevTools Network tab
- Scroll slowly - verify only visible images load
- Scroll to bottom - verify total ~70 image requests
- Check FPS in Performance tab - should stay >55fps

---

## Phase 3: Backend - Player Capacity Scaling (P3)

### Step 3.1: Update Room Model

Modify `workers/src/models/Room.ts`:

```typescript
export class Room {
  public code: string;
  public hostPlayerId: string;
  public maxPlayers: number;  // NEW
  public spyCount: number;    // NEW
  // ... existing fields
  
  constructor(code: string, hostPlayerId: string, gameType: string, options?: {
    maxPlayers?: number;
    spyCount?: number;
  }) {
    this.code = code;
    this.hostPlayerId = hostPlayerId;
    this.maxPlayers = options?.maxPlayers ?? 10;  // Default backward compat
    this.spyCount = options?.spyCount ?? 1;
    // ... existing initialization
  }
  
  canJoin(currentPlayerCount: number): boolean {
    return currentPlayerCount < this.maxPlayers;
  }
  
  canStart(currentPlayerCount: number): boolean {
    return currentPlayerCount >= 4 && 
           currentPlayerCount >= this.spyCount * 3;
  }
}
```

### Step 3.2: Update GameRoom Durable Object

Modify `workers/src/durable-objects/GameRoom.ts`:

```typescript
// In fetch() method for /init endpoint
async fetch(request: Request): Promise<Response> {
  if (url.pathname === '/init' && request.method === 'POST') {
    const body = await request.json();
    const { hostPlayerId, hostPlayerName, gameType, maxPlayers, spyCount } = body;
    
    // Validate
    if (maxPlayers && (maxPlayers < 4 || maxPlayers > 20)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Max players must be between 4 and 20' 
      }), { status: 400 });
    }
    
    if (spyCount && (spyCount < 1 || spyCount > 3)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Spy count must be between 1 and 3' 
      }), { status: 400 });
    }
    
    this.room = new Room(url.hostname, hostPlayerId, gameType, {
      maxPlayers,
      spyCount
    });
    
    await this.saveState();
    // ...
  }
}
```

### Step 3.3: Update Room State Broadcasts

Modify WebSocket broadcast in `GameRoom.ts`:

```typescript
this.broadcast({
  type: 'ROOM_STATE',
  payload: {
    players: Array.from(this.players.values()).map(p => p.toJSON()),
    hostId: this.room?.hostPlayerId,
    phase: this.room?.phase,
    maxPlayers: this.room?.maxPlayers ?? 10,      // NEW
    currentPlayerCount: this.players.size,         // NEW
    spyCount: this.room?.spyCount ?? 1             // NEW
  },
  timestamp: Date.now()
});
```

### Step 3.4: Test Capacity Limits

**Manual Test**:
1. Create room with `maxPlayers: 6`
2. Join with 6 different players
3. Try to join with 7th player
4. Verify:
   - ✓ First 6 players join successfully
   - ✓ 7th player gets "Room is full" error
   - ✓ Lobby shows "6/6 players"

---

## Phase 4: Frontend - Capacity Configuration UI (P3)

### Step 4.1: Update Lobby Component

Modify `components/room/Lobby.tsx`:

```tsx
export function Lobby({ roomState, isHost, onStartGame, onUpdateConfig }) {
  const [maxPlayers, setMaxPlayers] = useState(roomState.maxPlayers ?? 10);
  const [spyCount, setSpyCount] = useState(roomState.spyCount ?? 1);
  
  const handleConfigChange = () => {
    if (isHost) {
      onUpdateConfig({ maxPlayers, spyCount });
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Player list */}
      <PlayerList players={roomState.players} maxPlayers={roomState.maxPlayers} />
      
      {/* Host controls */}
      {isHost && roomState.phase === 'lobby' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-bold">Game Settings</h3>
          
          {/* Max players slider */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Max Players: {maxPlayers}
            </label>
            <input
              type="range"
              min="4"
              max="20"
              value={maxPlayers}
              onChange={e => setMaxPlayers(parseInt(e.target.value))}
              onMouseUp={handleConfigChange}
              disabled={roomState.currentPlayerCount > maxPlayers}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Current: {roomState.currentPlayerCount} players
            </p>
          </div>
          
          {/* Spy count selector */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Number of Spies: {spyCount}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3].map(n => (
                <button
                  key={n}
                  onClick={() => {
                    setSpyCount(n);
                    onUpdateConfig({ spyCount: n });
                  }}
                  disabled={roomState.currentPlayerCount < n * 3}
                  className={`px-4 py-2 rounded ${
                    spyCount === n ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            {roomState.currentPlayerCount < spyCount * 3 && (
              <p className="text-xs text-red-500 mt-1">
                Need at least {spyCount * 3} players for {spyCount} spies
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Start button */}
      <button
        onClick={onStartGame}
        disabled={!roomState.canStart}
        className="w-full py-3 bg-green-500 text-white rounded-lg font-bold"
      >
        Start Game
      </button>
    </div>
  );
}
```

### Step 4.2: Update PlayerList Component

Modify `components/room/PlayerList.tsx`:

```tsx
export function PlayerList({ players, maxPlayers }: { players: Player[], maxPlayers?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">Players</h3>
        {maxPlayers && (
          <span className="text-sm text-gray-600">
            {players.length}/{maxPlayers}
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        {players.map(player => (
          <div key={player.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <span>{player.name}</span>
            {player.isHost && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Host</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Step 4.3: Test Configuration UI

**Manual Test**:
1. Create room as host
2. Adjust max players slider
3. Adjust spy count buttons
4. Add/remove players and verify validation
5. Verify:
   - ✓ Slider updates capacity in real-time
   - ✓ Cannot reduce below current count
   - ✓ Spy count buttons disable correctly
   - ✓ "Need X players" message shows
   - ✓ Start button enables/disables appropriately

---

## Phase 5: Backend - Multi-Spy Logic (P4)

### Step 5.1: Update GameState Model

Modify `workers/src/models/GameState.ts`:

```typescript
export class GameState {
  public locationId: string;
  public spyPlayerIds: string[];  // Changed from single to array
  public assignments: Map<string, Assignment>;
  // ... existing fields
  
  static assignRoles(
    playerIds: string[],
    location: Location,
    spyCount: number
  ): Map<string, Assignment> {
    // Shuffle for fairness
    const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
    
    // Select spies
    const spyIds = shuffled.slice(0, spyCount);
    const nonSpyIds = shuffled.slice(spyCount);
    
    const assignments = new Map();
    
    // Assign spies
    spyIds.forEach(id => {
      assignments.set(id, {
        playerId: id,
        isSpy: true,
        totalSpies: spyCount
      });
    });
    
    // Assign roles to non-spies (with modulo for large groups)
    nonSpyIds.forEach((id, index) => {
      const roleIndex = index % location.roles.length;
      assignments.set(id, {
        playerId: id,
        isSpy: false,
        location: location.nameTh,
        role: location.roles[roleIndex],
        isDuplicateRole: index >= location.roles.length
      });
    });
    
    return assignments;
  }
}
```

### Step 5.2: Test Multi-Spy Assignment

**Manual Test**:
1. Create room with 10 players, 2 spies
2. Start game
3. Check each player's role
4. Verify:
   - ✓ Exactly 2 players are spies
   - ✓ Both spies see location browser
   - ✓ Both spies see "Total Spies: 2"
   - ✓ Spies don't know each other's identity
   - ✓ 8 non-spies get unique roles (or repeated if <8 roles)

---

## Common Issues & Solutions

### Issue: Images not loading

**Solution**: Check R2 bucket CORS configuration:
```bash
wrangler r2 bucket update spyfall-assets \
  --cors-config='{
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"]
  }'
```

### Issue: Capacity changes not syncing

**Solution**: Ensure WebSocket broadcast includes new fields:
- Check `ROOM_STATE` payload has `maxPlayers`, `spyCount`
- Verify frontend listens for these fields
- Clear Durable Object state if testing: `wrangler dev --local`

### Issue: Lazy loading not working

**Solution**: Verify browser support and fallback:
- Check `loading="lazy"` attribute present
- Test in Chrome/Firefox/Safari (all support native lazy loading)
- If older browser, images still load (just not lazy)

---

## Next Steps

After completing this quickstart:

1. **Test Phase**: Follow playground validation in `spec.md`
2. **Polish Phase**: Add animations, improve error messages
3. **Deploy Phase**: Push to Cloudflare Pages and Workers
4. **Monitor Phase**: Check R2 bandwidth usage, Durable Object limits

---

## Useful Commands

```bash
# Frontend development
npm run dev                    # Start Next.js dev server
npm run format                 # Format code with Prettier

# Backend development
npm run workers:dev            # Start Workers dev server locally
npm run workers:deploy         # Deploy to Cloudflare

# Testing
# Open multiple browser tabs to simulate players
# Use Chrome DevTools Device Mode for mobile testing
```

---

## Performance Benchmarks

Expected results after implementation:

| Metric | Target | Actual (fill after testing) |
|--------|--------|------------------------------|
| Non-spy image load time (4G) | <2s | _____ |
| Spy browser scroll FPS | >55fps | _____ |
| Room with 20 players start time | <5s | _____ |
| WebSocket message size increase | <100 bytes | _____ |

---

## Questions?

See:
- **research.md**: Technical decisions and alternatives
- **data-model.md**: Entity definitions and relationships
- **contracts/**: API specifications
- **spec.md**: Original feature requirements
