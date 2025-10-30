# Research: Multi-Language Support

**Feature**: 004-multi-language  
**Date**: October 30, 2025  
**Status**: Complete

## Overview

This document captures research findings for implementing multi-language support in the CF Boardgames Spyfall application. The goal is to support 7 languages with minimal complexity while ensuring high performance and maintainability.

## Key Decisions

### 1. i18n Library Choice

**Decision**: Use **next-intl** for Next.js 14 App Router

**Rationale**:

- Native Next.js App Router support with `[locale]` dynamic routing
- Type-safe translations with TypeScript
- Automatic locale detection from browser settings
- Zero configuration RSC (React Server Components) support
- Smaller bundle size compared to next-i18next (~15KB vs ~30KB)
- Built-in support for ICU message format for parameterized translations
- Declarative API that aligns with our constitution (Principle III)

**Alternatives Considered**:

1. **next-i18next**: More mature but designed for Pages Router, requires additional configuration for App Router, larger bundle size
2. **react-i18next**: More flexible but requires manual Next.js integration, more boilerplate code, violates "Do Less, Get Works" principle
3. **Custom solution**: Would violate "Do Less, Get Works" principle, would require significant maintenance

**References**:

- next-intl docs: https://next-intl-docs.vercel.app/
- Next.js i18n routing: https://nextjs.org/docs/app/building-your-application/routing/internationalization

---

### 2. Translation File Structure

**Decision**: Use **JSON files organized by locale and namespace**

**Structure**:

```
locales/
├── en/
│   ├── common.json       # UI strings, buttons, labels
│   ├── locations.json    # 84 location names
│   ├── roles.json        # 588 role names (organized by location)
│   ├── errors.json       # Error messages
│   └── gameplay.json     # Game-specific strings
├── th/
│   └── [same structure]
└── [other locales]
```

**Rationale**:

- JSON is declarative, easy to edit, and supported by all i18n libraries
- Namespace separation (common, locations, roles) improves load performance (can lazy-load game content)
- Clear organization makes translations easy to find and update
- Git-friendly format (clear diffs when translations change)
- No build step required (pure data files)

**Alternatives Considered**:

1. **YAML files**: More human-readable but requires additional parsing library, slower to parse
2. **Database storage**: Would require backend changes, API calls for translations, violates "Do Less, Get Works"
3. **Single large JSON file**: Would load all translations upfront, poor performance, harder to maintain

---

### 3. RTL (Right-to-Left) Support for Arabic

**Decision**: Use **Tailwind CSS RTL plugin** with `dir` attribute switching

**Implementation**:

- Add `tailwindcss-rtl` plugin to Tailwind config
- Set `dir="rtl"` on `<html>` element when Arabic is selected
- Use logical properties in Tailwind (e.g., `ms-4` instead of `ml-4` for margin-start)
- CSS automatically mirrors layout when `dir="rtl"` is set

**Rationale**:

- Declarative approach: change one HTML attribute, entire layout mirrors
- Tailwind's logical properties handle most layout automatically
- No custom CSS required for basic RTL support
- Aligns with Tailwind's existing utility-first approach

**Alternatives Considered**:

1. **Manual CSS with `[dir="rtl"]` selectors**: More code, harder to maintain, error-prone
2. **Separate RTL stylesheet**: Doubles CSS bundle size, complex build setup
3. **JavaScript-based flipping**: Runtime performance cost, violates declarative principle

**References**:

- tailwindcss-rtl: https://github.com/20lives/tailwindcss-rtl
- CSS Logical Properties: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties

---

### 4. Language Preference Storage

**Decision**: Use **localStorage with next-intl's locale cookie**

**Implementation**:

- next-intl automatically sets `NEXT_LOCALE` cookie for server-side locale detection
- Additionally store in localStorage for client-side persistence
- Priority: localStorage > cookie > browser language > default (Thai)

**Rationale**:

- Cookie enables server-side rendering with correct locale
- localStorage provides instant client-side access without request overhead
- Browser language detection provides good default UX
- No backend API changes required
- Works offline (localStorage persists across sessions)

**Alternatives Considered**:

