# User Story 3: Player Capacity Configuration - Testing Guide

## Overview

This playground tests **User Story 3**: "Host can configure room capacity (4-20 players) from the lobby, with clear indication of current/max player counts."

## Prerequisites

- Phase 1-4 complete (foundational types and components exist)
- Development server running: `pnpm dev`
- Workers server running: `npm run workers:dev`
- At least 2 test browsers/devices for multi-player testing

## Test Scenarios

### Scenario 1: Capacity Slider in Lobby

**Objective**: Verify host can adjust room capacity using an intuitive slider

**Steps**:

1. Create a new game room as host
2. In the lobby, locate the capacity configuration slider
3. Adjust the slider to various values (4, 8, 12, 16, 20)
4. Observe the UI updates in real-time

**Expected Results**:

- ✅ Slider is visible only to the host
- ✅ Slider range is 4-20 players
- ✅ Current value is clearly displayed (e.g., "10 players")
- ✅ Default value is 10 players
- ✅ Slider updates smoothly without lag
- ✅ Value persists when navigating away and back

### Scenario 2: Current/Max Player Count Display

**Objective**: Verify all players see current and maximum player counts

**Steps**:

1. Create a room with capacity set to 8
2. Join with multiple players (2, 4, 6, 8)
3. Observe the player count display in the lobby
4. Try to join with a 9th player

**Expected Results**:

- ✅ Display shows "X/8 players" format
- ✅ Count updates in real-time as players join
- ✅ 9th player receives clear error message
- ✅ All connected players see the same count
- ✅ Display is prominent and easy to read

### Scenario 3: Room Full State

**Objective**: Verify proper handling when room reaches capacity

**Steps**:

1. Create a room with capacity 5
2. Join with 5 players (room is now full)
3. Attempt to join with a 6th player
4. Observe lobby state for existing players

**Expected Results**:

- ✅ 6th player cannot join (receives error message)
- ✅ Error message is clear: "Room is full (5/5 players)"
- ✅ Lobby shows visual indication of "Full" status
- ✅ Host can still adjust capacity upward to allow more joins
- ✅ Join button is disabled on full room

### Scenario 4: Dynamic Capacity Adjustment

**Objective**: Verify host can change capacity while players are in room

**Steps**:

1. Create room with capacity 10
2. Join with 6 players
3. As host, adjust capacity to 8
4. Try to join with 7th and 8th player
5. As host, adjust capacity down to 7

**Expected Results**:

- ✅ Capacity can be increased at any time
- ✅ Capacity can be decreased if new value ≥ current player count
- ✅ Cannot decrease below current player count
- ✅ All players see updated capacity in real-time
- ✅ Error message if trying to decrease below current count

### Scenario 5: Capacity Validation (4-20 Range)

**Objective**: Verify capacity constraints are enforced

**Steps**:

1. Create a new room as host
2. Try to set capacity to 3 (below minimum)
3. Try to set capacity to 21 (above maximum)
4. Verify boundaries at 4 and 20

**Expected Results**:

- ✅ Slider minimum is 4 (cannot go below)
- ✅ Slider maximum is 20 (cannot go above)
- ✅ Input validation if manual entry allowed
- ✅ Clear indication of valid range in UI
- ✅ No console errors on boundary values

### Scenario 6: Start Game with Capacity Settings

**Objective**: Verify capacity is respected during game start

**Steps**:

1. Create room with capacity 6
2. Join with exactly 4 players
3. Start the game
4. Verify game starts correctly
5. Try to join mid-game with 5th and 6th player

**Expected Results**:

- ✅ Game starts with 4+ players (minimum requirement)
- ✅ Capacity setting persists into active game
- ✅ New players cannot join during active game
- ✅ After game ends, capacity still enforced in next round
- ✅ Room returns to lobby with same capacity

### Scenario 7: Non-Host Player View

**Objective**: Verify non-host players see capacity info but cannot edit

**Steps**:

1. Create room as Player A (host)
2. Join as Player B (non-host)
3. As Player B, observe the lobby interface
4. As Player A, change capacity
5. Verify Player B sees the update

