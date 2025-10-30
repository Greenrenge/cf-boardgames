# Implementation Plan: Location API Customization

**Branch**: `005-location-api-customization` | **Date**: October 30, 2025 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/005-location-api-customization/spec.md`

## Summary

Migrate location and role data from static translation files to a centralized API, enabling user customization of locations and roles before game start. Users can select/deselect specific locations and roles, with selections persisted in local storage. The system supports exporting and importing configurations, with intelligent merging of API and local storage data where local storage overrides API for matching IDs.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+  
**Primary Dependencies**: Next.js 14.2, React 18.3, existing i18n setup (next-intl), Tailwind CSS 3.4  
**Storage**: Browser localStorage for user selections (indefinite persistence), 24-hour cache for API responses  
**Testing**: Manual validation via playground/demo (per constitution)  
**Target Platform**: Web browsers (modern evergreen browsers with ES2020+ support)  
**Project Type**: Web application (Next.js frontend + Cloudflare Workers backend with API endpoint)  
**Performance Goals**: <3 seconds API fetch time, <100ms merge operation, smooth UI with skeleton loading  
**Constraints**: Public read-only API (no authentication), 80-120 locations expected, no pagination needed  
**Scale/Scope**: 80-120 locations × 7 languages × 7 roles per location = ~4,200 role translations via API

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Do Less, Get Works**: Uses existing Next.js API routes (no new backend framework), localStorage API (no database), JSON export/import (no complex serialization), simple merge logic (no CRDT or conflict resolution algorithms)
- [x] **Playground Over Tests**: Plan includes interactive demos for: API integration, location customization UI, persistence, export/import, merge behavior
- [x] **Declarative Style**: Location data is pure JSON from API, merge logic is functional transformations, React hooks for data access, configuration-driven UI components
- [x] **Consistent Code Style**: Will use existing Prettier configuration, follow established Next.js patterns from codebase
- [x] **Readability First**: Clear entity names (Location, LocationSelection), straightforward merge algorithm, explicit caching logic, no clever tricks

**Constitution Check Status**: ✅ PASSED - All principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/005-location-api-customization/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - API design, caching strategies
├── data-model.md        # Phase 1 output - location entities and relationships
├── quickstart.md        # Phase 1 output - how to use location API and customize
├── contracts/           # Phase 1 output - API schemas
│   ├── location-api-response.json    # OpenAPI schema for GET /api/locations
│   └── export-config-schema.json     # JSON schema for export file format
└── playground/          # Working demos
    └── story1/
        └── README.md    # Demo: API integration with caching
    └── story2/
        └── README.md    # Demo: location/role customization UI
    └── story3/
        └── README.md    # Demo: host persistence
    └── story4/
        └── README.md    # Demo: non-host saving
    └── story5/
        └── README.md    # Demo: merge strategy
    └── story6/
        └── README.md    # Demo: export/import
```

### Source Code (repository root)

```text
# Web application structure (Next.js frontend + Workers backend)

# API Layer (new)
app/api/locations/
├── route.ts             # NEW: GET /api/locations - returns all location data with translations

# Frontend Components (new/modified)
components/
├── game/
│   ├── LocationImage.tsx           # MODIFIED: Use API data instead of static files
│   ├── LocationReference.tsx       # MODIFIED: Use API data
│   └── SpyLocationBrowser.tsx      # MODIFIED: Use API data
├── room/
│   ├── Lobby.tsx                   # MODIFIED: Add location customization UI
│   └── LocationCustomizer.tsx      # NEW: UI for selecting/deselecting locations/roles
├── location/                        # NEW: Location management components
│   ├── LocationList.tsx            # Display available locations with checkboxes
│   ├── LocationItem.tsx            # Individual location with role expansion
│   ├── RoleSelector.tsx            # Role checkboxes within location
│   ├── ExportButton.tsx            # Export configuration to JSON file
│   ├── ImportButton.tsx            # Import configuration from JSON file
│   └── ConfigMergeDialog.tsx       # Dialog for merge vs replace on import

# Data Layer (new/modified)
lib/
├── api/                             # NEW: API client layer
│   ├── locationsApi.ts             # Fetch locations from API with caching
│   └── apiCache.ts                 # 24-hour cache implementation
├── locations.ts                     # MODIFIED: Replace static import with API fetch
├── locationStorage.ts               # NEW: localStorage operations for selections
├── locationMerge.ts                 # NEW: Merge API + localStorage logic
├── exportImport.ts                  # NEW: Export/import configuration logic
└── types.ts                         # MODIFIED: Add Location, LocationSelection types

# Hooks (new)
lib/hooks/
├── useLocations.ts                  # NEW: Hook to fetch and merge location data
├── useLocationSelection.ts          # NEW: Hook to manage user selections
└── useLocationPersistence.ts        # NEW: Hook for localStorage sync

# Remove old translation files
locales/
├── en/
│   ├── locations.json               # DELETE: Replaced by API
│   └── roles.json                   # DELETE: Replaced by API
├── th/
│   ├── locations.json               # DELETE
│   └── roles.json                   # DELETE
└── [similar for zh, hi, es, fr, ar] # DELETE all location/role translation files

# Data migration
data/
├── locations.json                   # MODIFIED: Add role translations, prepare for API
└── migration/                       # NEW: Scripts to prepare API data
    └── prepare-api-data.ts          # Convert current data structure for API

# Backend (Cloudflare Workers)
workers/src/
├── locations/                       # NEW: Location API implementation
│   ├── handler.ts                  # Location API route handler
│   └── data.ts                     # Location data source (static JSON for now)
```

