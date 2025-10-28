# User Story 5: Large Group Support (20 Players) - Testing Guide

## Overview

This playground tests **User Story 5**: "System supports up to 20 players with proper duplicate role marking when location has fewer roles than non-spy players."

## Prerequisites

- Phase 1-6 complete (all UI controls and backend support exist)
- Development server running: `pnpm dev`
- Workers server running: `npm run workers:dev` (in workers directory)
- Multiple test devices/browsers (or use automated testing tools)
- Chrome DevTools for performance monitoring

## Test Scenarios

### Scenario 1: Maximum Capacity (20 Players)

**Objective**: Verify system handles 20 players smoothly

**Steps**:

1. Create a room and set capacity to 20
2. Join with 20 players (can use multiple browsers/incognito windows)
3. Verify all players see correct player list
4. Set spy count to 3 (maximum for 20 players: floor(20/4) = 5, capped at 3)
5. Start the game
6. Verify game starts successfully

**Expected Results**:

- ✅ All 20 players successfully join
- ✅ Lobby shows "20/20 players"
- ✅ Room becomes full (no 21st player can join)
- ✅ Player list displays all 20 names without overflow
- ✅ Game starts within 5 seconds
- ✅ No performance degradation or lag
- ✅ All players receive role assignments

### Scenario 2: Duplicate Role Marking

**Objective**: Verify duplicate roles are properly marked

**Steps**:

1. Create room with 20 players
2. Start game with 3 spies (17 non-spy players)
3. Select a location with fewer than 17 roles (most locations have 6-10 roles)
4. Check each non-spy player's assignment
5. Verify duplicate role indicators

**Expected Results**:

- ✅ Non-spy players assigned roles from location's role list
- ✅ Roles distributed using modulo (role = roles[index % roles.length])
- ✅ Players with duplicate roles see indicator: `isDuplicateRole: true`
- ✅ First N players (N = role count) get unique roles
- ✅ Remaining players get repeated roles in same order
- ✅ All non-spy players can see their role clearly

**Example with 17 non-spies and 8 roles**:

```
Player 1-8: Roles 1-8 (unique, isDuplicateRole: false)
Player 9-16: Roles 1-8 (duplicates, isDuplicateRole: true)
Player 17: Role 1 (duplicate, isDuplicateRole: true)
```

### Scenario 3: Large Group with 3 Spies

**Objective**: Verify multi-spy works correctly in large groups

**Steps**:

1. Create room with 20 players
2. Set spy count to 3
3. Start game
4. Identify the 3 spy players
5. Play through a complete round

**Expected Results**:

- ✅ Exactly 3 players assigned as spies
- ✅ All 3 spies see location browser (grid of all locations)
- ✅ 17 non-spy players see their assigned location + role
- ✅ Voting requires eliminating all 3 spies to win
- ✅ Timer works correctly for large group
- ✅ Chat handles 20 players without performance issues
- ✅ Turn indicators work smoothly

### Scenario 4: Duplicate Role Display

**Objective**: Verify UI clearly shows duplicate role status

**Steps**:

1. Start game with 20 players (17 non-spies)
2. As a non-spy player with unique role, check your card
3. As a non-spy player with duplicate role, check your card
4. Compare the two displays

**Expected Results**:

- ✅ Unique roles: standard role card display
- ✅ Duplicate roles: visual indicator (badge, icon, or text)
- ✅ Indicator text: "⚠️ Others may have this role" or similar
- ✅ Styling differentiates duplicate from unique
- ✅ Tooltip or help text explains what it means
- ✅ Doesn't reveal which other players have same role

### Scenario 5: Large Group Voting

**Objective**: Verify voting mechanics with 20 players

**Steps**:

1. Play game with 20 players until voting phase
2. Have all 20 players cast votes
3. Verify vote counting and results
4. Eliminate a player and continue

**Expected Results**:

- ✅ Voting interface handles 20 player options
- ✅ Vote counter shows "X/20 votes"
- ✅ All votes counted correctly
- ✅ Player with most votes is eliminated
- ✅ Tie-breaking works if applicable
- ✅ Results screen shows correct point distribution
- ✅ Game continues with 19 players if spies remain

