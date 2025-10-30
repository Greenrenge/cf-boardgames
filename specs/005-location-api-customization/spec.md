# Feature Specification: Location API Customization

**Feature Branch**: `005-location-api-customization`  
**Created**: October 30, 2025  
**Status**: Draft  
**Input**: User description: "the location should single place of truth via api, the translation of location / role should be included in the location data from api, so delete the role/location translation files. user can customize to include or exclude certain locations or roles before starting the game, default from location returned from api. selected location from default and custom locations will be saved in local storage. non host can also save their room's location that host has selected in local storage for later default use. when there is location in localStorage, the location will be merged into the location list from api, if the id matches, the localStorage location will override the api location."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - API as Single Source of Truth (Priority: P1)

The application should fetch all location data including translations from an API, eliminating the need for separate translation files. This ensures consistency and makes updates easier.

**Why this priority**: This is the foundation of the entire feature. Without a centralized API for location data, none of the customization features can work properly. This must be implemented first.

**Independent Test**: Can be fully tested by starting the application, inspecting network requests to verify API calls are made, checking that location data with translations is received, and confirming that old translation files are not being used. Success means the app displays locations and roles in all supported languages using only API data.

**Acceptance Scenarios**:

1. **Given** the application starts, **When** the location data is needed, **Then** the system should make an API call to fetch location data including all translations
2. **Given** the API returns location data, **When** the data is received, **Then** it should include location names, role names, and translations for all supported languages (Thai, English, Chinese, Hindi, Spanish, French, Arabic)
3. **Given** a user switches languages, **When** locations are displayed, **Then** the system should use translations from the API response, not from local translation files
4. **Given** the old translation files (locations.json, roles.json in locale folders) exist, **When** the new API system is implemented, **Then** these files should be removed from the codebase
5. **Given** the API is unavailable, **When** the application tries to fetch location data, **Then** the system should display an appropriate error message and potentially use cached data if available

---

### User Story 2 - Location and Role Customization (Priority: P1)

Users should be able to customize which locations and roles are included in their game before starting. This allows for tailored gameplay experiences based on player preferences.

**Why this priority**: This is core user value - giving players control over their game experience. It can be tested independently once the API integration is working.

**Independent Test**: Can be tested by navigating to the game setup screen, viewing the default locations and roles from the API, selecting/deselecting specific locations or roles, and starting a game to verify only selected items are used in gameplay.

**Acceptance Scenarios**:

1. **Given** a user is setting up a new game, **When** they view the location selection interface, **Then** they should see all locations returned from the API checked by default
2. **Given** a user views the location selection interface, **When** they want to exclude specific locations, **Then** they should be able to uncheck those locations
3. **Given** a user has customized their location selection, **When** they want to exclude specific roles from a location, **Then** they should be able to expand that location and uncheck specific roles
4. **Given** a user has selected their preferred locations and roles, **When** they start the game, **Then** only the selected locations and roles should be available for assignment during gameplay
5. **Given** a user wants to reset their customization, **When** they click a "Reset to Default" button, **Then** all locations and roles should be re-selected based on the API's default configuration
6. **Given** a user has excluded all locations, **When** they try to start the game, **Then** the system should display a validation error preventing game start

---

### User Story 3 - Host Location Selection Persistence (Priority: P2)

When a host (game creator) customizes location and role selections, these preferences should be saved to local storage and automatically applied the next time they create a game.

**Why this priority**: This improves user experience by remembering preferences, but the game is fully functional without this persistence feature.

**Independent Test**: Can be tested by creating a room as a host, customizing location selections, closing the browser, reopening and creating a new room, then verifying the previous selections are pre-applied.

**Acceptance Scenarios**:

1. **Given** a host has customized their location and role selections, **When** they start the game, **Then** the system should save these selections to local storage
2. **Given** a host's selections are saved in local storage, **When** they create a new room in the future, **Then** their previous selections should be automatically applied as defaults
3. **Given** a host has saved selections in local storage, **When** they modify selections in a new room, **Then** the new selections should override the previous saved selections
4. **Given** a host's local storage contains saved selections, **When** the API returns updated location data (new locations added), **Then** the system should merge the saved selections with the new API data appropriately
5. **Given** a host clears their browser data, **When** they create a new room, **Then** the system should fall back to the API's default selections

---