1. **Cookie only**: Requires server read on every page load, slower than localStorage
2. **URL parameter**: Forces locale in URL (`/en/room/ABC123`), breaks shareable links with locale
3. **Database storage**: Requires user accounts and authentication, massive scope increase

---

### 5. Translation Data Organization

**Decision**: **Structured JSON with location/role ID references**

**Structure**:

```json
// locales/en/locations.json
{
  "loc-hospital": {
    "name": "Hospital"
  },
  "loc-school": {
    "name": "School"
  }
  // ... 84 locations
}

// locales/en/roles.json
{
  "loc-hospital": {
    "roles": [
      "Doctor",
      "Nurse",
      "Patient",
      "Visitor",
      "Pharmacist",
      "Security Guard",
      "Receptionist"
    ]
  }
  // ... 84 locations with 7 roles each
}
```

**Rationale**:

- Uses existing location IDs as keys (language-neutral)
- Roles organized by location (maintains context)
- Flat structure (no deep nesting) for easy editing
- Direct key lookup (O(1) access time)
- Type-safe with TypeScript interfaces

**Alternatives Considered**:

1. **Array-based with indices**: Fragile (order matters), easy to break with edits
2. **Embedded in locations.json**: Would require modifying source data file, complex migration
3. **Separate role IDs**: Would require inventing 588 role IDs, unnecessary complexity

---

### 6. Browser Language Detection

**Decision**: Use **`navigator.language` with fallback chain**

**Implementation**:

```typescript
// Priority chain:
1. localStorage (user explicitly selected)
2. NEXT_LOCALE cookie (server-set on previous visit)
3. navigator.language (browser preference)
4. navigator.languages[0] (first preferred language)
5. 'th' (default fallback)

// Map browser language codes to supported locales:
'en-US' → 'en'
'zh-CN' → 'zh'
'zh-TW' → 'zh'
'hi-IN' → 'hi'
'es-ES' → 'es'
'es-MX' → 'es'
'fr-FR' → 'fr'
'ar-SA' → 'ar'
'th-TH' → 'th'
```

**Rationale**:

- Respects user's system preferences
- Graceful degradation through fallback chain
- Maps regional variants to supported locales
- No external API calls required
- Works on first visit (before any preference stored)

**Alternatives Considered**:

1. **IP geolocation**: Requires external API, privacy concerns, doesn't reflect user preference
2. **Always default to Thai**: Poor UX for non-Thai speakers
3. **Force user to select**: Friction on first visit, unnecessary extra step

---

### 7. Performance Optimization

**Decision**: **Lazy-load translation namespaces, pre-load common strings**

**Strategy**:

- Pre-load: `common.json` (loaded with app shell, ~200 strings)
- Lazy-load: `locations.json`, `roles.json` (loaded when entering game, ~4,700 strings)
- Per-page: `errors.json`, `gameplay.json` (loaded on demand)

**Rationale**:

- Initial page load stays fast (<100KB translations)
- Game content loads asynchronously (non-blocking)
- Meets <2 second language switch requirement
- Network-efficient (only load needed translations)

**Measurement Plan**:

- Measure common.json load time (target: <50ms)
- Measure full language switch time (target: <2 seconds)
- Monitor translation lookup time (target: <1ms per lookup)

**Alternatives Considered**:

1. **Load all translations upfront**: ~42KB × 7 languages = 294KB, too slow for initial load
2. **Load translations on demand per component**: Too many small requests, HTTP overhead
3. **Bundle translations in JS**: Prevents lazy-loading, increases JS bundle size

---

## Translation Management

### Translation Process

**Workflow**:

1. Developer adds English translation key to `locales/en/*.json`
2. Developer adds `TODO` placeholder for other languages
3. Native speakers/translators fill in other languages
4. Translations reviewed by language-specific maintainers
5. Automated checks verify all keys exist across all locales

**Quality Assurance**:

- Script to detect missing translation keys across locales
- Linting to ensure consistent JSON structure
- Manual review by native speakers for cultural appropriateness
- Playground testing in each language

**Cultural Localization Guidelines**:

- Use cultural adaptation, not literal translation
- Example: "7-11 Convenience Store" → "Convenience Store" (if 7-11 not culturally relevant)
- Location names should reflect cultural context (e.g., "BTS Station" in Thai vs "Metro Station" in other languages)
- Role names should use local job titles (e.g., "พยาบาล" vs "Nurse" vs "Enfermera")

---

## Technical Implementation Notes

### Type Safety

**Approach**: Generate TypeScript types from English translations

```typescript
// Auto-generated from locales/en/*.json
type TranslationKeys =
  | 'common.button.createRoom'
  | 'common.button.joinRoom'
  | 'location.hospital.name';
// ... all keys

// Type-safe translation hook
const t = useTranslations<TranslationKeys>();
t('common.button.createRoom'); // ✅ Valid
t('common.button.invalid'); // ❌ TypeScript error
```

**Rationale**: Catch translation key typos at compile time, auto-complete in IDE

---

### Parameterized Translations

**Approach**: Use ICU MessageFormat for dynamic content

```json
{
  "gameplay.playerJoined": "{playerName} has joined the room",
  "gameplay.playersCount": "You have {count, plural, =1 {1 player} other {# players}}",
  "gameplay.timeRemaining": "Time remaining: {minutes}:{seconds}"
}
```

**Usage**:

```typescript
t('gameplay.playerJoined', { playerName: 'Alice' });
t('gameplay.playersCount', { count: 5 });
```

**Rationale**: Handles pluralization, variable substitution, and formatting in language-aware manner

---

## Dependencies

### New Dependencies Required

```json
{
  "dependencies": {
    "next-intl": "^3.0.0" // i18n library
  },
  "devDependencies": {
    "tailwindcss-rtl": "^0.9.0" // RTL support
  }
}
```

### No Backend Changes Required

The Cloudflare Workers backend requires **zero changes**:

- Game state stores language-neutral IDs (e.g., `"loc-hospital"`)
- Translation happens entirely on client side
- Backend remains stateless regarding language
- WebSocket messages use IDs, not translated strings

---

## Risks & Mitigations

### Risk 1: Translation Quality

**Risk**: Poor quality or inaccurate translations harm user experience

**Mitigation**:

- Use professional translation services for initial translations
- Native speaker review for cultural appropriateness
- Community contributions with review process
- Placeholder system to mark untranslated strings visually

### Risk 2: Missing Translations

**Risk**: Some strings remain untranslated, breaking UX

**Mitigation**:

- Fallback chain: selected language → English → Thai
- Automated script to detect missing keys
- CI/CD check to prevent incomplete translations from deploying
- Visual indicator in UI for fallback translations (dev mode only)

### Risk 3: RTL Layout Issues

**Risk**: Complex layouts don't mirror correctly for Arabic

**Mitigation**:

- Use Tailwind logical properties consistently
- Manual testing with Arabic locale
- Playground includes RTL-specific test cases
- Document common RTL pitfalls and solutions

### Risk 4: Performance Degradation

**Risk**: Large translation files slow down app

**Mitigation**:

- Lazy-load translation namespaces
- Measure and monitor translation load times
- Compress JSON files in production build
- Cache translations in browser memory after first load

---

## Success Metrics

These metrics align with Success Criteria in spec.md:

1. **Language switch time**: <2 seconds (measured in playground)
2. **Translation coverage**: 100% of all strings translated
3. **Translation lookup performance**: <1ms per lookup (measured with performance.now())
4. **RTL layout correctness**: Manual verification in Arabic mode
5. **Locale persistence**: Verified across browser restarts
6. **Multi-player language independence**: Verified with 2+ browsers in different languages

---

## Open Questions

None. All technical decisions have been made.

---

## References

- next-intl documentation: https://next-intl-docs.vercel.app/
- ICU MessageFormat syntax: https://unicode-org.github.io/icu/userguide/format_parse/messages/
- Tailwind RTL plugin: https://github.com/20lives/tailwindcss-rtl
- CSS Logical Properties: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties
- Next.js i18n routing: https://nextjs.org/docs/app/building-your-application/routing/internationalization
- Browser language detection: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/language
