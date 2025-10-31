# Tasks: Location API Customization

**Input**: Design documents from `/specs/005-location-api-customization/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Playgrounds**: Tasks include playground/demo creation to validate each user story works. Tests are optional (per constitution).

**Organization**: Tasks are grouped by user story to enable independent implementation and demonstration of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Review existing codebase structure in app/, components/, lib/ directories
- [x] T002 Verify existing dependencies (Next.js 14.2, React 18.3, next-intl, Tailwind CSS 3.4)
- [x] T003 Create feature branch 005-location-api-customization (if not already created)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Type Definitions & Data Structures

- [x] T004 [P] Create Location, Role, and LocalizedNames interfaces in lib/types.ts
- [x] T005 [P] Create APIResponse interface with version and timestamp in lib/types.ts
- [x] T006 [P] Create LocationSelection interface for user preferences in lib/types.ts
- [x] T007 [P] Create LocalStorageConfig interface for persistent data in lib/types.ts
- [x] T008 [P] Create CacheEntry interface with expiration logic in lib/types.ts
- [x] T009 [P] Create ExportConfig interface for import/export functionality in lib/types.ts

### Data Preparation & Migration

- [x] T010 Audit existing location data in data/locations.json for API compatibility
- [x] T011 Create migration script in data/migration/prepare-api-data.ts to transform data for API format
- [x] T012 Run migration script to generate API-ready location data with all translations
- [x] T013 Verify migrated data includes all 7 language translations (en, th, zh, hi, es, fr, ar)

### Backend API Implementation (Cloudflare Workers)

- [x] T014 Create location data source file in workers/src/locations/data.ts with migrated JSON
- [x] T015 Create location API handler in workers/src/locations/handler.ts with GET endpoint
- [x] T016 Implement APIResponse structure (version, timestamp, locations) in handler
- [ ] T017 Add response validation using Zod schema in handler
- [ ] T018 Deploy Workers endpoint and verify /api/locations returns valid JSON
- [ ] T019 Test API endpoint with curl/Postman to verify all translations are present

### Frontend API Client Layer

- [x] T020 Create API cache utility in lib/api/apiCache.ts with 24-hour expiration logic
- [x] T021 Create locations API client in lib/api/locationsApi.ts with fetch and caching
- [x] T022 Implement cache validation with timestamp checking in apiCache.ts
- [x] T023 Add error handling for API failures with fallback to cache in locationsApi.ts

**Checkpoint**: Foundation ready - API endpoint working, types defined, cache layer implemented. User story implementation can now begin.

---

## Phase 3: User Story 1 - API as Single Source of Truth (Priority: P1) 🎯 MVP

**Goal**: Fetch all location data including translations from API, eliminating separate translation files. Display skeleton UI during loading.

**Independent Test**: Start application, verify API call is made, check that locations display with translations in all languages, confirm old translation files are not used.

### Playground for User Story 1 (MANDATORY) ✓

- [x] T024 [US1] Create playground directory specs/005-location-api-customization/playground/story1/
- [x] T025 [US1] Create README.md in playground/story1/ documenting API integration demo
- [ ] T026 [US1] Add demo page or component showing API fetch with network inspector

### Implementation for User Story 1

- [x] T027 [US1] Create useLocations hook in lib/hooks/useLocations.ts to fetch from API
- [x] T028 [US1] Implement skeleton loading component in components/location/LocationSkeleton.tsx
- [x] T029 [US1] Modify lib/locations.ts to use API fetch instead of static imports
- [x] T030 [US1] Update LocationImage component in components/game/LocationImage.tsx to use API data
- [x] T031 [US1] Update LocationReference component in components/game/LocationReference.tsx to use API data
- [x] T032 [US1] Update SpyLocationBrowser component in components/game/SpyLocationBrowser.tsx to use API data
- [x] T033 [US1] Add error handling UI component in components/location/LocationLoadError.tsx
- [x] T034 [US1] Implement cache status display (shows cache age, expiry time) for debugging
- [x] T035 [US1] Test API fetch in all supported languages (en, th, zh, hi, es, fr, ar)
- [x] T036 [US1] Remove old translation files: locales/en/locations.json and locales/en/roles.json
- [x] T037 [US1] Remove old translation files: locales/th/locations.json and locales/th/roles.json
- [x] T038 [US1] Remove old translation files: locales/zh/locations.json and locales/zh/roles.json
- [x] T039 [US1] Remove old translation files: locales/hi/locations.json and locales/hi/roles.json
- [x] T040 [US1] Remove old translation files: locales/es/locations.json and locales/es/roles.json
- [x] T041 [US1] Remove old translation files: locales/fr/locations.json and locales/fr/roles.json
- [x] T042 [US1] Remove old translation files: locales/ar/locations.json and locales/ar/roles.json
- [x] T043 [US1] Search codebase for any remaining imports of deleted translation files and remove them
- [x] T044 [US1] Verify playground demo shows working API integration with skeleton UI

**Checkpoint**: At this point, User Story 1 playground should demonstrate API fetch, caching, skeleton loading, and removal of old translation files.

---

## Phase 4: User Story 5 - Local Storage and API Merge Strategy (Priority: P1)

**Goal**: Implement intelligent merge logic where localStorage overrides API data for matching IDs, new API locations are added, and custom locations are preserved.

**Independent Test**: Manually set location data in localStorage, fetch API data, verify merge behavior: matching IDs use localStorage values, new API locations are added, removed locations remain.

**Note**: This story is implemented before US2 because the merge logic is needed for the customization UI to work correctly.

### Playground for User Story 5 (MANDATORY) ✓

- [x] T045 [US5] Create playground directory specs/005-location-api-customization/playground/story5/
- [x] T046 [US5] Create README.md in playground/story5/ with merge test scenarios
- [x] T047 [US5] Create demo page showing merge behavior with localStorage inspector

### Implementation for User Story 5

- [x] T048 [P] [US5] Create locationStorage utility in lib/locationStorage.ts for localStorage operations
- [x] T049 [US5] Implement getLocationSelections function in lib/locationStorage.ts
- [x] T050 [US5] Implement saveLocationSelections function in lib/locationStorage.ts
- [x] T051 [US5] Create merge utility in lib/locationMerge.ts for combining API and localStorage data
- [x] T052 [US5] Implement mergeLocations function with ID matching logic in lib/locationMerge.ts
- [x] T053 [US5] Add logic to apply isSelected from localStorage to API locations in merge function
- [x] T054 [US5] Add logic to apply role selections from localStorage to API roles in merge function
- [x] T055 [US5] Handle new API locations (not in localStorage) - default to selected
- [x] T056 [US5] Handle custom locations (in localStorage but not in API) - preserve them
- [x] T057 [US5] Update useLocations hook to call merge logic after API fetch
- [x] T058 [US5] Add validation to ensure no duplicate location IDs after merge
- [x] T059 [US5] Test merge with various scenarios in playground (override, new, removed)
- [x] T060 [US5] Verify playground demo shows correct merge behavior

**Checkpoint**: At this point, merge logic is working - localStorage overrides API, new locations are added, custom locations preserved.

---

## Phase 5: User Story 2 - Location and Role Customization (Priority: P1)

**Goal**: Provide UI for users to select/deselect locations and roles before starting a game. Prevent game start with no locations selected.

**Independent Test**: Navigate to game setup, view default selections, uncheck locations/roles, start game to verify only selected items are used, try starting with no locations (should show error).

### Playground for User Story 2 (MANDATORY) ✓

- [x] T061 [US2] Create playground directory specs/005-location-api-customization/playground/story2/
- [x] T062 [US2] Create README.md in playground/story2/ with customization UI demo instructions
- [x] T063 [US2] Create demo showing location/role selection UI with live preview

### Implementation for User Story 2

- [x] T064 [P] [US2] Create LocationList component in components/location/LocationList.tsx
- [x] T065 [P] [US2] Create LocationItem component in components/location/LocationItem.tsx with expand/collapse
- [x] T066 [P] [US2] Create RoleSelector component in components/location/RoleSelector.tsx with checkboxes
- [x] T067 [US2] Create useLocationSelection hook in lib/hooks/useLocationSelection.ts
- [x] T068 [US2] Implement toggleLocationSelection function in lib/locationStorage.ts
- [x] T069 [US2] Implement toggleRoleSelection function in lib/locationStorage.ts
- [x] T070 [US2] Add "Select All" / "Deselect All" buttons to LocationList component
- [x] T071 [US2] Add "Reset to Default" button that clears localStorage and reloads from API
- [x] T072 [US2] Add location count display (e.g., "45 of 80 locations selected")
- [x] T073 [US2] Modify Lobby component in components/room/Lobby.tsx to integrate LocationList
- [x] T074 [US2] Add validation to prevent game start when no locations are selected
- [x] T075 [US2] Create validation error component in components/location/SelectionValidationError.tsx
- [x] T076 [US2] Implement game start logic to use only selected locations and roles
- [x] T077 [US2] Add smooth expand/collapse animation with Tailwind CSS
- [x] T078 [US2] Optimize list rendering with React.memo for LocationItem components
- [x] T079 [US2] Test customization UI with 80-120 locations for performance
- [x] T080 [US2] Verify playground demo shows working customization UI with validation

**Checkpoint**: At this point, users can customize location/role selections, changes are validated, only selected items are used in gameplay.

---

## Phase 6: User Story 3 - Host Location Selection Persistence (Priority: P2)

**Goal**: Save host's location selections to localStorage automatically when game starts, and restore them when creating a new room.

**Independent Test**: Create room as host, customize selections, start game, close browser, reopen and create new room, verify previous selections are pre-applied.

### Playground for User Story 3 (MANDATORY) ✓

- [x] T081 [US3] Create playground directory specs/005-location-api-customization/playground/story3/
- [x] T082 [US3] Create README.md in playground/story3/ with persistence demo instructions
- [x] T083 [US3] Create demo showing host persistence across browser sessions

### Implementation for User Story 3

- [x] T084 [US3] Add auto-save trigger when host starts game in components/room/Lobby.tsx
- [x] T085 [US3] Implement saveHostSelections function in lib/locationStorage.ts
- [x] T086 [US3] Add timestamp to saved selections for debugging/audit trail
- [x] T087 [US3] Update Lobby component to load saved selections on mount
- [x] T088 [US3] Add visual indicator showing "Using your saved selections" message
- [x] T089 [US3] Test persistence across browser restarts
- [x] T090 [US3] Verify playground demo shows host persistence working

**Checkpoint**: At this point, host selections persist across sessions and are automatically restored.

---

## Phase 7: User Story 4 - Non-Host Location Selection Saving (Priority: P2)

**Goal**: Allow non-host players to view host's selections and save them to their own localStorage for future use.

**Independent Test**: Join room as non-host, view host's selections, save them, create new room as host, verify saved selections are applied.

### Playground for User Story 4 (MANDATORY) ✓

- [ ] T091 [US4] Create playground directory specs/005-location-api-customization/playground/story4/
- [ ] T092 [US4] Create README.md in playground/story4/ with non-host saving demo
- [ ] T093 [US4] Create demo with two browser windows (host and non-host)

### Implementation for User Story 4

- [ ] T094 [US4] Add "Save These Selections" button in Lobby component for non-host players
- [ ] T095 [US4] Show button only when player is not the host (conditional rendering)
- [ ] T096 [US4] Implement saveNonHostSelections function in lib/locationStorage.ts
- [ ] T097 [US4] Add confirmation message after successful save
- [ ] T098 [US4] Display host's current selection count to non-host players
- [ ] T099 [US4] Test non-host saving with multiple browser windows/tabs
- [ ] T100 [US4] Verify playground demo shows non-host saving working correctly

**Checkpoint**: At this point, non-host players can save host's selections and use them in their own games.

---

## Phase 8: User Story 6 - Export and Import Configurations (Priority: P3)

**Goal**: Allow users to export location selections to JSON file and import previously exported configurations for backup and sharing.

**Independent Test**: Customize selections, export to JSON file, clear localStorage or use different browser, import file, verify selections are restored correctly.

### Playground for User Story 6 (MANDATORY) ✓

- [ ] T101 [US6] Create playground directory specs/005-location-api-customization/playground/story6/
- [ ] T102 [US6] Create README.md in playground/story6/ with export/import demo
- [ ] T103 [US6] Create demo showing full export/import workflow

### Implementation for User Story 6

- [ ] T104 [P] [US6] Create ExportButton component in components/location/ExportButton.tsx
- [ ] T105 [P] [US6] Create ImportButton component in components/location/ImportButton.tsx
- [ ] T106 [US6] Create exportConfig function in lib/exportImport.ts
- [ ] T107 [US6] Create importConfig function in lib/exportImport.ts
- [ ] T108 [US6] Implement JSON Schema validation using Zod for import validation
- [ ] T109 [US6] Generate JSON with version, timestamp, appIdentifier in export
- [ ] T110 [US6] Validate appIdentifier on import to prevent wrong app configs
- [ ] T111 [US6] Create merge dialog component in components/location/ConfigMergeDialog.tsx
- [ ] T112 [US6] Add "Merge" vs "Replace" options in dialog when importing
- [ ] T113 [US6] Implement merge logic for imported data with existing localStorage
- [ ] T114 [US6] Add error handling for invalid/corrupted JSON files
- [ ] T115 [US6] Create error display component for import failures
- [ ] T116 [US6] Add download filename with timestamp (e.g., spyfall-config-2025-10-30.json)
- [ ] T117 [US6] Add file picker with .json filter for import
- [ ] T118 [US6] Test export/import with various file sizes and formats
- [ ] T119 [US6] Test import with intentionally invalid files to verify error handling
- [ ] T120 [US6] Verify playground demo shows complete export/import workflow

**Checkpoint**: At this point, all user stories are complete - users can customize, persist, share, and backup their location configurations.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final cleanup

- [ ] T121 [P] Add loading states to all async operations (API fetch, localStorage operations)
- [ ] T122 [P] Add success/error toast notifications for user actions
- [ ] T123 [P] Improve accessibility: keyboard navigation for LocationList
- [ ] T124 [P] Improve accessibility: ARIA labels for checkboxes and buttons
- [ ] T125 [P] Add RTL support verification for Arabic language
- [ ] T126 Code cleanup: remove dead code and unused imports
- [ ] T127 Code cleanup: simplify complex merge logic if possible
- [ ] T128 Readability pass: improve variable naming and add comments
- [ ] T129 [P] Run Prettier formatter on all modified files
- [ ] T130 [P] Update documentation in quickstart.md with actual implementation notes
- [ ] T131 Validate all playgrounds still work after polish changes
- [ ] T132 Test full workflow: API fetch → customize → persist → export → import
- [ ] T133 Performance check: measure API fetch time (<3s target)
- [ ] T134 Performance check: measure merge operation time (<100ms target)
- [ ] T135 Browser compatibility testing: Chrome, Firefox, Safari, Edge
- [ ] T136 Test with localStorage disabled (graceful error handling)
- [ ] T137 Test with full localStorage (quota exceeded scenario)
- [ ] T138 Add cache invalidation button for manual API refresh
- [ ] T139 Final code review and refactoring pass
- [ ] T140 Update .github/copilot-instructions.md with new patterns (if not already done)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 5 (Phase 4)**: Depends on Foundational phase completion (US1 helps but not required)
- **User Story 2 (Phase 5)**: Depends on Foundational and US5 completion (needs merge logic)
- **User Story 3 (Phase 6)**: Depends on US2 completion (needs customization UI)
- **User Story 4 (Phase 7)**: Depends on US3 completion (same persistence mechanism)
- **User Story 6 (Phase 8)**: Depends on US2 completion (needs working customization)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

```
Foundation (Phase 2) - BLOCKS ALL STORIES
    ↓
