# User Story 3 Playground - Spy Location Guess

## Goal

Test the spy location guess feature: If the spy survives the voting phase, they get a chance to guess the location. If they guess correctly, they score 2 points. If wrong, each non-spy player gets 1 point.

## Prerequisites

- User Story 1 & 2 must be working (room creation, game play, voting)
- At least 3 browser tabs/windows open
- Backend server running (`npm run dev` in workers/)
- Frontend running (`npm run dev` in root)

## Test Scenarios

### Scenario 1: Spy Survives and Guesses Correctly ✅

**Setup:**

1. Open 4 tabs (Player A = Host, Player B, Player C, Player D)
2. All players join the same room
3. Start game with Easy difficulty, 1 minute timer

**Execution:**

1. **Identify the spy**: One player will see "You are the spy" (red card)
2. **Force spy survival**: During voting phase, all non-spy players vote for each other (NOT the spy)
   - Example: If Player B is spy, Players A/C/D vote for Player A or C or D
3. **Wait for voting results**: No one should be eliminated, OR someone other than spy is eliminated
4. **Spy guess phase triggers**:
   - Spy should see location list with all available locations
   - Non-spy players see "Spy is guessing the location..." waiting message
5. **Spy makes guess**:
   - Spy selects the correct location from list
   - Clicks "Guess Location" button
6. **Verify results**:
   - All players see "Spy guessed correctly!" message
   - Spy gets +2 points
   - All non-spy players get 0 additional points
   - Correct location is revealed

**Expected:**

- ✅ Spy guess UI appears only for spy
- ✅ Location list shows all possible locations
- ✅ Non-spy see waiting message
- ✅ Correct guess awards spy +2 points
- ✅ Results show guess was correct

---

### Scenario 2: Spy Survives and Guesses Incorrectly ❌

**Setup:**

1. Same as Scenario 1

**Execution:**

1. Follow steps 1-4 from Scenario 1
2. **Spy makes wrong guess**:
   - Spy selects an INCORRECT location (not the actual one)
   - Clicks "Guess Location" button
3. **Verify results**:
   - All players see "Spy guessed incorrectly!" message
   - Spy gets 0 points
   - Each non-spy player gets +1 point
   - Correct location is revealed

**Expected:**

- ✅ Wrong guess awards each non-spy +1 point
- ✅ Spy gets 0 points for wrong guess
- ✅ Results show actual vs guessed location

---

### Scenario 3: Spy is Eliminated (No Guess Phase) 🎯

**Setup:**

1. Same as Scenario 1

**Execution:**

1. **Identify the spy**: One player will see "You are the spy"
2. **Vote for spy**: All players vote for the spy
3. **Voting results**: Spy is eliminated
4. **Verify NO spy guess phase**:
   - Game should go directly to results screen
   - No spy guess UI appears
   - Non-spy players get +1 point each
   - Results show spy was caught

**Expected:**

- ✅ Spy guess phase is SKIPPED if spy eliminated
- ✅ Game goes directly to results
- ✅ Non-spy players get points for catching spy

---

### Scenario 4: Timer Expires (No One Voted, Spy Survives) ⏰

**Setup:**

1. Same as Scenario 1, but use 30 second timer

**Execution:**

1. Start game
2. **Let timer run out**: Don't use chat, just wait
3. **Voting phase**: Skip voting or vote randomly (spy survives)
4. **Spy guess phase**: Should trigger if spy not eliminated
5. **Test spy guess**: Follow Scenario 1 or 2

**Expected:**

- ✅ Spy guess works even when timer expires without chat
- ✅ All spy guess features work correctly

---

### Scenario 5: Multiple Locations to Choose From 🌍

**Setup:**

1. Same as Scenario 1

**Execution:**

1. **Force spy survival**
2. **In spy guess phase**:
   - Verify location list shows ALL available locations
   - Check locations are displayed clearly with names
   - Verify location grouping/sorting (if implemented)
3. **Search/filter**: Test location search if available
4. **Select and guess**: Pick one location and submit

**Expected:**

- ✅ All locations from database appear in list
- ✅ Locations are clearly readable
- ✅ Easy to find and select correct location
- ✅ UI is responsive and user-friendly

---

### Scenario 6: Reconnection During Spy Guess ♻️

**Setup:**

1. Same as Scenario 1

**Execution:**

1. **Force spy survival**
2. **Enter spy guess phase**
3. **Spy refreshes page**: F5 or Cmd+R
4. **Verify reconnection**:
   - Spy sees spy guess UI again
   - Non-spy still see waiting message
   - Can still make guess
5. **Complete guess**: Verify works normally

**Expected:**

