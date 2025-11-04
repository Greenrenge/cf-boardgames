# Implementation Tasks: Fix incomplete i18n translations and language switching

**Branch**: `001-fix-i18n-translations` | **Date**: 2025-11-02  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Task Summary

- **Total Tasks**: 24
- **User Story 1 (P1)**: 7 tasks - Switch language and see complete UI
- **User Story 2 (P1)**: 6 tasks - Play with translated locations and roles
- **User Story 3 (P2)**: 4 tasks - Language choice persists
- **Setup**: 2 tasks
- **Foundational**: 2 tasks
- **Polish**: 3 tasks

**Parallelization Opportunities**: 15 tasks marked [P] can run in parallel within their phase

**MVP Scope**: User Story 1 (P1) - Complete UI translation and language switching

---

## Dependencies & Execution Order

### User Story Completion Order

```
Phase 1: Setup (prerequisites)
  ↓
Phase 2: Foundational (translation generation infrastructure)
  ↓
Phase 3: User Story 1 [P1] (can start after Phase 2)
  ↓
Phase 4: User Story 2 [P1] (independent from US1, can run in parallel)
  ↓
Phase 5: User Story 3 [P2] (depends on US1 completing)
  ↓
Phase 6: Polish & Validation
```

### Independent Stories

- **US1** and **US2** can be implemented in parallel after Phase 2
- **US3** depends on US1 (language switching must work before persistence)

---

## Implementation Strategy

**MVP First**: Implement User Story 1 (P1) completely before starting other stories. This delivers immediate value:

- Users can switch languages and see translated UI
- Validates translation infrastructure works
- Provides playground for testing remaining stories

**Incremental Delivery**: After MVP, add stories independently:

- US2 adds location/role translations (gameplay content)
- US3 adds persistence (UX improvement)

Each story is independently testable using the playground validation criteria from spec.md.

---

## Phase 1: Setup (Prerequisites)

**Goal**: Establish tooling and verify environment

### Tasks

- [x] T001 Verify Node.js 20+ and pnpm installed
- [x] T002 Install dependencies via `pnpm install` and verify next-intl is present

---

## Phase 2: Foundational (Translation Generation Infrastructure)

**Goal**: Create reusable scripts to generate translation files from API data

**Why Foundational**: All user stories depend on having translation files available

### Tasks

- [x] T003 [P] Create `scripts/sync-translations-from-api-data.ts` to generate locations.json and roles.json for all 7 locales
- [x] T004 [P] Create `scripts/audit-translation-coverage.ts` to identify missing UI string keys across locales

**Completion Criteria**: Both scripts exist and can be executed successfully

---

## Phase 3: User Story 1 [P1] - Switch language and see complete UI

**Story Goal**: Users can switch language and immediately see all UI text translated without English fallbacks

**Independent Test**:

1. Open homepage in any language
2. Use language selector to switch between all 7 languages
3. Verify all visible UI text updates to selected language
4. For Arabic: verify text direction changes to RTL

**Acceptance Criteria**:

- ✅ All UI strings translated in all 7 languages
- ✅ Language switch updates text within 1 second
- ✅ RTL languages (Arabic) display with correct text direction
- ✅ No English fallbacks visible (except for English locale)

### Tasks

- [x] T005 [P] [US1] Run audit script to identify missing keys in `locales/{zh,es,fr,hi,ar}/common.json`
- [ ] T006 [P] [US1] Complete missing UI string translations in `locales/zh/common.json` (aim for 90%+ coverage)
- [ ] T007 [P] [US1] Complete missing UI string translations in `locales/es/common.json` (aim for 90%+ coverage)
- [ ] T008 [P] [US1] Complete missing UI string translations in `locales/fr/common.json` (aim for 90%+ coverage)
- [ ] T009 [P] [US1] Complete missing UI string translations in `locales/hi/common.json` (aim for 90%+ coverage)
- [ ] T010 [P] [US1] Complete missing UI string translations in `locales/ar/common.json` (aim for 90%+ coverage)
- [x] T011 [US1] Update `app/[locale]/layout.tsx` to dynamically set `lang` and `dir` attributes on HTML element based on params.locale
- [ ] T012 [US1] Verify language switch updates document metadata by testing all 7 languages via playground (homepage language selector)

**Parallel Execution for US1**:

```bash
# Tasks T006-T010 can run in parallel (different files, no dependencies)
# Each translator/developer works on one locale simultaneously
```

---

## Phase 4: User Story 2 [P1] - Play with translated locations and roles

**Story Goal**: Players see translated location and role names during gameplay in their selected language

**Independent Test**:

1. Create room in any non-English language
2. Start game and check role card shows translated role name
3. Open location browser and verify all location names are translated
4. No English-only names appear (except in English locale)

**Acceptance Criteria**:

- ✅ All 80+ locations have translated names in all 7 languages
- ✅ All 400-800 roles have translated names in all 7 languages
- ✅ Role cards display translated names
- ✅ Location browser displays translated names
- ✅ Fallback to English is consistent (no raw keys)

### Tasks

- [x] T013 [US2] Run `scripts/sync-translations-from-api-data.ts` to generate `locales/{locale}/locations.json` for all 7 locales
- [x] T014 [US2] Run `scripts/sync-translations-from-api-data.ts` to generate `locales/{locale}/roles.json` for all 7 locales
- [x] T015 [P] [US2] Verify `lib/useLocationTranslations.ts` correctly loads and maps location names from API
- [x] T016 [P] [US2] Verify `lib/useRoleTranslations.ts` correctly loads and maps role names from API
- [ ] T017 [US2] Test role card component displays translated role names in game (test in 3+ languages)
- [ ] T018 [US2] Test location browser component displays translated location names in game (test in 3+ languages)