US1 (Phase 3) ----→ US5 (Phase 4) ----→ US2 (Phase 5)
    ↓                                       ↓
    └───────────────────────────────→ US3 (Phase 6) ----→ US4 (Phase 7)
                                            ↓
                                       US6 (Phase 8)
                                            ↓
                                       Polish (Phase 9)
```

**Critical Path**: Foundation → US5 → US2 → US3 → US4 → US6 → Polish  
**Parallel Opportunities**: US1 can run in parallel with US5 (both depend only on Foundation)

### Within Each User Story

- Playground creation FIRST (create scaffold, then implement until it works)
- Type definitions before implementations
- Models before services
- Services before UI components
- Core implementation before integration
- Story complete and validated via playground before moving to next priority

### Parallel Opportunities

**Phase 2 (Foundational)**:

- All type definition tasks (T004-T009) can run in parallel
- Component stubs (T104-T105) can run in parallel

**Phase 3 (US1)**:

- T030, T031, T032 (component updates) can run in parallel
- T036-T042 (file deletions) can run in parallel

**Phase 4 (US5)**:

- T048, T051 (utility file creation) can run in parallel

**Phase 5 (US2)**:

- T064, T065, T066 (component creation) can run in parallel

**Phase 8 (US6)**:

- T104, T105 (button components) can run in parallel

**Phase 9 (Polish)**:

- Most polish tasks are parallelizable (marked with [P])

---

## Parallel Example: User Story 2

```bash
# Create playground scaffold first:
Task: "Create playground directory specs/005-location-api-customization/playground/story2/"
Task: "Create README.md in playground/story2/ with customization UI demo instructions"

