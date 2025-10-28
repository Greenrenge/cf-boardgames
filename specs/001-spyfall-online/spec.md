# Feature Specification: Spyfall Online - Thai Edition

**Feature Branch**: `001-spyfall-online`  
**Created**: 2025-10-24  
**Status**: Draft  
**Input**: User description: "Multiplayer social deduction game with real-time communication, Thai localization, and pluggable game system"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Create and Join Game Room (Priority: P1)

Players can create or join a game room using a room code, set their display name, and wait for other players to join before starting the game.

**Why this priority**: This is the foundational flow - without the ability to create/join rooms and manage player presence, no game can happen. This is the absolute MVP.

**Independent Test**: Can be fully tested by creating a room with a unique code, joining from multiple browser tabs/devices with different names, seeing all players in the lobby, and verifying real-time updates when players join/leave.

**Acceptance Scenarios**:

1. **Given** I am a new visitor, **When** I enter my name and click "Create Room", **Then** I receive a unique room code and enter the lobby as the host
2. **Given** I have a room code from a friend, **When** I enter my name and the room code and click "Join", **Then** I enter the lobby and see all existing players
3. **Given** I am in a lobby with other players, **When** a new player joins, **Then** I immediately see them appear in the player list
4. **Given** I am in a lobby, **When** I close my browser/tab, **Then** other players see me removed from the player list within 5 seconds
5. **Given** I am the room host, **When** all players are ready (4-10 players present), **Then** I can start the game

---

### User Story 2 - Play Spyfall Round (Priority: P2)

Players receive their role assignments (spy or non-spy with location/role), ask and answer questions in turns, discuss freely, and vote to identify the spy within the time limit.

**Why this priority**: This is the core gameplay experience. Once players can join rooms, they need to actually play the game. This delivers the primary value proposition.

**Independent Test**: Can be fully tested by starting a game with 4+ players, verifying role assignments are hidden per player, taking turns asking/answering questions via chat, seeing the countdown timer, and completing a voting round.

**Acceptance Scenarios**:

1. **Given** a game has started with 4+ players, **When** I view my role card, **Then** I see either "You are the Spy" or my location + specific role
2. **Given** I am not the spy, **When** I view my role card, **Then** I also see a reference sheet with the location name and all possible roles
3. **Given** it is my turn, **When** I type a question in chat, **Then** all players see my question with a turn indicator
4. **Given** the timer is running, **When** time expires, **Then** the game automatically moves to voting phase
5. **Given** we are in voting phase, **When** all players vote, **Then** the player with most votes is revealed and we see if they were the spy
6. **Given** the spy was not caught, **When** the spy guesses the location, **Then** the game reveals if the guess was correct

---

### User Story 3 - Spy Location Guess (Priority: P3)

If the spy survives the voting round, they get a chance to guess the location from a list of all possible locations to win the round.

**Why this priority**: This adds strategic depth and a comeback mechanism for the spy, but the game is playable without it (spy just wins if not caught).

**Independent Test**: Can be fully tested by playing a round where the spy is not eliminated, then presenting the spy with a location selection interface, and checking if correct/incorrect guesses award appropriate points.

**Acceptance Scenarios**:

1. **Given** the voting phase ended without eliminating the spy, **When** the spy guess phase begins, **Then** only the spy sees a list of all possible locations
2. **Given** I am the spy and see the location list, **When** I select the correct location, **Then** I win the round and earn 2 points
3. **Given** I am the spy and guess incorrectly, **When** the location is revealed, **Then** non-spy players win and each earn 1 point

---

### User Story 4 - Multi-Round Scoring (Priority: P4)

Players can play multiple rounds in the same room, with scores accumulating across rounds and a leaderboard showing current standings.

**Why this priority**: Enhances replayability and social competition, but a single round is sufficient for MVP validation.

**Independent Test**: Can be fully tested by completing multiple rounds in the same room and verifying that scores persist and accumulate correctly across rounds.

**Acceptance Scenarios**:

1. **Given** a round has ended, **When** scores are displayed, **Then** I see each player's points for this round and their total score
2. **Given** we completed a round, **When** the host starts a new round, **Then** players are reassigned roles with a new location and previous scores are retained
3. **Given** multiple rounds have been played, **When** I view the leaderboard, **Then** players are ranked by total score

