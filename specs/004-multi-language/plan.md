# Implementation Plan: Multi-Language Support

**Branch**: `004-multi-language` | **Date**: October 30, 2025 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/004-multi-language/spec.md`

## Summary

Add comprehensive multi-language support for 7 languages (Thai, English, Mandarin Chinese, Hindi, Spanish, French, Arabic) with a user-accessible language switcher, complete UI translation, and translation of all game content (84 locations, 588 roles). Implementation will use a modern i18n library with declarative translation files, localStorage for preference persistence, and CSS-based RTL support for Arabic.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+  
**Primary Dependencies**: Next.js 14.2, React 18.3, next-intl (or react-i18next), Tailwind CSS 3.4  
**Storage**: Browser localStorage for language preference, JSON files for translations  
**Testing**: Manual validation via playground/demo (per constitution)  
**Target Platform**: Web browsers (modern evergreen browsers with ES2020+ support)  
**Project Type**: Web application (Next.js frontend + Cloudflare Workers backend)  
**Performance Goals**: <2 second language switch time, <100ms translation lookup  
**Constraints**: RTL layout support required for Arabic, no server-side translation state  
**Scale/Scope**: 84 locations × 7 languages = 588 location translations, 588 roles × 7 languages = 4,116 role translations, ~200 UI strings × 7 languages = ~1,400 UI translations, total ~6,100 translation strings

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Do Less, Get Works**: Feature uses existing i18n libraries (no custom translation engine), declarative JSON translation files (no complex build system), and localStorage (no backend changes)
- [x] **Playground Over Tests**: Plan includes interactive demo page showing all 7 languages with live switching, location/role display, and RTL layout
- [x] **Declarative Style**: Translation files are pure JSON data structures, language switching uses React context, translations accessed via declarative hooks/components
- [x] **Consistent Code Style**: Prettier already configured in package.json, will format all new translation files and components
- [x] **Readability First**: Translation keys use clear namespaced structure (e.g., `location.hospital.name`, `ui.button.createRoom`), no clever abstractions, straightforward React hooks

**Constitution Check Status**: ✅ PASSED - All principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/004-multi-language/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - i18n library evaluation
├── data-model.md        # Phase 1 output - translation data structure
├── quickstart.md        # Phase 1 output - how to add new translations
├── contracts/           # Phase 1 output - translation file schemas
│   └── translation-schema.json
└── playground/          # Working demos
    └── story1/
        └── README.md    # Demo: language switcher on all pages
    └── story2/
        └── README.md    # Demo: location translations
    └── story3/
        └── README.md    # Demo: role translations
    └── story4/
        └── README.md    # Demo: complete UI translation
    └── story5/
        └── README.md    # Demo: RTL Arabic layout
```

### Source Code (repository root)

```text
# Web application structure (Next.js frontend + Workers backend)

# Frontend (Next.js)
app/
├── [locale]/            # NEW: Next.js i18n routing
│   ├── layout.tsx       # MODIFIED: Add locale provider
│   ├── page.tsx         # MODIFIED: Add translations
│   └── (game)/          # MODIFIED: Add translations to game routes
components/
├── i18n/                # NEW: i18n components
│   ├── LanguageSwitcher.tsx
│   ├── TranslationProvider.tsx
│   └── LocaleDetector.tsx
├── game/                # MODIFIED: Add translation hooks to all game components
├── room/                # MODIFIED: Add translation hooks to all room components
└── ui/                  # MODIFIED: Add translation hooks to all UI components

lib/
├── i18n/                # NEW: i18n utilities
│   ├── config.ts        # Language configuration
│   ├── utils.ts         # Translation helpers
│   └── rtl.ts           # RTL layout utilities
└── types.ts             # MODIFIED: Add locale types

locales/                 # NEW: Translation files
├── en/
│   ├── common.json      # Common UI strings
│   ├── locations.json   # Location names
│   └── roles.json       # Role names
├── th/
│   ├── common.json
│   ├── locations.json
│   └── roles.json
├── zh/                  # Mandarin Chinese
├── hi/                  # Hindi
├── es/                  # Spanish
├── fr/                  # French
└── ar/                  # Arabic

data/
└── locations.json       # MODIFIED: Add translation keys

# Backend (Cloudflare Workers)
workers/
└── src/
    ├── index.ts         # NO CHANGES: Language is client-side only
    └── durable-objects/
        └── GameRoom.ts  # NO CHANGES: Store language-neutral IDs only

# Configuration
next.config.js           # MODIFIED: Add i18n configuration
tailwind.config.js       # MODIFIED: Add RTL plugin configuration
package.json             # MODIFIED: Add i18n dependencies
```

**Structure Decision**: Selected "Web application" structure. The multi-language feature is primarily a frontend concern - all translations, language switching, and UI rendering happen in the Next.js frontend. The Cloudflare Workers backend remains language-agnostic, storing only language-neutral location/role IDs. Translation files are organized by locale in a dedicated `locales/` directory, following Next.js i18n conventions.

## Complexity Tracking

> No constitution violations - this section is empty per constitution guidelines.