# Launch all component creations in parallel:
Task: "Create LocationList component in components/location/LocationList.tsx"
Task: "Create LocationItem component in components/location/LocationItem.tsx with expand/collapse"
Task: "Create RoleSelector component in components/location/RoleSelector.tsx with checkboxes"

# Then connect them together after components exist:
Task: "Modify Lobby component in components/room/Lobby.tsx to integrate LocationList"
Task: "Add validation to prevent game start when no locations are selected"

# Finally build demo:
Task: "Create demo showing location/role selection UI with live preview"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 5, 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (API integration)
4. Complete Phase 4: User Story 5 (Merge logic)
5. Complete Phase 5: User Story 2 (Customization UI)
6. **STOP and VALIDATE**: Test core functionality independently
7. Deploy/demo if ready (users can now customize locations!)

### Incremental Delivery

1. **Foundation + US1 + US5 + US2** → Basic customization works (MVP!)
2. **Add US3** → Host persistence (convenience feature)
3. **Add US4** → Non-host saving (collaboration feature)
4. **Add US6** → Export/import (power user feature)
5. **Polish** → Final refinements

Each addition adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers (after Foundation is complete):

- **Developer A**: US1 (API integration) → US3 (Host persistence)
- **Developer B**: US5 (Merge logic) → US2 (Customization UI) → US6 (Export/import)
- **Developer C**: Polish tasks in parallel

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **Playgrounds**: Create scaffold FIRST, then implement until it works
- **Constitution compliance**: Playground validation over tests, declarative patterns, readable code
- **File paths**: All paths are relative to repository root
- **Commit strategy**: Commit after each task or logical group
- **Testing**: Each playground validates the user story independently
- **Performance**: React.memo for list items, no virtualization needed for 80-120 items
- **Caching**: 24-hour cache for API responses, indefinite persistence for user selections
- **Validation**: Zod for runtime validation of API responses and import files
- **Error handling**: Graceful degradation with user-friendly messages
- **Avoid**: Speculative features, unnecessary abstractions, clever code over clear code
- **Prefer**: Simple solutions, declarative patterns, readable names, consistent style

---

## Total Task Count: 140 tasks

### Breakdown by Phase:

- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 21 tasks (BLOCKS all user stories)
- **Phase 3 (US1 - API Integration)**: 21 tasks
- **Phase 4 (US5 - Merge Logic)**: 16 tasks
- **Phase 5 (US2 - Customization UI)**: 20 tasks
- **Phase 6 (US3 - Host Persistence)**: 10 tasks
- **Phase 7 (US4 - Non-Host Saving)**: 10 tasks
- **Phase 8 (US6 - Export/Import)**: 20 tasks
- **Phase 9 (Polish)**: 20 tasks

### MVP Scope Recommendation:

**Phases 1, 2, 3, 4, 5 only** (81 tasks) - This delivers core value: API integration, merge logic, and customization UI. Users can customize locations and roles, with selections persisting automatically. Phases 6-8 add convenience features that can be delivered incrementally.