- ✅ Page refresh during spy guess preserves game state
- ✅ Spy can still make guess after reconnect
- ✅ Non-spy players unaffected

---

### Scenario 7: Edge Case - Tie Vote, Spy Survives 🤝

**Setup:**

1. Use exactly 4 players

**Execution:**

1. **Create vote tie**:
   - Player A votes for Player B
   - Player B votes for Player A
   - Player C votes for Player D
   - Player D votes for Player C
   - (Assume Player B is spy)
2. **Results**: No one eliminated (tie)
3. **Spy guess phase**: Should trigger since spy survived
4. **Complete guess**: Test as normal

**Expected:**

- ✅ Tie vote results in spy survival
- ✅ Spy guess phase triggers correctly
- ✅ Game flow works as expected

---

## How to Force Spy Survival (Testing Tips)

### Method 1: Coordinate Wrong Votes

- Players communicate via external chat (Discord/Slack)
- All non-spy players vote for same non-spy player
- Spy votes for any non-spy
- Result: Non-spy eliminated, spy survives

### Method 2: Skip Voting

- Modify voting UI temporarily to allow all players to skip
- If no votes cast, no one eliminated
- Spy survives by default

### Method 3: Vote Ties

- Split votes evenly among non-spy players
- Result: Tie, no elimination
- Spy survives

### Method 4: Spy Votes for Self (if allowed)

- Spy intentionally doesn't vote or skips
- Other players split votes
- Spy might survive

---

## WebSocket Message Flow

```
Playing Phase
  ├─ TIMER_TICK (countdown)
  └─ PHASE_CHANGE → voting

Voting Phase
  ├─ VOTE (players submit votes)
  ├─ VOTE_CAST (broadcast vote count)
  └─ VOTING_RESULTS (spy survives)
      └─ phase = 'spy_guess'

Spy Guess Phase (NEW!)
  ├─ SPY_GUESS (spy submits locationId)
  └─ SPY_GUESS_RESULT
      ├─ wasCorrect: boolean
      ├─ guessedLocation: Location
      ├─ actualLocation: Location
      ├─ scores: Record<playerId, number>
      └─ PHASE_CHANGE → results

Results Phase
  └─ Show spy guess outcome with scores
```

---

## Success Criteria

### Backend

- [x] SPY_GUESS message handler validates spy role
- [x] SPY_GUESS handler checks phase = 'spy_guess'
- [x] Location guess validation (correct vs incorrect)
- [x] Score calculation:
  - Correct: spy +2 points
  - Incorrect: each non-spy +1 point
- [x] SPY_GUESS_RESULT broadcast to all players
- [x] Phase transition to results after guess

### Frontend

- [x] SpyGuess component displays location list
- [x] Location selection UI works
- [x] SPY_GUESS message sent on submission
- [x] Non-spy see "Spy is guessing..." message
- [x] SPY_GUESS_RESULT handler shows result modal
- [x] Conditional rendering based on phase and role
- [x] Results screen shows spy guess outcome

### Integration

- [x] Spy guess only triggers if spy survives voting
- [x] All players see synchronized results
- [x] Scores update correctly
- [x] Game flow: voting → spy_guess → results
- [x] No spy guess if spy eliminated
- [x] Page refresh during spy_guess preserves state

---

## Testing Checklist

- [ ] Spy sees location list when spy_guess phase starts
- [ ] Non-spy see waiting message during spy_guess
- [ ] Spy can select location from list
- [ ] Spy can submit guess
- [ ] Correct guess awards spy +2 points
- [ ] Incorrect guess awards each non-spy +1 point
- [ ] Results show guessed vs actual location
- [ ] Results show correct/incorrect status
- [ ] Spy guess skipped if spy eliminated
- [ ] Page refresh during spy_guess works
- [ ] Multiple players see synchronized state
- [ ] Timer doesn't appear during spy_guess
- [ ] Back to lobby works from results

---

## Known Issues / Edge Cases

1. **What if spy disconnects during spy_guess?**
   - Should auto-guess random location after timeout
   - OR treat as incorrect guess

2. **What if non-spy refreshes during spy_guess?**
   - Should see waiting message again
   - Should maintain game state

3. **Location list too long?**
   - Implement search/filter
   - Group by difficulty
   - Pagination if >50 locations

4. **Spy takes too long to guess?**
   - Implement 60-second timer
   - Auto-submit random guess on timeout

---

## Notes

- This playground focuses on **spy guess** feature only
- Assumes User Story 1 & 2 are working
- Multi-round support will be added in User Story 4
- Location data comes from D1 database (data/locations.json)

---

**Last Updated:** October 24, 2025
**Status:** Ready for testing after implementation
