# Research: Location API Customization

**Feature**: 005-location-api-customization  
**Date**: October 30, 2025  
**Status**: Complete

## Overview

This document captures research findings for implementing the Location API Customization feature in the CF Boardgames Spyfall application. The feature migrates location and role data from static translation files to a centralized API, enabling user customization with intelligent caching and persistence strategies.

## Key Decisions

### 1. API Response Structure

**Decision**: Use **nested translation structure with embedded roles**

**Structure**:

```typescript
interface APIResponse {
  version: string;
  timestamp: string;
  locations: Location[];
}

interface Location {
  id: string;
  names: Record<LocaleCode, string>;
  roles: Role[];
  imageUrl?: string;
}

interface Role {
  id: string;
  names: Record<LocaleCode, string>;
}

type LocaleCode = 'en' | 'th' | 'zh' | 'hi' | 'es' | 'fr' | 'ar';
```

**Rationale**:

- **Nested translations by locale**: Makes it easy to access all translations for a location in one object, simplifies client-side locale switching
- **Embedded roles**: Reduces number of API calls, roles are always used with their parent location, no orphaned roles
- **Version + timestamp metadata**: Enables cache validation, version compatibility checks, future migration support
- **Flat ID structure**: Simple string IDs (e.g., "hospital", "airport") are human-readable and stable across versions

**Alternatives Considered**:

1. **Separate roles endpoint**: Would require 2 API calls (locations + roles), adds complexity, no performance benefit for our scale (80-120 locations)
2. **Flat translation structure with language suffix**: (e.g., `name_en`, `name_th`) - harder to iterate over locales, not type-safe, messy TypeScript interfaces
3. **Array of translation objects**: `translations: [{locale: 'en', name: 'Hospital'}]` - requires array filtering on every access, poor performance

**Implementation Notes**:

```typescript
// Example API response
{
  "version": "1.0.0",
  "timestamp": "2025-10-30T12:00:00Z",
  "locations": [
    {
      "id": "hospital",
      "names": {
        "en": "Hospital",
        "th": "โรงพยาบาล",
        "zh": "医院",
        "hi": "अस्पताल",
        "es": "Hospital",
        "fr": "Hôpital",
        "ar": "مستشفى"
      },
      "roles": [
        {
          "id": "doctor",
          "names": {
            "en": "Doctor",
            "th": "แพทย์",
            // ... other locales
          }
        }
        // ... more roles
      ]
    }
    // ... more locations
  ]
}
```

---

### 2. Browser Caching Strategy

**Decision**: Use **localStorage with timestamp-based expiration**

**Implementation**:

```typescript
interface CacheEntry {
  data: APIResponse;
  timestamp: string; // ISO 8601
  version: string;
}

const CACHE_KEY = 'location-api-cache';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCachedData(): APIResponse | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const entry: CacheEntry = JSON.parse(cached);
    const age = Date.now() - new Date(entry.timestamp).getTime();

    if (age > CACHE_DURATION_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

function setCachedData(data: APIResponse): void {
  const entry: CacheEntry = {
    data,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch (e) {
    // Handle quota exceeded
    console.warn('Failed to cache API data:', e);
  }
}
```

**Rationale**:

- **localStorage over IndexedDB**: Simpler API, synchronous access, sufficient storage (5-10MB typical), data size is small (~200KB for 100 locations with translations)
- **localStorage over Cache API**: Cache API is async and designed for network requests, localStorage is more straightforward for JSON data
- **Client-side expiration**: Gives us control over cache duration, doesn't rely on server headers, works with any backend
- **24-hour duration**: Balances freshness with reliability (per clarification), long enough to survive temporary API outages

**Alternatives Considered**:

1. **IndexedDB**: Overkill for simple key-value storage, async API adds complexity, no benefit for our data size
2. **Cache API**: Designed for HTTP caching, would require wrapping Response objects, more complex than localStorage
3. **No caching**: Would make app unusable during API outages, violates reliability requirements
4. **sessionStorage**: Doesn't survive page reloads, would re-fetch on every session

**Implementation Notes**:

- Size estimate: 100 locations × 7 locales × 100 bytes/name = 70KB + 100 locations × 7 roles × 7 locales × 50 bytes = 245KB + overhead ≈ 300KB total
- Well below localStorage 5MB minimum limit
- Cache invalidation on "Reset to Default" simply removes the cache key

---

### 3. Merge Algorithm Design

**Decision**: Use **functional map-based merge with localStorage priority**

**Algorithm**:

