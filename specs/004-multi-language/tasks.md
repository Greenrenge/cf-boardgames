# Tasks: Multi-Language Support

**Input**: Design documents from `/specs/004-multi-language/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md, contracts/translation-schema.json

**Playgrounds**: Tasks MUST include playground/demo creation to validate each user story works. Tests are OPTIONAL.

**Organization**: Tasks are grouped by user story to enable independent implementation and demonstration of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and i18n framework setup

- [ ] T001 Install next-intl package: `npm install next-intl`
- [ ] T002 Install tailwindcss-rtl plugin: `npm install --save-dev tailwindcss-rtl`
- [ ] T003 [P] Create locales directory structure: `locales/{en,th,zh,hi,es,fr,ar}/`
- [ ] T004 [P] Create i18n lib directory: `lib/i18n/`
- [ ] T005 [P] Create i18n components directory: `components/i18n/`
- [ ] T006 Configure Tailwind RTL plugin in `tailwind.config.js`
- [ ] T007 Create i18n type definitions in `lib/i18n/types.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core i18n infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Create locale configuration in `lib/i18n/config.ts` with SUPPORTED_LOCALES array
- [ ] T009 [P] Create i18n utilities in `lib/i18n/utils.ts` (detectBrowserLocale, getLocaleDirection, etc.)
- [ ] T010 [P] Create RTL utilities in `lib/i18n/rtl.ts` for Arabic layout helpers
- [ ] T011 Create Next.js i18n middleware in `middleware.ts` for locale routing
- [ ] T012 Create base English translation structure in `locales/en/common.json` with button, label, heading, message sections
- [ ] T013 Create TranslationProvider component in `components/i18n/TranslationProvider.tsx`
- [ ] T014 Update Next.js config in `next.config.js` to enable i18n routing
- [ ] T015 Create [locale] dynamic route layout in `app/[locale]/layout.tsx` with locale provider and dir attribute
- [ ] T016 Update root page to redirect to locale route in `app/page.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Language Selection (Priority: P1) 🎯 MVP

**Goal**: Enable users to select and switch between 7 supported languages with persistence

**Independent Test**: Open app, select any language from switcher, verify UI updates immediately, navigate pages (UI stays in selected language), close/reopen browser (language persists)

### Playground for User Story 1 (MANDATORY) ✓

> **NOTE: Create playground scaffold FIRST, then implement until it works**

- [ ] T017 [US1] Create playground demo page in `specs/004-multi-language/playground/story1/demo.tsx` showing language switcher
- [ ] T018 [US1] Document test scenarios in playground README (already exists, verify completeness)

### Implementation for User Story 1

- [ ] T019 [P] [US1] Create LanguageSwitcher component in `components/i18n/LanguageSwitcher.tsx` with dropdown showing all 7 languages
- [ ] T020 [P] [US1] Create LocaleDetector component in `components/i18n/LocaleDetector.tsx` for browser language detection
- [ ] T021 [US1] Implement switchLocale function in LanguageSwitcher to update localStorage and navigate to new locale route
- [ ] T022 [US1] Add LanguageSwitcher to main layout in `app/[locale]/layout.tsx`
- [ ] T023 [US1] Implement localStorage persistence for language preference (key: `cf-boardgames-locale`)
- [ ] T024 [US1] Implement cookie-based locale persistence (NEXT_LOCALE) for server-side rendering
- [ ] T025 [US1] Add browser language detection on first visit using navigator.language
- [ ] T026 [US1] Create placeholder translation files for all 6 non-English locales: `locales/{th,zh,hi,es,fr,ar}/common.json`
- [ ] T027 [US1] Add native script language names to switcher (English, ไทย, 中文, हिंदी, Español, Français, العربية)
- [ ] T028 [US1] Add visual indication for currently selected language in switcher
- [ ] T029 [US1] Test language switch on homepage - verify immediate UI update without page reload
- [ ] T030 [US1] Test language persistence across page navigation
- [ ] T031 [US1] Test language persistence across browser restart
- [ ] T032 [US1] Test browser language auto-detection with different browser settings
- [ ] T033 [US1] Validate playground demo shows all scenarios working

**Checkpoint**: At this point, User Story 1 playground should demonstrate working language switching with persistence

---

## Phase 4: User Story 2 - Location Names Translation (Priority: P1)

**Goal**: All 84 location names displayed in user's selected language

**Independent Test**: Switch to each language, view location list in lobby/game, verify all 84 locations show translated names, test Arabic RTL rendering

### Playground for User Story 2 (MANDATORY) ✓

- [ ] T034 [US2] Create playground demo in `specs/004-multi-language/playground/story2/` showing location names in all languages
- [ ] T035 [US2] Add README with test scenarios for location translation validation

### Implementation for User Story 2

- [ ] T036 [P] [US2] Create English location translations in `locales/en/locations.json` for all 84 locations using location IDs as keys
- [ ] T037 [P] [US2] Create Thai location translations in `locales/th/locations.json` (copy from existing data/locations.json nameTh field)
- [ ] T038 [P] [US2] Create Chinese location translations in `locales/zh/locations.json` for all 84 locations
- [ ] T039 [P] [US2] Create Hindi location translations in `locales/hi/locations.json` for all 84 locations
- [ ] T040 [P] [US2] Create Spanish location translations in `locales/es/locations.json` for all 84 locations
- [ ] T041 [P] [US2] Create French location translations in `locales/fr/locations.json` for all 84 locations
- [ ] T042 [P] [US2] Create Arabic location translations in `locales/ar/locations.json` for all 84 locations
- [ ] T043 [US2] Update LocationImage component in `components/game/LocationImage.tsx` to use translated location name
- [ ] T044 [US2] Update LocationReference component in `components/game/LocationReference.tsx` to show translated names
- [ ] T045 [US2] Update RoleCard component in `components/game/RoleCard.tsx` to display translated location name
- [ ] T046 [US2] Update SpyLocationBrowser component in `components/game/SpyLocationBrowser.tsx` to show translated names
- [ ] T047 [US2] Update Lobby component in `components/room/Lobby.tsx` if it shows location selection
- [ ] T048 [US2] Test location names in English - verify all 84 locations translated
- [ ] T049 [US2] Test location names in Arabic - verify RTL rendering and all 84 locations translated
- [ ] T050 [US2] Test location names in all other languages (Thai, Chinese, Hindi, Spanish, French)
- [ ] T051 [US2] Test multi-player scenario - two browsers with different languages viewing same location
- [ ] T052 [US2] Validate playground demo shows location translations working

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - can switch languages and see translated location names

---

## Phase 5: User Story 3 - Role Names Translation (Priority: P2)

**Goal**: All 588 role names (7 roles × 84 locations) displayed in user's selected language

**Independent Test**: Start game, receive role card, verify role name in selected language, view results screen with all roles translated

### Playground for User Story 3 (MANDATORY) ✓

- [ ] T053 [US3] Create playground demo in `specs/004-multi-language/playground/story3/` showing role names in all languages
- [ ] T054 [US3] Add README with test scenarios for role translation validation

### Implementation for User Story 3

- [ ] T055 [P] [US3] Create English role translations in `locales/en/roles.json` for all 84 locations (7 roles each)
- [ ] T056 [P] [US3] Create Thai role translations in `locales/th/roles.json` (copy from existing data/locations.json roles field)
- [ ] T057 [P] [US3] Create Chinese role translations in `locales/zh/roles.json` for all 588 roles
- [ ] T058 [P] [US3] Create Hindi role translations in `locales/hi/roles.json` for all 588 roles
- [ ] T059 [P] [US3] Create Spanish role translations in `locales/es/roles.json` for all 588 roles
- [ ] T060 [P] [US3] Create French role translations in `locales/fr/roles.json` for all 588 roles
- [ ] T061 [P] [US3] Create Arabic role translations in `locales/ar/roles.json` for all 588 roles
- [ ] T062 [US3] Update RoleCard component in `components/game/RoleCard.tsx` to display translated role name
- [ ] T063 [US3] Update LocationReference component in `components/game/LocationReference.tsx` to show translated role names when expanded
- [ ] T064 [US3] Update SpyLocationBrowser component in `components/game/SpyLocationBrowser.tsx` to display translated role names
- [ ] T065 [US3] Update ResultsScreen component in `components/game/ResultsScreen.tsx` to show translated role names for all players
- [ ] T066 [US3] Test role names on role card in all 7 languages
- [ ] T067 [US3] Test role names in location reference in all 7 languages
- [ ] T068 [US3] Test role names in results screen in all 7 languages
- [ ] T069 [US3] Validate playground demo shows role translations working

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently - full game content (locations + roles) translated

---

## Phase 6: User Story 4 - Complete UI Translation (Priority: P2)

**Goal**: All UI elements (buttons, labels, messages, errors, instructions) translated in all 7 languages

**Independent Test**: Navigate through entire app flow (home → create room → lobby → game → results) in each language, verify no untranslated text

### Playground for User Story 4 (MANDATORY) ✓

- [ ] T070 [US4] Create playground demo in `specs/004-multi-language/playground/story4/` showing complete UI in all languages
- [ ] T071 [US4] Add README with test scenarios covering all pages and features

### Implementation for User Story 4

#### Translation Files Creation

- [ ] T072 [P] [US4] Complete common.json for English with all buttons, labels, headings, messages in `locales/en/common.json`
- [ ] T073 [P] [US4] Complete common.json for Thai with all UI translations in `locales/th/common.json`
- [ ] T074 [P] [US4] Complete common.json for Chinese with all UI translations in `locales/zh/common.json`
- [ ] T075 [P] [US4] Complete common.json for Hindi with all UI translations in `locales/hi/common.json`
- [ ] T076 [P] [US4] Complete common.json for Spanish with all UI translations in `locales/es/common.json`
- [ ] T077 [P] [US4] Complete common.json for French with all UI translations in `locales/fr/common.json`
- [ ] T078 [P] [US4] Complete common.json for Arabic with all UI translations in `locales/ar/common.json`
- [ ] T079 [P] [US4] Create errors.json for all 7 languages with room, player, game, network error messages
- [ ] T080 [P] [US4] Create gameplay.json for all 7 languages with spy, nonSpy, voting, results messages

#### Homepage Components

- [ ] T081 [US4] Update homepage in `app/[locale]/page.tsx` to use translated strings for all text
- [ ] T082 [US4] Update CreateRoom component in `components/room/CreateRoom.tsx` to use translated labels, buttons, placeholders

#### Room Components

- [ ] T083 [US4] Update JoinRoom component in `components/room/JoinRoom.tsx` to use translated labels, buttons, validation messages
- [ ] T084 [US4] Update Lobby component in `components/room/Lobby.tsx` to use translated labels for settings, timer, difficulty, player count
- [ ] T085 [US4] Update PlayerList component in `components/room/PlayerList.tsx` to use translated labels and messages

#### Game Components

- [ ] T086 [US4] Update GameTimer component in `components/game/GameTimer.tsx` to use translated time labels
- [ ] T087 [US4] Update ChatPanel component in `components/game/ChatPanel.tsx` to use translated placeholder and send button
- [ ] T088 [US4] Update VotingInterface component in `components/game/VotingInterface.tsx` to use translated instructions and button
- [ ] T089 [US4] Update SpyGuess component in `components/game/SpyGuess.tsx` to use translated instructions and submit button
- [ ] T090 [US4] Update ResultsScreen component in `components/game/ResultsScreen.tsx` to use translated outcome messages and labels

#### UI Components

- [ ] T091 [US4] Update Button component in `components/ui/Button.tsx` if it has hardcoded text
- [ ] T092 [US4] Update Card component in `components/ui/Card.tsx` if it has hardcoded text
- [ ] T093 [US4] Update Input component in `components/ui/Input.tsx` if it has hardcoded placeholders

#### Error Handling

- [ ] T094 [US4] Update error messages throughout app to use translated error strings from errors.json
- [ ] T095 [US4] Add error boundary with translated error messages

#### Testing

- [ ] T096 [US4] Test homepage in all 7 languages - verify all buttons and text translated
- [ ] T097 [US4] Test create room flow in all 7 languages - verify all form elements translated
- [ ] T098 [US4] Test join room flow in all 7 languages - verify all form elements and validation messages translated
- [ ] T099 [US4] Test lobby in all 7 languages - verify all settings labels and buttons translated
- [ ] T100 [US4] Test gameplay in all 7 languages - verify chat, voting, timer all translated
- [ ] T101 [US4] Test results screen in all 7 languages - verify all outcome messages translated
- [ ] T102 [US4] Test error scenarios in all 7 languages - verify error messages translated
- [ ] T103 [US4] Validate playground demo shows complete UI translation

**Checkpoint**: At this point, User Stories 1-4 should all work - complete multilingual experience with all content and UI translated

---

## Phase 7: User Story 5 - Language Switcher Accessibility (Priority: P3)

**Goal**: Enhanced UX for language switcher with native scripts, visual indication, and optimal placement

**Independent Test**: Examine language switcher on all pages, verify native script display, check current language indication, test mobile touch-friendliness

### Playground for User Story 5 (MANDATORY) ✓

- [ ] T104 [US5] Create playground demo in `specs/004-multi-language/playground/story5/` showing enhanced language switcher
- [ ] T105 [US5] Add README with test scenarios for accessibility and UX validation

### Implementation for User Story 5

- [ ] T106 [US5] Enhance LanguageSwitcher in `components/i18n/LanguageSwitcher.tsx` with proper ARIA labels for accessibility
- [ ] T107 [US5] Add keyboard navigation support to LanguageSwitcher (arrow keys, enter, escape)
- [ ] T108 [US5] Style current language with visual indicator (checkmark, highlight, or bold) in LanguageSwitcher
- [ ] T109 [US5] Ensure LanguageSwitcher is properly positioned in navigation (consistent across all pages)
- [ ] T110 [US5] Add mobile-friendly touch targets (min 44x44px) to LanguageSwitcher dropdown
- [ ] T111 [US5] Test LanguageSwitcher with keyboard only (no mouse) - verify full navigation
- [ ] T112 [US5] Test LanguageSwitcher on mobile device - verify touch-friendliness
- [ ] T113 [US5] Test LanguageSwitcher shows native scripts correctly for all languages
- [ ] T114 [US5] Validate playground demo shows accessibility enhancements

**Checkpoint**: All 5 user stories complete - full multi-language support with polished UX

---

## Phase 8: RTL Layout Support for Arabic

**Purpose**: Ensure proper right-to-left layout rendering for Arabic language

- [ ] T115 [P] Add RTL CSS utilities to global styles in `app/globals.css` if needed
- [ ] T116 Update layout in `app/[locale]/layout.tsx` to set dir="rtl" when Arabic is selected
- [ ] T117 [P] Review and update all components using margin/padding to use logical properties (ms-_, me-_, ps-_, pe-_)
- [ ] T118 [P] Review and update all components using text-align to use logical values (text-start, text-end)
- [ ] T119 Test entire app in Arabic - verify all layouts mirror correctly
- [ ] T120 Test navigation in Arabic - verify menu items, buttons flow RTL
- [ ] T121 Test game components in Arabic - verify cards, lists flow RTL
- [ ] T122 Fix any RTL layout issues discovered during testing

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [ ] T123 [P] Run Prettier formatter on all translation JSON files: `npm run format`
- [ ] T124 [P] Run Prettier formatter on all new TypeScript files
- [ ] T125 Create translation validation script in `scripts/validate-translations.ts` to check for missing keys
- [ ] T126 Run translation validation script to verify all keys exist in all 7 locales
- [ ] T127 Fix any missing translation keys identified by validation
- [ ] T128 [P] Add README section in root about multi-language support for future contributors
- [ ] T129 [P] Update quickstart.md if any implementation differs from original plan
- [ ] T130 Code cleanup: remove any unused imports, dead code, console.logs
- [ ] T131 Readability pass: improve variable names, extract complex logic into named functions
- [ ] T132 Validate all 5 playground demos still work after polish changes
- [ ] T133 Run full app in each language and verify no regressions
- [ ] T134 Measure language switch performance - verify <2 second target met
- [ ] T135 Measure translation lookup performance - verify <1ms target met
- [ ] T136 [P] Update .github/copilot-instructions.md with any new patterns learned
- [ ] T137 Create final demo video showing all 5 user stories working

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User Story 1 (P1) - Language Selection: Can start after Foundational
  - User Story 2 (P1) - Location Names: Can start after Foundational (independent of US1 but better after US1 for testing)
  - User Story 3 (P2) - Role Names: Can start after Foundational (independent but builds on US2 pattern)
  - User Story 4 (P2) - Complete UI: Can start after US1 (needs language switching to test)
  - User Story 5 (P3) - Switcher UX: Depends on US1 (enhances existing switcher)
- **RTL Support (Phase 8)**: Should happen after US2 to test with real content
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories - TRUE MVP
- **User Story 2 (P1)**: Independent but better to do after US1 for easy testing
- **User Story 3 (P2)**: Independent but builds on US2 translation pattern
- **User Story 4 (P2)**: Needs US1 for language switching mechanism
- **User Story 5 (P3)**: Depends on US1 (enhances the switcher created in US1)

### Recommended Implementation Order

1. Phase 1 + 2 (Setup + Foundation) - 16 tasks
2. Phase 3 (User Story 1) - 17 tasks - **MVP COMPLETE HERE**
3. Phase 4 (User Story 2) - 19 tasks
4. Phase 8 (RTL Support) - 8 tasks - **Do early to catch issues**
5. Phase 5 (User Story 3) - 17 tasks
6. Phase 6 (User Story 4) - 33 tasks
7. Phase 7 (User Story 5) - 11 tasks
8. Phase 9 (Polish) - 15 tasks

**Total: 137 tasks**

### Parallel Opportunities Within Phases

**Phase 1 (Setup)**:

- Tasks T003, T004, T005, T006 can all run in parallel

**Phase 2 (Foundational)**:

- Tasks T009, T010 can run in parallel after T008

**Phase 3 (US1)**:

- Tasks T019, T020 can run in parallel
- Task T026 (create placeholder files) can start early

**Phase 4 (US2)**:

- Tasks T036-T042 (all translation files) can run in parallel - biggest parallelization opportunity (7 translators working simultaneously)
- Tasks T043-T046 (component updates) can run in parallel after translations exist

**Phase 5 (US3)**:

- Tasks T055-T061 (all translation files) can run in parallel - another big opportunity (7 translators)
- Tasks T062-T065 (component updates) can run in parallel after translations exist

**Phase 6 (US4)**:

- Tasks T072-T080 (all translation files) can run in parallel - largest translation effort
- Component update tasks T081-T093 can be split among multiple developers

**Phase 8 (RTL)**:

- Tasks T115, T117, T118 can run in parallel

**Phase 9 (Polish)**:

- Tasks T123, T124, T128, T129, T136 can run in parallel

---

## Parallel Example: User Story 2 (Location Translations)

```bash
# Create all 7 translation files simultaneously (7 translators):
Task T036: "Create English location translations in locales/en/locations.json"
Task T037: "Create Thai location translations in locales/th/locations.json"
Task T038: "Create Chinese location translations in locales/zh/locations.json"
Task T039: "Create Hindi location translations in locales/hi/locations.json"
Task T040: "Create Spanish location translations in locales/es/locations.json"
Task T041: "Create French location translations in locales/fr/locations.json"
Task T042: "Create Arabic location translations in locales/ar/locations.json"

