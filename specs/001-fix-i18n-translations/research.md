# Research: i18n Translation Completion Strategy

**Feature**: Fix incomplete i18n translations and language switching  
**Date**: 2025-11-02  
**Status**: Complete

## Research Questions

### Q1: How to generate missing translation files for locations and roles?

**Decision**: Use existing `data/migration/prepare-api-data.ts` as source of truth and create generation scripts that output locale-specific JSON files.

**Rationale**:

- The `prepare-api-data.ts` already aggregates location/role data with translations for all 7 languages
- It reads from canonical `locations.json` source and merges with translation dictionaries
- Reusing this logic ensures consistency between API data and client-side translation files

**Alternatives Considered**:

1. **Manual translation CSV imports**: Rejected because prepare-api-data.ts already has the data structure
2. **Machine translation APIs**: Rejected because translations already exist in the migration script
3. **Duplicate translation logic**: Rejected to avoid divergence; single source of truth is cleaner

**Implementation Approach**:

```typescript
// Generate locales/{lang}/locations.json from prepare-api-data output
// Generate locales/{lang}/roles.json from prepare-api-data output
// Script: scripts/sync-translations-from-api-data.ts
```

---

### Q2: How to complete missing UI strings in non-English/Thai locales?

**Decision**: Use English as template, identify missing keys via diff, and generate placeholder files with TODO markers for human translation.

**Rationale**:

- English common.json is most complete (baseline)
- Spanish/French/Chinese/Hindi/Arabic files have partial translations
- Automated key diffing ensures no keys are missed
- Human translation required for quality; scripts just scaffold

**Alternatives Considered**:

1. **Machine translate everything**: Rejected because quality matters for UI strings; better to have clear TODOs
2. **Copy English everywhere**: Rejected because users expect localized content
3. **Delete incomplete languages**: Rejected because multi-language support is a feature requirement

**Implementation Approach**:

```typescript
// Compare locales/en/common.json keys with locales/{lang}/common.json
// For missing keys, insert English value + "// TODO: Translate"
// Script: scripts/audit-translation-coverage.ts
```

---

### Q3: How to make language switching update document lang and direction?

**Decision**: Make `app/[locale]/layout.tsx` set `lang` and `dir` attributes dynamically per locale segment, not statically in root layout.

**Rationale**:

- Next.js App Router already has `[locale]` dynamic segment
- Layout can read `params.locale` and pass to `<html lang={locale} dir={direction}>`
- RTL support (Arabic) requires `dir="rtl"` at document level
- Current root layout has static `lang="th"` which doesn't update

**Alternatives Considered**:

1. **Client-side JavaScript to update document attributes**: Rejected because causes hydration mismatch and flash of wrong direction
2. **Keep static root layout**: Rejected because doesn't solve the core issue
3. **Middleware redirect to set attributes**: Rejected because Next.js layouts are the idiomatic place for this

**Implementation Approach**:

```tsx
// app/[locale]/layout.tsx already exists
// Modify to return wrapper with lang/dir from params.locale
// Use getDirectionAttr(locale) from lib/i18n/rtl.ts
```

---

### Q4: Translation file governance and update process

**Decision**: Establish convention that scripts generate from source data, humans review/edit output, committed files are source of truth for runtime.

**Rationale**:

- Separates machine-generated scaffolding from human-curated content
- Scripts are idempotent and can regenerate if source changes
- Git diffs show exactly what changed in translations
- No runtime dependency on migration scripts

**Alternatives Considered**:

1. **Generate at build time**: Rejected because adds build complexity and obscures what ships
2. **Keep only source data, generate on-demand**: Rejected because client needs static files
3. **Manual maintenance only**: Rejected because error-prone for 7 languages × 80+ locations

**Process**:

1. Run generation script when locations/roles change
2. Review generated JSON files
3. Human translators update TODO placeholders
4. Commit completed translations
5. Runtime uses committed files directly

---

### Q5: Validation strategy for translation completeness

**Decision**: Create interactive playground using existing language selector; manually verify all screens in all 7 languages.

**Rationale**:

- Constitution principle: "Playground Over Tests"
- Language selector already exists as functional UI
- Human verification catches layout issues, RTL problems, and missing strings visually
- Automated tests wouldn't catch semantic translation errors anyway

**Alternatives Considered**:

1. **Automated key coverage tests**: Useful but doesn't validate quality or rendering
2. **Screenshot diffing**: Overkill for translation verification
3. **No validation**: Rejected because we need confidence all languages work

**Validation Checklist**:

- [ ] Homepage: All UI strings translated in all 7 languages
- [ ] Language selector: Switching updates all text + direction instantly
- [ ] Lobby screen: All labels and buttons translated
- [ ] Game screen: Role cards show translated roles
- [ ] Game screen: Location browser shows translated locations
- [ ] Results screen: All labels translated
- [ ] RTL (Arabic): Layout mirrors correctly, text flows right-to-left
- [ ] Persistence: Reload maintains selected language + locale URL segment

---

## Technology Decisions

### Translation File Format

**Decision**: JSON dictionaries with nested keys following next-intl conventions.

**Rationale**:

- Already in use: `locales/{lang}/common.json`
- next-intl expects this structure
- Easy to edit and version control
- TypeScript can type-check usage via generated types

### Fallback Strategy

**Decision**: missing key → fallback to English → log warning in dev mode.

**Rationale**:

- English is most complete baseline
- Better to show English than raw keys or crashes
- Dev warnings help identify gaps
- next-intl handles this automatically

### Performance Considerations

**Decision**: No optimization needed; static JSON files are fast enough.

**Rationale**:

- Translation files are small (<50KB per locale)
- Loaded once per page navigation
- Next.js bundles them into static chunks
- No runtime translation computation needed

---

## Implementation Priorities

1. **Critical Path** (must complete first):
   - Generate missing locations.json and roles.json for all locales
   - Complete missing keys in common.json files
   - Fix app/[locale]/layout.tsx to set lang/dir dynamically

2. **Secondary** (can iterate):
   - Human translation quality review
   - Edge case testing (RTL, long text, special characters)
   - Documentation for translation update process

3. **Out of Scope** (defer to later):
   - Adding new languages beyond current 7
   - Pluralization rules (next-intl supports but not needed yet)
   - Date/time/number localization (if needed, next-intl supports)
   - Translation management platform integration (Crowdin, Lokalise, etc.)

---

## Risk Assessment

| Risk                                     | Probability | Impact | Mitigation                                                       |
| ---------------------------------------- | ----------- | ------ | ---------------------------------------------------------------- |
| Generated translations have errors       | Medium      | Medium | Human review before commit; playground validation                |
| RTL layout breaks existing UI            | Low         | Medium | Arabic-specific testing checklist; CSS already has RTL utilities |
| Translation file sync gets out of date   | Medium      | Low    | Document regeneration process; add to contribution guide         |
| Performance regression from larger files | Low         | Low    | Files are already small; monitor bundle size                     |

---

## References

- next-intl documentation: https://next-intl-docs.vercel.app/
- Next.js i18n routing: https://nextjs.org/docs/app/building-your-application/routing/internationalization
- Existing codebase locations: `lib/i18n/`, `locales/`, `components/i18n/`
- Source data: `data/migration/prepare-api-data.ts`