### User Story 4 - Non-Host Location Selection Saving (Priority: P2)

Non-host players (those who join a room) should be able to save the host's selected locations to their own local storage for future use when they create their own games.

**Why this priority**: This is a nice-to-have feature that helps spread good configurations between players, but isn't essential for core gameplay.

**Independent Test**: Can be tested by joining a room as a non-host player, viewing the host's location selections, choosing to save them, then creating a new room and verifying those selections are applied.

**Acceptance Scenarios**:

1. **Given** a non-host player is in a game room, **When** they view the game settings, **Then** they should see which locations and roles the host has selected
2. **Given** a non-host player sees the host's selections, **When** they want to save these selections for their own future games, **Then** they should see a "Save These Selections" button or similar option
3. **Given** a non-host player clicks "Save These Selections", **When** the selections are saved, **Then** the system should store them in the player's local storage
4. **Given** a non-host player has saved a host's selections, **When** they create their own room in the future, **Then** those saved selections should be applied as their defaults
5. **Given** a non-host player has saved multiple hosts' selections over time, **When** they create a new room, **Then** only the most recently saved selections should be applied

---

### User Story 5 - Local Storage and API Merge Strategy (Priority: P1)

When location data exists in both local storage and the API response, the system should intelligently merge them, with local storage overriding API data for matching location IDs.

**Why this priority**: This is critical for the customization system to work correctly. Without proper merge logic, user customizations could be lost or cause conflicts.

**Independent Test**: Can be tested by manually setting location data in local storage, fetching fresh API data, and verifying the merge behavior: matching IDs use local storage values, new API locations are added, removed locations are handled gracefully.

**Acceptance Scenarios**:

1. **Given** a user has customized location data in local storage with ID "location-001", **When** the API returns data that also includes "location-001", **Then** the system should use the local storage version for that location
2. **Given** a user has location data in local storage, **When** the API returns new locations that don't exist in local storage, **Then** the system should add those new locations to the available list
3. **Given** a user has location data in local storage for a location ID that no longer exists in the API response, **When** the data is merged, **Then** the system should keep the location from local storage and include it in the available locations list (users retain access to previously saved locations)
4. **Given** a user has customized only the selected/unselected state in local storage, **When** the API returns updated translation data for that location, **Then** the system should use the API's translation data but preserve the user's selection state
5. **Given** the merge process completes, **When** locations are displayed to the user, **Then** they should see a unified list combining both sources without duplicates

---

### User Story 6 - Export and Import Configurations (Priority: P3)

Users should be able to export their customized location and role selections to a file for backup purposes, and import previously exported configurations to restore or share settings across browsers or devices.

**Why this priority**: This is a convenience feature that adds value for power users and those who use multiple devices, but the core functionality works without it. It can be implemented independently after the main customization features.

**Independent Test**: Can be tested by customizing location selections, exporting to a JSON file, clearing local storage or opening a different browser, importing the file, and verifying the selections are restored correctly.

**Acceptance Scenarios**:

1. **Given** a user has customized their location and role selections, **When** they click an "Export Configuration" button, **Then** a JSON file containing their selections should be downloaded to their device
2. **Given** a user has an exported configuration file, **When** they click an "Import Configuration" button and select the file, **Then** the system should load and apply those selections
3. **Given** a user imports a configuration file, **When** they already have existing selections in local storage, **Then** the system should ask whether to merge or replace existing selections
4. **Given** a user imports a configuration file with invalid data, **When** the system validates the file, **Then** an error message should be displayed explaining the issue without breaking the application
5. **Given** a user imports a configuration file from an older version, **When** the system detects version differences, **Then** it should attempt to migrate the data or display a compatibility warning
6. **Given** a user successfully imports a configuration, **When** they view the location selection interface, **Then** the imported selections should be applied and visible

---

### Edge Cases

