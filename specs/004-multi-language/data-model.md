# Data Model: Multi-Language Support

**Feature**: 004-multi-language  
**Date**: October 30, 2025  
**Status**: Complete

## Overview

This document defines the data structures and relationships for the multi-language support feature. All models are designed to be language-agnostic at the core, with translations stored separately and loaded based on user preference.

---

## Core Entities

### 1. Locale

**Description**: Represents a supported language in the application.

**Attributes**:

- `code`: Language code (ISO 639-1), e.g., 'en', 'th', 'zh', 'hi', 'es', 'fr', 'ar'
- `name`: Native language name, e.g., "English", "ไทย", "中文"
- `direction`: Text direction, either 'ltr' (left-to-right) or 'rtl' (right-to-left)
- `nativeName`: Language name in its own script

**Valid Values**:

```typescript
type LocaleCode = 'en' | 'th' | 'zh' | 'hi' | 'es' | 'fr' | 'ar';

const SUPPORTED_LOCALES: Locale[] = [
  { code: 'en', name: 'English', direction: 'ltr', nativeName: 'English' },
  { code: 'th', name: 'Thai', direction: 'ltr', nativeName: 'ไทย' },
  { code: 'zh', name: 'Chinese', direction: 'ltr', nativeName: '中文' },
  { code: 'hi', name: 'Hindi', direction: 'ltr', nativeName: 'हिंदी' },
  { code: 'es', name: 'Spanish', direction: 'ltr', nativeName: 'Español' },
  { code: 'fr', name: 'French', direction: 'ltr', nativeName: 'Français' },
  { code: 'ar', name: 'Arabic', direction: 'rtl', nativeName: 'العربية' },
];
```

**Validation Rules**:

- `code` must be exactly 2 lowercase letters
- `code` must be one of the 7 supported locales
- `direction` must be either 'ltr' or 'rtl'

---

### 2. TranslationNamespace

**Description**: Logical grouping of related translation strings for organizational and performance purposes.

**Namespaces**:

- `common`: UI elements, buttons, labels, navigation (pre-loaded)
- `locations`: Location names for all 84 locations (lazy-loaded)
- `roles`: Role names organized by location (lazy-loaded)
- `errors`: Error messages and validation text (lazy-loaded)
- `gameplay`: Game-specific instructions and messages (lazy-loaded)

**Structure**:

```typescript
type NamespaceKey = 'common' | 'locations' | 'roles' | 'errors' | 'gameplay';

interface TranslationNamespace {
  key: NamespaceKey;
  loadStrategy: 'preload' | 'lazy';
  estimatedSize: number; // bytes
}
```

---

### 3. TranslationKey

**Description**: A unique identifier for a translatable string, following dot-notation namespacing.

**Format**: `namespace.category.identifier`

**Examples**:

- `common.button.createRoom` - "Create Room" button
- `common.button.joinRoom` - "Join Room" button
- `location.loc-hospital.name` - Hospital location name
- `role.loc-hospital.0` - First role at hospital (Doctor)
- `errors.room.notFound` - Room not found error
- `gameplay.spy.instruction` - Spy role instructions

**Validation Rules**:

- Must start with valid namespace key
- Must use dot notation (`.` separator)
- Must be kebab-case or camelCase after namespace
- Maximum length: 100 characters

---

### 4. Translation

**Description**: The actual translated text value for a given key in a specific locale.

**Attributes**:

- `key`: TranslationKey (unique identifier)
- `value`: Translated string
- `locale`: LocaleCode (which language this translation is for)
- `parameters`: Optional array of parameter names for interpolation

**Structure**:

```typescript
interface Translation {
  key: string;
  value: string;
  locale: LocaleCode;
  parameters?: string[]; // e.g., ['playerName', 'count']
}

// Example with parameters:
{
  key: 'gameplay.playerJoined',
  value: '{playerName} has joined the room',
  locale: 'en',
  parameters: ['playerName']
}
```

**Validation Rules**:

- `value` cannot be empty string
- If `parameters` specified, `value` must contain all parameters in `{paramName}` format
- Maximum length: 500 characters (to prevent excessively long translations)

---

### 5. LocationTranslation

**Description**: Translated name for a game location, linked to location ID from `locations.json`.

**Attributes**:

- `locationId`: ID from locations.json (e.g., 'loc-hospital')
- `name`: Translated location name
- `locale`: LocaleCode

**Structure**:

```typescript
interface LocationTranslation {
  locationId: string;
  name: string;
  locale: LocaleCode;
}

// Stored in locales/{locale}/locations.json:
{
  "loc-hospital": {
    "name": "Hospital"
  },
  "loc-school": {
    "name": "School"
  }
  // ... 84 locations
}
```

**Validation Rules**:

- `locationId` must match an existing location in `data/locations.json`
- `name` cannot be empty
- Maximum length: 100 characters

**Relationships**:

- References: `Location` (from data/locations.json)
- One location has exactly 7 translations (one per supported locale)

---

### 6. RoleTranslation

**Description**: Translated names for the 7 roles at each location.

