# Feature Specification: Multi-Language Support

**Feature Branch**: `004-multi-language`  
**Created**: October 30, 2025  
**Status**: Draft  
**Input**: User description: "from the beginning this was designed for Thai language only, now I want it has multiple language with thai / english / Mandarin Chinese / Hindi / Spanish / French and Arabic, the user able to switch the language easily in all pages. the location master only have the Thai name, so you need to modify it for those languages. all the UI must be translated to those language as well. the translation is a part of this specs."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Language Selection (Priority: P1)

A new player visits the application and wants to use it in their preferred language. They should be able to select their language from a visible and accessible language switcher on any page of the application.

**Why this priority**: This is the foundation of the entire multi-language feature. Without the ability to switch languages, users cannot access any translated content. This is the minimum viable product that must work independently.

**Independent Test**: Can be fully tested by opening the application, locating the language switcher (should be visible on all pages), selecting a different language, and verifying that the UI immediately updates to show content in the selected language. Success means the language preference is applied and persists across page navigation.

**Acceptance Scenarios**:

1. **Given** a user visits the homepage for the first time, **When** they look at the navigation area, **Then** they should see a language switcher displaying available language options (Thai, English, Mandarin Chinese, Hindi, Spanish, French, Arabic)
2. **Given** a user clicks on the language switcher, **When** they select a different language, **Then** all UI text on the current page should immediately update to the selected language
3. **Given** a user has selected their preferred language, **When** they navigate to any other page in the application, **Then** the UI should remain in their selected language
4. **Given** a user has selected their preferred language, **When** they close the browser and return later, **Then** their language preference should be remembered and automatically applied

---

### User Story 2 - Location Names Translation (Priority: P1)

Players need to see location names in their selected language during gameplay. The spy-finding mechanics depend on players understanding location names, so translations must be accurate and culturally appropriate.

**Why this priority**: Location names are core game content. Without translated location names, non-Thai speakers cannot play the game effectively. This delivers immediate value and can be tested independently of other features.

**Independent Test**: Can be fully tested by switching to each supported language and viewing the location list in the lobby or during gameplay. Verify that all 84 locations display names in the selected language. For languages with right-to-left text (Arabic), verify proper text direction rendering.

**Acceptance Scenarios**:

1. **Given** a player has selected English as their language, **When** they view the location list in the lobby, **Then** all location names should be displayed in English
2. **Given** a player has selected Mandarin Chinese, **When** the game starts and they view their role card, **Then** the location name should be displayed in Chinese characters
3. **Given** a player has selected Arabic, **When** they view any location name, **Then** the text should be displayed right-to-left with proper Arabic script
4. **Given** a player views the location reference during gameplay, **When** they scroll through all locations, **Then** every location name should be translated (no Thai text should appear when a different language is selected)
5. **Given** multiple players in different languages join the same game, **When** they each view the same location, **Then** each player should see the location name in their own selected language

---

### User Story 3 - Role Names Translation (Priority: P2)

Players receive role cards with specific roles at each location. These role names must be translated so players can understand their assigned role and answer questions appropriately.

**Why this priority**: Role names are essential for gameplay immersion and strategy, but the game is technically playable even if role names remain in Thai (players can still identify as "not the spy"). However, for a complete experience, role translations are needed.

**Independent Test**: Can be tested by starting a game, assigning roles to players, and verifying that each role name appears in the player's selected language on their role card. Test with all 84 locations and verify all 7 roles per location are translated.

**Acceptance Scenarios**:

1. **Given** a player has selected Spanish as their language, **When** they receive their role card at game start, **Then** their role name should be displayed in Spanish
2. **Given** a player is viewing another player's role (post-game results), **When** they see the roles list, **Then** all role names should be in their selected language
3. **Given** a player views the location reference during gameplay, **When** they expand a location to see possible roles, **Then** all role names for that location should be displayed in their selected language
4. **Given** a spy player views the location browser, **When** they browse through locations and roles, **Then** all role names should be consistently translated across all locations

---

### User Story 4 - Complete UI Translation (Priority: P2)

All user interface elements including buttons, labels, messages, instructions, error messages, and gameplay prompts must be translated to provide a fully localized experience.

**Why this priority**: While users might navigate basic functions with untranslated UI if locations/roles are translated, a professional application requires complete UI translation. This can be implemented and tested independently from location/role translation.

**Independent Test**: Can be tested by systematically navigating through every page and feature (homepage, create room, join room, lobby, game screen, results screen) in each language and verifying that all text elements are translated. No English or Thai text should appear when another language is selected.

**Acceptance Scenarios**:

