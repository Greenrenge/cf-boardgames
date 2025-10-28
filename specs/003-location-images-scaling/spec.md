# Feature Specification: Location Images & Player Scaling

**Feature Branch**: `003-location-images-scaling`  
**Created**: 2025-10-28  
**Status**: Draft  
**Input**: User description: "to show image properly. 3:2 ratio full width. at the room page. while spy can browse all location images in the list for see what possibly location that everyone is talking about. non-spy player has only one location image. add total 20 person possible add 1-3 spy person setting."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Location Image as Non-Spy (Priority: P1)

Non-spy players see a prominent, properly-formatted image of their assigned location to help them immerse in the game and reference during discussions.

**Why this priority**: This is the core visual enhancement that improves game experience immediately. Non-spy players need to see what location they're in, and this must work properly for the game to be playable with images.

**Independent Test**: Can be fully tested by starting a game, viewing the role card as a non-spy player, and verifying a 3:2 aspect ratio image appears at full width showing the assigned location.

**Acceptance Scenarios**:

1. **Given** I am a non-spy player and the game has started, **When** I view my role card, **Then** I see my location image displayed at full width with a 3:2 aspect ratio
2. **Given** I am a non-spy player, **When** I view my role card on a mobile device, **Then** the location image scales to full screen width while maintaining 3:2 ratio
3. **Given** I am a non-spy player, **When** I view my role card, **Then** I see only one location image (my assigned location)
4. **Given** I am a non-spy player, **When** the location image is loading, **Then** I see a loading indicator until the image appears
5. **Given** I am a non-spy player, **When** the location image fails to load, **Then** I see the location name as text fallback

---

### User Story 2 - Browse All Location Images as Spy (Priority: P2)

Spy players can browse through all available location images to help them understand what location others might be talking about and make strategic decisions.

**Why this priority**: This provides the spy with crucial visual information to play their role effectively. Without this, spies have a significant disadvantage in image-based games.

**Independent Test**: Can be fully tested by starting a game as the spy, accessing the location browser interface, and verifying all location images can be scrolled through and viewed at 3:2 ratio.

**Acceptance Scenarios**:

1. **Given** I am the spy and the game has started, **When** I view my role card, **Then** I see a browsable list/grid of all possible location images
2. **Given** I am the spy viewing location images, **When** I scroll through the list, **Then** each image displays at 3:2 aspect ratio with the location name
3. **Given** I am the spy, **When** I tap/click on a location image, **Then** I see an enlarged view of that specific location
4. **Given** I am the spy viewing the location browser, **When** I use the interface, **Then** the locations are organized alphabetically or by difficulty level for easy reference
5. **Given** I am the spy, **When** I view the location images on mobile, **Then** the grid/list layout adapts responsively while maintaining image quality

---

### User Story 3 - Host Configures Player Capacity (Priority: P3)

Room hosts can configure the maximum player capacity from 4-20 players before starting the game, allowing for larger game groups.

**Why this priority**: This enables larger parties and events to play together, but smaller games (4-10 players) are fully functional for MVP.

**Independent Test**: Can be fully tested by creating a room, adjusting the max player setting to different values (4-20), and verifying that the correct number of players can join before the room becomes full.

**Acceptance Scenarios**:

1. **Given** I am creating a room, **When** I view game settings, **Then** I see a player capacity selector with options from 4 to 20 players
2. **Given** I am the host in the lobby, **When** I adjust the max players setting, **Then** the lobby UI updates to reflect the new capacity limit
3. **Given** the room has reached max capacity, **When** another player tries to join, **Then** they see "Room is full" error message
4. **Given** I am the host, **When** I change max capacity to a number lower than current players, **Then** the system prevents this with a warning message
5. **Given** I have set max capacity to 20, **When** 20 players have joined, **Then** the start game button becomes enabled

---

### User Story 4 - Host Configures Spy Count (Priority: P4)

Room hosts can set the number of spies (1-3) before starting the game, adding strategic variety for larger player groups.

