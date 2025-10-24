# User Story 2 Playground: Play Spyfall Round

## Overview

This playground tests the full game round including role assignment, chat, timer, voting, and results display.

## What's Implemented

### Backend - Game Logic

- **Game Start Handler**: START_GAME message processing with player validation
- **Location Selection**: Random location picked from database based on difficulty settings
- **Role Assignment**: One random spy, others get unique roles from the location
- **Timer System**: Countdown timer with TIMER_TICK broadcasts every second
- **Chat System**: Real-time chat with message storage and broadcasting
- **Voting System**: Vote collection, tallying, and elimination logic
- **Score Calculation**: Points awarded based on spy caught/escaped outcomes

### Frontend - Game UI

- **Role Card**: Displays player's role and location info (or spy indicator)
- **Location Reference**: Shows all roles at the location for non-spy players
- **Chat Interface**: Send and receive messages with timestamp and player names
- **Timer Display**: Visual countdown showing remaining time
- **Voting Interface**: Player selection and vote submission
- **Results Display**: Shows voting outcome, spy identity, and updated scores

## Prerequisites

### Required: Completed User Story 1

Before testing US2, ensure US1 is working:

- ✅ Room creation and joining works
- ✅ Real-time player synchronization
- ✅ Connection status indicators
- ✅ Host can kick players
- ✅ WebSocket heartbeat (5s intervals)

### Backend Running

```bash
cd workers
wrangler dev
# Should be running on localhost:8787
```

### Frontend Running

```bash
npm run dev
# Should be running on localhost:3000
```

### Database Seeded

Verify locations exist in D1:

```bash
cd workers
wrangler d1 execute DB --local --command="SELECT COUNT(*) FROM locations"
# Should return at least 10 locations
```

## Testing Scenarios

### Scenario 1: Game Start with 4 Players

**Setup**:

1. Open 4 browser tabs (or use 2 browsers + 2 incognito tabs)
2. Tab 1: Create room as "Alice" (HOST)
3. Tabs 2-4: Join room as "Bob", "Charlie", "Diana"

**Test Game Start**:

1. **Alice's tab**: Click "เริ่มเกม" (Start Game) button
2. **Expected Results**:
   - All 4 tabs: Transition from lobby to game view
   - All tabs: Timer starts counting down from 8:00
   - Each tab shows different content:
     - **1 spy**: Shows "คุณเป็นสายลับ!" (You are the spy), no location info
     - **3 non-spies**: Show "สถานที่: [location name]" and their specific role

3. **Verify Role Distribution**:
   - Exactly 1 player sees spy indicator
   - Other 3 players see the same location name
   - Each non-spy has a unique role (no duplicates)

**Example**:

- Alice: "คุณเป็นสายลับ!" ⚠️
- Bob: "สถานที่: ชายหาด" + "บทบาท: นักดำน้ำ" 🏖️
- Charlie: "สถานที่: ชายหาด" + "บทบาท: คนขายของ" 🏖️
- Diana: "สถานที่: ชายหาด" + "บทบาท: นักท่องเที่ยว" 🏖️

### Scenario 2: Chat Communication

**During Active Game**:

1. **Alice** (spy): Type "Where are we?" in chat, press Enter
2. **Expected**:
   - All 4 tabs show: "[8:00] Alice: Where are we?"
   - Message appears in real-time (< 100ms)

3. **Bob**: Type "I'm working on my tan"
4. **Expected**: All tabs see: "[7:55] Bob: I'm working on my tan"

5. **Charlie**: Type "The weather is nice today"
6. **Diana**: Type "I love the ocean view"

7. **Verify Chat Features**:
   - All messages appear in chronological order
   - Each message shows player name and timestamp
   - Spy (Alice) can see all messages
   - Non-spies can see all messages

**Chat Strategy Test** (Optional):

- Spy tries to blend in by asking location-specific questions
- Non-spies try to catch spy with specific location details
- Verify all communication is visible to everyone

### Scenario 3: Timer Countdown

1. **Start Game** with 4 players
2. **Observe Timer**:
   - Initial: "8:00"
   - After 30 sec: "7:30"
   - After 60 sec: "7:00"

3. **Verify Timer Sync**:
   - All 4 tabs show same time (±1 second acceptable)
   - Timer updates every second
   - No timer drift between tabs

4. **Wait for Timer Expiry** (or set shorter time for testing):
   - When timer reaches "0:00"
   - **Expected**: Automatic phase change to voting
   - All tabs show voting interface

### Scenario 4: Voting for Spy

**After Timer Expires or Enough Discussion**:

1. **All Tabs**: Voting interface appears
   - Shows list of all players
   - Each player can select one suspect
   - "Vote" button to submit

2. **Alice** (spy): Votes for Bob
3. **Bob**: Votes for Alice
4. **Charlie**: Votes for Alice
5. **Diana**: Votes for Alice

6. **Expected Results**:
   - Each tab shows vote count updates:
     - "Bob (1 vote)"
     - "Alice (3 votes)"
   - After all votes in: Results screen appears

### Scenario 5: Voting Results - Spy Caught

**Continuing from Scenario 4**:

1. **Results Display** shows:
   - "Alice was eliminated!"
   - "Alice was the SPY! 🎉"
   - Score updates:
     - Bob: +1 point
     - Charlie: +1 point
     - Diana: +1 point
     - Alice: 0 points

2. **Verify Score Persistence**:
   - Scores should persist to next round
   - Check localStorage has updated session

3. **Return to Lobby**:
   - After 5 seconds, all tabs return to lobby
   - Ready for next round

