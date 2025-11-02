# Implementation Plan Summary

**Feature**: Fix incomplete i18n translations and language switching  
**Branch**: `001-fix-i18n-translations`  
**Status**: Planning Complete - Ready for Implementation  
**Date**: 2025-11-02

---

## Planning Artifacts Generated

All planning documentation has been created in `specs/001-fix-i18n-translations/`:

### Core Documentation

1. **spec.md** ✅
   - User scenarios (3 prioritized stories)
   - Functional requirements (7 core requirements)
   - Success criteria (4 measurable outcomes)
   - Playground validation approach

2. **plan.md** ✅
   - Technical context (Next.js 14.2, TypeScript 5.x, next-intl)
   - Constitution compliance check (all principles satisfied)
   - Project structure with concrete file paths
   - No complexity violations

3. **research.md** ✅ (Phase 0 Complete)
   - 5 research questions resolved with decisions + rationale
   - Translation generation strategy from API data
   - UI string completion approach
   - Language switching fix approach
   - Validation strategy (playground-based)
   - Risk assessment and mitigation

4. **data-model.md** ✅ (Phase 1 Complete)
   - 4 primary entities documented
   - Translation Dictionary structure
   - Localized Location structure
   - Localized Role structure
   - Language Preference storage
   - Entity relationships and data flows
   - File size estimates (~385 KB total, ~55 KB per locale)

5. **contracts/translation-interfaces.md** ✅ (Phase 1 Complete)
   - TypeScript interface contracts
   - API endpoint contracts (no changes needed)
   - File structure contracts
   - Validation contracts (build-time + runtime)
   - Generation script contracts

6. **quickstart.md** ✅ (Phase 1 Complete)
   - Step-by-step implementation guide
   - Code examples for generation scripts
   - Manual validation checklist
   - Troubleshooting guide
   - Deployment checklist

### Quality Assurance

7. **checklists/requirements.md** ✅
   - Spec quality validation (all checks passed)
   - No [NEEDS CLARIFICATION] markers
   - Requirements are testable
   - Success criteria are measurable and technology-agnostic

---

## Implementation Strategy

### Phase 1: Translation File Generation

- Create `scripts/sync-translations-from-api-data.ts`
- Generate missing `locations.json` and `roles.json` for all 7 locales
- Output: 14 new translation files (7 locales × 2 file types)

### Phase 2: UI Translation Completion

- Create `scripts/audit-translation-coverage.ts`
- Identify missing keys in non-English `common.json` files
- Complete translations (manual or scaffold for later)
- Target: ≥90% coverage for all locales

### Phase 3: Language Switching Fix

- Update `app/[locale]/layout.tsx` to dynamically set `lang` and `dir`
- Ensure proper coordination with root layout
- Verify RTL support works correctly for Arabic

### Phase 4: Validation

- Use existing language selector as interactive playground
- Manual validation checklist for all 7 languages
- Test all screens: homepage, lobby, game, results
- Verify persistence and URL locale segments

---

## Technical Approach

**No new dependencies needed.** All work uses existing infrastructure:

- next-intl for i18n (already configured)
- Next.js App Router with `[locale]` dynamic segments
- Existing locale configuration and utilities
- API data from `data/migration/prepare-api-data.ts`

**Key Changes:**

1. Generate translation files from existing data sources
2. Fix locale layout to set document-level `lang` and `dir`
3. Complete missing UI strings in partial locales

**Validation:**

- Playground-based (constitution principle: "Playground Over Tests")
- Manual verification across all 7 languages
- No automated test suite needed

---

## Constitution Compliance

✅ **Do Less, Get Works**: Only fixes immediate translation gaps; no speculative features  
✅ **Playground Over Tests**: Uses interactive language selector for validation  
✅ **Declarative Style**: JSON translation files are pure data; next-intl hooks are declarative  
✅ **Consistent Code Style**: TypeScript + Prettier already configured  
✅ **Readability First**: Simple generation scripts; straightforward locale layout changes

**No complexity violations** - all principles satisfied without justification needed.

---

## Next Steps

**Ready for**: `/speckit.tasks` command to generate task breakdown

**Implementation estimate**:

- Script creation: 2-3 hours
- Translation completion: 4-6 hours (depending on manual vs scaffold)
- Layout fixes: 1-2 hours
- Validation: 2-3 hours
- **Total**: ~10-14 hours

**Critical path**:

1. Generate location/role translation files (blocks game functionality)
2. Fix locale layout (blocks proper language switching)
3. Complete UI translations (blocks full localization)
4. Validation (ensures quality)

---

## References

- Feature spec: `specs/001-fix-i18n-translations/spec.md`
- All planning docs: `specs/001-fix-i18n-translations/`
- Current locale files: `locales/{locale}/`
- i18n utilities: `lib/i18n/`
- API source data: `data/migration/prepare-api-data.ts`

---

**Generated**: 2025-11-02  
**By**: Speckit planning workflow  
**Status**: ✅ Planning complete - ready for task breakdown