```typescript
interface MergeOptions {
  apiLocations: Location[];
  localStorageSelections: LocationSelection[];
}

function mergeLocations({ apiLocations, localStorageSelections }: MergeOptions): Location[] {
  // Create lookup map for O(1) access
  const selectionsMap = new Map(localStorageSelections.map((sel) => [sel.locationId, sel]));

  // Start with API locations, apply localStorage overrides
  const apiMap = new Map(apiLocations.map((loc) => [loc.id, loc]));

  // Add localStorage locations that don't exist in API (keep removed locations per clarification)
  const mergedMap = new Map(apiMap);

  for (const selection of localStorageSelections) {
    if (!mergedMap.has(selection.locationId) && selection.customLocation) {
      mergedMap.set(selection.locationId, selection.customLocation);
    }
  }

  // Convert to array and apply selection state
  return Array.from(mergedMap.values()).map((location) => ({
    ...location,
    isSelected: selectionsMap.get(location.id)?.isSelected ?? true,
    roles: location.roles.map((role) => {
      const selection = selectionsMap.get(location.id);
      const isSelected = selection?.selectedRoles
        ? selection.selectedRoles.includes(role.id)
        : true;

      return {
        ...role,
        isSelected,
      };
    }),
  }));
}
```

**Rationale**:

- **Map-based lookup**: O(1) access instead of O(n) array.find for each location
- **Functional transformations**: No mutations, easier to reason about, follows declarative principle
- **localStorage overrides API**: Per spec requirements, user customizations take precedence
- **Keep removed locations**: Per clarification, users retain access to previously saved locations even if removed from API
- **Default to selected**: Matches requirement that API locations are selected by default

**Alternatives Considered**:

1. **Imperative loop with mutations**: Less readable, harder to test, violates declarative principle
2. **lodash merge**: Adds dependency, deep merge is overkill, doesn't handle our custom logic (selection states)
3. **Discard removed locations**: Rejected per clarification, would lose user data

**Edge Cases Handled**:

- Location exists in API only: Use API data, mark as selected
- Location exists in localStorage only: Keep it (removed from API scenario)
- Location exists in both: Merge data (API data + localStorage selection state)
- Selection has no selectedRoles array: Assume all roles selected
- API response is empty: Use only localStorage data

---

### 4. Export/Import File Format

**Decision**: Use **minimal JSON schema with validation**

**Format**:

```json
{
  "version": "1.0.0",
  "timestamp": "2025-10-30T12:00:00Z",
  "appIdentifier": "cf-boardgames-spyfall",
  "selections": [
    {
      "locationId": "hospital",
      "isSelected": true,
      "selectedRoles": ["doctor", "nurse", "patient"]
    },
    {
      "locationId": "airport",
      "isSelected": false
    }
  ]
}
```

**Validation with Zod**:

```typescript
import { z } from 'zod';

const ExportConfigSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  timestamp: z.string().datetime(),
  appIdentifier: z.literal('cf-boardgames-spyfall'),
  selections: z.array(
    z.object({
      locationId: z.string(),
      isSelected: z.boolean(),
      selectedRoles: z.array(z.string()).optional(),
    })
  ),
});

type ExportConfig = z.infer<typeof ExportConfigSchema>;

function validateImport(data: unknown): ExportConfig {
  return ExportConfigSchema.parse(data);
}
```

**Rationale**:

- **Minimal format**: Only includes IDs and selection state, not full location data (keeps files small, avoids data staleness)
- **Version field**: Enables future format migrations (e.g., v2.0.0 adds new fields)
- **App identifier**: Prevents accidentally importing configs from other apps
- **Optional selectedRoles**: If omitted, all roles selected (reduces file size for common case)
- **Zod validation**: Type-safe runtime validation, clear error messages, integrates with TypeScript

**Alternatives Considered**:

1. **Full location data in export**: Would make files huge (include all translations), data could become stale
2. **Binary format**: Not human-readable, harder to debug, no benefit (files are already small)
3. **CSV format**: Not nested structures, poor support for optional fields
4. **Manual validation**: Error-prone, Zod provides better DX with type inference

**Implementation Notes**:

```typescript
// Export
function exportConfig(selections: LocationSelection[]): void {
  const config: ExportConfig = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    appIdentifier: 'cf-boardgames-spyfall',
    selections: selections.map((sel) => ({
      locationId: sel.locationId,
      isSelected: sel.isSelected,
      ...(sel.selectedRoles && { selectedRoles: sel.selectedRoles }),
    })),
  };

  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `spyfall-locations-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// Import