### Scenario 6: Chat Performance with 20 Players

**Objective**: Verify chat handles high message volume

**Steps**:

1. Start game with 20 players
2. Have multiple players send messages simultaneously
3. Monitor chat scroll behavior and performance
4. Check for message loss or ordering issues

**Expected Results**:

- ✅ All messages delivered to all players
- ✅ Messages appear in correct chronological order
- ✅ No message loss during high traffic
- ✅ Chat scroll works smoothly
- ✅ No layout issues with many messages
- ✅ Performance remains >30fps during heavy chat
- ✅ Turn indicators work correctly

### Scenario 7: Location with Minimum Roles

**Objective**: Test extreme duplicate scenario

**Steps**:

1. Identify location with fewest roles (e.g., 5-6 roles)
2. Start game with 20 players (17 non-spies)
3. Hope game selects that location (or modify code for testing)
4. Verify role distribution

**Expected Results**:

- ✅ All 17 non-spies get roles (with many duplicates)
- ✅ Role assignment uses modulo correctly
- ✅ First 5-6 players get unique roles
- ✅ Remaining 11-12 players get duplicate roles
- ✅ Each duplicate clearly marked
- ✅ No errors or undefined roles
- ✅ Game plays normally despite duplicates

### Scenario 8: Spy Guess with Large Group

**Objective**: Verify spy guess phase with 20 players

**Steps**:

1. Play game with 20 players and 3 spies
2. Let timer expire without eliminating all spies
3. Enter spy guess phase
4. One spy makes a guess
5. Check results distribution

**Expected Results**:

- ✅ Only 1 of 3 spies prompted to guess
- ✅ Other 2 spies see waiting screen
- ✅ 17 non-spies see waiting screen
- ✅ Guess result distributed to all 20 players
- ✅ Points calculated correctly for all players
- ✅ Results screen shows all 20 players and scores
- ✅ No timeout or performance issues

### Scenario 9: Player Disconnect/Reconnect in Large Group

**Objective**: Verify stability with player churn

**Steps**:

1. Start game with 20 players
2. Have 3-5 players disconnect mid-game
3. Verify game continues
4. Have disconnected players reconnect
5. Check state synchronization

**Expected Results**:

- ✅ Game continues when players disconnect
- ✅ Disconnected players marked properly
- ✅ Player list updates for all connected players
- ✅ Reconnection works smoothly
- ✅ Reconnected players see correct game state
- ✅ No duplicate players in list
- ✅ Vote counting adjusts for disconnected players

### Scenario 10: Performance Benchmarks

**Objective**: Measure system performance with 20 players

**Steps**:

1. Open Chrome DevTools > Performance tab
2. Start game with 20 players
3. Record performance during:
   - Game start (role assignment)
   - Active gameplay (chat, timer)
   - Voting phase
   - Results screen
4. Check FPS, memory usage, network traffic

**Expected Results**:

- ✅ Game start completes in < 5 seconds
- ✅ UI maintains > 30fps during gameplay
- ✅ Memory usage stays < 100MB per client
- ✅ WebSocket messages delivered in < 500ms
- ✅ No memory leaks over 10+ minute session
- ✅ No excessive re-renders (check React DevTools)
- ✅ Image lazy loading works (only visible images loaded)

### Scenario 11: Edge Case: 20 Players, 1 Spy

**Objective**: Test maximum non-spy player count

**Steps**:

1. Create room with 20 players
2. Set spy count to 1 (default)
3. Start game
4. Verify 19 non-spy role assignments

**Expected Results**:

- ✅ 19 non-spy players get roles
- ✅ High number of duplicate roles (most locations have < 19 roles)
- ✅ All duplicates properly marked
- ✅ Game plays normally
- ✅ Voting works with 19 players
- ✅ Single spy can still win if not caught

### Scenario 12: Capacity Reduction After Players Join

**Objective**: Verify capacity constraints with existing players

**Steps**:

1. Create room with capacity 20
2. Join with 15 players
3. As host, try to reduce capacity to 10 (should fail)
4. Reduce capacity to 15 (should work)
5. Try to join with 16th player

**Expected Results**:

- ✅ Cannot reduce capacity below current player count
- ✅ Error message: "Cannot set to 10 when 15 players in room"
- ✅ Can reduce to exactly current player count
- ✅ New reduced capacity enforced
- ✅ 16th player cannot join when capacity = 15
- ✅ All existing players remain connected

## Manual Testing Checklist

### Setup

- [ ] Development servers running (Next.js + Workers)
- [ ] Chrome DevTools ready for performance monitoring
- [ ] Multiple browsers/devices prepared (or testing tool)
- [ ] Test plan reviewed and understood

### Test Execution

- [ ] Run Scenario 1: Maximum Capacity (20 Players)
- [ ] Run Scenario 2: Duplicate Role Marking
- [ ] Run Scenario 3: Large Group with 3 Spies
- [ ] Run Scenario 4: Duplicate Role Display
- [ ] Run Scenario 5: Large Group Voting
- [ ] Run Scenario 6: Chat Performance
- [ ] Run Scenario 7: Location with Minimum Roles
- [ ] Run Scenario 8: Spy Guess with Large Group
- [ ] Run Scenario 9: Player Disconnect/Reconnect
- [ ] Run Scenario 10: Performance Benchmarks
- [ ] Run Scenario 11: Edge Case (20 Players, 1 Spy)
- [ ] Run Scenario 12: Capacity Reduction

### Performance Validation

- [ ] Game start < 5 seconds with 20 players
- [ ] UI maintains > 30fps during active gameplay
- [ ] WebSocket latency < 500ms
- [ ] No memory leaks detected
- [ ] Chat handles burst messages (10+ simultaneous)
- [ ] Location browser scrolls smoothly for spies

### Browser Compatibility

- [ ] Chrome (latest) - 20 players
- [ ] Firefox (latest) - 10+ players
- [ ] Safari (latest) - 5+ players
- [ ] Mobile Chrome - 2-3 players in large room
- [ ] Mobile Safari - 2-3 players in large room

## Success Criteria

**MVP Requirements (Must Have)**:

1. System handles 20 players without crashes ✅
2. Duplicate roles properly marked (isDuplicateRole flag) ✅
3. Modulo distribution works correctly ✅
4. All players receive role assignments ✅
5. Game logic works with any player count (4-20) ✅
6. Performance meets benchmarks (< 5s start, > 30fps) ✅
7. Multi-spy works with large groups ✅

**Game Logic Validation**:

- Role assignment uses modulo for large groups
- Duplicate role flag set correctly
- Voting works with any player count
- Points calculated correctly for all scenarios
- Spy guess works regardless of group size

**Performance Benchmarks**:

- Game start with 20 players: < 5 seconds
- UI frame rate during gameplay: > 30fps (> 55fps target)
- WebSocket message delivery: < 500ms
- Memory per client: < 100MB
- Chat message delivery: < 200ms per message

**Accessibility & UX**:

- Player list readable and scrollable with 20 players
- Voting interface usable with 20 options
- Duplicate role indicator is clear and helpful
- No UI overflow or layout breaks
- Touch targets remain adequate on mobile

## Known Issues / Limitations

_Document any known issues discovered during testing_

**Potential Issues to Watch For**:

1. WebSocket connection limits (typically 256 per browser)
2. Memory usage with many simultaneous connections
3. Race conditions in role assignment
4. Duplicate detection edge cases
5. Performance degradation on low-end devices

## Implementation Verification

**Backend (Already Implemented in Phase 2)**:

```typescript
// GameState.assignRoles() - modulo distribution
const roleIndex = index % location.roles.length;
assignments[id] = {
  playerId: id,
  role: location.roles[roleIndex],
  location: location.nameTh,
  isSpy: false,
  isDuplicateRole: index >= location.roles.length, // Mark duplicates
};
```

**Frontend Display**:
Need to add UI indicator for `isDuplicateRole` in RoleCard component.

## Next Steps

After completing User Story 5 testing:

1. Move to Phase 8: Polish & Cross-Cutting
2. Code cleanup and refactoring
3. Documentation updates
4. Final integration testing
5. Performance optimization if needed
6. Prepare for production deployment