- **What happens when the API returns malformed data?** The system should validate API responses and fall back to cached data or display an error message, preventing the application from breaking.
- **What happens when local storage is full?** The system should handle storage quota errors gracefully, potentially removing older saved configurations to make room for new ones.
- **What happens when a user has saved selections for 100 locations but the API now only returns 50?** The system should merge both sets - keeping all 100 locations from local storage plus any new ones from the API (total would be 100+ locations).
- **Can users export and import their location customizations?** Yes, users should be able to export their customized location configurations to a JSON file and import previously exported configurations, enabling backup and sharing across devices/browsers.
- **How does the system handle concurrent updates to local storage?** If a user has multiple browser tabs open, the system should use the most recent updates or notify the user of conflicts.
- **What happens if two locations have the same ID but different data in API vs local storage?** The local storage version should always take precedence for matching IDs (as specified in requirements).
- **How are translations handled when a user customizes a location in local storage?** The local storage location object should include all translation data to ensure the location displays correctly in all languages.
- **What happens when the API changes the data structure for locations?** The system should handle version mismatches between local storage data format and API data format, potentially migrating or resetting stored data.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide an API endpoint that returns all location data including location IDs, names, roles, and translations for all supported languages
- **FR-002**: System MUST remove all separate translation files for locations and roles (locales/{language}/locations.json and locales/{language}/roles.json)
- **FR-003**: System MUST fetch location data from the API when the application initializes or when location data is needed
- **FR-004**: System MUST display all locations returned from the API as selected by default in the game setup interface
- **FR-005**: System MUST provide a user interface for users to select or deselect specific locations before starting a game
- **FR-006**: System MUST provide a user interface for users to select or deselect specific roles within each location
- **FR-007**: System MUST prevent game start if no locations are selected, displaying an appropriate validation error
- **FR-008**: System MUST only use selected locations and roles during gameplay (for role assignment and spy guessing)
- **FR-009**: System MUST save location and role selections to local storage when a host starts a game
- **FR-010**: System MUST automatically load saved selections from local storage when a host creates a new room
- **FR-011**: System MUST display the host's selected locations and roles to non-host players in the room
- **FR-012**: System MUST provide a button or option for non-host players to save the host's selections to their own local storage
- **FR-013**: System MUST merge location data from local storage with location data from the API when both exist
- **FR-014**: System MUST use local storage location data for any location where the ID matches an API location ID (local storage overrides API)
- **FR-015**: System MUST add new locations from the API that don't exist in local storage to the available locations list
- **FR-016**: System MUST include complete translation data for all supported languages in the API response for each location and role
- **FR-017**: System MUST validate API response data structure before using it, handling errors gracefully
- **FR-018**: System MUST provide a "Reset to Default" option that reloads selections from the API, ignoring local storage overrides
- **FR-019**: System MUST provide an export function that generates a downloadable JSON file containing the user's customized location selections and configurations
- **FR-020**: System MUST provide an import function that accepts a previously exported JSON file and applies those location selections and configurations
- **FR-021**: System MUST validate imported configuration files before applying them, ensuring data integrity and compatibility with the current location data structure
- **FR-022**: System MUST merge imported configurations with existing local storage data, allowing users to keep or override their current selections during import

### Key Entities

- **Location**: Contains ID, name translations (all languages), array of roles, visibility flags, and metadata
  - Properties: id (string), names (object with language codes as keys), roles (array), isSelected (boolean), customData (object for user modifications)
- **Role**: Contains role name translations for all languages, linked to a parent location
  - Properties: id (string), names (object with language codes as keys), locationId (string), isSelected (boolean)
- **Location Selection**: User's preferences for which locations and roles are included in gameplay
  - Properties: locationId (string), isSelected (boolean), selectedRoles (array of role IDs), timestamp (date)
- **API Response**: Structured data returned from the location API
  - Properties: locations (array of Location objects), version (string), timestamp (date)
- **Local Storage Config**: Saved user preferences and customized location data
  - Properties: selections (array of Location Selection objects), customLocations (array of modified Location objects), lastUpdated (date)
- **Merged Location List**: Final list of locations combining API data and local storage overrides
  - Created at runtime by merging API response with local storage data based on ID matching

## Playground Validation _(mandatory)_

**Playground Type**: Interactive web application demonstration

**What It Demonstrates**:

- API successfully returns location data with all translations
- Old translation files are removed and not referenced in code
- Location selection UI displays all locations from API
- Users can select/deselect locations and roles
- Validation prevents game start with no locations selected
- Game only uses selected locations and roles during gameplay
- Host selections are saved to local storage
- Host's saved selections are automatically loaded on next room creation
- Non-host players can view host's selections
- Non-host players can save host's selections to their own local storage
- Local storage data merges correctly with API data (local storage overrides matching IDs)
- New API locations are added to the merged list
- Translation data from API works correctly in all supported languages
- Users can export their configuration to a JSON file
- Users can import a previously exported configuration file
- Import validation catches invalid or malformed configuration files

