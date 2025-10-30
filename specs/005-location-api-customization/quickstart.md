# Quickstart Guide: Location API Customization

## Overview

This feature provides a centralized location API as the single source of truth for game data, with user customization capabilities. Location and role translations are embedded in the API response, and users can customize which locations and roles to include via localStorage.

---

## Getting Started

### 1. Fetch Locations from API

The location data is fetched from the API and cached for 24 hours:

```typescript
import { fetchLocations } from '@/lib/locations';

// In your component or hook
const loadData = async () => {
  try {
    const locations = await fetchLocations();
    // locations is typed as Location[] with merged user selections
    console.log('Loaded locations:', locations);
  } catch (error) {
    // Handle error appropriately
    console.error('Failed to load locations:', error);
  }
};
```

**Key Points:**
- First call fetches from `/api/locations` (takes ~2-3 seconds)
- Response cached in localStorage for 24 hours
- Subsequent calls within 24 hours load instantly from cache
- User selections automatically merged into the response
- Returns `Location[]` with `isSelected` properties applied

---

### 2. Customize Location and Role Selection

Users can customize which locations/roles to include in the game:

```typescript
import { 
  saveLocationSelections, 
  getLocationSelections,
  toggleLocationSelection,
  toggleRoleSelection 
} from '@/lib/storage';

// Toggle entire location on/off
const handleLocationToggle = (locationId: string) => {
  toggleLocationSelection(locationId);
  // UI will re-render with updated selection state
};

// Toggle individual role within a location
const handleRoleToggle = (locationId: string, roleId: string) => {
  toggleRoleSelection(locationId, roleId);
};

// Get current user selections
const selections = getLocationSelections();
console.log('User selections:', selections);
```

**Key Points:**
- All changes persist immediately to localStorage
- Changes are indefinite (no expiration)
- Selections override API defaults
- Each location and role has independent selection state
- Safe to call from any component (no race conditions)

---

### 3. Export and Import Configuration

Users can export their customizations to share or backup:

#### Export

```typescript
import { exportConfig } from '@/lib/storage';

// Export current configuration to JSON file
const handleExport = () => {
  const configJson = exportConfig();
  
  // Create download link
  const blob = new Blob([configJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `spyfall-config-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
```

#### Import

```typescript
import { importConfig } from '@/lib/storage';

// Import configuration from JSON file
const handleImport = async (file: File) => {
  try {
    const text = await file.text();
    const success = importConfig(text);
    
    if (success) {
      alert('Configuration imported successfully!');
      // Trigger UI refresh to show imported selections
      window.location.reload();
    } else {
      alert('Invalid configuration file');
    }
  } catch (error) {
    console.error('Import failed:', error);
    alert('Failed to import configuration');
  }
};

// In your component
<input 
  type="file" 
  accept=".json"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) handleImport(file);
  }}
/>
```

**Export Format:**
```json
{
  "version": "1.0.0",
  "timestamp": "2025-10-30T12:00:00Z",
  "appIdentifier": "cf-boardgames-spyfall",
  "selections": [
    {
      "locationId": "hospital",
      "isSelected": true,
      "roles": [
        { "roleId": "doctor", "isSelected": true },
        { "roleId": "nurse", "isSelected": false }
      ]
    }
  ]
}
```

**Key Points:**
- Export generates minimal JSON (only selections, no translations)
- Import validates against JSON Schema before applying
- Invalid imports are rejected safely (no data corruption)
- Import overwrites existing selections completely
- File size typically 2-5 KB for 80-120 locations

---

### 4. Add New Locations to the API

To add new locations to the game:

#### Step 1: Update API Data Source

Add new location to your data source (e.g., JSON file or database):

```json
{
  "id": "space-station",
  "names": {
    "en": "Space Station",
    "th": "สถานีอวกาศ",
    "zh": "空间站",
    "hi": "अंतरिक्ष स्टेशन",
    "es": "Estación Espacial",
    "fr": "Station Spatiale",
    "ar": "محطة فضائية"
  },
  "roles": [
    {
      "id": "astronaut",
      "names": {
        "en": "Astronaut",
        "th": "นักบินอวกาศ",
        "zh": "宇航员",
        "hi": "अंतरिक्ष यात्री",
        "es": "Astronauta",
        "fr": "Astronaute",
        "ar": "رائد فضاء"
      }
    }
  ],
  "imageUrl": "/images/locations/space-station.jpg"
}
```

**Required Fields:**
- `id`: Unique kebab-case identifier
- `names`: Object with all 7 language codes (en, th, zh, hi, es, fr, ar)
- `roles`: Array of at least 1 role, each with id and names

**Optional Fields:**
- `imageUrl`: Path to location image (recommended)

#### Step 2: Clear Cache

New locations won't appear until cache expires (24 hours) or is cleared:

```typescript
import { clearApiCache } from '@/lib/storage';

// Manually clear cache to force fresh API fetch
clearApiCache();

// Then fetch again
const locations = await fetchLocations(); // Will fetch from API
```

**Key Points:**
- API validates all required fields before accepting data
- Missing translations will cause API validation errors
- Use consistent ID format (kebab-case)
- Each role ID must be unique within the location
- Location IDs must be unique across all locations

---

### 5. Use Translated Names in UI

Access location and role names in the current locale:

```typescript
import { useLocale } from 'next-intl';

