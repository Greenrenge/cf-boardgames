# Playground: User Story 1 - Non-Spy Location Image Display

**Feature**: Location Images & Player Scaling  
**User Story**: View Location Image as Non-Spy (Priority: P1)  
**Goal**: Non-spy players see their assigned location image at 3:2 aspect ratio, full width

## Test Instructions

### Prerequisites

- Next.js dev server running (`npm run dev`)
- At least 4 players to start a game
- Access to browser DevTools (for responsive testing)

### Test Scenario Checklist

**Basic Display:**

- [ ] Image loads and displays correctly
- [ ] Image maintains 3:2 aspect ratio
- [ ] Image spans full container width
- [ ] Location name displays below image
- [ ] Role name displays correctly

**Responsive Design:**

- [ ] Mobile (375px width): Image scales properly
- [ ] Tablet (768px width): Image scales properly
- [ ] Desktop (1440px width): Image scales properly
- [ ] No horizontal scrolling on any device size

**Loading States:**

- [ ] Loading skeleton appears while image loads
- [ ] Loading skeleton has pulse animation
- [ ] Skeleton disappears when image loads
- [ ] Smooth fade-in transition when image loads

**Error Handling:**

- [ ] If image fails to load, location name displays as fallback
- [ ] Error state is clearly visible (not blank)
- [ ] Game remains playable with text fallback

**Image Quality:**

- [ ] No pixelation or distortion
- [ ] Image is sharp and clear
- [ ] Colors are accurate

## Manual Testing Steps

### Step 1: Start Game as Non-Spy

1. Open `http://localhost:3000`
2. Create a new room
3. Copy room code and join with 3+ other browser tabs/devices
4. Start the game
5. Verify you are NOT the spy (no "You are the Spy" message)

### Step 2: Verify Image Display

1. Open your role card view
2. Check that location image appears
3. Verify 3:2 aspect ratio (image should be wider than it is tall)
4. Verify image spans full width of container
5. Check location name appears below image
6. Check your role appears below location name

### Step 3: Test Responsive Behavior

**On Desktop Browser:**

1. Open Chrome DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Test these viewports:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1440px)
4. For each viewport:
   - Verify image scales correctly
   - Verify 3:2 ratio maintained
   - Verify no horizontal scroll
   - Verify text is readable

### Step 4: Test Loading State

1. Open Chrome DevTools → Network tab
2. Throttle to "Slow 3G"
3. Refresh the game page
4. Observe:
   - Gray skeleton appears immediately
   - Skeleton has pulse animation
   - Skeleton disappears when image loads
   - Image fades in smoothly

### Step 5: Test Error Fallback

**Simulate Image Failure:**

1. Open Chrome DevTools → Network tab
2. Right-click on the location image request
3. Select "Block request URL"
4. Refresh the page
5. Verify:
   - Location name displays instead of broken image
   - Text is centered in the 3:2 ratio box
   - Game is still playable
   - No console errors visible to user

### Step 6: Test Multiple Locations

1. Play multiple rounds (or reset game)
2. Verify different locations:
   - All location images load correctly
   - Different images maintain 3:2 ratio
   - All images scale responsively
3. Suggested locations to test:
   - "ตลาดนัด" (Local Market)
   - "โรงพยาบาล" (Hospital)
   - "โรงเรียน" (School)

## Success Criteria

✅ All checklist items pass  
✅ Image displays at 3:2 ratio on all devices  
✅ Image loads within 2 seconds on 4G connection  
✅ Loading state visible on slow connections  
✅ Error fallback displays location name  
✅ No layout shifts or jank during loading

## Known Issues

- None at this time

## Notes

- This story is independent of spy functionality
- Can be tested without implementing spy location browser
- Works with existing single-spy game logic
- Images are already hosted on R2: `https://spyfall-asset.greenrenge.work/`