1. **Given** a user has selected French, **When** they view the homepage, **Then** all buttons ("Create Room", "Join Room"), headings, and descriptions should be in French
2. **Given** a user has selected Hindi, **When** they create a new room, **Then** all form labels, placeholders, validation messages, and button text should be in Hindi
3. **Given** a user has selected Mandarin Chinese, **When** they are in the lobby, **Then** all game settings labels, difficulty options, timer labels, and action buttons should be in Chinese
4. **Given** a user has selected Arabic, **When** they are in an active game, **Then** all gameplay instructions, chat interface, voting interface, and timer labels should be in Arabic with proper right-to-left layout
5. **Given** a user encounters an error (invalid room code, connection lost, etc.), **When** the error message is displayed, **Then** the error message should be in their selected language
6. **Given** a user views the results screen after a game, **When** they see game outcome messages and player statistics, **Then** all text should be in their selected language

---

### User Story 5 - Language Switcher Accessibility (Priority: P3)

The language switcher should be intuitive and accessible, displaying language names in their native scripts (Thai as "ไทย", Arabic as "العربية", etc.) and be easily findable on all pages.

**Why this priority**: While functional language switching is P1, enhanced UX features like native script display and optimal placement improve user experience but aren't critical for basic functionality.

**Independent Test**: Can be tested by examining the language switcher component on different pages, verifying that language names are displayed in their native scripts, and confirming that the switcher is consistently positioned and visible.

**Acceptance Scenarios**:

1. **Given** a user views the language switcher, **When** they see the language options, **Then** each language should be displayed in its native script (e.g., "English", "ไทย", "中文", "हिंदी", "Español", "Français", "العربية")
2. **Given** a user is on any page, **When** they look for the language switcher, **Then** it should be in a consistent, easily discoverable location (e.g., top navigation bar)
3. **Given** a user has selected a language, **When** they view the language switcher, **Then** the currently selected language should be visually indicated
4. **Given** a user with a mobile device, **When** they access the language switcher, **Then** it should be easily tappable and the dropdown/menu should be touch-friendly

---

### Edge Cases

- **What happens when a user's browser language matches one of the supported languages?** The application should automatically detect and set the initial language to match the user's browser language preference (if supported), otherwise default to Thai.
- **How does the system handle partial translations if translation data is missing?** If a specific translation key is missing, the system should fall back to English, then Thai as a last resort, and log the missing translation for developers.
- **What happens when a location or role name contains cultural context that doesn't translate directly?** Translations should use cultural adaptation (localization) rather than literal translation. For example, "ร้านสะดวกซื้อ 7-11" might become "Convenience Store" in English rather than "7-11 Store" if 7-11 isn't culturally relevant.
- **How does the system handle right-to-left (RTL) languages like Arabic?** The entire layout should mirror for RTL languages - text direction, flex layouts, and navigation elements should all adapt appropriately.
- **What happens when players in the same game room have different language preferences?** Each player should see all content in their own selected language independently. The game state should store language-neutral identifiers (IDs), and clients should render translations based on their preferences.
- **How are dynamic messages (e.g., "[Player name] has joined the room") translated?** Use parameterized translations where player names, numbers, and other dynamic values are injected into translated template strings.
- **What happens during gameplay when a player changes their language mid-game?** The UI should update immediately without disrupting the game state. All current game information should re-render in the new language.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST support exactly seven languages: Thai, English, Mandarin Chinese, Hindi, Spanish, French, and Arabic
- **FR-002**: System MUST provide a language switcher component that is visible and accessible on every page of the application
- **FR-003**: System MUST persist the user's selected language preference across browser sessions using local storage
- **FR-004**: System MUST detect the user's browser language preference and automatically set the initial language if it matches a supported language, otherwise default to Thai
- **FR-005**: System MUST immediately update all UI text when a user changes their language selection without requiring a page reload
- **FR-006**: System MUST translate all 84 location names into all seven supported languages
- **FR-007**: System MUST translate all role names (7 roles per location, 588 total roles) into all seven supported languages
- **FR-008**: System MUST translate all UI text including buttons, labels, form fields, error messages, success messages, instructions, and gameplay prompts
- **FR-009**: System MUST properly render right-to-left (RTL) text for Arabic, including mirroring the layout direction
- **FR-010**: System MUST display language names in the language switcher using their native scripts (e.g., "ไทย" for Thai, "العربية" for Arabic)
- **FR-011**: System MUST visually indicate the currently selected language in the language switcher
- **FR-012**: System MUST handle missing translations by falling back to English, then Thai, and logging the missing translation key
- **FR-013**: System MUST support parameterized translations for dynamic content (player names, numbers, timestamps)
- **FR-014**: System MUST ensure that players in the same game room can each use different language preferences independently
- **FR-015**: System MUST store location and role identifiers as language-neutral IDs in the game state
- **FR-016**: System MUST allow language changes during active gameplay without disrupting the game state
- **FR-017**: System MUST adapt cultural context appropriately in translations (localization, not just literal translation)
- **FR-018**: System MUST maintain consistent terminology across all translated content within each language

