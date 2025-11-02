# API Contract: Translation Data Interfaces

**Feature**: Fix incomplete i18n translations and language switching  
**Date**: 2025-11-02  
**Type**: TypeScript Interface Contracts

This feature uses file-based translations (JSON) and existing API endpoints. No new API routes needed. These contracts define the data shapes for type safety.

---

## TypeScript Contracts

### Locale Types

```typescript
// File: lib/i18n/types.ts (already exists)

/**
 * Supported language codes
 */
export type LocaleCode = 'en' | 'th' | 'zh' | 'hi' | 'es' | 'fr' | 'ar';

/**
 * Locale configuration with metadata
 */
export interface Locale {
  code: LocaleCode;
  name: string; // English name: "English", "Thai", "Arabic"
  nativeName: string; // Native name: "English", "ไทย", "العربية"
  flag: string; // Emoji flag: "🇬🇧", "🇹🇭", "🇸🇦"
  direction: 'ltr' | 'rtl';
}

/**
 * User language preference stored in localStorage
 */
export interface UserLanguagePreference {
  locale: LocaleCode;
  source: 'user-selected' | 'browser-detected' | 'default';
  timestamp: number;
}
```

---

### Translation Dictionary Contract

```typescript
// File: locales/{locale}/common.json (contract via TypeScript inference)

/**
 * UI string translation dictionary structure
 * All locales must have identical key structure
 */
export interface TranslationDictionary {
  button: {
    createRoom: string;
    joinRoom: string;
    startGame: string;
    leaveRoom: string;
    copyCode: string;
    // ... ~20 button labels
  };
  label: {
    roomCode: string;
    playerName: string;
    difficulty: string;
    timer: string;
    // ... ~15 form labels
  };
  heading: {
    welcome: string;
    createRoom: string;
    joinRoom: string;
    lobby: string;
    gameplay: string;
    results: string;
    // ... ~10 section headings
  };
  message: {
    roomCreated: string;
    playerJoined: string;
    playerLeft: string;
    gameStarting: string;
    waitingForPlayers: string;
    // ... ~30 status messages (supports {interpolation})
  };
  game: {
    yourRole: string;
    youAreTheSpy: string;
    location: string;
    allLocations: string;
    // ... ~40 game-specific strings
  };
  chat: {
    title: string;
    subtitle: string;
    placeholder: string;
    send: string;
    // ... ~10 chat interface strings
  };
  voting: {
    title: string;
    subtitle: string;
    vote: string;
    skip: string;
    // ... ~10 voting interface strings
  };
  results: {
    spyCaught: string;
    spyEscaped: string;
    scores: string;
    nextRound: string;
    backToLobby: string;
    // ... ~15 results screen strings
  };
  lobby: {
    room: string;
    playerCount: string;
    gameSettings: string;
    difficulty: string;
    startGame: string;
    // ... ~30 lobby configuration strings
  };
  playerList: {
    title: string;
    online: string;
    offline: string;
    you: string;
    host: string;
    points: string;
    kick: string;
    // ... ~10 player list strings
  };
  timer: {
    timeRemaining: string;
    timeAlmostUp: string;
    prepareToVote: string;
    discussAndFind: string;
    // ... ~5 timer strings
  };
  homepage: {
    tagline: string;
    howToPlay1: string;
    howToPlay2: string;
    howToPlay3: string;
    howToPlay4: string;
    feature1: string;
    feature2: string;
    feature3: string;
    feature4: string;
    footer: string;
    // ... ~10 homepage strings
  };
}

// Usage in components:
// const t = useTranslations('common');
// t('button.createRoom') → "Create Room"
// t('message.playerJoined', { playerName: 'Alice' }) → "Alice has joined"
```

---

### Location Translation Contract

```typescript
// File: locales/{locale}/locations.json

/**
 * Location ID to translated name mapping
 * Generated from API data
 */
export interface LocalizedLocationDictionary {
  [locationId: string]: string;
  // Example entries:
  // "loc-airport": "Airport"
  // "loc-hospital": "Hospital"
  // "loc-bank": "Bank"
  // ... ~80 total
}

/**
 * Full location object from API (for reference)
 * Not stored in translation files, but shapes the data
 */
export interface LocationWithTranslations {
  id: string; // "loc-airport"
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  names: {
    en: string;
    th: string;
    zh: string;
    hi: string;
    es: string;
    fr: string;
    ar: string;
  };
  roles: RoleWithTranslations[];
}

// Translation file contains flattened version:
// { "loc-airport": location.names[locale] }
```

---

### Role Translation Contract

```typescript
// File: locales/{locale}/roles.json

/**
 * Role ID to translated name mapping
 * Generated from API data
 */
export interface LocalizedRoleDictionary {
  [roleId: string]: string;
  // Example entries:
  // "loc-airport-role-1": "Pilot"
  // "loc-airport-role-2": "Flight Attendant"
  // "loc-hospital-role-1": "Doctor"
  // ... ~400-800 total across all locations
}

/**
 * Full role object from API (for reference)
 */
export interface RoleWithTranslations {
  id: string; // "loc-airport-role-1"
  names: {
    en: string;
    th: string;
    zh: string;
    hi: string;
    es: string;
    fr: string;
    ar: string;
  };
}

// Translation file contains flattened version:
// { "loc-airport-role-1": role.names[locale] }
```

---

### Hook Return Types

```typescript
// File: lib/useLocationTranslations.ts

/**
 * Return type for useLocationTranslations hook
 */
export interface LocationTranslationsResult {
  translations: Record<string, string>; // { "loc-airport": "Airport", ... }
  getLocationName: (locationId: string) => string;
  isLoading: boolean;
  locale: LocaleCode;
}

// Usage:
// const { getLocationName, isLoading } = useLocationTranslations();
// getLocationName('loc-airport') → "Airport" (in current locale)
```