# Once translations exist, update all components in parallel (4 developers):
Task T043: "Update LocationImage component in components/game/LocationImage.tsx"
Task T044: "Update LocationReference component in components/game/LocationReference.tsx"
Task T045: "Update RoleCard component in components/game/RoleCard.tsx"
Task T046: "Update SpyLocationBrowser component in components/game/SpyLocationBrowser.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (7 tasks) - ~1 hour
2. Complete Phase 2: Foundational (9 tasks) - ~3 hours
3. Complete Phase 3: User Story 1 (17 tasks) - ~5 hours
4. **STOP and VALIDATE**: Test language switching independently via playground
5. **Total MVP time: ~9 hours**

At this point you have a working language switcher that persists preferences and switches UI text for what exists.

### Incremental Delivery

1. **Foundation** (Phase 1-2): Core i18n setup → ~4 hours
2. **MVP** (Phase 3): Language selection working → ~5 hours → **Deploy/Demo US1**
3. **Game Content** (Phase 4): Location names translated → ~6 hours → **Deploy/Demo US1+US2**
4. **RTL Support** (Phase 8): Arabic layout works → ~2 hours → **Deploy/Demo with Arabic**
5. **Role Content** (Phase 5): Role names translated → ~6 hours → **Deploy/Demo US1+US2+US3**
6. **Complete UI** (Phase 6): All UI translated → ~12 hours → **Deploy/Demo US1+US2+US3+US4**
7. **Polish UX** (Phase 7): Enhanced switcher → ~3 hours → **Deploy/Demo all 5 stories**
8. **Polish** (Phase 9): Final cleanup → ~4 hours → **Production ready**

