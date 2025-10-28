---
description: 'Task breakdown for Location Images & Player Scaling'
---

# Tasks: Location Images & Player Scaling

**Feature**: 003-location-images-scaling
**Input**: Design documents from `/specs/003-location-images-scaling/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Organization**: Tasks are grouped by user story to enable independent implementation and demonstration of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a **Next.js + Cloudflare Workers** web application:

- **Frontend**: `app/`, `components/`, `lib/` (Next.js)
- **Backend**: `workers/src/` (Cloudflare Workers)
- **Shared Data**: `data/` (location data)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and verification of existing dependencies

- [ ] T001 Verify Next.js 14.2.16 and React 18.3.1 are installed and working
- [ ] T002 [P] Verify Cloudflare Workers environment with Wrangler CLI is configured
- [ ] T003 [P] Verify Tailwind CSS 3.4 configuration includes aspect-ratio utilities
- [ ] T004 [P] Verify Prettier 3.3.3 formatter is configured with project rules
- [ ] T005 Verify R2 bucket 'spyfall-assets' is accessible and all 70+ location images are uploaded
- [ ] T006 Verify data/locations.json has imageUrl field for all locations

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Update TypeScript types in lib/types.ts to add RoomConfig interface with maxPlayers and spyCount fields
- [ ] T008 Update TypeScript types in lib/types.ts to modify Assignment interface to include isSpy, totalSpies, isDuplicateRole fields
- [ ] T009 Update TypeScript types in lib/types.ts to change GameState spyPlayerId to spyPlayerIds array
- [ ] T010 Update workers/src/models/Room.ts to add maxPlayers (default 10) and spyCount (default 1) properties
- [ ] T011 Add validation methods to workers/src/models/Room.ts: canJoin(currentPlayerCount) and canStart(currentPlayerCount)
- [ ] T012 Update workers/src/models/GameState.ts to change spyPlayerId to spyPlayerIds array with migration logic
- [ ] T013 Create static method GameState.assignRoles(playerIds, location, spyCount) in workers/src/models/GameState.ts using Fisher-Yates shuffle
- [ ] T014 Update WebSocket ROOM_STATE broadcast in workers/src/durable-objects/GameRoom.ts to include maxPlayers, currentPlayerCount, spyCount fields
- [ ] T015 Update WebSocket YOUR_ROLE message in workers/src/durable-objects/GameRoom.ts to include totalSpies for spies and isDuplicateRole for non-spies

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Location Image as Non-Spy (Priority: P1) 🎯 MVP

**Goal**: Non-spy players see a prominent, properly-formatted image of their assigned location at 3:2 aspect ratio full width

**Independent Test**: Start a game, view role card as non-spy player, verify single location image appears at full width with 3:2 ratio, works on mobile/tablet/desktop

### Playground for User Story 1 (MANDATORY) ✓

> **NOTE: Create playground scaffold FIRST, then implement until it works**

- [ ] T016 [US1] Create playground structure in specs/003-location-images-scaling/playground/story1/
- [ ] T017 [US1] Create README.md in playground/story1/ with test instructions for non-spy image display
- [ ] T018 [US1] Add test scenario checklist to playground/story1/README.md: image loads, 3:2 ratio, full width, responsive, loading state, error fallback

### Implementation for User Story 1

- [ ] T019 [P] [US1] Create components/game/LocationImage.tsx with 3:2 aspect ratio, loading state, error fallback using Tailwind classes
- [ ] T020 [US1] Update components/game/RoleCard.tsx to import and render LocationImage component for non-spy players
- [ ] T021 [US1] Add image loading state management (loading/loaded/error) in LocationImage component using React useState
- [ ] T022 [US1] Implement loading skeleton with animate-pulse in LocationImage component
- [ ] T023 [US1] Implement text fallback display (location name) in LocationImage component for error state
- [ ] T024 [US1] Add fade-in transition using Tailwind opacity utilities when image loads
- [ ] T025 [US1] Test LocationImage component on mobile (375px), tablet (768px), desktop (1440px) with Chrome DevTools

**Checkpoint**: At this point, User Story 1 playground should demonstrate working non-spy image display

---

## Phase 4: User Story 2 - Browse All Location Images as Spy (Priority: P2)

**Goal**: Spy players can browse through all available location images in a scrollable grid to help them understand what location others might be talking about

**Independent Test**: Start a game as spy, access location browser interface, verify all 70+ location images can be scrolled through and viewed at 3:2 ratio with smooth performance

### Playground for User Story 2 (MANDATORY) ✓

- [ ] T026 [US2] Create playground structure in specs/003-location-images-scaling/playground/story2/
- [ ] T027 [US2] Create README.md in playground/story2/ with test instructions for spy image browser
- [ ] T028 [US2] Add test scenario checklist to playground/story2/README.md: all images load, smooth scroll, lazy loading, grid responsive, click enlarges, alphabetical sort

### Implementation for User Story 2

- [ ] T029 [P] [US2] Create components/game/SpyLocationBrowser.tsx with grid layout using Tailwind grid-cols-2 md:grid-cols-3 lg:grid-cols-4
- [ ] T030 [US2] Implement location sorting (alphabetical Thai) in SpyLocationBrowser component
- [ ] T031 [US2] Add native lazy loading (loading="lazy") to all image elements in SpyLocationBrowser grid
- [ ] T032 [US2] Implement modal/enlarged view state in SpyLocationBrowser using React useState for selectedLocation
- [ ] T033 [US2] Add click handler to location cards in SpyLocationBrowser to show enlarged modal view
- [ ] T034 [US2] Style modal overlay with fixed positioning, backdrop blur, and z-index in SpyLocationBrowser
- [ ] T035 [US2] Update components/game/RoleCard.tsx to render SpyLocationBrowser when assignment.isSpy is true
- [ ] T036 [US2] Test spy browser scroll performance with Chrome DevTools Performance tab (target >55fps)
- [ ] T037 [US2] Test spy browser lazy loading in Chrome DevTools Network tab (verify progressive image loading)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Host Configures Player Capacity (Priority: P3)

**Goal**: Room hosts can configure the maximum player capacity from 4-20 players before starting the game, allowing for larger game groups

**Independent Test**: Create a room, adjust max player setting to different values (4-20), verify correct number of players can join before room becomes full, verify UI updates correctly

### Playground for User Story 3 (MANDATORY) ✓

- [ ] T038 [US3] Create playground structure in specs/003-location-images-scaling/playground/story3/
- [ ] T039 [US3] Create README.md in playground/story3/ with test instructions for player capacity configuration
- [ ] T040 [US3] Add test scenario checklist to playground/story3/README.md: capacity selector visible, joins blocked at max, cannot reduce below current count, UI updates in real-time

### Backend Implementation for User Story 3

- [ ] T041 [P] [US3] Update POST /api/rooms endpoint in workers/src/index.ts to accept maxPlayers and spyCount parameters
- [ ] T042 [P] [US3] Add validation in POST /api/rooms endpoint: maxPlayers 4-20, spyCount 1-3
- [ ] T043 [US3] Update GET /api/rooms/:code endpoint in workers/src/index.ts to return maxPlayers and currentPlayerCount fields
- [ ] T044 [US3] Create PATCH /api/rooms/:code/config endpoint in workers/src/index.ts for config updates
- [ ] T045 [US3] Add authorization check in PATCH /api/rooms/:code/config (host only)
- [ ] T046 [US3] Add phase check in PATCH /api/rooms/:code/config (lobby only)
- [ ] T047 [US3] Add validation in PATCH /api/rooms/:code/config: maxPlayers >= currentPlayerCount
- [ ] T048 [US3] Update /init endpoint in workers/src/durable-objects/GameRoom.ts to handle maxPlayers and spyCount options
- [ ] T049 [US3] Update join logic in workers/src/durable-objects/GameRoom.ts to check room.canJoin() before allowing join
- [ ] T050 [US3] Add ROOM_CONFIG_UPDATE WebSocket message handler in workers/src/durable-objects/GameRoom.ts

### Frontend Implementation for User Story 3

- [ ] T051 [P] [US3] Update components/room/PlayerList.tsx to display capacity as "X/Y players" when maxPlayers is provided
- [ ] T052 [US3] Update components/room/Lobby.tsx to show max players slider (range 4-20) for host in lobby phase
- [ ] T053 [US3] Add onChange handler to max players slider in Lobby.tsx to call onUpdateConfig callback
- [ ] T054 [US3] Disable max players slider in Lobby.tsx when current count exceeds selected value
- [ ] T055 [US3] Add helper text in Lobby.tsx showing current player count below slider
- [ ] T056 [US3] Update app/(game)/room/[code]/page.tsx to handle ROOM_STATE messages with new capacity fields
- [ ] T057 [US3] Add onUpdateConfig handler in app/(game)/room/[code]/page.tsx to send ROOM_CONFIG_UPDATE WebSocket message
- [ ] T058 [US3] Test capacity enforcement by opening 15 browser tabs, joining room with maxPlayers=15, attempting 16th join

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Host Configures Spy Count (Priority: P4)

**Goal**: Room hosts can set the number of spies (1-3) before starting the game, adding strategic variety for larger player groups

**Independent Test**: Create a room, set spy count to 2 or 3, start a game with sufficient players, verify correct number of spies are assigned with all spies able to browse locations

### Playground for User Story 4 (MANDATORY) ✓

- [ ] T059 [US4] Create playground structure in specs/003-location-images-scaling/playground/story4/
- [ ] T060 [US4] Create README.md in playground/story4/ with test instructions for spy count configuration
- [ ] T061 [US4] Add test scenario checklist to playground/story4/README.md: spy count selector visible, 3:1 ratio enforced, correct spy assignment, all spies can browse

### Implementation for User Story 4

- [ ] T062 [P] [US4] Add spy count button group (1, 2, 3) in components/room/Lobby.tsx for host in lobby phase
- [ ] T063 [US4] Add onClick handler to spy count buttons in Lobby.tsx to call onUpdateConfig with new spyCount
- [ ] T064 [US4] Disable spy count buttons in Lobby.tsx when currentPlayerCount < spyCount \* 3
- [ ] T065 [US4] Add validation warning text in Lobby.tsx: "Need at least X players for Y spies"
- [ ] T066 [US4] Update start game validation in workers/src/durable-objects/GameRoom.ts to use room.canStart() method
- [ ] T067 [US4] Update GameState.assignRoles() calls in workers/src/durable-objects/GameRoom.ts to pass room.spyCount parameter
- [ ] T068 [US4] Update GAME_STARTED WebSocket message in workers/src/durable-objects/GameRoom.ts to include spyCount field
- [ ] T069 [US4] Test multi-spy assignment by creating room with 10 players and 2 spies, verify exactly 2 spies assigned
- [ ] T070 [US4] Test spy count validation by creating room with 6 players, attempting to set 3 spies, verify error shown

**Checkpoint**: At this point, User Stories 1, 2, 3, AND 4 should all work independently

---

## Phase 7: User Story 5 - Dynamic Role Assignment for Larger Groups (Priority: P5)

**Goal**: The system automatically adapts role assignment to support 11-20 players with appropriate location role distribution and scoring adjustments

**Independent Test**: Start games with 11-20 players and verify all non-spy players receive roles (with repetition only if location has fewer roles than players minus spies), verify scoring is distributed correctly

### Playground for User Story 5 (MANDATORY) ✓

- [ ] T071 [US5] Create playground structure in specs/003-location-images-scaling/playground/story5/
- [ ] T072 [US5] Create README.md in playground/story5/ with test instructions for large group role assignment
- [ ] T073 [US5] Add test scenario checklist to playground/story5/README.md: 20 player game works, role distribution fair, duplicate roles marked, scoring correct

### Implementation for User Story 5

- [ ] T074 [P] [US5] Verify GameState.assignRoles() uses modulo distribution for role assignment (index % roles.length)
- [ ] T075 [US5] Add isDuplicateRole flag logic in GameState.assignRoles(): true when index >= location.roles.length
- [ ] T076 [US5] Update VOTING_RESULTS WebSocket message in workers/src/durable-objects/GameRoom.ts to include allSpiesCaught and remainingSpyCount fields
- [ ] T077 [US5] Update voting logic in workers/src/durable-objects/GameRoom.ts to check if all spyPlayerIds are in eliminatedPlayerIds
- [ ] T078 [US5] Update scoring logic in workers/src/durable-objects/GameRoom.ts to award +1 to each non-spy if allSpiesCaught is true
- [ ] T079 [US5] Update scoring logic in workers/src/durable-objects/GameRoom.ts to award +2 to each spy if any spy survives
- [ ] T080 [US5] Update SPY_GUESS_RESULT WebSocket message in workers/src/durable-objects/GameRoom.ts to include otherSpyIds array
- [ ] T081 [US5] Add first-spy-to-guess logic in spy guess handler to prevent multiple guess submissions
- [ ] T082 [US5] Test role assignment with 20 players and 2 spies (18 non-spies) by checking all players receive assignments
- [ ] T083 [US5] Test duplicate role marking by starting game with location having 7 roles but 14 non-spies
- [ ] T084 [US5] Test scoring with multi-spy game by playing through voting and spy guess phases

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T085 [P] Run Prettier formatter on all modified files: npm run format
- [ ] T086 [P] Add loading state improvements to LocationImage component with skeleton animations
- [ ] T087 [P] Optimize image loading by adding Cache-Control headers in R2 bucket configuration
- [ ] T088 Code cleanup in RoleCard.tsx: extract conditional rendering into helper functions
- [ ] T089 Code cleanup in Lobby.tsx: extract validation messages into constants
- [ ] T090 Code cleanup in GameRoom.ts: extract role assignment and scoring logic into separate methods
- [ ] T091 [P] Update components/room/CreateRoom.tsx to include max players and spy count inputs on room creation form
- [ ] T092 [P] Add helpful tooltips to capacity and spy count controls in Lobby component
- [ ] T093 Readability pass: rename variables for clarity in GameState.assignRoles() method
- [ ] T094 Readability pass: add JSDoc comments to LocationImage and SpyLocationBrowser components
- [ ] T095 Test all playground scenarios from specs/003-location-images-scaling/playground/
- [ ] T096 Validate all acceptance scenarios from spec.md user stories 1-5
- [ ] T097 Run through quickstart.md validation steps for all 5 phases
- [ ] T098 Performance test: verify spy browser maintains >55fps on mobile device with 70+ images
- [ ] T099 Performance test: verify 20 player game start completes within 5 seconds
- [ ] T100 Final integration test: create room with 20 players, 3 spies, play complete game round

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Uses LocationImage from US1 but can be developed independently
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Backend capacity logic independent from image display
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Extends capacity config from US3 but independently testable
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Uses multi-spy logic from US4 but independently testable

### Within Each User Story

- Playground README creation before implementation (write test scenarios first)
- Models/types before services
- Backend endpoints before frontend components that call them
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 (Setup)**: T001-T006 can all run in parallel (verification tasks)
- **Phase 2 (Foundational)**: T007-T009 can run in parallel (types), T010-T015 must be sequential
- **Phase 3 (US1)**: T016-T018 can run in parallel (playground setup), T019 can start immediately, T020-T024 sequential, T025 parallel
- **Phase 4 (US2)**: T026-T028 can run in parallel (playground setup), T029-T034 can run in parallel (component implementation), T035-T037 sequential
- **Phase 5 (US3)**: T038-T040 parallel (playground), T041-T042 parallel (backend endpoints), T043-T050 sequential, T051-T057 can run in parallel (frontend components), T058 sequential
- **Phase 6 (US4)**: T059-T061 parallel (playground), T062-T065 parallel (frontend UI), T066-T068 sequential (backend logic), T069-T070 sequential (testing)
- **Phase 7 (US5)**: T071-T073 parallel (playground), T074-T084 mostly sequential (complex logic dependencies)
- **Phase 8 (Polish)**: T085-T094 can run in parallel (different files), T095-T100 sequential (testing)

**Cross-Story Parallelism**: If you have multiple developers, User Stories 1-5 can all be worked on in parallel after Phase 2 completes, since they operate on different components and have independent test criteria.

---

## Parallel Example: Multiple Developers

### After Phase 2 (Foundational) Completes:

```bash
# Developer A: User Story 1 (P1 - Highest Priority)
Launch: T016-T025 (Non-spy image display)