**How to Run**:

1. Start the development server: `npm run dev`
2. Open the application in a browser: `http://localhost:3000`
3. Verify API integration:
   - Open browser DevTools Network tab
   - Create a new room
   - Verify API call is made to fetch location data
   - Inspect response to confirm it includes translations for all languages
4. Test location customization:
   - In the game setup screen, verify all locations are checked by default
   - Uncheck several locations
   - Expand a location and uncheck specific roles
   - Try to start with all locations unchecked (should show error)
   - Re-check some locations and start the game
   - Verify only selected locations appear during gameplay
5. Test host persistence:
   - Close the browser
   - Reopen and create a new room
   - Verify previous selections are pre-applied
6. Test non-host saving:
   - Open a second browser window
   - Join the room created in step 5
   - View the host's selections
   - Click "Save These Selections"
   - Create a new room as host in this second window
   - Verify saved selections are applied
7. Test merge behavior:
   - Use browser DevTools Application tab to view local storage
   - Manually modify a location's data in local storage
   - Refresh the page
   - Verify the modified data is used instead of API data for that location
8. Test translation consistency:
   - Switch between all supported languages
   - Verify location and role names display correctly from API data
   - Confirm no references to old translation files
9. Test export/import functionality:
   - Customize location selections
   - Export configuration to a file
   - Clear local storage or open a new browser
   - Import the configuration file
   - Verify selections are restored correctly
   - Test importing an invalid file and verify error handling

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of location data including all translations is fetched from the API within 3 seconds of application start
- **SC-002**: Zero references to old translation files (locales/{language}/locations.json, roles.json) remain in the codebase
- **SC-003**: Users can successfully customize location and role selections and start a game with only selected items appearing in gameplay
- **SC-004**: Host's location selections persist correctly across 100% of browser session restarts
- **SC-005**: Non-host players can successfully save a host's selections and have them applied to their own future games 100% of the time
- **SC-006**: Local storage location data overrides API data for matching IDs in 100% of cases
- **SC-007**: New locations from API are added to merged list in 100% of cases
- **SC-008**: System prevents game start when no locations are selected 100% of the time
- **SC-009**: Users can switch between all supported languages and see correct translations from API data without any display errors
- **SC-010**: API request failures are handled gracefully without crashing the application 100% of the time
- **SC-011**: Users can successfully reset to default API selections, clearing local storage overrides, 100% of the time
- **SC-012**: Users can successfully export their configuration and import it on a different browser or device with 100% fidelity
- **SC-013**: Invalid or corrupted configuration files are rejected during import with appropriate error messages 100% of the time

## Assumptions _(optional)_

- The API endpoint is accessible and has reasonable response times (< 3 seconds)
- The API response format is versioned and backward compatible
- Browser local storage is available and not disabled by user settings
- Local storage has sufficient capacity for storing customized location data (typically 5-10MB available)
- The existing application uses a component-based architecture that can be refactored to use API data instead of local files
- The API provides adequate error responses for troubleshooting connection issues
- Location IDs are stable and won't change frequently (to ensure local storage overrides work correctly)
- Users have a reliable internet connection to fetch API data on application start
- The API includes rate limiting or caching to handle multiple concurrent requests
- Location data structure in the API matches or can be easily mapped to the current application's data model

## Dependencies _(optional)_

- API endpoint for location data (needs to be developed or existing endpoint needs to be modified)
- HTTP client library for making API requests (fetch API or axios)
- Local storage API for persisting user selections
- Validation library for API response validation
- Error handling and logging system for API failures
- Migration script to remove old translation files from the codebase
- Potentially a caching layer (service worker or in-memory cache) for offline functionality

## Out of Scope _(optional)_

- Creating custom locations from scratch (users can only select/deselect existing API locations)
- Editing location names or role names (users can only include/exclude, not modify content)
- Sharing customized location configurations between users via cloud sync or social features
- Offline mode with full functionality (API must be accessible to fetch initial data)
- Admin interface for managing location data in the API
- Analytics on which locations are most frequently selected/deselected
- Location recommendation system based on player preferences
- Version conflict resolution when local storage data format is outdated
- Multi-device sync of location preferences (only local browser storage)
- User authentication or account system for storing preferences server-side
