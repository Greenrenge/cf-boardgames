# User Story 4: UI Component Translation - Testing Playground

## Overview

This playground demonstrates all translated UI components working in multiple languages.

## Components Translated

### 1. ChatPanel

**What to test:**

- Title and subtitle text
- "No messages" empty state
- Message display with "You" indicator
- Turn indicator messages
- Input placeholder
- Character counter
- Send button

**How to test:**

1. Create a room and start a game
2. Open the chat panel
3. Switch languages and verify text updates
4. Send messages and check formatting
5. Test in dark mode

### 2. GameTimer

**What to test:**

- "Time Remaining" header
- Time format (MM:SS)
- Color changes (green → yellow → red)
- Warning message when < 60 seconds
- Status messages based on time

**How to test:**

1. Start a game with short timer (5 min)
2. Switch languages during gameplay
3. Watch timer count down
4. Verify warning appears at < 60s
5. Check status messages change

### 3. VotingInterface

**What to test:**

- Title and subtitle
- Vote count display
- Player cards with host badge
- Vote/Skip buttons
- "You voted" confirmation
- Waiting message
- Skip hint text

**How to test:**

1. Play until voting phase
2. Switch languages before voting
3. Test vote selection
4. Test skip button
5. Verify confirmation message

### 4. ResultsScreen

**What to test:**

- Win/loss titles (Spy Caught/Escaped)
- Spy and location reveals
- Spy guess results (correct/wrong)
- Vote tally header
- Eliminated player message
- Tie vote message
- Scores leaderboard
- Spy badge
- Next Round / Back to Lobby buttons

**How to test:**

1. Complete a full game round
2. Switch languages on results screen
3. Check all text displays correctly
4. Test with different outcomes:
   - Spy caught
   - Spy escaped
   - Spy guessed correctly
   - Spy guessed wrong
   - Tie vote

### 5. Lobby

**What to test:**

- Room header and code
- Copy code tooltip
- Share code message
- Player count
- "Room Full" warning
- Game Settings header
- Max Players label and slider
- Spy Count label and buttons
- Ratio explanation text
- Timer Duration label and dropdown
- All time options (5-15 min)
- Difficulty Level label and checkboxes
- Easy/Medium/Hard labels
- Validation messages
- Start Game button states:
  - "Start Game"
  - "Starting game..."
  - "Need X players for Y spies"
- "Waiting for host" message (non-host)

**How to test:**

1. Create a room
2. Switch languages in lobby
3. Change all settings and verify labels
4. Test validation messages
5. Add/remove players to trigger different states
6. Test as host and non-host

## Language Testing Checklist

### English (EN) ✅

- [ ] ChatPanel - All text in English
- [ ] GameTimer - All text in English
- [ ] VotingInterface - All text in English
- [ ] ResultsScreen - All text in English
- [ ] Lobby - All text in English
- [ ] Dark mode - All readable
- [ ] Parameterized translations work

### Thai (TH) ✅

- [ ] ChatPanel - All text in Thai
- [ ] GameTimer - All text in Thai
- [ ] VotingInterface - All text in Thai
- [ ] ResultsScreen - All text in Thai
- [ ] Lobby - All text in Thai
- [ ] Dark mode - All readable
- [ ] Parameterized translations work

### Chinese (ZH) 📋

- [ ] All components show English placeholders
- [ ] No missing key errors
- [ ] Ready for professional translation

### Hindi (HI) 📋

- [ ] All components show English placeholders
- [ ] No missing key errors
- [ ] Ready for professional translation

### Spanish (ES) 📋

- [ ] All components show English placeholders
- [ ] No missing key errors
- [ ] Ready for professional translation

### French (FR) 📋

- [ ] All components show English placeholders
- [ ] No missing key errors
- [ ] Ready for professional translation

### Arabic (AR) 📋

- [ ] All components show English placeholders
- [ ] RTL layout works correctly
- [ ] Text flows right-to-left
- [ ] UI mirrors properly
- [ ] Ready for professional translation

## Quick Test URLs