# Developer B: User Story 2 (P2 - Independent)
Launch: T026-T037 (Spy location browser)

# Developer C: User Story 3 (P3 - Independent)
Launch: T038-T058 (Player capacity configuration)
```

### Single Developer Sequential:

```bash
# Week 1: Complete foundation and MVP
Complete: Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1) → MVP deployed!

# Week 2: Add spy browsing
Complete: Phase 4 (US2) → Deploy increment

# Week 3: Add player scaling
Complete: Phase 5 (US3) → Phase 6 (US4) → Deploy increment

# Week 4: Complete feature
Complete: Phase 7 (US5) → Phase 8 (Polish) → Final deploy
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T015) - CRITICAL
3. Complete Phase 3: User Story 1 (T016-T025)
4. **STOP and VALIDATE**: Test US1 independently via playground/story1/
5. Deploy/demo if ready - **You now have working location image display!**

### Incremental Delivery (Recommended)

1. Setup + Foundational → Foundation ready (T001-T015)
2. User Story 1 → Test → Deploy (T016-T025) - **MVP with images!**
3. User Story 2 → Test → Deploy (T026-T037) - **Spy browser added!**
4. User Story 3 → Test → Deploy (T038-T058) - **Player scaling added!**
5. User Story 4 → Test → Deploy (T059-T070) - **Multi-spy added!**
6. User Story 5 → Test → Deploy (T071-T084) - **Large groups supported!**
7. Polish → Final Deploy (T085-T100) - **Production ready!**

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With 3 developers:

1. All complete Phase 1-2 together (T001-T015)
2. Once Foundational done, split:
   - Dev A: US1 + US2 (Image display features)
   - Dev B: US3 + US4 (Configuration features)
   - Dev C: US5 (Large group scaling)
3. Stories complete and integrate independently
4. All join for Phase 8 (Polish)

---

## Estimated Effort

Based on plan.md estimates, single developer:

| Phase                           | Tasks         | Estimated Time  |
| ------------------------------- | ------------- | --------------- |
| Phase 1: Setup                  | T001-T006     | 1-2 hours       |
| Phase 2: Foundational           | T007-T015     | 3-4 hours       |
| Phase 3: US1 (Non-spy images)   | T016-T025     | 4-6 hours       |
| Phase 4: US2 (Spy browser)      | T026-T037     | 6-8 hours       |
| Phase 5: US3 (Player capacity)  | T038-T058     | 3-4 hours       |
| Phase 6: US4 (Spy count config) | T059-T070     | 4-6 hours       |
| Phase 7: US5 (Large groups)     | T071-T084     | 4-6 hours       |
| Phase 8: Polish                 | T085-T100     | 4-6 hours       |
| **Total**                       | **100 tasks** | **29-42 hours** |

**MVP to Production**: 3-5 days for experienced developer, 1-2 weeks for team

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **Playground First**: Create playground scaffold and test scenarios BEFORE implementing
- **Test Independently**: Each user story should work standalone via its playground
- **Build Until It Works**: Write playground tests, implement until tests pass
- **Format Before Commit**: Run `npm run format` before committing
- **Commit Frequently**: After each task or logical group of related tasks
- **Stop at Checkpoints**: Validate story independently via playground before proceeding
- **Avoid**: Speculative features, unnecessary abstractions, clever code over clear code
- **Prefer**: Simple solutions, declarative patterns, readable names, consistent style, Do Less Get Works

---

## Total Task Count

- **Phase 1 (Setup)**: 6 tasks
- **Phase 2 (Foundational)**: 9 tasks (BLOCKS all stories)
- **Phase 3 (US1)**: 10 tasks
- **Phase 4 (US2)**: 12 tasks
- **Phase 5 (US3)**: 21 tasks
- **Phase 6 (US4)**: 12 tasks
- **Phase 7 (US5)**: 14 tasks
- **Phase 8 (Polish)**: 16 tasks

**Total: 100 tasks** organized into 8 phases with clear dependencies and parallel opportunities.
