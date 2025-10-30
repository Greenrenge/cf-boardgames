# Data Model: Location API Customization

**Feature**: 005-location-api-customization  
**Date**: October 30, 2025  
**Status**: Complete

## Overview

This document defines the data structures and relationships for the Location API Customization feature. All models support 7 languages (Thai, English, Mandarin Chinese, Hindi, Spanish, French, Arabic) with location data sourced from API and user selections persisted in local storage.

---

## Core Entities

### 1. Location

**Description**: Represents a game location with names in all supported languages and associated roles.

**TypeScript Interface**:

```typescript
interface Location {
  id: string;
  names: LocalizedNames;
  roles: Role[];
  imageUrl?: string;
  isSelected: boolean; // Runtime property, not from API
}

type LocaleCode = 'en' | 'th' | 'zh' | 'hi' | 'es' | 'fr' | 'ar';

type LocalizedNames = Record<LocaleCode, string>;
```

**Attributes**:

- `id` (string, required): Unique identifier for the location
  - Format: kebab-case, lowercase (e.g., "hospital", "space-station")
  - Stable across API versions
  - Used as key for localStorage overrides
- `names` (LocalizedNames, required): Location name translations
  - Object with locale codes as keys
  - All 7 locales must be present
  - Values are plain strings (no HTML)
- `roles` (Role[], required): Array of roles for this location
  - Minimum 1 role, maximum 10 roles per location
  - Order is preserved from API
- `imageUrl` (string, optional): URL to location image
  - Used by LocationImage component
  - Can be relative path or full URL
- `isSelected` (boolean, runtime): Whether location is enabled for gameplay
  - Not stored in API response
  - Derived from user selections or defaults to true

**Validation Rules**:

```typescript
function validateLocation(location: unknown): Location {
  const schema = z.object({
    id: z.string().min(1).max(50),
    names: z.object({
      en: z.string().min(1),
      th: z.string().min(1),
      zh: z.string().min(1),
      hi: z.string().min(1),
      es: z.string().min(1),
      fr: z.string().min(1),
      ar: z.string().min(1),
    }),
    roles: z.array(z.custom<Role>()).min(1).max(10),
    imageUrl: z.string().url().optional(),
    isSelected: z.boolean().default(true),
  });

  return schema.parse(location);
}
```

**Example**:

```json
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
    { "id": "doctor", "names": { ... }, "isSelected": true },
    { "id": "nurse", "names": { ... }, "isSelected": true }
  ],
  "imageUrl": "/images/locations/hospital.jpg",
  "isSelected": true
}
```

---

### 2. Role

**Description**: Represents a role within a location, with names in all supported languages.

**TypeScript Interface**:

```typescript
interface Role {
  id: string;
  names: LocalizedNames;
  locationId?: string; // Added at runtime for reference
  isSelected: boolean; // Runtime property
}
```

**Attributes**:

- `id` (string, required): Unique identifier for the role within its location
  - Format: kebab-case, lowercase (e.g., "doctor", "head-nurse")
  - Unique within location, may repeat across locations
- `names` (LocalizedNames, required): Role name translations
  - Object with locale codes as keys
  - All 7 locales must be present
- `locationId` (string, optional runtime): Parent location ID
  - Not in API response
  - Added at runtime for easier lookup
- `isSelected` (boolean, runtime): Whether role is enabled for gameplay
  - Derived from user selections or defaults to true

**Validation Rules**:

```typescript
function validateRole(role: unknown): Role {
  const schema = z.object({
    id: z.string().min(1).max(50),
    names: z.object({
      en: z.string().min(1),
      th: z.string().min(1),
      zh: z.string().min(1),
      hi: z.string().min(1),
      es: z.string().min(1),
      fr: z.string().min(1),
      ar: z.string().min(1),
    }),
    locationId: z.string().optional(),
    isSelected: z.boolean().default(true),
  });

  return schema.parse(role);
}
```

**Example**:

```json
{
  "id": "doctor",
  "names": {
    "en": "Doctor",
    "th": "แพทย์",
    "zh": "医生",
    "hi": "डॉक्टर",
    "es": "Médico",
    "fr": "Médecin",
    "ar": "طبيب"
  },
  "locationId": "hospital",
  "isSelected": true
}
```

---

### 3. APIResponse

**Description**: Top-level response from GET /api/locations endpoint.

**TypeScript Interface**:

```typescript
interface APIResponse {
  version: string;
  timestamp: string;
  locations: Location[];
}
```

**Attributes**:

- `version` (string, required): API version in semver format
  - Format: "X.Y.Z" (e.g., "1.0.0")
  - Used for compatibility checks
  - Breaking changes increment major version
- `timestamp` (string, required): When response was generated
  - Format: ISO 8601 datetime (e.g., "2025-10-30T12:00:00Z")
  - Used for cache validation
- `locations` (Location[], required): Array of all available locations
  - Expected count: 80-120 locations
  - Ordered alphabetically by English name

**Validation Rules**:

```typescript
const APIResponseSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  timestamp: z.string().datetime(),
  locations: z.array(z.custom<Location>()).min(1).max(200),
});
```

**Example**:

```json
{
  "version": "1.0.0",
  "timestamp": "2025-10-30T12:00:00Z",
  "locations": [
    { "id": "airport", "names": {...}, "roles": [...] },
    { "id": "hospital", "names": {...}, "roles": [...] }
  ]
}
```

---

### 4. LocationSelection

**Description**: User's preference for a specific location (enabled/disabled state and role selections).

**TypeScript Interface**:

```typescript
interface LocationSelection {
  locationId: string;
  isSelected: boolean;
  selectedRoles?: string[]; // Role IDs, undefined = all selected
  timestamp?: string; // When selection was made
}
```

**Attributes**:

- `locationId` (string, required): ID of the location this selection applies to
- `isSelected` (boolean, required): Whether location is enabled
- `selectedRoles` (string[], optional): Array of enabled role IDs
  - If undefined/null: All roles are selected
  - If empty array: No roles selected (invalid state, prevented by validation)
  - If array with IDs: Only those roles selected
- `timestamp` (string, optional): When this selection was last modified
  - ISO 8601 format
  - Used for conflict resolution in multi-tab scenarios

**Validation Rules**:

```typescript
const LocationSelectionSchema = z.object({
  locationId: z.string().min(1),
  isSelected: z.boolean(),
  selectedRoles: z.array(z.string()).min(1).optional(), // Must have at least 1 if present
  timestamp: z.string().datetime().optional(),
});
```

**State Rules**:

- If `isSelected = false`, `selectedRoles` is ignored
- If `isSelected = true` and `selectedRoles` is undefined, all roles enabled
- If `isSelected = true` and `selectedRoles` is empty, validation error (must have at least 1 role)

**Example**:

```json
{
  "locationId": "hospital",
  "isSelected": true,
  "selectedRoles": ["doctor", "nurse", "patient"],
  "timestamp": "2025-10-30T14:30:00Z"
}
```

---

### 5. LocalStorageConfig

**Description**: Complete user configuration stored in localStorage.

**TypeScript Interface**:

```typescript
interface LocalStorageConfig {
  selections: LocationSelection[];
  customLocations?: Location[]; // Locations removed from API but kept by user
  lastUpdated: string;
  version: string;
}
```

**Attributes**:

- `selections` (LocationSelection[], required): User's selection preferences
  - One entry per customized location
  - Locations not in this array default to selected with all roles
- `customLocations` (Location[], optional): Full location data for removed locations
  - Locations that exist in localStorage but not in current API response
  - Preserves user's access to previously available locations
- `lastUpdated` (string, required): When config was last modified
  - ISO 8601 format
- `version` (string, required): Config format version
  - For future migration support

**Storage Key**: `"location-selections"`

**Storage Size**: Approximately 25KB for 100 locations

**Example**:

```json
{
  "selections": [
    {
      "locationId": "hospital",
      "isSelected": true,
      "selectedRoles": ["doctor", "nurse"]
    },
    {
      "locationId": "airport",
      "isSelected": false
    }
  ],
  "customLocations": [
    {
      "id": "old-location",
      "names": {...},
      "roles": [...]
    }
  ],
  "lastUpdated": "2025-10-30T14:30:00Z",
  "version": "1.0.0"
}
```

---

### 6. CacheEntry

**Description**: Cached API response stored in localStorage.

**TypeScript Interface**:

```typescript
interface CacheEntry {
  data: APIResponse;
  timestamp: string;
  version: string;
}
```

**Attributes**:

- `data` (APIResponse, required): Complete API response
- `timestamp` (string, required): When cached
  - Used to calculate cache age
  - Cache expires after 24 hours
- `version` (string, required): Cache format version

**Storage Key**: `"location-api-cache"`

**Storage Size**: Approximately 300KB

**Cache Duration**: 24 hours (86,400,000 milliseconds)

**Example**:

```json
{
  "data": {
    "version": "1.0.0",
    "timestamp": "2025-10-30T12:00:00Z",
    "locations": [...]
  },
  "timestamp": "2025-10-30T12:00:00Z",
  "version": "1.0.0"
}
```

---

### 7. ExportConfig

**Description**: Configuration file format for export/import functionality.

**TypeScript Interface**:

```typescript
interface ExportConfig {
  version: string;
  timestamp: string;
  appIdentifier: 'cf-boardgames-spyfall';
  selections: LocationSelection[];
}
```

**Attributes**:

- `version` (string, required): Export format version (semver)
- `timestamp` (string, required): When exported
- `appIdentifier` (string literal, required): Must be "cf-boardgames-spyfall"
  - Prevents importing configs from incompatible apps
- `selections` (LocationSelection[], required): User's selections

**File Format**: JSON with pretty-printing (2-space indent)

**File Extension**: `.json`

**File Naming**: `spyfall-locations-YYYY-MM-DD.json`

**JSON Schema**:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Location Configuration Export",
  "type": "object",
  "required": ["version", "timestamp", "appIdentifier", "selections"],
  "properties": {
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "appIdentifier": {
      "type": "string",
      "const": "cf-boardgames-spyfall"
    },
    "selections": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["locationId", "isSelected"],
        "properties": {
          "locationId": { "type": "string" },
          "isSelected": { "type": "boolean" },
          "selectedRoles": {
            "type": "array",
            "items": { "type": "string" }
          }
        }
      }
    }
  }
}
```

---

## Entity Relationships

```
APIResponse (from server)
  └── contains many → Location
                        └── contains many → Role

LocalStorageConfig (in browser)
  ├── selections → many LocationSelection
  │                  └── references → Location (by ID)
  │                       └── references → Role (by ID)
  └── customLocations → many Location (for removed locations)

CacheEntry (in browser)
  └── caches → APIResponse

ExportConfig (file)
  └── contains → LocationSelection[] (portable format)
```

### Merge Flow

```
1. Fetch API Response
   ↓
2. Check Cache (24-hour expiration)
   ↓
3. Load LocalStorageConfig
   ↓
4. Merge Process:
   - Start with API locations
   - Apply localStorage selection states
   - Add customLocations not in API
   ↓
5. Result: Merged Location[]
   ↓
6. Display in UI
```

---

## State Transitions

### Location Selection State

```
[Default: Selected with all roles]
         ↓
    User deselects
         ↓
    [Not Selected]
         ↓
    User re-selects
         ↓
[Selected with all roles]


[Selected with all roles]
         ↓
  User deselects some roles
         ↓
[Selected with specific roles]
         ↓
  User deselects all roles
         ↓
  [Validation Error - Must have ≥1 role]
```

### Cache State

```
[No Cache]
    ↓
API Fetch Success
    ↓
[Fresh Cache] (age < 24h)
    ↓
  Time passes
    ↓
[Expired Cache] (age ≥ 24h)
    ↓
API Fetch Success OR
User clicks "Reset"
    ↓