**Total estimated time: ~42 hours for full feature**

### Parallel Team Strategy

With 3 developers + translators:

1. **All together**: Phase 1 + 2 (Setup + Foundation) - ~4 hours
2. **Once Foundational complete**:
   - Developer A: User Story 1 (Language Selection) - 5 hours
   - Developer B: Prepare translation structure and work with translators for US2
   - Developer C: Set up playground scaffolds for all stories
3. **After US1 complete**:
   - Developer A: User Story 4 (UI Translation) - 12 hours
   - Developer B: User Story 2 (Location Names) + RTL - 8 hours
   - Developer C: User Story 3 (Role Names) - 6 hours
4. **Final phase**:
   - All developers: User Story 5 + Polish together - 7 hours

**Total parallel time with 3 devs: ~25-30 hours**

---

## Translation Coordination

### Translation Tasks Requiring Native Speakers

- **T036-T042**: 84 location names × 6 languages = 504 translations
- **T055-T061**: 588 role names × 6 languages = 3,528 translations
- **T072-T080**: ~200 UI strings × 6 languages = 1,200 translations

**Total translation work: ~5,200 strings**

### Recommended Approach

1. Start with English as source of truth (already done in tasks)
2. Thai translations copy from existing data (already in app)
3. Hire professional translators or work with native speakers for remaining 5 languages
4. Use translation management platform (e.g., Crowdin, Lokalise) or spreadsheets
5. Provide context for cultural adaptation (not just literal translation)
6. Review translations with native-speaking gamers for game-appropriate language

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and demonstrable via playground
- Build playground scaffold first, then implement until it works
- Translation files (T036-T080) are largest parallelization opportunity - coordinate with translators early
- Run Prettier after each batch of changes to maintain consistent style
- Commit after completing each user story phase
- Stop at each checkpoint to validate story works independently via playground
- Arabic RTL testing should happen early (Phase 8) to catch layout issues before too much UI work
- Total of 137 tasks spanning 5 user stories + setup + polish
- MVP (User Story 1) = first 33 tasks
- Full feature = all 137 tasks

---

## Success Criteria Validation

After completing all tasks, verify:

- ✅ **SC-001**: Language switch time <2 seconds (Task T134)
- ✅ **SC-002**: 100% of 84 location names translated (Tasks T036-T042, validated in T048-T051)
- ✅ **SC-003**: 100% of 588 role names translated (Tasks T055-T061, validated in T066-T068)
- ✅ **SC-004**: 100% of UI elements translated (Tasks T072-T095, validated in T096-T103)
- ✅ **SC-005**: Language persistence works 100% (validated in T030-T031)
- ✅ **SC-006**: Arabic RTL layout correct (Phase 8 tasks, validated in T119-T121)
- ✅ **SC-007**: Language switcher on all pages (Task T022, validated throughout)
- ✅ **SC-008**: Multi-player language independence (validated in T051)
- ✅ **SC-009**: Full game flow in any language (validated in T096-T102)
- ✅ **SC-010**: Language changes update UI <1 second (validated in T029)
- ✅ **SC-011**: Browser language detection works (validated in T032)
- ✅ **SC-012**: Fallback behavior handles missing translations (validated in T126-T127)
