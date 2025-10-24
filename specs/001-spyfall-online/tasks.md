---
description: 'Task list for Spyfall Online - Thai Edition implementation'
---

# Tasks: Spyfall Online - Thai Edition

**Input**: Design documents from `/specs/001-spyfall-online/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Tests**: Per constitution (Playground Over Tests), no test tasks included. Validation via working playground.

**Organization**: Tasks are grouped by user story to enable independent implementation and demonstration of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Web application structure (monorepo):

- **Frontend**: `app/`, `components/`, `lib/` at repository root
- **Backend**: `workers/src/`
- **Shared**: `lib/types.ts` for TypeScript types
- **Data**: `data/locations.json` for Thai locations

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Next.js 14 project with TypeScript and App Router at repository root
- [x] T002 [P] Install and configure Tailwind CSS 3.x with config in tailwind.config.js
- [x] T003 [P] Configure Prettier in .prettierrc for TypeScript/React formatting
- [x] T004 [P] Configure ESLint in .eslintrc.json for code quality
- [x] T005 [P] Create TypeScript config in tsconfig.json with strict mode enabled
- [ ] T006 Install Cloudflare Wrangler CLI globally and initialize Workers project in workers/
- [x] T007 [P] Create wrangler.toml config for Durable Objects, D1, and R2 bindings
- [x] T008 [P] Create Next.js config in next.config.js for Cloudflare Pages deployment
- [x] T009 [P] Create D1 database schema in workers/src/db/schema.sql (locations table)
- [x] T010 [P] Create D1 migration file in migrations/0001_initial_schema.sql
- [x] T011 [P] Create locations seed data in data/locations.json (100 Thai locations with roles)
- [x] T012 [P] Create package.json with all dependencies (Next.js, React, Tailwind, Hono, etc.)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T013 Create shared TypeScript types in lib/types.ts (Room, Player, GameState, Message, Vote, Location, WebSocketMessage)
- [x] T014 [P] Create localStorage helper utilities in lib/storage.ts (save/load session, playerId, playerName)
- [x] T015 [P] Create base UI components: Button in components/ui/Button.tsx
- [x] T016 [P] Create base UI components: Input in components/ui/Input.tsx
- [x] T017 [P] Create base UI components: Card in components/ui/Card.tsx
- [x] T018 [P] Create root layout in app/layout.tsx with Thai font and Tailwind imports
- [x] T019 [P] Create global styles in app/globals.css with Tailwind directives
- [ ] T020 Create Cloudflare Worker entry point in workers/src/index.ts (HTTP router with Hono)
- [x] T021 [P] Create Room model in workers/src/models/Room.ts (validation, state transitions)
- [x] T022 [P] Create Player model in workers/src/models/Player.ts (validation, connection status)
- [x] T023 [P] Create GameState model in workers/src/models/GameState.ts (round state, assignments)
- [ ] T024 Run D1 migrations locally to create locations table
- [ ] T025 Seed D1 database with 100 Thai locations from data/locations.json

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and Join Game Room (Priority: P1) 🎯 MVP

**Goal**: Players can create/join rooms with room codes and see real-time player list updates

**Independent Test**: Open multiple browser tabs, create room in first tab, join from other tabs with different names, verify all players see each other in real-time, close a tab and verify others see player removed

### Playground for User Story 1 (MANDATORY) ✓

- [x] T026 [US1] Create playground scaffold in specs/001-spyfall-online/playground/story1/ with README explaining how to test
- [x] T027 [US1] Document multi-tab testing procedure in playground README

### Implementation for User Story 1

**Backend - Room Creation & Management**

- [ ] T028 [P] [US1] Implement GameRoom Durable Object class in workers/src/durable-objects/GameRoom.ts (constructor, state initialization)
- [ ] T029 [P] [US1] Implement room creation handler in workers/src/handlers/room.ts (POST /api/rooms - generate 6-char code, create Durable Object)
- [ ] T030 [P] [US1] Implement get room info handler in workers/src/handlers/room.ts (GET /api/rooms/:code)
- [ ] T031 [US1] Add Durable Object WebSocket handling in workers/src/durable-objects/GameRoom.ts (accept connection, handle upgrade)
- [ ] T032 [US1] Implement JOIN message handler in workers/src/handlers/websocket.ts (validate player, add to room, broadcast PLAYER_JOINED)
- [ ] T033 [US1] Implement LEAVE message handler in workers/src/handlers/websocket.ts (remove player, broadcast PLAYER_LEFT)
- [ ] T034 [US1] Implement disconnect detection in workers/src/durable-objects/GameRoom.ts (mark player disconnected after 2min, transfer host if needed)
- [ ] T034b [US1] Implement room cleanup timer in workers/src/durable-objects/GameRoom.ts (close room after 5min of no active players, per FR-004)
- [ ] T035 [US1] Implement duplicate name handling in workers/src/handlers/websocket.ts (append (2), (3) to duplicates)

**Frontend - Home Page & Room Creation**

- [x] T036 [P] [US1] Create home page in app/page.tsx (create/join room options)
- [x] T037 [P] [US1] Create CreateRoom component in components/room/CreateRoom.tsx (name input, create button, gameType selector)
- [x] T038 [P] [US1] Create JoinRoom component in components/room/JoinRoom.tsx (name input, room code input, join button)
- [x] T039 [US1] Implement room creation logic in CreateRoom.tsx (API call, store session, navigate to room)
- [x] T040 [US1] Implement room join logic in JoinRoom.tsx (API call, validate code, navigate to room)

**Frontend - WebSocket Client & Room UI**

- [x] T041 [US1] Create WebSocket client utility in lib/websocket.ts (connect, send message, handle reconnection with exponential backoff)
- [x] T042 [P] [US1] Create PlayerList component in components/room/PlayerList.tsx (display players, connection status, host badge)
- [x] T043 [P] [US1] Create Lobby component in components/room/Lobby.tsx (show room code, player list, start game button for host)
- [x] T044 [US1] Create game room page in app/(game)/room/[code]/page.tsx (WebSocket connection, room state management)
- [x] T045 [US1] Create game layout in app/(game)/layout.tsx (wrapper for game UI)
- [x] T046 [US1] Implement WebSocket message handling in room page (PLAYER_JOINED, PLAYER_LEFT, HOST_CHANGED, ERROR)
- [x] T047 [US1] Implement real-time player list updates in room page (add/remove players on messages)
- [x] T048 [US1] Add localStorage persistence for player session (load on mount, save on creation/join)
- [x] T049 [US1] Implement room code display and copy-to-clipboard in Lobby.tsx
- [x] T050 [US1] Add error handling and user feedback (room full, room not found, connection lost)

**Checkpoint**: User Story 1 playground should demonstrate working room creation, joining, and real-time player sync

---

## Phase 4: User Story 2 - Play Spyfall Round (Priority: P2)

**Goal**: Players receive roles, chat in real-time, see timer, vote for spy, and see results

**Independent Test**: Start game with 4+ players, verify each player sees correct role (one spy, others with location), send chat messages, wait for timer or vote, verify voting works and scores update

### Playground for User Story 2 (MANDATORY) ✓

- [ ] T051 [US2] Create playground for user story 2 in specs/001-spyfall-online/playground/story2/ documenting full game round test
- [ ] T052 [US2] Add demo script showing how to test role assignment, chat, voting with multiple tabs

### Implementation for User Story 2

**Backend - Game Start & Role Assignment**

- [ ] T053 [P] [US2] Query D1 for locations by difficulty in workers/src/handlers/game.ts (SELECT with WHERE difficulty IN)
- [ ] T054 [US2] Implement START_GAME message handler in workers/src/handlers/websocket.ts (validate host, player count, create GameState)
- [ ] T055 [US2] Implement random location selection in workers/src/handlers/game.ts (filter by difficulty, pick one)
- [ ] T056 [US2] Implement spy assignment in workers/src/handlers/game.ts (random player selection)
- [ ] T057 [US2] Implement role assignment for non-spies in workers/src/handlers/game.ts (assign unique roles from location)
- [ ] T058 [US2] Broadcast GAME_STARTED message to all players in GameRoom Durable Object
- [ ] T059 [US2] Send private ROLE_ASSIGNMENT messages to each player in GameRoom Durable Object

**Backend - Chat & Timer**

- [ ] T060 [P] [US2] Implement CHAT message handler in workers/src/handlers/websocket.ts (validate, store in GameState, broadcast MESSAGE)
- [ ] T061 [P] [US2] Implement timer logic in GameRoom Durable Object (start timer, send TIMER_TICK every second, PHASE_CHANGE on expiry)
- [ ] T062 [US2] Implement turn tracking in GameState (currentTurn index, turn indicator in chat)

**Backend - Voting**

- [ ] T063 [US2] Implement VOTE message handler in workers/src/handlers/websocket.ts (validate phase, store vote, broadcast VOTE_CAST with count)
- [ ] T064 [US2] Implement vote tallying in workers/src/handlers/game.ts (count votes, determine eliminated player)
- [ ] T065 [US2] Implement score calculation in workers/src/handlers/game.ts (spy caught: +1 non-spies, spy survives: proceed to spy_guess)
- [ ] T066 [US2] Broadcast VOTING_RESULTS message with eliminated player, wasSpy flag, and scores

**Frontend - Game Configuration**

- [ ] T067 [P] [US2] Add difficulty selector to Lobby component (checkboxes for easy/medium/hard)
- [ ] T068 [P] [US2] Add timer duration selector to Lobby component (dropdown 5-15 minutes)
- [ ] T069 [US2] Implement START_GAME message sending from Lobby (host button click, include difficulty and timer)
- [ ] T070 [US2] Update Lobby component to disable start button if <4 or >10 players

**Frontend - Role Display**

- [ ] T071 [P] [US2] Create RoleCard component in components/game/RoleCard.tsx (show role, location for non-spy, "You are the spy" for spy)
- [ ] T072 [P] [US2] Create LocationReference component in components/game/LocationReference.tsx (show location name + all roles for non-spy)
- [ ] T073 [US2] Handle ROLE_ASSIGNMENT message in room page (store role privately, show appropriate card)
- [ ] T074 [US2] Implement conditional rendering in room page (show Lobby vs RoleCard based on game phase)

**Frontend - Chat**

- [ ] T075 [P] [US2] Create ChatPanel component in components/game/ChatPanel.tsx (message list, input field, send button)
- [ ] T076 [US2] Implement chat message sending in ChatPanel (CHAT WebSocket message with content and isTurnIndicator)
- [ ] T077 [US2] Handle MESSAGE WebSocket message in room page (append to chat history)
- [ ] T078 [US2] Add turn indicator styling in ChatPanel (highlight messages with isTurnIndicator flag)
- [ ] T079 [US2] Add auto-scroll to bottom in ChatPanel (scroll on new message)

**Frontend - Timer**

- [ ] T080 [P] [US2] Create GameTimer component in components/game/GameTimer.tsx (countdown display, visual progress bar)
- [ ] T081 [US2] Handle TIMER_TICK message in room page (update timer state)
- [ ] T082 [US2] Handle PHASE_CHANGE message in room page (transition to voting phase)
- [ ] T083 [US2] Add timer expiration animation in GameTimer component (flash or sound on expiry)

**Frontend - Voting**

- [ ] T084 [P] [US2] Create VotingInterface component in components/game/VotingInterface.tsx (player list with vote buttons)
- [ ] T085 [US2] Implement vote submission in VotingInterface (VOTE WebSocket message with suspectId)
- [ ] T086 [US2] Handle VOTE_CAST message in room page (update vote count display)
- [ ] T087 [US2] Handle VOTING_RESULTS message in room page (show eliminated player, wasSpy status, updated scores)
- [ ] T088 [US2] Add voting results modal/overlay in room page (display results clearly before transitioning)

**Frontend - Game State Management**

- [ ] T089 [US2] Implement game state reducer in room page (manage phase transitions, role, timer, messages, votes)
- [ ] T090 [US2] Add phase-based conditional rendering in room page (lobby → playing → voting → results)
- [ ] T091 [US2] Update PlayerList to show scores during and after game

**Checkpoint**: User Story 2 playground should demonstrate complete game round with roles, chat, timer, voting, and results

---

## Phase 5: User Story 3 - Spy Location Guess (Priority: P3)

**Goal**: If spy survives voting, they can guess the location from a list

**Independent Test**: Play round where spy is not eliminated, verify spy sees location list, test correct and incorrect guesses, verify scores update appropriately

### Playground for User Story 3 (MANDATORY) ✓

- [ ] T092 [US3] Create playground for user story 3 in specs/001-spyfall-online/playground/story3/ with instructions for testing spy guess
- [ ] T093 [US3] Add notes on how to force spy to survive (intentional wrong votes) for testing

### Implementation for User Story 3

**Backend - Spy Guess Logic**

- [ ] T094 [US3] Implement SPY_GUESS message handler in workers/src/handlers/websocket.ts (validate spy, phase, locationId)
- [ ] T095 [US3] Implement guess validation in workers/src/handlers/game.ts (check if guessed location matches actual)
- [ ] T096 [US3] Implement spy guess scoring in workers/src/handlers/game.ts (correct: +2 spy, incorrect: +1 each non-spy)
- [ ] T097 [US3] Broadcast SPY_GUESS_RESULT message with guess, actual location, wasCorrect flag, and updated scores

**Frontend - Spy Guess UI**

- [ ] T098 [P] [US3] Create SpyGuess component in components/game/SpyGuess.tsx (location list, select button)
- [ ] T099 [US3] Fetch all locations for spy guess in SpyGuess component (call GET /api/locations)
- [ ] T100 [US3] Implement location selection and submission in SpyGuess (SPY_GUESS WebSocket message)
- [ ] T101 [US3] Handle SPY_GUESS_RESULT message in room page (show result modal, display correct location)
- [ ] T102 [US3] Add conditional rendering for spy_guess phase in room page (show SpyGuess only for spy)
- [ ] T103 [US3] Update non-spy players' view during spy_guess phase (show "Spy is guessing..." message)

**Checkpoint**: User Story 3 playground should demonstrate spy guess interface and correct scoring

---

## Phase 6: User Story 4 - Multi-Round Scoring (Priority: P4)

**Goal**: Play multiple rounds with persistent scores and leaderboard

**Independent Test**: Complete one round, start another from results screen, verify scores carry over, play 3+ rounds and verify leaderboard ranks correctly

### Playground for User Story 4 (MANDATORY) ✓

- [ ] T104 [US4] Create playground for user story 4 in specs/001-spyfall-online/playground/story4/ showing multi-round gameplay
- [ ] T105 [US4] Document how to test score persistence across rounds

### Implementation for User Story 4

**Backend - Multi-Round Support**

- [ ] T106 [US4] Implement round cleanup in GameRoom Durable Object (clear messages, votes, reassign roles)
- [ ] T107 [US4] Implement score persistence across rounds in GameRoom Durable Object (keep player scores in memory)
- [ ] T108 [US4] Update START_GAME handler to support new rounds (increment roundNumber, preserve scores)
- [ ] T109 [US4] Add round number to GAME_STARTED broadcast message

**Frontend - Results & New Round**

- [ ] T110 [P] [US4] Create results screen component in components/game/Results.tsx (show round winner, all scores, leaderboard)
- [ ] T111 [US4] Add "New Round" button to Results component (host only, triggers START_GAME)
- [ ] T112 [US4] Implement leaderboard sorting in Results component (rank by total score descending)
- [ ] T113 [US4] Add round number display in GameTimer component
- [ ] T114 [US4] Update room page to transition from results back to playing phase on new round

**Checkpoint**: User Story 4 playground should demonstrate multi-round gameplay with cumulative scoring

---

## Phase 7: User Story 5 - Pluggable Game System (Priority: P5)

**Goal**: Architecture supports multiple game types (Spyfall active, Werewolf coming soon)

**Independent Test**: Verify game type selector shows on room creation, verify room info displays game type, verify codebase structure allows easy addition of new game without modifying room logic

### Playground for User Story 5 (MANDATORY) ✓

- [ ] T115 [US5] Create playground for user story 5 in specs/001-spyfall-online/playground/story5/ documenting architecture
- [ ] T116 [US5] Add architecture diagram showing game-agnostic room system vs game-specific components

### Implementation for User Story 5

**Backend - Game Type Abstraction**

- [ ] T117 [P] [US5] Create game interface/abstract class in workers/src/models/Game.ts (startGame, processAction, calculateScores)
- [ ] T118 [P] [US5] Create SpyfallGame implementation in workers/src/models/SpyfallGame.ts (implement interface with current logic)
- [ ] T119 [US5] Refactor GameRoom Durable Object to use game interface (delegate game-specific logic to SpyfallGame)
- [ ] T120 [US5] Add game type validation in room creation handler (support "spyfall", reject "werewolf" with message)
- [ ] T121 [US5] Update GameState model to be game-agnostic (move Spyfall-specific fields to SpyfallGame)

**Frontend - Game Type Selection**

- [ ] T122 [P] [US5] Add game type selector to CreateRoom component (radio buttons: Spyfall enabled, Werewolf grayed out)
- [ ] T123 [US5] Pass gameType to room creation API call
- [ ] T124 [US5] Display game type in Lobby component (show "Game: Spyfall" badge)
- [ ] T125 [US5] Create game component factory in lib/game-logic.ts (map gameType to appropriate React components)

**Checkpoint**: User Story 5 playground should demonstrate game type selection and architecture documentation

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T126 [P] Run Prettier to format all TypeScript and React files
- [ ] T127 Code cleanup: Remove unused imports, dead code, console.logs
- [ ] T128 Readability pass: Improve variable names, extract complex logic into named functions
- [ ] T129 [P] Add Thai language text throughout UI (replace English placeholders)
- [ ] T130 [P] Add error messages in Thai for all error scenarios
- [ ] T131 Validate all playgrounds still work after changes (run through each user story test)
- [ ] T132 [P] Optimize WebSocket message payloads (remove redundant fields)
- [ ] T133 [P] Add loading states for all async operations (room creation, joining, starting game)
- [ ] T134 [P] Implement connection status indicator in UI (connected, reconnecting, disconnected)
- [ ] T135 [P] Add mobile responsive styles (test on phone sizes, fix any horizontal scroll)
- [ ] T136 [P] Optimize images: Convert to WebP, add proper dimensions
- [ ] T137 Create deployment script in package.json (build frontend, deploy Workers, run migrations)
- [ ] T138 Create environment-specific configs (.env.local, .env.production)
- [ ] T139 Add rate limiting to API endpoints (prevent abuse)
- [ ] T140 Review and validate quickstart.md against final implementation
- [ ] T141 Create production deployment checklist in specs/001-spyfall-online/deployment-checklist.md
- [ ] T142 [P] Validate performance: Measure chat message latency meets <500ms requirement (SC-007)
- [ ] T143 [P] Validate performance: Test timer synchronization drift stays <2s across clients (SC-010)
- [ ] T144 [P] Validate performance: Load test 100 concurrent rooms with 10 players each (SC-005)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed) after Phase 2
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories ✅
- **User Story 2 (P2)**: Depends on User Story 1 (needs room/player infrastructure)
- **User Story 3 (P3)**: Depends on User Story 2 (extends voting phase)
- **User Story 4 (P4)**: Depends on User Story 2 (extends round system)
- **User Story 5 (P5)**: Can start after Foundational - Architectural, can be done alongside others

### Within Each User Story

- Playground setup first (document test approach)
- Backend models and handlers before frontend components
- WebSocket handlers before frontend message handling
- UI components before page integration
- State management last (after all pieces exist)

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Within each user story, tasks marked [P] can run in parallel
- Backend and Frontend work can happen in parallel within a story (different files)
- Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Backend tasks (different developer or different time):
Task T028: "Implement GameRoom Durable Object class"
Task T029: "Implement room creation handler"
Task T030: "Implement get room info handler"

# Frontend tasks (can happen simultaneously with backend):
Task T036: "Create home page"
Task T037: "Create CreateRoom component"
Task T038: "Create JoinRoom component"
Task T042: "Create PlayerList component"
Task T043: "Create Lobby component"

# Then integrate:
Task T044: "Create game room page (uses WebSocket + components)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test US1 playground independently
5. Deploy/demo if ready

### Incremental Delivery (Recommended)

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! Room system works)
3. Add User Story 2 → Test independently → Deploy/Demo (Full game playable!)
4. Add User Story 3 → Test independently → Deploy/Demo (Spy guess adds depth)
5. Add User Story 4 → Test independently → Deploy/Demo (Multi-round competition)
6. Add User Story 5 → Test independently → Deploy/Demo (Future-proof architecture)
7. Polish → Final QA → Production launch

### Parallel Team Strategy

With multiple developers after Foundational phase:

1. **Developer A**: User Story 1 (T026-T050)
2. **Developer B**: User Story 5 (T115-T125) - Architecture work, doesn't block others
3. Once US1 complete:
   - **Developer A**: User Story 2 (T051-T091)
   - **Developer C**: User Story 3 scaffolding (T092-T093, T098-T099)
4. Once US2 complete:
   - **Developer B**: User Story 4 (T104-T114)
   - **Developer C**: Finish User Story 3 (T100-T103)

---

## Task Summary

**Total Tasks**: 144

**Breakdown by Phase**:

- Phase 1 (Setup): 12 tasks
- Phase 2 (Foundational): 13 tasks
- Phase 3 (US1 - MVP): 26 tasks (includes T034b for room cleanup)
- Phase 4 (US2 - Core Game): 41 tasks
- Phase 5 (US3 - Spy Guess): 12 tasks
- Phase 6 (US4 - Multi-Round): 11 tasks
- Phase 7 (US5 - Pluggable): 11 tasks
- Phase 8 (Polish): 19 tasks (includes T142-T144 for performance validation)

**Parallelizable Tasks**: 64 tasks marked [P] (44% can run in parallel)

**Critical Path** (Sequential MVP):
Setup (12) → Foundational (13) → US1 (26) = **51 tasks for MVP**

**Estimated Effort**:

- MVP (US1): ~3-5 days (1 developer)
- Full Game (US1+US2): ~7-10 days
- Production Ready (US1-US5 + Polish): ~15-20 days

---

## Notes

- All tasks include specific file paths for clarity
- [P] tasks use different files - safe to parallelize
- [Story] labels enable tracking implementation by user story
- Each user story is independently testable via playground
- Backend and frontend tasks separated for parallel development
- No test tasks per constitution (Playground Over Tests principle)
- Formatters run in polish phase (Prettier for consistency)
- Thai localization added in polish phase
- Deployment concerns addressed in final polish tasks