**Parallel Execution for US2**:

```bash
# Tasks T015-T016 can run in parallel (different hooks, no dependencies)
# Tasks T017-T018 must run after T013-T016 complete
```

---

## Phase 5: User Story 3 [P2] - Language choice persists

**Story Goal**: User's selected language persists across page reloads and sessions

**Independent Test**:

1. Select a non-default language (e.g., Spanish)
2. Reload the page
3. Verify URL has locale segment (e.g., `/es/`)
4. Verify UI is still in Spanish
5. Open new tab and navigate to site
6. Verify language is still Spanish

**Acceptance Criteria**:

- ✅ Language preference saved to localStorage
- ✅ Language preference saved to NEXT_LOCALE cookie
- ✅ URL includes locale segment after reload
- ✅ Returning users see their previously selected language
- ✅ No flicker or language mismatch on load

### Tasks

- [x] T019 [P] [US3] Verify `lib/i18n/utils.ts` correctly saves language preference to localStorage with format `{ locale, source, timestamp }`
- [x] T020 [P] [US3] Verify `components/i18n/LanguageSwitcher.tsx` sets NEXT_LOCALE cookie on language change
- [x] T021 [US3] Verify `middleware.ts` correctly reads locale from cookie/header and redirects to locale-prefixed path
- [ ] T022 [US3] Test persistence by selecting language, reloading page, and verifying language + URL persist (test 3+ languages)

**Parallel Execution for US3**:

```bash
# Tasks T019-T020 can run in parallel (different files)
# Task T021 depends on T019-T020 for context
# Task T022 is final validation after all implementation complete
```

---

## Phase 6: Polish & Cross-Cutting Concerns

**Goal**: Final validation, cleanup, and documentation

### Tasks

- [ ] T023 Run complete playground validation checklist from `specs/001-fix-i18n-translations/quickstart.md` for all 7 languages
- [ ] T024 [P] Document translation update process in project README or contributor guide
- [x] T025 [P] Run `pnpm build` to verify production build succeeds with all translations

---

## Validation Checklist (from spec.md)

Execute this checklist after all phases complete:

### Per-Language Validation (repeat for each of 7 locales)

**Homepage** (/{locale}/):

- [ ] All UI text displays in selected language
- [ ] Language selector shows current language highlighted
- [ ] Page layout is correct (RTL for Arabic, LTR for others)

**Language Switching**:

- [ ] Changing language updates URL to new locale
- [ ] All text updates within 1 second
- [ ] Direction attribute updates (check Arabic RTL ↔ English LTR)
- [ ] No console errors or warnings

**Persistence**:

- [ ] Reload page preserves selected language
- [ ] URL maintains locale segment after reload
- [ ] Navigate to /room/ABC → URL becomes /{locale}/room/ABC

**Lobby Screen**:

- [ ] All labels and buttons translated
- [ ] Player list labels translated
- [ ] Game settings text translated

**Game Screen**:

- [ ] Role card shows translated role name
- [ ] Location browser shows translated location names
- [ ] Chat interface labels translated
- [ ] Voting interface text translated

**Results Screen**:

- [ ] All results labels translated
- [ ] Score display text translated

### RTL-Specific (Arabic only)

- [ ] Text flows right-to-left
- [ ] UI elements mirror correctly
- [ ] No text overflow or layout breaks
- [ ] Language selector dropdown works

---

## Task Format Validation

✅ All tasks follow required format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
✅ All user story tasks include [US1], [US2], or [US3] label
✅ Setup and Foundational tasks have no story label
✅ Parallel tasks marked with [P]
✅ Tasks include specific file paths where applicable

---

## Parallel Execution Examples

### Phase 2 (Foundational)

```bash
# Run both script creation tasks in parallel
Developer A: Creates sync-translations-from-api-data.ts
Developer B: Creates audit-translation-coverage.ts
```

### Phase 3 (User Story 1)

```bash
# Complete UI translations in parallel
Translator for Chinese: locales/zh/common.json
Translator for Spanish: locales/es/common.json
Translator for French: locales/fr/common.json
Translator for Hindi: locales/hi/common.json
Translator for Arabic: locales/ar/common.json

# While translations happen:
Developer: Updates app/[locale]/layout.tsx for dynamic lang/dir
```

### Phase 4 (User Story 2)

```bash
# Verify hooks in parallel
Developer A: Tests useLocationTranslations.ts
Developer B: Tests useRoleTranslations.ts

# Then test components in parallel:
Tester A: Role card translation in 3 languages
Tester B: Location browser translation in 3 languages
```

### Phase 5 (User Story 3)

```bash
# Verify storage mechanisms in parallel
Developer A: Tests localStorage persistence in utils.ts
Developer B: Tests cookie setting in LanguageSwitcher.tsx
```

---

## Success Metrics (from spec.md)

- **SC-001**: 100% of visible UI strings on primary flows appear in selected language ✅
- **SC-002**: 100% of location/role names display localized values or fallback ✅
- **SC-003**: Language switch updates UI + direction within 1 second ✅
- **SC-004**: Returning users see previously selected language automatically ✅

---

## References

- Spec: [spec.md](./spec.md)
- Plan: [plan.md](./plan.md)
- Research: [research.md](./research.md)
- Data Model: [data-model.md](./data-model.md)
- Contracts: [contracts/](./contracts/)
- Quickstart: [quickstart.md](./quickstart.md)
- Playground Validation: [quickstart.md](./quickstart.md#phase-4-validation-playground)