---

### User Story 5 - Pluggable Game System (Priority: P5)

The room system supports multiple game types (starting with Spyfall, with Werewolf planned next), allowing hosts to select which game to play.

**Why this priority**: Future expansion capability. Spyfall alone is sufficient for launch, but the architecture should support adding more games.

**Independent Test**: Can be fully tested by implementing the Spyfall game with a game-agnostic room/player management system, then verifying a second game type can be added without modifying room logic.

**Acceptance Scenarios**:

1. **Given** I am creating a room, **When** I see game type options, **Then** I can select "Spyfall" (with "Werewolf - Coming Soon" grayed out)
2. **Given** I am in a room lobby, **When** I view the room info, **Then** I see which game type is selected
3. **Given** the architecture is built, **When** a developer adds a new game, **Then** only game-specific components need to be created (room/chat/player systems are reused)

---

### Edge Cases

- What happens when a player disconnects mid-game? (They are marked as disconnected; game continues with remaining players; they can rejoin if connection restored within 2 minutes)
- What happens when the room host disconnects? (Host role automatically transfers to the next player who joined; if no players remain, room is closed after 5 minutes)
- What happens when players try to join a room that's already at capacity (10 players)? (They see an error message "Room is full" and cannot join)
- What happens when players try to join a room that doesn't exist? (They see an error message "Room not found")
- What happens when a player tries to start a game with fewer than 4 players? (Start button is disabled with a message "Need at least 4 players")
- What happens when two players choose the same name in the same room? (System appends a number to duplicate names: "John", "John (2)", "John (3)")
- What happens when the timer expires during voting? (Automatic vote submission with "skip" for players who haven't voted)
- What happens when there's a tie in voting? (No one is eliminated; game proceeds to spy guess phase)
- What happens when a player closes their browser mid-game? (Their name persists in localStorage; if they return within 2 minutes and rejoin the same room code, they can resume; otherwise treated as disconnected)

## Requirements _(mandatory)_

### Functional Requirements

**Room Management:**

- **FR-001**: System MUST allow users to create a new room with a unique room code (6-character alphanumeric)
- **FR-002**: System MUST allow users to join an existing room using a valid room code
- **FR-003**: System MUST enforce room capacity limits (minimum 4 players, maximum 10 players)
- **FR-004**: System MUST persist room state even if all players temporarily disconnect (for up to 5 minutes)
- **FR-005**: System MUST automatically transfer host privileges if the current host disconnects

**Player Management:**

- **FR-006**: System MUST allow players to set a display name before joining/creating a room
- **FR-007**: System MUST persist player names in browser storage for convenience on return visits
- **FR-008**: System MUST handle duplicate names by appending unique identifiers
- **FR-009**: System MUST track player connection status in real-time (connected/disconnected)
- **FR-010**: System MUST allow disconnected players to rejoin within 2 minutes and resume their session

**Game Setup:**

- **FR-011**: System MUST support Spyfall game with 100 Thai locations across three difficulty levels: Easy (everyday places), Medium (less common places), Hard (rare/specific places)
- **FR-012**: Host MUST be able to select which difficulty level(s) to include in the game
- **FR-013**: System MUST randomly assign one player as the spy and others as non-spies with location + role
- **FR-014**: System MUST provide unique roles for each non-spy player at a given location
- **FR-015**: Host MUST be able to configure round timer (5-15 minutes in 1-minute increments)

**Gameplay:**

- **FR-016**: System MUST display role assignments privately to each player (spy sees only "You are the spy", non-spies see location + role + reference sheet)
- **FR-017**: System MUST provide real-time text chat for all players with turn indicators
- **FR-018**: System MUST display a countdown timer visible to all players
- **FR-019**: System MUST support a voting phase where each player selects who they suspect is the spy
- **FR-020**: System MUST reveal voting results showing who was eliminated
- **FR-021**: System MUST allow the spy to guess the location if they survive voting
- **FR-022**: System MUST calculate and display scores based on game outcome (spy wins: +2 points, non-spies catch spy: +1 each)

**Real-Time Communication:**

- **FR-023**: System MUST update player lists across all clients within 1 second when players join/leave
- **FR-024**: System MUST deliver chat messages to all room participants within 500ms
- **FR-025**: System MUST synchronize game state (phase changes, timer, votes) across all clients in real-time
- **FR-026**: System MUST handle connection drops gracefully and attempt reconnection

**Multi-Game Architecture:**

- **FR-027**: System MUST be architected to support multiple game types (Spyfall initially, Werewolf and others in future)
- **FR-028**: System MUST display game type selection during room creation
- **FR-029**: Game-specific logic MUST be isolated from room/player/chat management logic

**Localization:**

- **FR-030**: All UI text MUST be in Thai language
- **FR-031**: Role names and game instructions MUST be in Thai

**Note**: FR-011 already specifies 100 Thai locations requirement

### Key Entities

- **Room**: Represents a game session; attributes include unique room code, host player ID, game type, selected difficulty levels, timer duration, current game phase, list of player IDs, created timestamp, last activity timestamp
- **Player**: Represents a participant; attributes include unique player ID, display name, connection status (connected/disconnected/reconnecting), join timestamp, current score, assigned role (spy/non-spy/spectator)
- **Game State**: Represents the current round; attributes include selected location, assigned roles per player, question/answer history, current turn, timer remaining, voting results, round number
- **Location**: Represents a Spyfall location; attributes include Thai name, difficulty level (easy/medium/hard), list of possible roles
- **Message**: Represents a chat message; attributes include sender player ID, message text, timestamp, turn indicator flag
- **Vote**: Represents a player's suspicion; attributes include voter player ID, suspected player ID, timestamp

## Playground Validation _(mandatory)_

**Playground Type**: Interactive web application deployed to a public URL (Cloudflare Pages)

**What It Demonstrates**:

- Room creation with unique code generation and instant lobby access
- Multi-player join flow with real-time player list updates (test with 4+ browser tabs/devices)
- Role assignment (open multiple tabs to see different roles: spy vs non-spy with location)
- Real-time chat with turn indicators and message delivery
- Countdown timer synchronized across all clients
- Voting mechanism with result revelation
- Spy location guess interface (when spy survives voting)
- Score calculation and multi-round persistence
- Connection drop handling (close tab and see player removed from others' views)
- Reconnection flow (close and reopen within 2 minutes to resume)
- Mobile-responsive interface (test on phone, tablet, desktop)

**How to Run**:

1. Open the deployed URL in your primary browser
2. Enter a player name and click "Create Room"
3. Copy the room code shown
4. Open 3-4 additional browser tabs/devices (or use incognito windows)
5. In each new tab, enter a different name, paste the room code, and click "Join Room"
6. Return to the first tab (host) and click "Start Game" once 4+ players are present
7. In each tab, view your role card (one will be spy, others will have location + role)
8. Use the chat in each tab to ask/answer questions
9. Observe the timer counting down
10. When time expires or host triggers voting, select a player to vote for in each tab
11. Observe voting results and score updates
12. If spy survived, test the location guess interface in the spy's tab
13. Test disconnection by closing one tab and observing the player list update in other tabs
14. Test mobile view by opening the room on a smartphone

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Players can create a room and receive a shareable room code in under 5 seconds
- **SC-002**: Players can join a room and see existing players within 3 seconds of entering a valid code
- **SC-003**: Real-time updates (player joins, chat messages, phase changes) appear on all clients within 1 second
- **SC-004**: The system supports 10 concurrent players in a single room with smooth real-time communication
- **SC-005**: The system supports at least 100 concurrent rooms (1000 concurrent players across all rooms)
- **SC-006**: 90% of players successfully complete their first game round within 20 minutes (measured from game start to results screen)
- **SC-007**: Chat messages deliver to all players within 500ms under normal network conditions
- **SC-008**: Disconnected players can rejoin and resume within 2 minutes without losing their role/score
- **SC-009**: The game interface is fully usable on mobile devices (phones and tablets) without horizontal scrolling
- **SC-010**: Timer remains synchronized across all clients with less than 2 seconds drift
- **SC-011**: Players can complete a full game round (setup, question phase, voting, results) within 15 minutes
- **SC-012**: The application works on modern browsers (Chrome, Firefox, Safari, Edge) without requiring plugins