### Scenario 6: Voting Results - Wrong Person Eliminated

**Setup**:

1. Start game, Alice is spy
2. During voting:
   - Alice: Votes for Bob
   - Bob: Votes for Charlie
   - Charlie: Votes for Bob
   - Diana: Votes for Bob

**Bob Eliminated (2 votes)**:

1. **Results Display**:
   - "Bob was eliminated!"
   - "Bob was NOT the spy 😢"
   - "The spy (Alice) wins this round!"
   - Score updates:
     - Alice: +1 point (spy escaped)
     - Bob, Charlie, Diana: 0 points

2. **Verify Spy Victory**:
   - Spy gets point when wrong person eliminated
   - Game shows spy's actual identity in results

### Scenario 7: Vote Tie Handling

**Setup**: 4 players vote 2-2

**Test Tie**:

1. Alice: Votes for Bob
2. Bob: Votes for Alice
3. Charlie: Votes for Bob
4. Diana: Votes for Alice

**Expected**:

- Vote counts: Alice (2), Bob (2)
- Result: "Tie! No one eliminated"
- Spy (reveal who it was) gets the point
- Scores: Spy +1, others 0

### Scenario 8: Skip Vote Option

**Test "Skip" Voting**:

1. During voting phase
2. Each player can select "Skip" instead of player name
3. If majority votes "Skip":
   - No one eliminated
   - Game proceeds to spy guess phase (US3)

### Scenario 9: Edge Cases

#### 9a. Player Disconnects During Game

1. Start game with 4 players
2. Bob closes tab during chat phase
3. **Expected**:
   - Bob shows as disconnected (gray dot)
   - Bob can rejoin within 60 seconds
   - If Bob doesn't rejoin: Auto-kicked after 60s
   - Game continues with remaining players

#### 9b. Host Leaves During Game

1. Start game with Alice (host)
2. Alice closes tab
3. **Expected**:
   - Host transfers to next player (Bob)
   - Game continues normally
   - Bob can now kick players

#### 9c. Minimum Players Check

1. Start with 4 players
2. 2 players leave (kicked or disconnect)
3. **Expected**:
   - If < 3 players remain: Game ends
   - All players return to lobby
   - Error message: "Not enough players"

## Success Criteria

### Must Pass ✅

**Game Start**:

- [ ] Exactly 1 spy assigned per game
- [ ] All non-spies see same location
- [ ] Each non-spy has unique role
- [ ] Timer starts immediately after game start
- [ ] All players transition from lobby to game view

**Chat**:

- [ ] Messages appear in real-time (< 500ms)
- [ ] Message order is consistent across all tabs
- [ ] Player names and timestamps display correctly
- [ ] Chat history persists during round

**Timer**:

- [ ] Timer counts down every second
- [ ] All tabs show synchronized time (±1s)
- [ ] Timer expiry triggers voting phase
- [ ] Visual indicator shows time running out (< 1 min)

**Voting**:

- [ ] Each player can vote exactly once
- [ ] Vote counts update in real-time
- [ ] Results show correct elimination
- [ ] Spy identity revealed in results
- [ ] Scores update correctly

**Edge Cases**:

- [ ] Handle player disconnects gracefully
- [ ] Host transfer works during active game
- [ ] Game ends if < 3 players remain
- [ ] Tie votes handled appropriately

### Nice to Have 🌟

- Chat has turn indicators (visual cue for who should speak)
- Timer shows color change (green → yellow → red)
- Voting has progress indicator (X/N votes cast)
- Results screen has animation
- Sound effects for important events

## Debugging Tips

### Check Game State

Browser DevTools Console:

```javascript
// Should show current game state
localStorage.getItem('spyfall_session');
```

### Verify WebSocket Messages

Look for these message types in console:

```
[WebSocket] Sent: START_GAME
[WebSocket] Received: GAME_STARTED
[WebSocket] Received: ROLE_ASSIGNMENT { role: "...", location: "..." }
[WebSocket] Received: TIMER_TICK { remainingSeconds: 480 }
[WebSocket] Sent: CHAT { content: "..." }
[WebSocket] Received: MESSAGE { message: {...} }
[WebSocket] Sent: VOTE { suspectId: "..." }
[WebSocket] Received: VOTING_RESULTS { eliminatedPlayerId: "...", wasSpy: true }
```

### Check Timer Accuracy

```javascript
// In browser console, track timer ticks
let lastTick = Date.now();
// Each TIMER_TICK should be ~1000ms apart
```

### Verify Role Assignment

```javascript
// All non-spies should see same location
// Check in browser console on each tab
// Expected: 1 spy (no location), 3 with same location name
```

## Performance Benchmarks

- **Game Start Latency**: < 500ms from button click to role display
- **Chat Message Latency**: < 200ms from send to all players
- **Timer Precision**: ±1 second across all clients
- **Vote Processing**: < 300ms from last vote to results

## Known Limitations (To Be Addressed in US3)

- Spy cannot guess location yet (US3 feature)
- No multi-round support yet (US4 feature)
- No game mode selection yet (US5 feature)
- No image support for locations yet (US6 feature)

## Next Steps After US2 Passes

1. Mark T051-T091 as complete in tasks.md
2. Create playground for **User Story 3** (Spy Guess)
3. Implement spy location guess after voting
4. Test full game flow: Start → Chat → Vote → Spy Guess → Results

---

**Status**: Ready for implementation 🚀  
**Priority**: P2 (MVP Core Gameplay)  
**Dependencies**: User Story 1 must be complete and tested  
**Estimated Test Time**: 15-20 minutes per scenario