**Why this priority**: Multiple spies add gameplay depth and scale better with larger groups, but single-spy games are the standard and fully functional.

**Independent Test**: Can be fully tested by creating a room, setting spy count to 2 or 3, starting a game with sufficient players, and verifying the correct number of spies are assigned with all spies able to browse locations.

**Acceptance Scenarios**:

1. **Given** I am creating a room, **When** I view game settings, **Then** I see a spy count selector with options: 1, 2, or 3 spies
2. **Given** I am the host, **When** I select 2 spies with 8 players total, **Then** the game starts with exactly 2 spy players and 6 non-spy players
3. **Given** I am one of multiple spies, **When** I view my role card, **Then** I see "You are the Spy" and can browse all locations (but don't know who the other spy is)
4. **Given** I am the host, **When** I select 3 spies but have only 7 players, **Then** the system shows a warning that at least 9 players are needed for 3 spies
5. **Given** the voting phase ends with multiple spies, **When** any spy survives, **Then** all surviving spies collaborate on location guess (only one guess total)

---

### User Story 5 - Dynamic Role Assignment for Larger Groups (Priority: P5)

The system automatically adapts role assignment to support 11-20 players with appropriate location role distribution and scoring adjustments.

**Why this priority**: This ensures the game remains balanced and fair with larger groups, but is only needed once player scaling is implemented.

**Independent Test**: Can be fully tested by starting games with 11-20 players and verifying that all non-spy players receive unique roles (with repetition only if location has fewer roles than players minus spies).

**Acceptance Scenarios**:

1. **Given** a game starts with 15 players and 1 spy, **When** roles are assigned, **Then** 14 non-spy players receive roles (with duplicates only if the location has fewer than 14 roles)
2. **Given** a game starts with 20 players and 2 spies, **When** roles are assigned, **Then** 18 non-spy players receive roles with a fair distribution
3. **Given** a location has only 7 roles but 14 non-spies, **When** roles are assigned, **Then** each role is assigned to exactly 2 players
4. **Given** a game with 20 players ends, **When** scoring is calculated, **Then** points are distributed fairly (spies win: +2 each, non-spies catch all spies: +1 each)

---

### Edge Cases

- What happens when a location image URL is broken or inaccessible? (System falls back to displaying location name in text, game continues normally)
- What happens when multiple spies try to guess locations simultaneously? (Only the first spy to submit the guess is counted; others see a message that a guess has been submitted)
- What happens when host changes spy count after some players have joined? (Setting is locked once game starts; can only be changed in lobby before game begins)
- What happens when host tries to set 3 spies with only 6 total players? (System enforces minimum ratio: need at least 3x spy count in total players, shows error "Need at least 9 players for 3 spies")
- What happens when a spy disconnects mid-game in a multi-spy game? (Remaining spies continue playing; if all spies disconnect, non-spies win automatically)
- What happens when browsing location images with slow internet? (Images lazy-load as user scrolls; loading indicators show progress; game continues even if some images haven't loaded yet)
- What happens when a player's device has low memory and can't load all location images? (Images load on-demand as spy scrolls; older images may be unloaded from memory to preserve performance)
- What happens when viewing location images on very small screens (< 320px width)? (Images scale down but maintain 3:2 ratio; grid switches to single-column layout for readability)

## Requirements *(mandatory)*

### Functional Requirements

**Image Display & Formatting:**

- **FR-001**: System MUST display location images in 3:2 aspect ratio (width:height)
- **FR-002**: System MUST display location images at full container width on all device sizes
- **FR-003**: System MUST maintain image quality without pixelation or distortion when scaling
- **FR-004**: System MUST apply consistent styling to all location images (border radius, shadow, spacing)
- **FR-005**: System MUST show a loading indicator while images are being fetched
- **FR-006**: System MUST provide text fallback (location name) if image fails to load

**Role-Based Image Access:**

- **FR-007**: Non-spy players MUST see exactly one location image (their assigned location)
- **FR-008**: Spy players MUST see a browsable collection of all available location images
- **FR-009**: Spy players MUST be able to view location images in a grid or list layout
- **FR-010**: Spy players MUST be able to see location names alongside images
- **FR-011**: System MUST organize spy's location browser by difficulty level or alphabetically
- **FR-012**: Spy players MUST be able to enlarge individual location images for closer inspection

**Player Capacity Scaling:**

- **FR-013**: System MUST support configurable player capacity from 4 to 20 players per room
- **FR-014**: Host MUST be able to set max player capacity during room creation or in lobby before game starts
- **FR-015**: System MUST prevent players from joining when room reaches max capacity
- **FR-016**: System MUST prevent host from reducing max capacity below current player count
- **FR-017**: System MUST display current player count and max capacity in lobby UI (e.g., "8/20 players")
- **FR-018**: System MUST enforce minimum 4 players to start game regardless of max capacity setting

**Spy Count Configuration:**

- **FR-019**: System MUST support configurable spy count: 1, 2, or 3 spies per game
- **FR-020**: Host MUST be able to set spy count during room creation or in lobby before game starts
- **FR-021**: System MUST enforce minimum player-to-spy ratio: at least 3x spy count total players (e.g., 3 spies require at least 9 total players)
- **FR-022**: System MUST randomly select the specified number of spies from all players when game starts
- **FR-023**: System MUST ensure multiple spies do not know each other's identities
- **FR-024**: System MUST allow all spies to browse location images independently

**Role Assignment for Large Groups:**

- **FR-025**: System MUST assign unique roles to non-spy players when location has sufficient roles
- **FR-026**: System MUST handle role repetition fairly when location has fewer roles than non-spy players (distribute evenly)
- **FR-027**: System MUST validate that selected locations have appropriate role counts for the player count
- **FR-028**: System MUST display role assignment clearly even in games with 20 players

**Scoring Adjustments:**

- **FR-029**: System MUST award +2 points to each spy if all spies survive voting
- **FR-030**: System MUST award +1 point to each non-spy if all spies are caught
- **FR-031**: System MUST award +2 points to all spies if any surviving spy correctly guesses the location
- **FR-032**: System MUST handle mixed outcomes (some spies caught, some survive) with partial scoring

**Performance & UX:**

- **FR-033**: System MUST lazy-load location images to optimize performance with large image sets
- **FR-034**: System MUST cache loaded images to avoid repeated network requests
- **FR-035**: System MUST provide responsive layout for location image browser on mobile devices
- **FR-036**: System MUST maintain smooth scrolling performance when browsing 70+ location images on mobile

### Key Entities

- **Location Image**: Represents visual reference for a location; attributes include image URL, aspect ratio (3:2), loading state, display dimensions
- **Player Capacity Config**: Represents room size setting; attributes include maximum players (4-20), current player count, is capacity locked
- **Spy Config**: Represents spy count setting; attributes include number of spies (1-3), minimum required players for this spy count
- **Role Assignment**: Enhanced entity; attributes include player ID, role type (spy/non-spy), assigned location (if non-spy), assigned specific role, is duplicate role flag (for large groups)
- **Image Cache Entry**: Represents cached image data; attributes include location ID, image blob/data, cache timestamp, cache hit count

## Playground Validation *(mandatory)*

**Playground Type**: Interactive web application deployed to public URL (existing Cloudflare Pages deployment)

**What It Demonstrates**:

- Location image display at 3:2 ratio full width for non-spy players
- Location image browser with scrollable grid/list for spy players
- Image lazy-loading and caching performance
- Responsive image layout on mobile, tablet, and desktop
- Player capacity configuration from 4-20 players
- Spy count configuration from 1-3 spies
- Room capacity enforcement (joining when full)
- Role assignment for games with 11-20 players
- Multiple spies independently browsing locations
- Scoring calculations for multi-spy scenarios
- Image loading fallback behavior
- Performance with large player groups (15-20 players)

**How to Run**:

1. **Test Image Display (Non-Spy)**:
   - Create a room, invite 3+ players, start game
   - View role card as non-spy player
   - Verify single location image appears at full width, 3:2 ratio
   - Test on mobile, tablet, desktop for responsive scaling
   - Test with slow network (throttle to 3G) to see loading indicator

2. **Test Location Browser (Spy)**:
   - Create a room, invite 3+ players, start game
   - View role card as spy player
   - Verify browsable grid/list of all 70+ locations
   - Scroll through entire list, check 3:2 ratio maintained
   - Tap/click location to see enlarged view
   - Test grid responsiveness on different screen sizes
   - Test lazy-loading by scrolling quickly

3. **Test Player Capacity Scaling**:
   - Create room, set max capacity to 15 players
   - Open 15 browser tabs/devices, join room with different names
   - Verify 15th player can join successfully
   - Attempt to join with 16th player, verify "Room is full" error
   - Try reducing max capacity below 15, verify prevented with warning
   - Start game with 15 players, verify all receive roles

4. **Test Spy Count Configuration**:
   - Create room with 10 players, set spy count to 2
   - Start game, verify exactly 2 players are spies
   - Verify both spies can browse locations independently
   - Play through voting, catch only 1 spy
   - Verify surviving spy can guess location
   - Create room with 6 players, try setting 3 spies
   - Verify error: "Need at least 9 players for 3 spies"

5. **Test Large Group Gameplay**:
   - Create room with 20 players, 3 spies
   - Start game, verify 17 non-spies all receive roles
   - Check if any roles are duplicated (expected for locations with <17 roles)
   - Complete game, verify scoring is distributed correctly
   - Test chat and voting with 20 active participants

6. **Test Edge Cases**:
   - Break an image URL, verify text fallback appears
   - Disconnect spy mid-browse, reconnect, verify images still load
   - Test with very slow network (2G) to see progressive image loading
   - Test on device with limited memory (old phone) for performance

## Success Criteria *(mandatory)*

### Measurable Outcomes

**Image Display & Performance:**

- **SC-001**: Location images display at exactly 3:2 aspect ratio across all device sizes with less than 2% distortion
- **SC-002**: Location images scale to full container width (100%) on screens from 320px to 2560px wide
- **SC-003**: Non-spy players see their location image load within 2 seconds on standard 4G connection
- **SC-004**: Spy players can scroll through all 70+ location images with smooth 60fps performance on modern mobile devices
- **SC-005**: Image cache reduces repeated load times by at least 80% on second view
- **SC-006**: Image fallback (text) appears within 500ms if image fails to load

**Player Scaling:**

- **SC-007**: Rooms support 20 concurrent players with real-time updates delivered within 1 second to all participants
- **SC-008**: Games with 20 players can start and assign all roles within 5 seconds
- **SC-009**: Host can change player capacity setting and see UI update within 500ms
- **SC-010**: Room capacity enforcement prevents joining when full with error message appearing within 1 second

**Spy Configuration:**

- **SC-011**: Host can configure spy count (1-3) and setting is applied correctly 100% of the time in role assignment
- **SC-012**: Multi-spy games (2-3 spies) distribute spy roles randomly with equal probability for all players
- **SC-013**: All spies in multi-spy games can independently browse location images with no coordination issues
- **SC-014**: Minimum player requirement for spy count is enforced 100% of the time before game start

**User Experience:**

- **SC-015**: 90% of players can successfully identify their location from the image within 10 seconds
- **SC-016**: Spy players can find a specific location in the browser within 30 seconds
- **SC-017**: Games with 15-20 players complete full rounds (setup through results) within 20 minutes
- **SC-018**: Mobile users can view and interact with location images without horizontal scrolling or pinch-zoom
- **SC-019**: Players on slow networks (3G, 1Mbps) can still view images with progressive loading within 10 seconds
- **SC-020**: System maintains 95% uptime for image hosting service with failover to text display when needed