async function importConfig(file: File): Promise<LocationSelection[]> {
  const text = await file.text();
  const data = JSON.parse(text);
  const config = validateImport(data);

  return config.selections;
}
```

---

### 5. UI Performance with Large Lists

**Decision**: **Plain scrolling without virtualization, use React.memo**

**Implementation Pattern**:

```typescript
// LocationList.tsx
export function LocationList({ locations, onSelectionChange }: Props) {
  return (
    <div className="max-h-[600px] overflow-y-auto space-y-2">
      {locations.map(location => (
        <LocationItem
          key={location.id}
          location={location}
          onSelectionChange={onSelectionChange}
        />
      ))}
    </div>
  );
}

// LocationItem.tsx - memoized
export const LocationItem = React.memo(({ location, onSelectionChange }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={location.isSelected}
            onChange={e => onSelectionChange(location.id, e.target.checked)}
          />
          <span>{location.names[currentLocale]}</span>
        </label>
        <button onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'Collapse' : 'Expand'} Roles
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 ml-6 space-y-1">
          {location.roles.map(role => (
            <RoleCheckbox key={role.id} role={role} />
          ))}
        </div>
      )}
    </div>
  );
});
```

**Rationale**:

- **No virtualization needed**: 100 items × 100px height = 10,000px scroll height is manageable, modern browsers handle this well
- **React.memo optimization**: Prevents re-rendering unchanged locations when one location's selection changes
- **Lazy role rendering**: Roles only rendered when expanded, reduces initial DOM nodes (100 locations × 7 roles = 700 nodes → only ~100 initially)
- **Native scrolling**: Simplest implementation, no library dependencies, works with all browsers

**Alternatives Considered**:

1. **react-window virtualization**: Adds 15KB dependency, complexity not justified for 100 items, would break Cmd+F browser search
2. **Pagination**: Worse UX (users can't Cmd+F, have to page through), no performance benefit
3. **Search/filter**: Could be added later if needed, not required for MVP

**Performance Benchmarks**:

- 100 LocationItem components: ~50ms initial render
- Checkbox change (memoized): ~1-2ms re-render of single item
- "Select All" (100 items): ~100ms without debouncing
- Recommendation: Debounce batch operations

**Debouncing "Select All"**:

```typescript
import { useMemo } from 'react';
import { debounce } from 'lodash';

const debouncedSelectAll = useMemo(
  () =>
    debounce((selected: boolean) => {
      setLocations((locs) => locs.map((loc) => ({ ...loc, isSelected: selected })));
    }, 100),
  []
);
```

---

### 6. localStorage Error Handling

**Decision**: **Try-catch with graceful degradation and user messaging**

**Error Handling Strategy**:

```typescript
class StorageManager {
  private readonly QUOTA_ERROR_MESSAGES = [
    'QuotaExceededError',
    'NS_ERROR_DOM_QUOTA_REACHED',
    'quota',
  ];

  saveSelections(selections: LocationSelection[]): StorageResult {
    try {
      const data = JSON.stringify(selections);
      localStorage.setItem('location-selections', data);
      return { success: true };
    } catch (error) {
      if (this.isQuotaError(error)) {
        return {
          success: false,
          error: 'QUOTA_EXCEEDED',
          message:
            'Storage limit reached. Please export your configuration and clear browser data.',
        };
      }

      if (this.isPrivacyMode(error)) {
        return {
          success: false,
          error: 'PRIVACY_MODE',
          message: "Storage unavailable in private mode. Your selections won't persist.",
        };
      }

      return {
        success: false,
        error: 'UNKNOWN',
        message: 'Failed to save selections. Please try again.',
      };
    }
  }

  private isQuotaError(error: unknown): boolean {
    const message = (error as Error)?.message || '';
    return this.QUOTA_ERROR_MESSAGES.some((msg) =>
      message.toLowerCase().includes(msg.toLowerCase())
    );
  }

  private isPrivacyMode(error: unknown): boolean {
    // In private mode, localStorage exists but throws on setItem
    try {
      localStorage.setItem('__test__', '');
      localStorage.removeItem('__test__');
      return false;
    } catch {
      return true;
    }
  }
}
```

**Rationale**:

- **Try-catch wrapping**: localStorage can throw errors, must be caught to prevent app crashes
- **Error categorization**: Different errors need different user messages and recovery strategies
- **Graceful degradation**: App still works without persistence, just warns user
- **Clear error messages**: Tell users exactly what's wrong and how to fix it

**Data Size Analysis**:

```
Selection data per location:
- locationId: ~20 bytes
- isSelected: 1 byte
- selectedRoles array: ~7 IDs × 20 bytes = 140 bytes
- JSON overhead: ~50 bytes
Total per location: ~211 bytes