**Attributes**:

- `locationId`: ID from locations.json
- `roles`: Array of 7 translated role names (indexed 0-6)
- `locale`: LocaleCode

**Structure**:

```typescript
interface RoleTranslation {
  locationId: string;
  roles: [string, string, string, string, string, string, string];
  locale: LocaleCode;
}

// Stored in locales/{locale}/roles.json:
{
  "loc-hospital": {
    "roles": [
      "Doctor",
      "Nurse",
      "Patient",
      "Visitor",
      "Pharmacist",
      "Security Guard",
      "Receptionist"
    ]
  }
  // ... 84 locations
}
```

**Validation Rules**:

- `locationId` must match an existing location
- `roles` array must have exactly 7 elements
- Each role name cannot be empty
- Maximum length per role: 50 characters
- Role order must match the order in `data/locations.json` for the Thai names

**Relationships**:

- References: `Location` (from data/locations.json)
- Each location has exactly 7 roles × 7 locales = 49 role translations

---

### 7. UserLanguagePreference

**Description**: Stores the user's selected language preference.

**Attributes**:

- `locale`: LocaleCode (user's selected language)
- `source`: How the preference was determined
- `timestamp`: When preference was last updated

**Structure**:

```typescript
interface UserLanguagePreference {
  locale: LocaleCode;
  source: 'user-selected' | 'browser-detected' | 'default';
  timestamp: number; // Unix timestamp
}

// Stored in localStorage as:
{
  "cf-boardgames-locale": {
    "locale": "en",
    "source": "user-selected",
    "timestamp": 1698624000000
  }
}
```

**State Transitions**:

```
Initial state: null (no preference stored)
  ↓
Browser detection → source: 'browser-detected'
  ↓
User selects language → source: 'user-selected'
  ↓
User changes language → update locale, timestamp
```

**Validation Rules**:

- `locale` must be one of the 7 supported locales
- `source` must be one of the three valid values
- `timestamp` must be valid Unix timestamp

**Storage**:

- Primary: Browser localStorage (key: `cf-boardgames-locale`)
- Secondary: Next.js cookie (key: `NEXT_LOCALE`)

---

## Data Relationships

```
SUPPORTED_LOCALES (7 locales)
    ↓
    ├─→ LocationTranslation (84 locations × 7 locales = 588 translations)
    ├─→ RoleTranslation (84 locations × 7 roles × 7 locales = 4,116 translations)
    └─→ Translation (UI strings: ~200 × 7 locales = ~1,400 translations)

Location (data/locations.json)
    ├─→ LocationTranslation (one per locale)
    └─→ RoleTranslation (one per locale, contains 7 role names)

UserLanguagePreference
    ├─→ localStorage (persistent storage)
    └─→ NEXT_LOCALE cookie (server-side detection)
```

---

## File Structure & Formats

### Translation Files Structure

```
locales/
├── en/
│   ├── common.json          # ~5KB (pre-loaded)
│   ├── locations.json       # ~3KB (lazy-loaded)
│   ├── roles.json           # ~10KB (lazy-loaded)
│   ├── errors.json          # ~2KB (lazy-loaded)
│   └── gameplay.json        # ~4KB (lazy-loaded)
├── th/
│   └── [same structure]
├── zh/
│   └── [same structure]
├── hi/
│   └── [same structure]
├── es/
│   └── [same structure]
├── fr/
│   └── [same structure]
└── ar/
    └── [same structure]

Total size: ~24KB × 7 locales = ~168KB
```

### File Format: common.json

```json
{
  "button": {
    "createRoom": "Create Room",
    "joinRoom": "Join Room",
    "startGame": "Start Game",
    "leaveRoom": "Leave Room",
    "copyCode": "Copy Code",
    "share": "Share"
  },
  "label": {
    "roomCode": "Room Code",
    "playerName": "Player Name",
    "difficulty": "Difficulty",
    "timer": "Timer",
    "players": "Players"
  },
  "heading": {
    "welcome": "Welcome to Spyfall",
    "lobby": "Game Lobby",
    "gameplay": "Gameplay",
    "results": "Game Results"
  },
  "message": {
    "roomCreated": "Room created successfully",
    "playerJoined": "{playerName} has joined",
    "gameStarting": "Game starting in {seconds} seconds",
    "copied": "Copied to clipboard"
  }
}
```

### File Format: locations.json

```json
{
  "loc-hospital": {
    "name": "Hospital"
  },
  "loc-school": {
    "name": "School"
  },
  "loc-bank": {
    "name": "Bank"
  }
  // ... 84 total locations
}
```

### File Format: roles.json

```json
{
  "loc-hospital": {
    "roles": [
      "Doctor",
      "Nurse",
      "Patient",
      "Visitor",
      "Pharmacist",
      "Security Guard",
      "Receptionist"
    ]
  },
  "loc-school": {
    "roles": [
      "Teacher",
      "Student",
      "Principal",
      "Janitor",
      "Security Guard",
      "Parent",
      "PE Teacher"
    ]
  }
  // ... 84 total locations
}
```

---

## TypeScript Interfaces

### Complete Type Definitions

```typescript
// lib/i18n/types.ts

export type LocaleCode = 'en' | 'th' | 'zh' | 'hi' | 'es' | 'fr' | 'ar';
export type TextDirection = 'ltr' | 'rtl';
export type NamespaceKey = 'common' | 'locations' | 'roles' | 'errors' | 'gameplay';
export type PreferenceSource = 'user-selected' | 'browser-detected' | 'default';

export interface Locale {
  code: LocaleCode;
  name: string;
  direction: TextDirection;
  nativeName: string;
}

export interface TranslationNamespace {
  key: NamespaceKey;
  loadStrategy: 'preload' | 'lazy';
  estimatedSize: number;
}

export interface Translation {
  key: string;
  value: string;
  locale: LocaleCode;
  parameters?: string[];
}

export interface LocationTranslation {
  locationId: string;
  name: string;
  locale: LocaleCode;
}

export interface RoleTranslation {
  locationId: string;
  roles: [string, string, string, string, string, string, string];
  locale: LocaleCode;
}

export interface UserLanguagePreference {
  locale: LocaleCode;
  source: PreferenceSource;
  timestamp: number;
}

// Translation file structures (JSON schemas)
export interface CommonTranslations {
  button: Record<string, string>;
  label: Record<string, string>;
  heading: Record<string, string>;
  message: Record<string, string>;
}

export interface LocationsTranslations {
  [locationId: string]: {
    name: string;
  };
}

export interface RolesTranslations {
  [locationId: string]: {
    roles: [string, string, string, string, string, string, string];
  };
}

export interface ErrorsTranslations {
  room: Record<string, string>;
  player: Record<string, string>;
  game: Record<string, string>;
  network: Record<string, string>;
}

export interface GameplayTranslations {
  spy: Record<string, string>;
  nonSpy: Record<string, string>;
  voting: Record<string, string>;
  results: Record<string, string>;
}
```

---

## Data Validation Rules

### Validation at Runtime

```typescript
// Validate locale code
function isValidLocale(code: string): code is LocaleCode {
  return ['en', 'th', 'zh', 'hi', 'es', 'fr', 'ar'].includes(code);
}

// Validate translation key format
function isValidTranslationKey(key: string): boolean {
  const pattern = /^[a-z]+\.[a-z][a-zA-Z0-9-_]*(\.[a-z][a-zA-Z0-9-_]*)*$/;
  return pattern.test(key) && key.length <= 100;
}

// Validate location translation
function validateLocationTranslation(translation: LocationTranslation): boolean {
  return (
    translation.name.length > 0 &&
    translation.name.length <= 100 &&
    isValidLocale(translation.locale)
  );
}

// Validate role translation
function validateRoleTranslation(translation: RoleTranslation): boolean {
  return (
    translation.roles.length === 7 &&
    translation.roles.every((role) => role.length > 0 && role.length <= 50) &&
    isValidLocale(translation.locale)
  );
}
```

---

## Migration from Current Data

### Current State

```json
// data/locations.json (current)
{
  "id": "loc-hospital",
  "nameTh": "โรงพยาบาล",
  "difficulty": "medium",
  "roles": ["หมอ", "พยาบาล", ...],
  "imageUrl": "..."
}
```

### Migration Strategy

1. **Keep existing structure** in `data/locations.json` (source of truth)
2. **Extract Thai translations** to `locales/th/locations.json` and `locales/th/roles.json`
3. **Add translation files** for 6 new languages
4. **Components use translations** by looking up location ID

**No breaking changes** - existing location data remains unchanged.

---

## Performance Considerations

### Memory Usage

```
Pre-loaded (common.json): 5KB × 7 = 35KB
Lazy-loaded (locations + roles): 13KB × 7 = 91KB
Total in memory after game start: ~130KB

Per translation lookup: O(1) hash map access
```

### Load Time Targets

- Initial load (common): <50ms
- Lazy load (locations + roles): <200ms
- Language switch: <2 seconds (includes re-render)

---

## Extensibility

### Adding New Languages

1. Add locale to `SUPPORTED_LOCALES` array
2. Create `locales/{new-locale}/` directory
3. Copy all JSON files from `locales/en/`
4. Translate all strings
5. Update TypeScript `LocaleCode` type

### Adding New Translation Keys

1. Add key-value to `locales/en/{namespace}.json`
2. Add corresponding translations to all other locales
3. TypeScript types auto-update on next build
4. Use new key in components via `t('namespace.key')`

---

## Summary

This data model provides:

- ✅ Language-agnostic core (location/role IDs remain unchanged)
- ✅ Declarative translation files (pure JSON data)
- ✅ Type-safe access (TypeScript interfaces)
- ✅ Performance-optimized (lazy-loading strategy)
- ✅ Easy maintenance (clear file organization)
- ✅ Extensible (straightforward to add languages or keys)

All validation rules ensure data integrity, and the structure aligns with the constitution's principles of simplicity and declarative style.