```typescript
// File: lib/useRoleTranslations.ts

/**
 * Return type for useRoleTranslations hook
 */
export interface RoleTranslationsResult {
  translations: Record<string, string>; // { "loc-airport-role-1": "Pilot", ... }
  getRoleName: (roleId: string) => string;
  isLoading: boolean;
  locale: LocaleCode;
}

// Usage:
// const { getRoleName, isLoading } = useRoleTranslations();
// getRoleName('loc-airport-role-1') → "Pilot" (in current locale)
```

---

## Existing API Endpoints (No Changes Needed)

### GET /api/locations

**Purpose**: Fetch all locations with translations and roles

**Response**:

```typescript
interface LocationsApiResponse {
  locations: LocationWithTranslations[];
}

// Example response:
{
  "locations": [
    {
      "id": "loc-airport",
      "difficulty": "easy",
      "imageUrl": "https://example.com/airport.jpg",
      "names": {
        "en": "Airport",
        "th": "สนามบิน",
        "zh": "机场",
        "hi": "हवाई अड्डा",
        "es": "Aeropuerto",
        "fr": "Aéroport",
        "ar": "مطار"
      },
      "roles": [
        {
          "id": "loc-airport-role-1",
          "names": {
            "en": "Pilot",
            "th": "นักบิน",
            "zh": "飞行员",
            "hi": "पायलट",
            "es": "Piloto",
            "fr": "Pilote",
            "ar": "طيار"
          }
        },
        // ... more roles
      ]
    },
    // ... more locations
  ]
}
```

**Contract Guarantees**:

- All locations have `names` object with all 7 locales
- All roles have `names` object with all 7 locales
- If translation missing, API returns fallback (English)
- Response is cached for 24 hours

---

## File Structure Contracts

### Translation File Naming Convention

```
locales/
├── {locale}/
│   ├── common.json      # UI strings (REQUIRED)
│   ├── locations.json   # Location names (REQUIRED)
│   └── roles.json       # Role names (REQUIRED)
```

**Rules**:

- Locale directory name must match LocaleCode type
- All 3 files must exist for each locale
- Files must be valid JSON
- Files must not have trailing commas (strict JSON)

### Translation Key Naming Convention

**UI Strings** (`common.json`):

- Format: `{namespace}.{key}` (2 levels max for simplicity)
- Namespace: semantic grouping (button, label, heading, message, etc.)
- Key: camelCase describing the UI element
- Examples: `button.createRoom`, `message.waitingForPlayers`, `heading.lobby`

**Location/Role IDs**:

- Format: `loc-{name}` for locations (kebab-case)
- Format: `loc-{location}-role-{number}` for roles (kebab-case)
- IDs are immutable (changing breaks game state)
- Examples: `loc-airport`, `loc-airport-role-1`

---

## Validation Contracts

### Build-time Validation

```typescript
// Checks performed by generation scripts

interface TranslationValidation {
  keyCoverage: {
    locale: LocaleCode;
    missingKeys: string[]; // Keys present in 'en' but missing in this locale
    extraKeys: string[]; // Keys present in this locale but not in 'en'
  }[];

  locationCoverage: {
    locale: LocaleCode;
    missingLocations: string[]; // Location IDs missing from this locale
  }[];

  roleCoverage: {
    locale: LocaleCode;
    missingRoles: string[]; // Role IDs missing from this locale
  }[];
}

// Script outputs validation report and exits with error if critical gaps found
```

### Runtime Validation

```typescript
// Performed by next-intl and custom hooks

interface RuntimeValidation {
  // next-intl automatically:
  // - Logs missing keys in development
  // - Falls back to key name or default locale
  // Custom hooks validate:
  // - Locale code is valid (isValidLocale check)
  // - Translation files loaded successfully
  // - API responses have expected structure
}
```

---

## Migration/Generation Scripts

### Script: `scripts/sync-translations-from-api-data.ts`

**Input Contract**:

```typescript
// Reads from data/migration/prepare-api-data.ts
interface ApiDataSource {
  generateApiData(): {
    locations: LocationWithTranslations[];
  };
}
```

**Output Contract**:

```typescript
// Writes to locales/{locale}/
interface GeneratedFiles {
  [`locales/${LocaleCode}/locations.json`]: LocalizedLocationDictionary;
  [`locales/${LocaleCode}/roles.json`]: LocalizedRoleDictionary;
}
```

---

### Script: `scripts/audit-translation-coverage.ts`

**Input Contract**:

```typescript
// Reads all common.json files
interface AuditInput {
  baseline: TranslationDictionary; // locales/en/common.json
  locales: {
    [key in LocaleCode]: Partial<TranslationDictionary>;
  };
}
```

**Output Contract**:

```typescript
// Console report and optional file updates
interface AuditOutput {
  report: {
    locale: LocaleCode;
    totalKeys: number;
    translatedKeys: number;
    missingKeys: string[];
    coverage: number; // percentage
  }[];

  // If --fix flag used:
  updatedFiles?: string[]; // List of files that were scaffolded
}
```

---

## Type Safety Guarantees

1. **Compile-time**: TypeScript ensures components use correct translation keys
2. **Generation-time**: Scripts validate key consistency across locales
3. **Runtime**: next-intl provides type-safe hook APIs
4. **Fallback**: All missing translations fall back to English (never raw keys)

---

## References

- next-intl types: `node_modules/next-intl/dist/index.d.ts`
- Existing type definitions: `lib/i18n/types.ts`, `lib/types.ts`
- API implementation: `workers/src/locations/handler.ts`