const MyComponent = ({ location }: { location: Location }) => {
  const locale = useLocale() as LocaleCode;
  
  // Get translated location name
  const locationName = location.names[locale];
  
  return (
    <div>
      <h2>{locationName}</h2>
      <ul>
        {location.roles.map(role => (
          <li key={role.id}>
            {role.names[locale]}
            {role.isSelected && ' ✓'}
          </li>
        ))}
      </ul>
    </div>
  );
};
```

**Supported Locales:**
- `en` - English
- `th` - Thai (ไทย)
- `zh` - Mandarin Chinese (中文)
- `hi` - Hindi (हिन्दी)
- `es` - Spanish (Español)
- `fr` - French (Français)
- `ar` - Arabic (العربية)

**Key Points:**
- All locations include all 7 translations
- No fallback needed (all translations guaranteed by API)
- RTL support handled automatically for Arabic
- Names preserve original character sets

---

## Common Workflows

### Initial Setup (First Time User)

1. User visits app for first time
2. Skeleton loading UI displays immediately
3. API fetches locations (~2-3s)
4. Data cached for 24 hours
5. All locations selected by default
6. User can customize selections

### Returning User (Within 24 Hours)

1. User visits app
2. Data loads instantly from cache (<100ms)
3. User selections already applied
4. No loading UI needed

### Returning User (After 24 Hours)

1. User visits app
2. Cache expired, API refetch triggered
3. Loading UI displays during fetch
4. User selections preserved and reapplied
5. New cache created for next 24 hours

### Sharing Configuration

1. User A exports config (JSON file downloads)
2. User A shares file with User B
3. User B imports file
4. User B's selections updated to match User A
5. Both users have identical game setup

---

## Troubleshooting

### Problem: Locations not loading

**Symptoms:**
- Spinner displays indefinitely
- Error message shown
- Console shows API error

**Solutions:**
1. Check network tab for API response
2. Verify API endpoint is accessible: `/api/locations`
3. Check console for validation errors
4. Clear cache and retry: `clearApiCache()`

### Problem: Changes not persisting

**Symptoms:**
- Toggle location/role but change reverts
- Export doesn't include changes
- Selections reset on page refresh

**Solutions:**
1. Check localStorage quota (5MB limit)
2. Verify browser allows localStorage
3. Check console for storage errors
4. Test in incognito mode (no extensions)

### Problem: Import fails

**Symptoms:**
- Import doesn't apply
- Error message about invalid format
- Console shows validation error

**Solutions:**
1. Validate JSON syntax (use JSONLint)
2. Check `appIdentifier` matches `"cf-boardgames-spyfall"`
3. Ensure all location IDs exist in current API
4. Verify version format is semver (e.g., `"1.0.0"`)
5. Check schema: `contracts/export-config-schema.json`

### Problem: Translations missing or incorrect

**Symptoms:**
- Location/role shows wrong language
- Text appears as object or undefined
- RTL not working for Arabic

**Solutions:**
1. Verify `useLocale()` returns valid LocaleCode
2. Check API response includes all 7 languages
3. Clear API cache to get fresh translations
4. Check browser locale settings
5. Verify next-intl configuration in `lib/i18n/config.ts`

### Problem: New locations not appearing

**Symptoms:**
- Added location to API but not visible
- Old data still showing

**Solutions:**
1. Clear API cache: `clearApiCache()`
2. Force hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. Check API response in network tab
4. Verify location has all required fields
5. Wait for cache to expire naturally (24 hours)

---

## Performance Tips

### Large Location Lists (80-120 items)

1. **Use React.memo for Location Components:**
   ```typescript
   const LocationCard = React.memo(({ location }: Props) => {
     // Component implementation
   });
   ```

2. **Batch Selection Updates:**
   ```typescript
   // Good: Single update
   const selectMultiple = (locationIds: string[]) => {
     const selections = getLocationSelections();
     locationIds.forEach(id => {
       selections[id].isSelected = true;
     });
     saveLocationSelections(selections);
   };
   
   // Avoid: Multiple updates
   locationIds.forEach(id => toggleLocationSelection(id)); // Slow!
   ```

3. **Debounce Search/Filter:**
   ```typescript
   const debouncedFilter = useMemo(
     () => debounce((query: string) => {
       setFilteredLocations(filterByName(locations, query));
     }, 300),
     [locations]
   );
   ```

### Reducing Bundle Size

- API response caching eliminates repeated fetches
- Export format is minimal (no translations, ~2-5KB)
- Zod validation tree-shakeable
- next-intl loads only active locale

### Optimizing Initial Load

- Skeleton UI prevents layout shift
- API fetch starts immediately on mount
- Cache check is synchronous (<1ms)
- Parallel: UI render + API fetch

---

## API Reference

### Storage Functions

```typescript
// Fetch locations (with cache & merge)
fetchLocations(): Promise<Location[]>

// Selection management
getLocationSelections(): LocationSelection[]
saveLocationSelections(selections: LocationSelection[]): void
toggleLocationSelection(locationId: string): void
toggleRoleSelection(locationId: string, roleId: string): void

// Import/Export
exportConfig(): string
importConfig(jsonString: string): boolean

// Cache management
clearApiCache(): void
getApiCacheStatus(): { exists: boolean; age: number; expiresIn: number }
```

### Type Reference

See `specs/005-location-api-customization/data-model.md` for complete TypeScript interfaces.

---

## Next Steps

1. **Review Data Model:** See `data-model.md` for complete type definitions
2. **Check API Contract:** See `contracts/location-api-response.json` for API schema
3. **Implementation Tasks:** See `tasks.md` for development breakdown (after planning phase)
4. **Testing:** Unit tests for merge logic, integration tests for API, E2E for UI

---

## Support

- **Feature Spec:** `specs/005-location-api-customization/spec.md`
- **Research Decisions:** `specs/005-location-api-customization/research.md`
- **API Contract:** `specs/005-location-api-customization/contracts/`
- **Issues:** File in GitHub with `[location-api]` tag
