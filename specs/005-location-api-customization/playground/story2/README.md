# User Story 2: Location and Role Customization - Playground

**Feature**: Interactive UI for selecting/deselecting locations and roles before starting a game

## Overview

This playground demonstrates and tests the customization UI that allows users to:

- View all available locations
- Select/deselect individual locations
- Expand locations to see roles
- Select/deselect individual roles within locations
- Use bulk actions (Select All, Deselect All, Reset)
- See selection count and validation messages
- Prevent game start with no locations selected

## UI Components

### LocationList

Main container showing all locations with selection controls

**Features**:

- Location count display (e.g., "45 of 80 locations selected")
- Bulk action buttons (Select All, Deselect All, Reset to Default)
- Scrollable list of LocationItem components
- Performance optimized with React.memo for large lists

### LocationItem

Individual location card with expand/collapse functionality

**Features**:

- Location name in current language
- Checkbox for selection state
- Expand/collapse button to show roles
- Role count indicator
- Smooth animation on expand/collapse
- Visual feedback on hover/focus

### RoleSelector

Role selection interface within expanded location

**Features**:

- List of all roles for the location
- Checkbox for each role
- Role names in current language
- Select All/Deselect All for roles
- Visual indication of selection count

## Test Scenarios

### Scenario 1: Basic Location Selection

**Steps**:

1. View location list
2. Click checkbox to deselect a location
3. Verify location is visually deselected
4. Check localStorage updated

**Expected**: Location state persists, UI reflects change immediately

### Scenario 2: Role-Level Selection

**Steps**:

1. Expand a location
2. Deselect 2-3 specific roles
3. Keep location selected
4. Start game

**Expected**: Only selected roles appear in that location during gameplay

### Scenario 3: Bulk Actions

**Steps**:

1. Click "Deselect All"
2. Verify all locations unchecked
3. Click "Select All"
4. Verify all locations checked
5. Click "Reset to Default"
6. Verify localStorage cleared, all selected

**Expected**: Bulk actions work correctly, immediate UI update

### Scenario 4: Validation

**Steps**:

1. Deselect all locations
2. Try to start game
3. Verify error message displayed
4. Verify start button disabled or shows warning

**Expected**: Cannot start game with zero locations, clear error message

### Scenario 5: Performance Test

**Steps**:

1. Load page with 80-120 locations
2. Scroll through list
3. Expand/collapse multiple locations rapidly
4. Toggle selections quickly

**Expected**: Smooth UI, no lag, <100ms per interaction

### Scenario 6: Persistence

**Steps**:

1. Customize selections
2. Refresh browser
3. Verify selections restored

**Expected**: All selections persist across page reload

## UI/UX Requirements

### Location Count Display

```
[45 of 80 locations selected]
```

- Always visible at top
- Updates in real-time
- Color-coded: green if >0, red if 0

### Bulk Actions Layout

```
[Select All] [Deselect All] [Reset to Default]
```

- Horizontal button row
- Clear labels
- Disabled states when appropriate

### LocationItem Layout

```
□ Location Name (12 roles)                    [▼]
```

When expanded:

```
☑ Location Name (12 roles)                    [▲]
  ──────────────────────────────────
  Roles (10 of 12 selected):
  ☑ Role 1      ☑ Role 2      □ Role 3
  ☑ Role 4      ☑ Role 5      ☑ Role 6
  ...
  [Select All Roles] [Deselect All Roles]
```

### Validation Error

```
⚠ You must select at least 1 location to start the game
```

- Red border/background
- Icon + message
- Appears near start button

## Accessibility

- ✅ Keyboard navigation (Tab, Space, Enter)
- ✅ Screen reader support (ARIA labels)
- ✅ Focus indicators visible
- ✅ Color not sole indicator (use icons too)
- ✅ Sufficient color contrast ratios

## Performance Targets

| Operation                     | Target | Acceptable |
| ----------------------------- | ------ | ---------- |
| Initial render (80 locations) | <500ms | <1s        |
| Toggle location               | <50ms  | <100ms     |
| Expand location               | <100ms | <200ms     |
| Bulk select all               | <200ms | <500ms     |
| Scroll performance            | 60fps  | 30fps      |

## Integration Points

### Lobby Component

The LocationList should be integrated into the Lobby component:

1. Display before game starts
2. Replace or supplement existing location selection (if any)
3. Show validation errors near start button
4. Pass selected locations to game start logic

### Game Start Logic

When host starts game:

1. Validate at least 1 location selected
2. Filter locations to only selected ones
3. Filter roles within locations to only selected ones
4. Pass filtered data to game assignment logic

## Testing Instructions

### Manual Testing

1. **Load Demo Page**:
   - Navigate to `/en/test-customization`
   - Verify all locations load
   - Check count display shows correct numbers

2. **Test Selection**:
   - Click location checkboxes
   - Verify count updates
   - Check localStorage in DevTools

3. **Test Roles**:
   - Expand a location
   - Toggle role checkboxes
   - Verify role count updates
   - Check roles persist in localStorage

4. **Test Bulk Actions**:
   - Click each bulk action button
   - Verify correct behavior
   - Test with localStorage empty vs populated

5. **Test Validation**:
   - Deselect all locations
   - Try to "start game" (button in demo)
   - Verify error appears

6. **Test Performance**:
   - Load page with full dataset
   - Measure render time (DevTools Performance tab)
   - Test rapid interactions

### Automated Validation

Demo page should show:

- Selection count (selected/total)
- localStorage sync status
- Performance metrics
- Validation status
- Interactive preview of game start

## Success Criteria

✅ UI displays all locations from merged data  
✅ Location selection toggles correctly  
✅ Role selection works within locations  
✅ Bulk actions (Select All, Deselect All, Reset) work  
✅ Selection count accurate and updates in real-time  
✅ Validation prevents game start with 0 locations  
✅ Selections persist in localStorage  
✅ Performance meets targets (<100ms toggles)  
✅ Smooth expand/collapse animations  
✅ Keyboard accessible  
✅ Works in all supported languages

## API Endpoints Used

- None (uses merged data from `useLocations` hook)

## localStorage Keys

- `location-selections` - Stores all selection states

## Files Involved

- `components/location/LocationList.tsx` - Main container
- `components/location/LocationItem.tsx` - Individual location card
- `components/location/RoleSelector.tsx` - Role checkboxes
- `lib/hooks/useLocationSelection.ts` - Selection state management
- `lib/locationStorage.ts` - Persistence layer (already created)
- `components/location/SelectionValidationError.tsx` - Error display
- `components/room/Lobby.tsx` - Integration point
- `playground/story2/demo.tsx` - Testing page

## Design Notes

### Colors (Tailwind)

- Selected: `bg-green-50 border-green-500 dark:bg-green-900/20`
- Deselected: `bg-gray-50 border-gray-300 dark:bg-gray-800`
- Error: `bg-red-50 border-red-500 dark:bg-red-900/20`
- Focus: `ring-2 ring-blue-500`

### Icons

- Checkbox checked: `☑` or icon library
- Checkbox unchecked: `□` or icon library
- Expand: `▼` or chevron down
- Collapse: `▲` or chevron up
- Warning: `⚠` or alert icon

### Animation

- Expand/collapse: `transition-all duration-200 ease-in-out`
- Fade in: `animate-fade-in`
- Selection change: Subtle highlight flash

## Running the Demo

1. Copy `playground/story2/demo.tsx` to `app/[locale]/test-customization/page.tsx`
2. Navigate to `http://localhost:3000/en/test-customization`
3. Follow test scenarios above
4. Check DevTools Console for any errors
5. Monitor Performance tab for optimization opportunities