```bash
# Start dev server
npm run dev

# Test pages
# Homepage (language switcher)
http://localhost:3000

# Create room (lobby)
http://localhost:3000 → Click "Create Room"

# Join room (test with friends)
http://localhost:3000 → Click "Join Room" → Enter code

# Game (all components)
Create room → Add players → Start Game
```

## Automated Testing Commands

```bash
# Build check
npm run build

# Type check
npx tsc --noEmit

# Lint check
npm run lint

# All checks
npm run build && npx tsc --noEmit && npm run lint
```

## Expected Behavior

### Language Switching

1. User switches language via LanguageSwitcher
2. All translated components update immediately
3. Game state persists (no reload required)
4. URL updates with new locale
5. Setting saved for future visits

### Parameterized Translations

**Chat Character Count:**

```typescript
t('chat.characterCount', { count: 150 });
// EN: "150/200"
// TH: "150/200"
```

**Lobby Player Count:**

```typescript
t('lobby.playerCount', { current: 5, max: 10 });
// EN: "5/10 Players"
// TH: "5/10 ผู้เล่น"
```

**Vote Count:**

```typescript
t('voting.votesCount', { current: 3, required: 5 });
// EN: "Voted: 3/5"
// TH: "โหวตแล้ว: 3/5"
```

**Results Elimination:**

```typescript
t('results.eliminatedPlayer', { playerName: 'Alice', votes: 3 });
// EN: "Alice was voted out (3 votes)"
// TH: "Alice ถูกโหวตออก (3 คะแนน)"
```

## Known Issues / Limitations

### Currently Working ✅

- All 60+ translation keys implemented
- English and Thai translations complete
- Parameterized translations functional
- Dark mode support complete
- Build compiles successfully
- No TypeScript errors

### Needs Professional Translation 📋

- Chinese (ZH) - Using English placeholders
- Hindi (HI) - Using English placeholders
- Spanish (ES) - Using English placeholders
- French (FR) - Using English placeholders
- Arabic (AR) - Using English placeholders

### Future Enhancements 🔮

- Add more minute options to timer dropdown
- Add tooltips for complex settings
- Add confirmation dialogs before actions
- Add sound effects for notifications
- Add animation transitions for language changes

## Testing Tips

### Manual Testing

1. **Use Multiple Browsers**: Test in Chrome, Firefox, Safari
2. **Test Dark Mode**: Toggle theme while testing translations
3. **Test Mobile**: Verify on actual mobile devices
4. **Test RTL**: Arabic should flow right-to-left
5. **Test Edge Cases**: Empty states, max players, tie votes

### Screenshot Checklist

- [ ] Homepage in all 7 languages
- [ ] Lobby in EN and TH
- [ ] Chat panel with messages
- [ ] Timer in warning state (red)
- [ ] Voting interface
- [ ] Results screen (spy caught)
- [ ] Results screen (spy escaped)
- [ ] Dark mode versions of above

### Performance Testing

- [ ] Language switch is instant (<100ms)
- [ ] No flicker when switching
- [ ] No layout shift
- [ ] Smooth animations

## Success Criteria

User Story 4 is considered complete when:

- ✅ All 5 components use translation keys (no hardcoded text)
- ✅ Build compiles successfully
- ✅ No TypeScript errors
- ✅ English and Thai translations complete
- ✅ Placeholder languages ready for translation
- ✅ Dark mode works with all translations
- ✅ Parameterized translations work correctly
- ⏳ Manual testing completed
- ⏳ Screenshots captured
- ⏳ No visual bugs found

## Related Documentation

- [User Story 4 Completion Report](../USER_STORY_4_COMPLETION.md)
- [Translation Keys Reference](../../locales/en/common.json)
- [Feature Spec](../../spec.md)
- [User Story 1 Playground](../playground/story1/README.md)
- [User Story 2 Playground](../playground/story2/README.md)
- [User Story 3 Playground](../playground/story3/README.md)

## Next Steps

After completing testing:

1. ✅ Mark User Story 4 as complete
2. 🔄 Update progress tracking (100/137 tasks)
3. 📝 Document any issues found
4. 🚀 Move to User Story 5 (Accessibility)
5. 🌍 Plan professional translation for remaining languages