### Key Entities

- **Translation Key**: A unique identifier for each translatable text string (e.g., "common.createRoom", "location.hospital.name", "role.hospital.doctor")
- **Language Code**: A standardized code for each supported language (e.g., "th", "en", "zh", "hi", "es", "fr", "ar")
- **Translation Dictionary**: A structured collection of translation keys and their corresponding translated values for a specific language
- **Location Translation**: Contains translated name for a location, linked to the location ID
- **Role Translation**: Contains translated name for a role, linked to both location ID and role index/ID
- **User Language Preference**: A stored preference indicating which language a user has selected
- **Language Context**: Runtime state that determines which translations are currently active for rendering

## Playground Validation _(mandatory)_

**Playground Type**: Interactive web application demonstration

**What It Demonstrates**:

- Complete language switching functionality across all seven supported languages
- All UI text translations in every language
- All 84 location names properly translated in each language
- All 588 role names properly translated in each language
- Language persistence across page navigation and browser sessions
- Right-to-left layout for Arabic language
- Language switcher component behavior and current language indication
- Multi-player scenario where different players use different languages in the same game room
- Error message translation and fallback behavior
- Dynamic content translation with parameterized values

**How to Run**:

1. Start the development server: `npm run dev`
2. Open the application in a browser: `http://localhost:3000`
3. Test language switching on homepage:
   - Click the language switcher
   - Select each language one by one
   - Verify all buttons and text update immediately
4. Create a room while in a non-Thai language and verify all lobby UI is translated
5. Start a game and verify location and role names are translated
6. Open a second browser window in a different language
7. Join the same room from the second window
8. Verify both players see content in their respective languages
9. Test RTL layout by selecting Arabic
10. Test language persistence by closing and reopening the browser

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can switch between all seven supported languages within 2 seconds on any page
- **SC-002**: 100% of location names (84 locations) are translated and displayed correctly in all seven languages
- **SC-003**: 100% of role names (588 roles) are translated and displayed correctly in all seven languages
- **SC-004**: 100% of UI text elements are translated and displayed correctly in all seven languages
- **SC-005**: Language preference persists correctly across 100% of browser session restarts
- **SC-006**: Arabic language displays with proper right-to-left layout on all pages
- **SC-007**: Language switcher is visible and functional on 100% of application pages
- **SC-008**: Multiple players in the same game room can each use different languages without conflicts or errors
- **SC-009**: Users can successfully complete a full game flow (create room, start game, play, view results) in any of the seven supported languages
- **SC-010**: Language changes during active gameplay update the UI within 1 second without disrupting game state
- **SC-011**: Browser language auto-detection correctly sets the initial language for users with supported browser language preferences
- **SC-012**: System handles missing translations gracefully with fallback behavior 100% of the time without crashing

## Assumptions _(optional)_

- Translation quality will be provided as part of this specification or obtained through professional translation services for accuracy
- The application already has a component-based architecture that supports dynamic text rendering
- Browser local storage is available and enabled for persisting language preferences
- The current data structure for locations and roles can be extended to include translations
- Players are comfortable reading game content in their selected language (no requirement for bilingual display)
- Language switching does not require server-side changes to game state management
- All supported languages use Unicode characters that modern browsers render correctly
- The application uses a modern front-end framework (React/Next.js) that supports internationalization patterns

## Dependencies _(optional)_

- Internationalization (i18n) library or framework (e.g., next-i18next, react-i18next, or similar)
- Translation files or database to store all translated content
- Professional translation services or native speakers for accurate translations
- RTL CSS framework or utilities for Arabic language support
- Browser language detection API (navigator.language or navigator.languages)
- Local storage API for persisting language preferences

## Out of Scope _(optional)_

- Translation of user-generated content (chat messages, player names)
- Translation of location images or visual assets
- Voice/audio translations or text-to-speech
- Automatic translation of new content added in the future (translations must be manually provided)
- Support for additional languages beyond the seven specified
- Regional variants of languages (e.g., Brazilian Portuguese vs European Portuguese, Latin American Spanish vs European Spanish)
- Translation of external documentation, terms of service, or privacy policies
- Accessibility features beyond standard text rendering (screen reader optimizations, high contrast modes)
- Cultural adaptations of game rules or mechanics beyond location/role name translations