**Expected Results**:

- ✅ Non-host sees capacity display (read-only)
- ✅ Non-host does NOT see slider/edit controls
- ✅ Non-host sees real-time updates when host changes capacity
- ✅ Display format is consistent for all players
- ✅ Clear visual distinction between host and non-host views

### Scenario 8: API Endpoint Testing

**Objective**: Verify backend API properly handles capacity updates

**Steps**:

1. Open browser DevTools > Network tab
2. Create a room and observe POST /rooms request
3. Adjust capacity and observe PATCH /rooms/:code/config
4. Try invalid capacity values via API (if possible)
5. Check WebSocket messages for ROOM_CONFIG_UPDATE

**Expected Results**:

- ✅ POST /rooms accepts optional maxPlayers parameter
- ✅ PATCH /rooms/:code/config endpoint exists and works
- ✅ API validates 4-20 range on server side
- ✅ Invalid requests return 400 Bad Request
- ✅ WebSocket broadcasts ROOM_CONFIG_UPDATE to all players
- ✅ Response includes updated room configuration

### Scenario 9: Backward Compatibility

**Objective**: Verify existing rooms work without capacity config

**Steps**:

1. Create room without specifying capacity
2. Verify default capacity is applied (10 players)
3. Join with multiple players
4. Start game and complete a round

**Expected Results**:

- ✅ Rooms default to 10 player capacity
- ✅ Existing API calls work without maxPlayers parameter
- ✅ No breaking changes to existing functionality
- ✅ Old clients can still join and play
- ✅ Capacity can be adjusted after room creation

### Scenario 10: Responsive Design

**Objective**: Verify capacity controls work on all device sizes

**Steps**:

1. Open DevTools responsive mode
2. Test capacity slider at various widths:
   - 375px (mobile)
   - 768px (tablet)
   - 1024px (desktop)
3. Verify touch interactions on mobile

**Expected Results**:

- ✅ Slider is touch-friendly on mobile (min 44px height)
- ✅ Labels are readable on small screens
- ✅ Layout doesn't break at any breakpoint
- ✅ Player count display is always visible
- ✅ Controls remain accessible and usable

## Manual Testing Checklist

### DevTools Setup

- [ ] Open Chrome/Firefox DevTools
- [ ] Enable responsive design mode
- [ ] Open Network tab to monitor API calls
- [ ] Open Console for error detection
- [ ] Prepare second browser/incognito for multi-user testing

### Test Execution

- [ ] Run Scenario 1: Capacity Slider in Lobby
- [ ] Run Scenario 2: Current/Max Player Count Display
- [ ] Run Scenario 3: Room Full State
- [ ] Run Scenario 4: Dynamic Capacity Adjustment
- [ ] Run Scenario 5: Capacity Validation (4-20 Range)
- [ ] Run Scenario 6: Start Game with Capacity Settings
- [ ] Run Scenario 7: Non-Host Player View
- [ ] Run Scenario 8: API Endpoint Testing
- [ ] Run Scenario 9: Backward Compatibility
- [ ] Run Scenario 10: Responsive Design

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Success Criteria

**MVP Requirements (Must Have)**:

1. Host sees capacity slider (4-20 range) ✅
2. All players see "X/Y players" display ✅
3. Room prevents joins when full ✅
4. Capacity can be adjusted dynamically ✅
5. API endpoint PATCH /rooms/:code/config works ✅
6. WebSocket broadcasts capacity updates ✅
7. Default capacity is 10 (backward compatible) ✅

**Performance Benchmarks**:

- Capacity update latency: < 200ms
- WebSocket broadcast to all clients: < 500ms
- UI slider response time: < 50ms (60fps)

**Accessibility**:

- Slider has proper ARIA labels
- Keyboard navigation works (arrow keys, tab)
- Screen reader announces current value
- Focus indicators are visible

## Known Issues / Limitations

_Document any known issues discovered during testing_

## Next Steps

After completing User Story 3 testing:

1. Move to Phase 6: Spy Count Configuration (User Story 4)
2. Test multi-spy assignment with various capacity settings
3. Validate large group support (User Story 5)
