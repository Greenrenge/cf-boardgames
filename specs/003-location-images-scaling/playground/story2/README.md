# User Story 2: Spy Location Browser - Testing Guide

## Overview

This playground tests **User Story 2**: "Spy players see a browsable grid of all location images to help them blend in during questioning."

## Prerequisites

- Phase 1-3 complete (LocationImage component exists)
- Development server running: `pnpm dev`
- At least 70 location images available in R2 bucket
- Test with locations.json containing all location metadata

## Test Scenarios

### Scenario 1: Basic Grid Display

**Objective**: Verify spy players see a complete grid of all location images

**Steps**:

1. Create a new game room
2. Join with at least 4 players
3. Ensure one player is assigned as spy
4. Start the game
5. As the spy player, observe the location browser

**Expected Results**:

- ✅ Spy sees a grid of ALL location images (70+)
- ✅ Images are displayed in alphabetical order (Thai alphabetical)
- ✅ Grid layout is responsive:
  - Mobile (< 768px): 2 columns
  - Tablet (768-1024px): 3 columns
  - Desktop (> 1024px): 4 columns
- ✅ Each image maintains 3:2 aspect ratio
- ✅ Location names are clearly visible below each image

### Scenario 2: Lazy Loading Performance

**Objective**: Verify images load efficiently without blocking UI

**Steps**:

1. As spy player, scroll through the entire location grid
2. Monitor browser DevTools > Network tab
3. Observe loading behavior and performance

**Expected Results**:

- ✅ Images load progressively as user scrolls (native lazy loading)
- ✅ Initial page load only fetches visible images
- ✅ Scroll performance maintains >55fps (DevTools Performance tab)
- ✅ No layout shift occurs as images load
- ✅ Loading skeleton/placeholder shows for pending images

### Scenario 3: Modal/Enlarged View

**Objective**: Verify spy can click to view enlarged image

**Steps**:

1. As spy player, click on any location image in the grid
2. Observe modal/enlarged view
3. Click outside or press ESC to close
4. Try keyboard navigation (arrow keys if implemented)

**Expected Results**:

- ✅ Clicked image opens in modal/overlay
- ✅ Enlarged image is clearly visible and maintains aspect ratio
- ✅ Location name is displayed prominently
- ✅ Modal closes on outside click or ESC key
- ✅ Focus returns to grid after closing
- ✅ Modal content is centered and responsive

### Scenario 4: Grid vs Single Image Toggle

**Objective**: Verify spy can toggle between grid and single location views

**Steps**:

1. As spy player in grid view, note the interface
2. Check for any toggle/switch to show single location
3. If toggle exists, switch to single location mode
4. Verify behavior matches non-spy display

**Expected Results**:

- ✅ Toggle control is intuitive and clearly labeled
- ✅ Single location mode shows same display as non-spy players
- ✅ Toggle state persists during game round
- ✅ Grid returns on next round (if applicable)

### Scenario 5: Non-Spy Comparison

**Objective**: Verify non-spy players DO NOT see the location browser

**Steps**:

1. Create game with 4+ players
2. Start game
3. As non-spy player, observe the interface
4. As spy player, observe the interface side-by-side

**Expected Results**:

- ✅ Non-spy sees ONLY their assigned location image
- ✅ Spy sees FULL grid of all locations
- ✅ No accidental leakage of spy interface to non-spies
- ✅ Clear visual distinction between spy and non-spy views

### Scenario 6: Responsive Design Testing

**Objective**: Verify grid layout adapts correctly across device sizes

**Steps**:

1. As spy player, open DevTools responsive mode
2. Test at various breakpoints:
   - 375px (mobile)
   - 768px (tablet)
   - 1024px (desktop)
   - 1920px (large desktop)
3. Verify grid columns and spacing

**Expected Results**:

- ✅ Mobile (375px): 2 columns, readable text
- ✅ Tablet (768px): 3 columns, adequate spacing
- ✅ Desktop (1024px+): 4 columns, optimal layout
- ✅ Images never distort or overflow
- ✅ Touch targets are adequate on mobile (min 44x44px)

### Scenario 7: Error Handling

**Objective**: Verify graceful degradation when images fail to load

**Steps**:

1. As spy player, simulate network throttling (DevTools > Network > Slow 3G)
2. Observe image loading behavior
3. Simulate failed image loads (block image URLs in DevTools)
4. Check for error states

**Expected Results**:

- ✅ Failed images show fallback placeholder with location name
- ✅ Grid layout remains intact despite missing images
- ✅ User can still identify locations by text
- ✅ No JavaScript errors in console
- ✅ Retry or refresh mechanism available (optional)

## Manual Testing Checklist

### DevTools Setup

- [ ] Open Chrome/Firefox DevTools
- [ ] Enable responsive design mode
- [ ] Open Network tab to monitor image requests
- [ ] Open Performance tab for FPS monitoring
- [ ] Open Console for error detection

### Test Execution

- [ ] Run Scenario 1: Basic Grid Display
- [ ] Run Scenario 2: Lazy Loading Performance
- [ ] Run Scenario 3: Modal/Enlarged View
- [ ] Run Scenario 4: Grid vs Single Toggle (if implemented)
- [ ] Run Scenario 5: Non-Spy Comparison
- [ ] Run Scenario 6: Responsive Design Testing
- [ ] Run Scenario 7: Error Handling

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Success Criteria

**MVP Requirements (Must Have)**:

1. Spy sees grid of all 70+ location images ✅
2. Grid is alphabetically sorted (Thai) ✅
3. Responsive layout: 2/3/4 columns ✅
4. Images maintain 3:2 aspect ratio ✅
5. Native lazy loading implemented ✅
6. Modal/enlarged view functional ✅

**Performance Benchmarks**:

- Initial page load: < 2 seconds
- Scroll FPS: > 55fps
- Time to Interactive: < 3 seconds
- First Contentful Paint: < 1 second

**Accessibility**:

- Keyboard navigation works for modal
- Focus management is correct
- Screen reader announces location names
- Color contrast meets WCAG AA

## Known Issues / Limitations

_Document any known issues discovered during testing_

## Next Steps

After completing User Story 2 testing:

1. Move to Phase 5: Player Capacity Configuration (User Story 3)
2. Implement spy count configuration (User Story 4)
3. Validate large group support (User Story 5)
