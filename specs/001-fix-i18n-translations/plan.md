# Implementation Plan: Fix incomplete i18n translations and language switching

**Branch**: `001-fix-i18n-translations` | **Date**: 2025-11-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-fix-i18n-translations/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Fix incomplete translations for UI strings, location names, and role names across all 7 supported languages (en, th, zh, hi, es, fr, ar). Ensure language switching updates all visible content, page metadata (lang/dir), and persists correctly across sessions. The technical approach uses next-intl for i18n, generates missing translation files from existing data sources, and ensures dynamic locale layout updates work correctly with Next.js App Router.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+  
**Primary Dependencies**: Next.js 14.2 (App Router), React 18.3, next-intl for i18n, Tailwind CSS 3.4  
**Storage**: Browser localStorage for user preferences (indefinite persistence), JSON files for translation dictionaries  
**Testing**: Manual playground validation via interactive language switcher  
**Target Platform**: Web browsers (desktop + mobile), server-side rendering on Cloudflare Pages  
**Project Type**: Web application (frontend with API routes)  
**Performance Goals**: Language switch updates UI within 1 second  
**Constraints**: All 7 supported languages must have complete translations; RTL support required for Arabic  
**Scale/Scope**: 7 languages, ~300 UI strings, 80+ locations with 5-10 roles each

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Do Less, Get Works**: Completes only missing translations and fixes language switcher; no new features
- [x] **Playground Over Tests**: Uses existing language selector on homepage as interactive validation playground
- [x] **Declarative Style**: Translation files are pure JSON data; next-intl provides declarative useTranslations hooks
- [x] **Consistent Code Style**: TypeScript + Prettier already configured; JSON format for all translation files
- [x] **Readability First**: Simple data file generation scripts; straightforward locale layout updates

_If any principle cannot be met, document justification in Complexity Tracking section below._

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── playground.md        # Working demo/examples showing feature works
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
locales/                          # Translation dictionaries (JSON)
├── en/
│   ├── common.json              # UI strings (complete ✓)
│   ├── locations.json           # Location names (complete ✓)
│   └── roles.json               # Role names (needs generation)
├── th/
│   ├── common.json              # UI strings (complete ✓)
│   ├── locations.json           # Location names (complete ✓)
│   └── roles.json               # Role names (needs generation)
├── zh/
│   ├── common.json              # UI strings (needs completion)
│   └── [locations.json, roles.json need generation]
├── es/
│   ├── common.json              # UI strings (needs completion)
│   └── [locations.json, roles.json need generation]
├── fr/
│   ├── common.json              # UI strings (needs completion)
│   └── [locations.json, roles.json need generation]
├── hi/
│   ├── common.json              # UI strings (needs completion)
│   └── [locations.json, roles.json need generation]
└── ar/
    ├── common.json              # UI strings (needs completion)
    └── [locations.json, roles.json need generation]

app/
├── [locale]/                     # Dynamic locale routes
│   ├── layout.tsx               # Needs lang/dir dynamic update
│   └── page.tsx                 # Homepage with language selector
└── layout.tsx                   # Root layout (static lang="th" - needs review)

components/
└── i18n/
    ├── LanguageSwitcher.tsx     # Already updates cookies + URL
    └── TranslationProvider.tsx  # Wraps next-intl provider

lib/
├── i18n/
│   ├── config.ts                # Supported locales, RTL detection
│   ├── types.ts                 # LocaleCode, Locale types
│   └── utils.ts                 # Locale detection, storage
├── useLocationTranslations.ts   # Fetches from API
└── useRoleTranslations.ts       # Fetches from API

scripts/
├── generate-location-translations.js  # Generate missing location files
└── generate-role-translations.js      # Generate missing role files

data/
└── migration/
    └── prepare-api-data.ts      # Source of truth for location/role translations
```

**Structure Decision**: Next.js App Router web application with file-based i18n. Translation files are JSON dictionaries in `locales/[lang]/`. Components use next-intl hooks. Dynamic locale routing via `[locale]` segment.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
