# User Story 4: Spy Count Configuration - Testing Guide

## Overview

This playground tests **User Story 4**: "Host can configure number of spies (1-3) from the lobby, with validation that ensures at least 3 non-spy players per spy."

## Prerequisites

- Phase 1-5 complete (capacity configuration exists)
- Development server running: `pnpm dev`
- Workers server running: `npm run workers:dev` (in workers directory)
- At least 2 test browsers/devices for multi-player testing

## Test Scenarios

### Scenario 1: Spy Count Button Group in Lobby

**Objective**: Verify host can select spy count using intuitive button group

**Steps**:

1. Create a new game room as host
2. In the lobby, locate the spy count configuration
3. Click between 1, 2, and 3 spy options
4. Observe the UI updates

**Expected Results**:

- ✅ Button group shows three options: 1, 2, 3 spies
- ✅ Buttons are visually distinct (selected vs unselected state)
- ✅ Only one button can be selected at a time
- ✅ Default selection is 1 spy
- ✅ Selection persists when navigating away and back
- ✅ Only visible to host (non-host players see read-only display)

### Scenario 2: 3:1 Ratio Validation

**Objective**: Verify spy count cannot exceed player count / 3

**Steps**:

1. Create room with 4 players
2. Try to select 2 spies (requires 6 players)
3. Try to select 3 spies (requires 9 players)
4. Add more players to reach 6
5. Try selecting 2 spies again

**Expected Results**:

- ✅ With 4-5 players: Only 1 spy available
- ✅ With 6-8 players: 1-2 spies available
- ✅ With 9+ players: 1-3 spies available
- ✅ Invalid options are disabled/grayed out
- ✅ Tooltip or message explains why option is disabled
- ✅ Clear indication of required player count

### Scenario 3: Dynamic Validation with Capacity Changes

**Objective**: Verify spy count adjusts when capacity changes

**Steps**:

1. Create room with capacity 20, select 3 spies
2. Reduce capacity to 8 (below 9 required for 3 spies)
3. Observe spy count adjustment
4. Increase capacity back to 20
5. Verify spy count can be set to 3 again

**Expected Results**:

- ✅ Spy count auto-adjusts down when capacity < required
- ✅ User sees notification about auto-adjustment
- ✅ Valid spy count options update in real-time
- ✅ Can manually re-select previous value after increasing capacity
- ✅ No errors or broken states

### Scenario 4: Multi-Spy Role Assignment

**Objective**: Verify game correctly assigns multiple spies

**Steps**:

1. Create room with 9+ players
2. Set spy count to 3
3. Start the game
4. Check each player's role assignment
5. Verify spy players see correct information

**Expected Results**:

- ✅ Exactly 3 players are assigned as spies
- ✅ Spy players see "You are a spy!" message
- ✅ Spy players see "Total spies: 3" indicator
- ✅ Non-spy players assigned to location roles
- ✅ No player sees other players' roles
- ✅ Role assignment is random (different each round)

### Scenario 5: Multi-Spy Location Browser

**Objective**: Verify all spies see the location browser

**Steps**:

1. Create game with 9 players, 3 spies
2. Start the game
3. Check each spy player's screen
4. Verify all see the same location grid

**Expected Results**:

- ✅ All 3 spy players see location browser
- ✅ Browser shows all 70+ locations
- ✅ Non-spy players see only their assigned location
- ✅ Layout is consistent across all spy players
- ✅ No indication who else is a spy

### Scenario 6: Multi-Spy Voting and Elimination

**Objective**: Verify voting works correctly with multiple spies

**Steps**:

1. Create game with 2 spies
2. Start game and reach voting phase
3. Vote to eliminate a spy
4. Observe results
5. Vote to eliminate a non-spy
6. Observe different results

**Expected Results**:

- ✅ Eliminating one spy doesn't end the game
- ✅ "Spy eliminated!" message shows when spy voted out
- ✅ Game continues if other spy(ies) remain
- ✅ Eliminating non-spy shows "Not a spy" message
- ✅ Correct point calculations for multi-spy scenarios
- ✅ All remaining spies must be eliminated to win

### Scenario 7: Multi-Spy Guess Phase

**Objective**: Verify guess phase with multiple spies

**Steps**:

1. Create game with 2 spies
2. Time expires with spies not eliminated
3. Check which spy can guess
4. Make a guess as the designated spy
5. Observe results for all players

**Expected Results**:

- ✅ Only one spy is designated to guess
- ✅ Other spy(ies) wait while designated spy guesses
- ✅ Correct guess: all spies win
- ✅ Wrong guess: all spies lose
- ✅ Points distributed correctly
- ✅ All players see the same results

### Scenario 8: Spy Count Display for Non-Host

**Objective**: Verify non-host players see spy count info

**Steps**:

1. Create room as Player A (host)
2. Join as Player B (non-host)
3. As Player A, change spy count from 1 to 2
4. As Player B, observe the lobby

**Expected Results**:

- ✅ Non-host sees "Number of spies: X" display
- ✅ Display updates in real-time when host changes it
- ✅ Non-host cannot edit spy count
- ✅ Display is prominent and clear
- ✅ No UI glitches during updates

### Scenario 9: Start Game Validation

**Objective**: Verify game start respects spy count validation

**Steps**:

1. Create room with 4 players, 1 spy selected
2. Try to start game (should work)
3. Change to 2 spies (requires 6 players)
4. Try to start game with only 4 players
5. Add 2 more players
6. Try starting again

**Expected Results**:

- ✅ Start button enabled when player count sufficient
- ✅ Start button disabled when player count insufficient
- ✅ Button text shows required players: "Need 6 players for 2 spies"
- ✅ Game starts successfully when requirements met
- ✅ Error message if attempting to start with invalid config
- ✅ No client-side or server-side errors

### Scenario 10: WebSocket Sync and Persistence

**Objective**: Verify spy count syncs across all clients

**Steps**:

1. Create room with 2 players
2. Set spy count to 2 (will be invalid)
3. Join with 4 more players (total 6, now valid)
4. Observe all clients
5. Disconnect and reconnect as host
6. Verify spy count persisted

**Expected Results**:

- ✅ All clients see spy count update in real-time
- ✅ WebSocket broadcasts `ROOM_CONFIG_UPDATE` message
- ✅ Validation updates immediately for all users
- ✅ Spy count persists through disconnects
- ✅ No race conditions or stale data
- ✅ Consistent state across all clients

### Scenario 11: Edge Cases

**Objective**: Test boundary conditions and edge cases

**Steps**:

1. Create room with exactly 3 players (minimum - 1)
2. Try setting 1 spy (requires 4 minimum)
3. Add 1 player (now 4 total)
4. Set to 1 spy and start game
5. Create room with 20 players
6. Set to 3 spies and start
7. Verify role distribution

**Expected Results**:

- ✅ Minimum 4 players enforced for any spy count
- ✅ Cannot start with 3 or fewer players
- ✅ Maximum 3 spies enforced even with 20 players
- ✅ Ratio validation always respected (3:1)
- ✅ Edge cases handled gracefully
- ✅ No division by zero or math errors

## Manual Testing Checklist

### DevTools Setup

- [ ] Open Chrome/Firefox DevTools
- [ ] Enable responsive design mode
- [ ] Open Network tab to monitor WebSocket messages
- [ ] Open Console for error detection
- [ ] Prepare second browser/incognito for multi-user testing

### Test Execution

- [ ] Run Scenario 1: Spy Count Button Group
- [ ] Run Scenario 2: 3:1 Ratio Validation
- [ ] Run Scenario 3: Dynamic Validation with Capacity
- [ ] Run Scenario 4: Multi-Spy Role Assignment
- [ ] Run Scenario 5: Multi-Spy Location Browser
- [ ] Run Scenario 6: Multi-Spy Voting and Elimination
- [ ] Run Scenario 7: Multi-Spy Guess Phase
- [ ] Run Scenario 8: Non-Host Display
- [ ] Run Scenario 9: Start Game Validation
- [ ] Run Scenario 10: WebSocket Sync
- [ ] Run Scenario 11: Edge Cases

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Success Criteria

**MVP Requirements (Must Have)**:

1. Host sees spy count button group (1, 2, 3) ✅
2. 3:1 player-to-spy ratio enforced ✅
3. Invalid options are disabled with clear feedback ✅
4. All clients sync spy count via WebSocket ✅
5. Multi-spy role assignment works correctly ✅
6. Start game validation respects spy count ✅
7. Default spy count is 1 (backward compatible) ✅

**Game Logic Requirements**:

- Exactly N spies assigned when spy count = N
- All spies see location browser
- Voting eliminates spies one at a time
- Only one spy guesses at end
- Points calculated correctly for multi-spy

**Performance Benchmarks**:

- Spy count update latency: < 200ms
- WebSocket broadcast to all clients: < 500ms
- UI button group response time: < 50ms (60fps)

**Accessibility**:

- Button group has proper ARIA labels
- Keyboard navigation works (tab, arrow keys, space/enter)
- Screen reader announces selected option
- Focus indicators are visible
- Disabled buttons clearly indicate why

## Known Issues / Limitations

_Document any known issues discovered during testing_

## Next Steps

After completing User Story 4 testing:

1. Move to Phase 7: Large Group Support Testing (User Story 5)
2. Verify 20-player games with multi-spy work smoothly
3. Test duplicate role marking in large groups
4. Validate end-to-end gameplay scenarios
