# Data Model: i18n Translation Entities

**Feature**: Fix incomplete i18n translations and language switching  
**Date**: 2025-11-02  
**Phase**: Design (Phase 1)

## Entity Overview

This feature deals with three primary data entities:

1. **Translation Dictionary**: UI strings grouped by functional area
2. **Localized Location**: Location names in multiple languages
3. **Localized Role**: Role names in multiple languages

These are pure data entities (JSON files); no database or API state mutations.

---

## Entity: Translation Dictionary

**Purpose**: Stores human-readable UI strings keyed by functional context.

**File Location**: `locales/{locale}/common.json`

**Structure**:

```typescript
interface TranslationDictionary {
  [namespace: string]: {
    [key: string]: string | TranslationValue;
  };
}

type TranslationValue = string | { [nestedKey: string]: string };

// Example structure:
{
  "button": {
    "createRoom": "Create Room",
    "joinRoom": "Join Room",
    "startGame": "Start Game"
  },
  "label": {
    "playerName": "Player Name",
    "roomCode": "Room Code"
  },
  "message": {
    "waitingForPlayers": "Waiting for players..."
  }
}
```

**Validation Rules**:

- All locales must have identical key structure (same namespaces and keys)
- Values are strings (no complex types)
- Keys use camelCase convention
- Namespaces group related UI elements (button, label, heading, message, etc.)

**Relationships**:

- Parent: Locale configuration (`lib/i18n/config.ts` defines supported locales)
- Usage: Components consume via `useTranslations('common')` hook from next-intl

**State Transitions**: N/A (static files, loaded once per navigation)

---

## Entity: Localized Location

**Purpose**: Maps location IDs to translated display names for each language.

**File Location**: `locales/{locale}/locations.json`

**Structure**:

```typescript
interface LocalizedLocationDictionary {
  [locationId: string]: string;
}

// Example:
{
  "loc-airport": "Airport",
  "loc-hospital": "Hospital",
  "loc-bank": "Bank",
  // ... ~80 locations
}
```

**Validation Rules**:

- Location ID format: `loc-{name}` (kebab-case)
- All locales must have same set of location IDs
- Display name is human-readable string appropriate for locale
- If translation missing, fallback to English value (logged in dev mode)

**Relationships**:

- Source: `data/migration/prepare-api-data.ts` generates canonical list
- API: Cloudflare Workers endpoint `/api/locations` returns full location objects with `names` object containing all locales
- Client: `useLocationTranslations` hook fetches from API and builds lookup map

**State Transitions**:

- Generation time: Script reads source data → writes JSON files
- Runtime: Hook fetches from API → caches in component state

---

## Entity: Localized Role

**Purpose**: Maps role IDs to translated display names for each language.

**File Location**: `locales/{locale}/roles.json`

**Structure**:

```typescript
interface LocalizedRoleDictionary {
  [roleId: string]: string;
}

// Example:
{
  "loc-airport-role-1": "Pilot",
  "loc-airport-role-2": "Flight Attendant",
  "loc-hospital-role-1": "Doctor",
  "loc-hospital-role-2": "Nurse",
  // ... ~400-800 roles across all locations
}
```

**Validation Rules**:

- Role ID format: `loc-{location}-role-{number}` (kebab-case)
- All locales must have same set of role IDs
- Display name is human-readable string appropriate for locale
- If translation missing, fallback to English value (logged in dev mode)

**Relationships**:

- Source: `data/migration/prepare-api-data.ts` generates canonical list
- API: Cloudflare Workers endpoint `/api/locations` returns locations with nested `roles` array, each role has `names` object
- Client: `useRoleTranslations` hook fetches from API and builds lookup map

**State Transitions**:

- Generation time: Script reads source data → writes JSON files
- Runtime: Hook fetches from API → caches in component state

---

## Entity: Language Preference

**Purpose**: Stores user's selected language for persistence across sessions.

**Storage Location**:

- Browser localStorage: `cf-boardgames-locale` key
- Cookie: `NEXT_LOCALE` (for SSR)
- URL: `/{locale}/...` path segment

**Structure**:

```typescript
interface UserLanguagePreference {
  locale: LocaleCode; // 'en' | 'th' | 'zh' | 'hi' | 'es' | 'fr' | 'ar'
  source: 'user-selected' | 'browser-detected' | 'default';
  timestamp: number; // Unix timestamp
}

// localStorage value (JSON string):
{
  "locale": "en",
  "source": "user-selected",
  "timestamp": 1698765432000
}

// Cookie value (simple string):
"en"

// URL segment:
"/en/room/ABC123"
```

**Validation Rules**:

- Locale must be one of 7 supported codes (validated via `isValidLocale()`)
- Source indicates how locale was determined (for debugging)
- Timestamp tracks when preference was set
- If invalid or missing, falls back to browser language detection, then default (Thai)

**Relationships**:

- Read by: Middleware (`middleware.ts`) for URL routing
- Written by: `LanguageSwitcher` component when user selects language
- Consumed by: `[locale]/layout.tsx` to load correct messages

**State Transitions**:

```
Initial load:
  No preference → detect browser language → save as 'browser-detected'
  Has preference → validate → use if valid, else reset to default

User changes language:
  LanguageSwitcher fires → save to localStorage + cookie → update URL → trigger navigation

Page reload:
  Read preference → validate → pass to layout → load translations
```

---

## Entity Relationships Diagram

