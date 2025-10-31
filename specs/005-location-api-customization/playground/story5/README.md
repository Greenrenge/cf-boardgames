# User Story 5: Local Storage and API Merge Strategy - Playground

**Feature**: Intelligent merging of localStorage selections with API data

## Overview

This playground demonstrates and tests the merge logic that combines:

- User selections stored in localStorage (which locations/roles are selected)
- Fresh location data from the API (with latest translations and content)

## Merge Strategy

The merge follows these rules:

1. **Matching IDs (API + localStorage)**: Use API data but apply localStorage selection state
2. **New Locations (API only)**: Add to list with `isSelected: true` (default)
3. **Custom Locations (localStorage only)**: Preserve in list with user's selection state
4. **Role Selections**: Apply localStorage role selections to matching location roles

## Test Scenarios

### Scenario 1: Basic Override

**Setup**: API has 80 locations all selected, localStorage has 5 locations deselected
**Expected**: Merged result has 80 locations, 5 are deselected (localStorage wins)

### Scenario 2: New API Locations

**Setup**: localStorage has selections for 80 locations, API now has 85 locations
**Expected**: All 85 appear, original 80 use localStorage state, 5 new ones default to selected

### Scenario 3: Custom Locations

**Setup**: localStorage has 3 custom locations not in API
**Expected**: All API locations + 3 custom locations appear

### Scenario 4: Role-Level Selections

**Setup**: localStorage has specific roles deselected in a location
**Expected**: Location appears with API role data, but selection state from localStorage

### Scenario 5: Removed Locations

**Setup**: localStorage has location "museum", API no longer has it (removed/renamed)
**Expected**: "museum" still appears in merged data (preserved from localStorage)

## localStorage Structure

```json
{
  "location-selections": {
    "version": "1.0.0",
    "timestamp": "2025-10-31T12:00:00.000Z",
    "selections": {
      "loc-hospital": {
        "isSelected": false,
        "selectedRoles": ["loc-hospital-role-1", "loc-hospital-role-2"]
      },
      "loc-custom-venue": {
        "isSelected": true,
        "selectedRoles": []
      }
    }
  }
}
```

## Testing Steps

### Manual Testing

1. **Test Basic Merge**:

   ```javascript
   // In browser console
   localStorage.setItem(
     'location-selections',
     JSON.stringify({
       version: '1.0.0',
       timestamp: new Date().toISOString(),
       selections: {
         'loc-hospital': { isSelected: false, selectedRoles: [] },
       },
     })
   );
   ```

   Refresh page - hospital should be deselected

2. **Test New Locations**:
   - Set localStorage with 5 location selections
   - API returns 80 locations
   - Verify: 5 match localStorage state, 75 default to selected

3. **Test Custom Locations**:
   ```javascript
   localStorage.setItem(
     'location-selections',
     JSON.stringify({
       version: '1.0.0',
       timestamp: new Date().toISOString(),
       selections: {
         'custom-secret-base': { isSelected: true, selectedRoles: [] },
       },
     })
   );
   ```

   - Check merged result includes 'custom-secret-base'

### Automated Validation

Demo page should show:

- Total locations (API + custom)
- Selected vs deselected count
- Which locations came from localStorage only
- Which locations are new from API
- Role-level selection states

## Success Criteria

✅ localStorage selections override API default states  
✅ New API locations appear with default selected state  
✅ Custom locations from localStorage are preserved  
✅ Role selections are applied correctly  
✅ No duplicate location IDs in merged result  
✅ Merge completes in <100ms for 120 locations  
✅ Demo page clearly shows merge behavior

## API Endpoints Used

- `GET /api/locations` - Fetch all locations with translations

## localStorage Keys

- `location-selections` - User's location and role selection preferences

## Files Involved

- `lib/locationStorage.ts` - localStorage read/write operations
- `lib/locationMerge.ts` - Merge logic implementation
- `lib/hooks/useLocations.ts` - Updated to use merge
- `playground/story5/demo.tsx` - Interactive testing page

## Demo Page Features

The demo page should display:

1. **Before Merge**: Show API data and localStorage data side-by-side
2. **After Merge**: Show final merged result
3. **Merge Stats**:
   - Total locations
   - From API only
   - From localStorage only
   - Overridden by localStorage
4. **Interactive Controls**:
   - Button to add test localStorage data
   - Button to clear localStorage
   - Button to trigger re-merge
5. **Visual Indicators**:
   - Color coding for data source (API/localStorage/both)
   - Selection state badges (selected/deselected)

## Running the Demo

1. Copy `playground/story5/demo.tsx` to `app/[locale]/test-merge/page.tsx`
2. Navigate to `http://localhost:3000/en/test-merge`
3. Use browser DevTools → Application → localStorage to inspect data
4. Follow test scenarios above

## Performance Requirements

- Merge operation: <100ms for 120 locations
- No blocking UI during merge
- Memory efficient (no data duplication)

## Notes

- Custom locations must have valid Location structure (even if minimal)
- Merge is idempotent (same inputs = same output)
- Timestamp used for debugging/audit trail only
- Version field allows future migration if schema changes