## Phase 0: Outline & Research

### Unknowns from Technical Context

Based on the specification and clarifications, the following areas need research:

1. **API Response Structure**: Exact JSON schema for location data including all translations
2. **Caching Implementation**: Best practices for 24-hour cache in browser (localStorage vs IndexedDB vs Cache API)
3. **Merge Algorithm**: Efficient approach to merge API and localStorage data without duplicates
4. **Export File Format**: JSON structure for configuration export that's both human-readable and version-safe
5. **UI Patterns**: Best practices for collapsible location lists with role checkboxes (performance with 80-120 items)
6. **localStorage Quota**: Strategies to handle quota exceeded errors gracefully
7. **Skeleton UI**: Modern loading patterns with React Suspense or manual loading states

### Research Tasks

#### 1. API Design & Response Format

**Objective**: Define the optimal structure for location API response

**Questions**:

- How should translations be nested? (flat vs nested by locale)
- Should role data be embedded in locations or separate endpoint?
- What metadata is needed? (version, timestamp, etag for caching)
- How to structure for efficient client-side merging?

**Approach**:

- Review existing location data structure in `data/locations.json`
- Research REST API best practices for i18n data
- Evaluate flat vs nested translation structures
- Consider client-side filtering and merging performance

#### 2. Browser Caching Strategy

**Objective**: Implement 24-hour cache that survives page reloads

**Questions**:

- localStorage vs IndexedDB vs Cache API for API response caching?
- How to store timestamps for expiration?
- How to invalidate cache on-demand?
- How to handle cache versioning?

**Approach**:

- Compare storage APIs (size limits, performance, browser support)
- Research cache invalidation patterns
- Evaluate cache-control headers vs client-side expiration

#### 3. Merge Algorithm Design

**Objective**: Create efficient, predictable merge logic

**Questions**:

- How to identify matching locations by ID?
- What fields should localStorage override vs API?
- How to handle removed locations (keep vs discard)?
- How to avoid duplicate processing on every render?

**Approach**:

- Define merge priority rules clearly
- Create pseudo-code for merge algorithm
- Identify edge cases (null fields, missing IDs, type mismatches)
- Consider using functional programming patterns (map, reduce, filter)

#### 4. Export/Import File Format

**Objective**: Define JSON schema for configuration files

**Questions**:

- Should export include full location data or just selections?
- How to handle versioning for forward/backward compatibility?
- What validation is needed on import?
- How to make files human-readable for debugging?

**Approach**:

- Review JSON schema standards
- Design minimal format (IDs + selections only)
- Add metadata fields (version, timestamp, app identifier)
- Research JSON validation libraries (Zod, Yup, AJV)

#### 5. UI Performance with Large Lists

**Objective**: Ensure smooth UX with 80-120 location items

**Questions**:

- Is virtualization needed for 100 items?
- How to handle expanding/collapsing roles efficiently?
- Should "select all" / "deselect all" be debounced?
- How to show loading states without blocking UI?

**Approach**:

- Research React virtualization libraries (react-window, react-virtualized)
- Review Tailwind CSS patterns for lists
- Evaluate whether plain scrolling is sufficient (likely yes for 100 items)
- Design skeleton UI for loading states

#### 6. localStorage Error Handling

**Objective**: Handle quota exceeded and privacy mode gracefully

**Questions**:

- What's the typical size of selection data?
- How to detect when quota is exceeded?
- What fallback behavior if localStorage unavailable?
- How to communicate errors to users?

**Approach**:

- Calculate approximate size of selection data
- Research localStorage quota limits by browser
- Test in private/incognito mode
- Design user-friendly error messages

#### 7. Skeleton UI Patterns

**Objective**: Implement non-blocking loading indicators

**Questions**:

- Should we use React Suspense or manual loading states?
- What should skeleton UI look like for location list?
- How to transition from skeleton to real content smoothly?
- Should skeleton match exact layout or be generic?

**Approach**:

- Review modern skeleton UI libraries (react-loading-skeleton)
- Evaluate Next.js built-in loading.tsx pattern
- Design skeleton components that match location list layout
- Ensure smooth transitions with CSS animations

**Output**: research.md with all decisions, rationales, and chosen approaches

## Phase 1: Design & Contracts

### Prerequisites

- ✅ research.md complete with all technical decisions

### Entity Extraction from Spec

From the specification, the following entities need detailed modeling:

1. **Location** (from API response)
2. **Role** (from API response, nested in Location)
3. **Location Selection** (user preferences)
4. **Local Storage Config** (persistent selections)
5. **API Response** (wrapper with metadata)
6. **Merged Location List** (runtime combination)
7. **Export Configuration** (file format)

### API Contracts

#### Endpoint: GET /api/locations

**Purpose**: Return all location data with translations for all supported languages

**Response Schema** (OpenAPI 3.0):

```yaml
/api/locations:
  get:
    summary: Get all locations with translations
    responses:
      200:
        description: Successful response
        content:
          application/json:
            schema:
              type: object
              properties:
                version:
                  type: string
                  description: API version for compatibility
                timestamp:
                  type: string
                  format: date-time
                locations:
                  type: array
                  items:
                    $ref: '#/components/schemas/Location'
      500:
        description: Server error
```

**Location Schema**:

```yaml
Location:
  type: object
  required: [id, names, roles]
  properties:
    id:
      type: string
      description: Unique location identifier
    names:
      type: object
      description: Location names by locale
      properties:
        en: { type: string }
        th: { type: string }
        zh: { type: string }
        hi: { type: string }
        es: { type: string }
        fr: { type: string }
        ar: { type: string }
    roles:
      type: array
      items:
        $ref: '#/components/schemas/Role'
```

**Role Schema**:

```yaml
Role:
  type: object
  required: [id, names]
  properties:
    id:
      type: string
      description: Unique role identifier within location
    names:
      type: object
      description: Role names by locale
      properties:
        en: { type: string }
        th: { type: string }
        zh: { type: string }
        hi: { type: string }
        es: { type: string }
        fr: { type: string }
        ar: { type: string }
```

#### Export Configuration File Schema

**Purpose**: JSON file format for exporting/importing user selections

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Location Configuration Export",
  "type": "object",
  "required": ["version", "timestamp", "selections"],
  "properties": {
    "version": {
      "type": "string",
      "description": "Configuration format version",
      "pattern": "^\\d+\\.\\d+\\.\\d+$"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "When configuration was exported"
    },
    "appIdentifier": {
      "type": "string",
      "const": "cf-boardgames-spyfall",
      "description": "Prevents importing configs from other apps"
    },
    "selections": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["locationId", "isSelected"],
        "properties": {
          "locationId": {
            "type": "string"
          },
          "isSelected": {
            "type": "boolean"
          },
          "selectedRoles": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Optional: if omitted, all roles selected"
          }
        }
      }
    }
  }
}
```

### Data Model Output

Will generate `data-model.md` with:

- Detailed entity definitions
- TypeScript interfaces
- Validation rules
- State transition diagrams (if needed)
- Relationship diagrams

### Quickstart Output

Will generate `quickstart.md` with:

- How to fetch locations from API
- How to customize location selections in UI
- How to export/import configurations
- How to add new locations to API
- Common troubleshooting scenarios

### Agent Context Update

After Phase 1 completion:

- Run `.specify/scripts/bash/update-agent-context.sh copilot` (if exists)
- Or manually update `.github/copilot-instructions.md`
- Add new dependencies: (none expected, using existing Next.js/React)
- Add new patterns: location API usage, merge logic, export/import

**Output**: data-model.md, contracts/, quickstart.md, updated agent context

## Phase 2: Task Breakdown

_Phase 2 is not covered by the `/speckit.plan` command. Task breakdown will be handled by `/speckit.tasks` after this plan is reviewed and approved._

## Notes

### Migration Strategy

Existing code references static translation files (`locales/{lang}/locations.json`, `locales/{lang}/roles.json`). These need to be:

1. Consolidated into API data structure
2. API endpoint created to serve consolidated data
3. Frontend code updated to fetch from API instead of import
4. Old translation files deleted
5. Verify no broken imports remain

### Caching Implementation Details

The 24-hour cache needs to:

- Store full API response in localStorage (not just data, but timestamp too)
- Check cache age on every fetch attempt
- Fall back to cache if API fails AND cache is < 24 hours old
- Show error if API fails AND (no cache OR cache > 24 hours old)
- Allow manual cache invalidation via "Reset to Default" button

### localStorage Structure

Recommended structure:

```typescript
{
  "location-api-cache": {
    "data": {...},      // Full API response
    "timestamp": "...",  // ISO timestamp
    "version": "1.0.0"  // For future migrations
  },
  "location-selections": {
    "selections": [...], // Array of LocationSelection
    "lastUpdated": "..." // ISO timestamp
  }
}
```

### Performance Considerations

- 80-120 locations × 7 roles = 560-840 checkboxes max
- No virtualization needed for this scale
- Use React.memo for LocationItem components
- Debounce "select all" operations if needed
- Skeleton UI prevents perceived slowness during load

### Security Considerations

- API is public read-only (no auth needed)
- Validate imported JSON against schema before applying
- Sanitize location/role names before rendering (XSS prevention)
- No user-generated content in exports (just IDs and booleans)