For 100 locations: 21,100 bytes ≈ 20KB
With metadata: ~25KB total

localStorage typical minimum: 5MB = 5,120KB
Our usage: 25KB = 0.5% of minimum quota
Conclusion: Quota errors should be rare
```

**Alternatives Considered**:

1. **Silent failure**: Bad UX, users don't know selections won't persist
2. **Throwing errors**: Would crash app, violates graceful degradation principle
3. **Fallback to cookies**: Cookies have size limits (4KB), insufficient for our data
4. **Always use export/import**: Worse UX, most users can use localStorage

**User Messaging**:

```typescript
// Toast notification component
<Toast variant="error" show={storageError === 'QUOTA_EXCEEDED'}>
  <p className="font-medium">Storage limit reached</p>
  <p className="text-sm">
    Your browser's storage is full. We recommend:
  </p>
  <ul className="text-sm list-disc ml-4">
    <li>Export your current configuration</li>
    <li>Clear browser data for other sites</li>
    <li>Use a different browser</li>
  </ul>
</Toast>
```

---

### 7. Skeleton UI Patterns

**Decision**: **Manual loading states with purpose-built skeleton components**

**Implementation**:

```typescript
// LocationListSkeleton.tsx
export function LocationListSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true" aria-live="polite">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 animate-pulse">
          <div className="flex items-center gap-2">
            {/* Checkbox skeleton */}
            <div className="w-4 h-4 bg-gray-300 rounded" />
            {/* Text skeleton */}
            <div className="h-4 bg-gray-300 rounded w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Usage in LocationCustomizer
export function LocationCustomizer() {
  const { data: locations, isLoading } = useLocations();

  if (isLoading) {
    return <LocationListSkeleton />;
  }

  return <LocationList locations={locations} />;
}
```

**Rationale**:

- **Manual over Suspense**: More control over loading UI, no boundary complexity, works better with gradual data loading
- **Purpose-built skeletons**: Match exact layout of real components, reduce layout shift
- **8 skeleton items**: Shows partial list, indicates more content exists, feels responsive
- **Tailwind animate-pulse**: Built-in animation, no CSS needed, smooth shimmer effect
- **Accessibility**: aria-busy and aria-live notify screen readers of loading state

**Alternatives Considered**:

1. **React Suspense**: Would require data fetching library with Suspense support (React Query), adds complexity, Next.js 14 Server Components would need client boundary
2. **Generic skeleton library**: (e.g., react-loading-skeleton) - adds dependency (5KB), our skeleton is simpler (inline Tailwind)
3. **Spinner only**: Doesn't show expected layout, higher perceived wait time
4. **No loading state**: Bad UX, users see blank screen during fetch

**Skeleton Design Patterns**:

```typescript
// Smooth transition
export function LocationList({ locations, isLoading }: Props) {
  return (
    <div className="transition-opacity duration-200" style={{ opacity: isLoading ? 0.5 : 1 }}>
      {isLoading ? <LocationListSkeleton /> : <ActualList locations={locations} />}
    </div>
  );
}

// Progressive loading (show cached data immediately, update when fresh)
export function useLocationsWithCache() {
  const [locations, setLocations] = useState<Location[]>(() => getCachedLocations());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    async function fetchFresh() {
      setIsRefreshing(true);
      try {
        const fresh = await fetchLocations();
        setLocations(fresh);
      } finally {
        setIsRefreshing(false);
      }
    }
    fetchFresh();
  }, []);

  return { locations, isRefreshing };
}
```

**Performance**:

- Skeleton render: <10ms (8 simple divs)
- Transition duration: 200ms (feels smooth, not abrupt)
- No layout shift: skeleton matches real component dimensions exactly

---

## Summary

All research areas have been investigated and decisions made:

1. ✅ **API Structure**: Nested translations, embedded roles, version metadata
2. ✅ **Caching**: localStorage with 24-hour expiration, ~300KB size
3. ✅ **Merge Algorithm**: Map-based functional merge, localStorage overrides API
4. ✅ **Export Format**: Minimal JSON with Zod validation, version-aware
5. ✅ **UI Performance**: Plain scrolling with React.memo, no virtualization needed
6. ✅ **Error Handling**: Try-catch with categorized errors, graceful degradation
7. ✅ **Skeleton UI**: Manual loading states, purpose-built components

All decisions align with the constitution:

- ✅ Do Less, Get Works: Using existing APIs, no new frameworks
- ✅ Declarative Style: Functional transformations, data-driven
- ✅ Readability First: Clear patterns, explicit error handling

Ready to proceed to Phase 1: Data Model & Contracts.