[Fresh Cache]
```

---

## Data Transformations

### 1. API Response → Merged Locations

```typescript
function applySelections(apiLocations: Location[], selections: LocationSelection[]): Location[] {
  const selectionsMap = new Map(selections.map((sel) => [sel.locationId, sel]));

  return apiLocations.map((location) => {
    const selection = selectionsMap.get(location.id);

    return {
      ...location,
      isSelected: selection?.isSelected ?? true,
      roles: location.roles.map((role) => ({
        ...role,
        isSelected: selection?.selectedRoles ? selection.selectedRoles.includes(role.id) : true,
      })),
    };
  });
}
```

### 2. Merged Locations → LocationSelection[]

```typescript
function extractSelections(locations: Location[]): LocationSelection[] {
  return locations
    .filter((loc) => {
      // Only save if not default state
      const hasCustomSelection = !loc.isSelected || loc.roles.some((role) => !role.isSelected);
      return hasCustomSelection;
    })
    .map((loc) => ({
      locationId: loc.id,
      isSelected: loc.isSelected,
      selectedRoles: loc.roles.every((role) => role.isSelected)
        ? undefined // All selected = omit array
        : loc.roles.filter((role) => role.isSelected).map((role) => role.id),
      timestamp: new Date().toISOString(),
    }));
}
```

### 3. LocalStorageConfig → ExportConfig

```typescript
function createExportConfig(config: LocalStorageConfig): ExportConfig {
  return {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    appIdentifier: 'cf-boardgames-spyfall',
    selections: config.selections,
  };
}
```

### 4. ExportConfig → LocalStorageConfig

```typescript
function importConfig(
  exportConfig: ExportConfig,
  existingConfig: LocalStorageConfig
): LocalStorageConfig {
  return {
    selections: exportConfig.selections,
    customLocations: existingConfig.customLocations, // Preserve custom locations
    lastUpdated: new Date().toISOString(),
    version: exportConfig.version,
  };
}
```

---

## Query Patterns

### Get enabled locations for gameplay

```typescript
function getEnabledLocations(locations: Location[]): Location[] {
  return locations.filter((loc) => loc.isSelected && loc.roles.some((role) => role.isSelected));
}
```

### Get location by ID

```typescript
function getLocationById(locations: Location[], id: string): Location | undefined {
  return locations.find((loc) => loc.id === id);
}
```

### Get role by ID within location

```typescript
function getRoleById(location: Location, roleId: string): Role | undefined {
  return location.roles.find((role) => role.id === roleId);
}
```

### Check if configuration is valid for game start

```typescript
function isValidConfiguration(locations: Location[]): boolean {
  const enabledLocations = getEnabledLocations(locations);
  return enabledLocations.length >= 5; // Minimum locations for game
}
```

---

## Validation Summary

| Entity             | Required Fields                  | Constraints                                |
| ------------------ | -------------------------------- | ------------------------------------------ |
| Location           | id, names, roles                 | 1-10 roles, all locales present            |
| Role               | id, names                        | All locales present                        |
| APIResponse        | version, timestamp, locations    | 1-200 locations, valid semver              |
| LocationSelection  | locationId, isSelected           | If selectedRoles present, min 1 role       |
| LocalStorageConfig | selections, lastUpdated, version | Valid ISO timestamp                        |
| CacheEntry         | data, timestamp, version         | data must be valid APIResponse             |
| ExportConfig       | all fields                       | appIdentifier must be exact literal string |

---

## Migration Notes

### Version 1.0.0 → 2.0.0 (Future)

If we need to add new fields:

```typescript
function migrateConfig(config: any): LocalStorageConfig {
  if (config.version === '1.0.0') {
    return {
      ...config,
      newField: defaultValue,
      version: '2.0.0',
    };
  }
  return config;
}
```

### Handling Old Export Files

```typescript
function importWithMigration(fileData: any): LocalStorageConfig {
  const version = fileData.version || '1.0.0';

  if (version === '1.0.0') {
    // Current version, no migration needed
    return validateAndImport(fileData);
  }

  throw new Error(`Unsupported export version: ${version}`);
}
```
