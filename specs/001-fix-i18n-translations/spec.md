# Feature Specification: Fix incomplete i18n translations and language switching

**Feature Branch**: `001-fix-i18n-translations`  
**Created**: 2025-11-01  
**Status**: Draft  
**Input**: User description: "I think our translation of location, role and UI has not completing translated nor UI change language has some bug, please find the root cause and plan to fix it"

## Context and Problem Statement

Players using non-default languages report two issues:

- Many UI strings, location names, and role names are not translated or appear in English.
- Changing the app language does not fully apply everywhere (e.g., language/direction metadata does not update consistently).

Observed root causes (from current repository state):

- Only two locales have complete location/role resources; other locales lack these files, forcing fallbacks to English for names.
- Several non-English UI dictionaries are partially translated and inconsistent across languages, causing visible English text.
- The top-level document language and direction do not change per selected locale, leading to inconsistent UX (notably for RTL languages) even if content strings change.

This feature ensures consistent, complete translations for UI/locations/roles in all supported languages and makes language switching fully coherent across the interface and metadata.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Switch language and see complete UI (Priority: P1)

As a player, I want to switch the application language and immediately see all interface text rendered in my chosen language so I can play without mixed-language confusion.

**Why this priority**: Directly impacts accessibility and usability for non-default locales.

**Independent Test**: Select each supported language from the language selector on the home screen; verify all visible strings (labels, buttons, helper text, toasts) display in that language without English fallbacks.

**Acceptance Scenarios**:

1. Given I am on the home page in any language, When I change the language using the selector, Then the page updates and all UI strings are shown in the selected language.
2. Given my selected language uses RTL script, When I change to that language, Then text direction and layout mirroring are applied appropriately across the page.

---

### User Story 2 - Play with translated locations and roles (Priority: P1)

As a player, I want location and role names to be translated in my selected language during gameplay so that I can understand options and communicate effectively.

**Why this priority**: Core gameplay relies on location/role comprehension.

**Independent Test**: Start a lobby and begin a game in each language; open role cards, location browsers, and voting panels to verify translated names appear. No English-only names unless the selected language is English.

**Acceptance Scenarios**:

1. Given I selected a non-English language, When I open my role card, Then the role title and related labels are shown in my selected language.
2. Given I browse available locations, When I search or filter, Then location names display in my selected language.

---

### User Story 3 - Language choice persists and is respected (Priority: P2)

As a returning player, I want my language preference to persist so I don’t have to reselect it every visit.

**Why this priority**: Reduces friction and supports consistent experience.

**Independent Test**: Set a language, reload the site, and navigate between pages and sessions; confirm the same language is active and navigation includes the locale.

**Acceptance Scenarios**:

1. Given I selected a language previously, When I revisit the site, Then the interface loads in that language and the URL includes the locale segment.
2. Given I follow a deep link with a locale prefix, When I land on the page, Then the interface loads in that locale and direction without flicker or mismatch.

---

### Edge Cases

- Missing translation key in a specific language: shows fallback language consistently and logs for content correction; does not surface raw keys.
- Switching between LTR and RTL languages: text direction and any mirrored UI affordances update without layout breakage.
- Deep-linked routes (e.g., lobby/room/game screens): language switch updates URL segments and content without losing state where designed (e.g., lobby state is preserved if applicable by product rules).

## Requirements _(mandatory)_

### Functional Requirements

- FR-001: The system must provide complete UI string dictionaries for all supported languages across primary screens (home, lobby, game, results, common components).
- FR-002: The system must present translated location names in all supported languages; where a translation genuinely does not exist, display the defined fallback language consistently.
- FR-003: The system must present translated role names in all supported languages; where a translation genuinely does not exist, display the defined fallback language consistently.
- FR-004: Changing language from the selector must update visible UI text, location names, role names, and page metadata (language code and text direction) without a full manual reload.
- FR-005: The selected language must persist across sessions and be reflected in the URL structure and cookies/local storage according to product rules.
- FR-006: For languages that require RTL layout, the page direction must update to RTL, and content alignment/mirroring must remain readable and navigable.
- FR-007: The system must provide a repeatable content process for adding/updating translations that keeps keys in sync across all languages.

### Key Entities

- Translation Dictionary: A set of human-readable keys grouped by functional area (e.g., common UI, lobby, game, results) with values for each supported language.
- Domain Content Sets: Location names and role names with localized variants for each supported language; includes defined fallback behavior for missing entries.
- Language Preference: The user’s selected language stored in a privacy-respecting manner and applied to routing and presentation.

## Playground Validation _(mandatory)_

**Playground Type**: Interactive web experience using the existing language selector and gameplay screens.

**What It Demonstrates**:

- Complete UI translation across supported languages on the home page and lobby.
- Translated location and role names in gameplay screens.
- Correct persistence and URL locale segments after reload and navigation.
- Correct language code and direction metadata when switching between languages (LTR and RTL).

**How to Run**:

1. Open the application home page.
2. Use the language selector to cycle through all supported languages; verify UI text and page direction update instantly.
3. Create a room and start a game; open role cards and location browser to verify translated names.
4. Reload the page and confirm the selected language persists and URLs include the locale segment.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- SC-001: 100% of visible UI strings on primary flows (home, lobby, game, results) appear in the selected language for all supported languages.
- SC-002: 100% of location and role names display localized values for all supported languages, or fallback language values where localized content is intentionally absent; no raw keys are shown.
- SC-003: Switching languages updates UI strings and page direction within 1 second and without a full-page manual reload.
- SC-004: Returning users see the previously selected language applied automatically, including localized URL segments, with no perceptible mismatch or flicker.

## Assumptions

- Supported languages are the ones currently listed in the product language list; expanding the list is out of scope for this feature.
- Where professional human translations are not yet available, high-quality translated content may be staged and iterated, provided user-facing consistency is maintained and fallbacks are clearly defined.
- Accessibility and readability standards apply to all languages; direction changes must not reduce usability.
