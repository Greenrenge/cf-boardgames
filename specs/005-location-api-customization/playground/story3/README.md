# User Story 3: Host Location Selection Persistence - Playground

**Feature**: Automatically save and restore host's location selections across browser sessions

## Overview

This playground demonstrates host persistence functionality:

- Host customizes location selections in Lobby
- Selections automatically saved when game starts
- Selections automatically restored when creating a new room
- Visual indicator shows when using saved selections
- Works across browser restarts

## User Story

**As a** game host  
**I want** my location selections to be remembered  
**So that** I don't have to reconfigure them every time I host a game

## Persistence Strategy

### When Selections Are Saved

- Automatically when host clicks "Start Game"
- Timestamp added for audit trail
- Stored in localStorage under `location-selections`

### When Selections Are Restored

- Automatically when Lobby component mounts (if user is host)
- Merged with latest API data (using existing merge logic)
- Visual indicator shown: "Using your saved selections from [date]"

### What Is Saved

- All location isSelected states
- All role selections within locations
- Timestamp of when saved
- Version for future compatibility

## Test Scenarios

### Scenario 1: Basic Persistence

**Steps**:

1. Create a room as host
2. Customize location selections (deselect 5 locations)
3. Start game
4. After game ends, leave room
5. Create a new room
6. Verify previous selections are restored

**Expected**: Selections persist, same 5 locations deselected

### Scenario 2: Browser Restart

**Steps**:

1. Create room, customize selections
2. Start game
3. Close browser completely
4. Reopen browser, navigate to app
5. Create new room

**Expected**: Selections restored from localStorage

### Scenario 3: Mixed with API Updates

**Steps**:

1. Host saves selections (80 locations)
2. API updated to 85 locations
3. Host creates new room

**Expected**:

- Original 80 locations have saved states
- 5 new locations default to selected
- All display correctly merged

### Scenario 4: Visual Indicator

**Steps**:

1. Host with saved selections creates room
2. Check for visual indicator in Lobby

**Expected**: Message like "Using your saved selections from Oct 31, 2025"

### Scenario 5: Override Saved Selections

**Steps**:

1. Create room (loads saved selections)
2. Modify selections
3. Click "Reset to Default"

**Expected**:

- Saved selections cleared from localStorage
- All locations reset to selected
- Indicator message disappears

### Scenario 6: Non-Host Doesn't Auto-Load

**Steps**:

1. Join room as non-host
2. Check if selections are loaded

**Expected**: Non-host does NOT auto-load host's personal saved selections

## Implementation Details

### Auto-Save Trigger

```typescript
// In Lobby component, when host starts game
const handleStartGame = () => {
  if (isHost) {
    // Save current selections to localStorage
    saveHostSelections(locations);
  }
  onStartGame(selectedDifficulties, timerDuration);
};
```

### Auto-Restore on Mount

```typescript
// In Lobby component useEffect
useEffect(() => {
  if (isHost) {
    const savedSelections = getLocationSelections();
    if (savedSelections && savedSelections.timestamp) {
      setShowSavedIndicator(true);
      setSavedTimestamp(savedSelections.timestamp);
    }
  }
}, [isHost]);
```

### Visual Indicator Component

```tsx
{
  showSavedIndicator && savedTimestamp && (
    <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
      ℹ️ Using your saved selections from {formatDate(savedTimestamp)}
    </div>
  );
}
```

## localStorage Structure

Same as existing `location-selections` with timestamp:

```json
{
  "version": "1.0.0",
  "timestamp": "2025-10-31T14:30:00.000Z",
  "selections": {
    "loc-hospital": {
      "locationId": "loc-hospital",
      "isSelected": false,
      "selectedRoles": ["loc-hospital-role-1"],
      "timestamp": "2025-10-31T14:30:00.000Z"
    }
  }
}
```

## Success Criteria

✅ Selections automatically saved when host starts game  
✅ Selections automatically restored when host creates new room  
✅ Visual indicator shows when using saved selections  
✅ Timestamp displayed in human-readable format  
✅ Works across browser restarts  
✅ Merge with API updates works correctly  
✅ Reset button clears saved selections  
✅ Non-hosts do NOT auto-load selections

## Testing Instructions

### Manual Testing

1. **Test Basic Persistence**:
   - Create room, customize, start game
   - Create new room
   - Verify selections restored

2. **Test Browser Restart**:
   - Save selections, close browser
   - Reopen, create room
   - Check selections restored

3. **Test Visual Indicator**:
   - Look for indicator message in Lobby
   - Check timestamp is human-readable
   - Verify it only shows when selections exist

4. **Test Reset**:
   - With saved selections, click "Reset to Default"
   - Create new room
   - Verify no selections restored

5. **Test Non-Host**:
   - Join as non-host
   - Verify no auto-loading
   - Verify host's saved selections don't affect non-host

### Demo Page Testing

Navigate to `/test-host-persistence`:

- Button to simulate "Start Game" (saves selections)
- Button to simulate "Create New Room" (loads selections)
- Display showing saved timestamp
- Visual indicator preview

## Files Involved

- `components/room/Lobby.tsx` - Add auto-save and auto-restore logic
- `lib/locationStorage.ts` - Already has save/load functions (no changes needed)
- `playground/story3/demo.tsx` - Testing page
- `playground/story3/README.md` - This file

## Performance Considerations

- Auto-save on game start: <10ms (async, non-blocking)
- Auto-restore on mount: <50ms (uses existing merge)
- No impact on game start time
- localStorage operations are synchronous but fast

## Edge Cases Handled

1. **No saved selections**: App works normally, all locations selected by default
2. **Corrupted localStorage**: Gracefully fallback to defaults
3. **Old version format**: Version field allows migration in future
4. **API changes**: Merge logic handles new/removed locations
5. **Multiple devices**: Each device has its own localStorage (by design)

## Running the Demo

1. Copy `playground/story3/demo.tsx` to `app/[locale]/test-host-persistence/page.tsx`
2. Navigate to `http://localhost:3000/en/test-host-persistence`
3. Follow test scenarios above
4. Check DevTools → Application → localStorage for persistence