```
┌─────────────────────────────┐
│  Language Preference        │
│  (localStorage + cookie)    │
└──────────┬──────────────────┘
           │
           │ determines locale
           ▼
┌─────────────────────────────┐
│  Translation Dictionary     │◄──── loaded by
│  locales/{locale}/common    │      [locale]/layout.tsx
└─────────────────────────────┘

┌─────────────────────────────┐
│  API: /api/locations        │
│  (Cloudflare Worker)        │
└──────────┬──────────────────┘
           │
           │ provides source data
           ▼
┌─────────────────────────────┐      ┌──────────────────────────┐
│  Localized Location         │      │  Localized Role          │
│  locales/{locale}/locations │      │  locales/{locale}/roles  │
└──────────┬──────────────────┘      └────────┬─────────────────┘
           │                                   │
           │ consumed by                       │ consumed by
           ▼                                   ▼
┌─────────────────────────────┐      ┌──────────────────────────┐
│  useLocationTranslations()  │      │  useRoleTranslations()   │
│  (React hook)               │      │  (React hook)            │
└─────────────────────────────┘      └──────────────────────────┘
```

---

## Data Flow

### Language Switch Flow

```
User clicks language selector
  ↓
LanguageSwitcher.switchLocale(newLocale)
  ↓
Save to localStorage + cookie
  ↓
Update URL: /th/room/123 → /en/room/123
  ↓
Next.js navigation to new locale route
  ↓
[locale]/layout.tsx loads messages for new locale
  ↓
Page re-renders with new translations
```

### Translation Loading Flow

```
Page loads with locale segment
  ↓
[locale]/layout.tsx reads params.locale
  ↓
Import locales/{locale}/common.json
  ↓
Pass messages to TranslationProvider
  ↓
Components use useTranslations('common.namespace.key')
  ↓
Hook returns translated string from loaded dictionary
```

### Location/Role Translation Flow

```
Game component mounts
  ↓
useLocationTranslations() hook runs
  ↓
Fetch /api/locations (cached)
  ↓
Extract location.names[locale] for all locations
  ↓
Build lookup map: { "loc-airport": "Airport", ... }
  ↓
Component calls getLocationName("loc-airport")
  ↓
Return translated name from map
```

---

## File Size Estimates

| Entity                     | Locales | Entries        | Size per Locale | Total       |
| -------------------------- | ------- | -------------- | --------------- | ----------- |
| UI Strings (common.json)   | 7       | ~300 keys      | ~15-20 KB       | ~140 KB     |
| Locations (locations.json) | 7       | ~80 locations  | ~3-5 KB         | ~35 KB      |
| Roles (roles.json)         | 7       | ~400-800 roles | ~15-30 KB       | ~210 KB     |
| **Total**                  | -       | -              | -               | **~385 KB** |

Compressed (gzip): ~80-100 KB total
Per-page load: Only 1 locale at a time (~55 KB uncompressed, ~15 KB gzipped)

---

## Generation Scripts

### Script: `scripts/sync-translations-from-api-data.ts`

**Purpose**: Generate locales/{locale}/locations.json and roles.json from prepare-api-data output.

**Input**: `data/migration/prepare-api-data.ts` (source of truth)
**Output**: 7 × 2 = 14 JSON files (locations + roles for each locale)

**Logic**:

1. Import prepare-api-data module
2. Call generateApiData() to get locations array
3. For each locale:
   - Extract location.names[locale] → write to locales/{locale}/locations.json
   - Extract role.names[locale] for all roles → write to locales/{locale}/roles.json
4. Validate: ensure all locales have same keys

---

### Script: `scripts/audit-translation-coverage.ts`

**Purpose**: Identify missing keys in non-English UI dictionaries.

**Input**: `locales/en/common.json` (baseline)
**Output**: Report of missing keys; optionally generate scaffolded files

**Logic**:

1. Load en/common.json
2. Extract all keys (flattened: "button.createRoom", "label.playerName", etc.)
3. For each other locale:
   - Load {locale}/common.json
   - Find missing keys
   - Report missing keys
   - Optionally: insert English value with "TODO: Translate" comment
4. Output: console report + optionally update files

---

## Validation Rules Summary

| Entity                 | Required Fields                      | Format                   | Constraints                     |
| ---------------------- | ------------------------------------ | ------------------------ | ------------------------------- |
| Translation Dictionary | All keys from en/common.json         | JSON with nested objects | String values only              |
| Localized Location     | Same keys as prepare-api-data output | JSON flat map            | Keys must match across locales  |
| Localized Role         | Same keys as prepare-api-data output | JSON flat map            | Keys must match across locales  |
| Language Preference    | locale, source, timestamp            | JSON object              | locale must be valid LocaleCode |

---

## Assumptions & Constraints

**Assumptions**:

- Translation files are committed to git (not generated at build time)
- English is the primary fallback language
- API data structure matches client expectations (validated by existing hooks)
- next-intl handles missing key scenarios gracefully

**Constraints**:

- Cannot add new locales without updating SUPPORTED_LOCALES in config
- All translation files must be valid JSON (build will fail otherwise)
- Role/location IDs are immutable (changing them breaks saved game state)
- RTL languages (Arabic) require special CSS handling (already implemented)

---

## References

- Type definitions: `lib/i18n/types.ts`
- Locale configuration: `lib/i18n/config.ts`
- API source data: `data/migration/prepare-api-data.ts`
- Existing hooks: `lib/useLocationTranslations.ts`, `lib/useRoleTranslations.ts`
