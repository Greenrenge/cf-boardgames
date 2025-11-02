# Quickstart Guide: i18n Translation Fixes

**Feature**: Fix incomplete i18n translations and language switching  
**Date**: 2025-11-02  
**Audience**: Developers implementing the fix

This guide provides step-by-step instructions for completing the translation coverage and fixing language switching.

---

## Prerequisites

- Node.js 20+ installed
- Repository cloned and dependencies installed (`pnpm install`)
- Familiarity with Next.js App Router and TypeScript
- Branch: `001-fix-i18n-translations` checked out

---

## Phase 1: Generate Missing Translation Files

### Step 1.1: Create Translation Generation Script

Create `scripts/sync-translations-from-api-data.ts`:

```typescript
import * as fs from 'fs';
import * as path from 'path';
import { generateApiData } from '../data/migration/prepare-api-data';

const LOCALES = ['en', 'th', 'zh', 'hi', 'es', 'fr', 'ar'] as const;
const LOCALES_DIR = path.join(__dirname, '../locales');

async function main() {
  console.log('🔄 Generating translation files from API data...\n');

  const { locations } = generateApiData();

  for (const locale of LOCALES) {
    console.log(`📝 Processing ${locale}...`);

    // Generate locations.json
    const locationTranslations: Record<string, string> = {};
    for (const location of locations) {
      locationTranslations[location.id] = location.names[locale];
    }

    const locationsFile = path.join(LOCALES_DIR, locale, 'locations.json');
    fs.mkdirSync(path.dirname(locationsFile), { recursive: true });
    fs.writeFileSync(locationsFile, JSON.stringify(locationTranslations, null, 2));
    console.log(
      `  ✅ Created ${locale}/locations.json (${Object.keys(locationTranslations).length} entries)`
    );

    // Generate roles.json
    const roleTranslations: Record<string, string> = {};
    for (const location of locations) {
      for (const role of location.roles) {
        roleTranslations[role.id] = role.names[locale];
      }
    }

    const rolesFile = path.join(LOCALES_DIR, locale, 'roles.json');
    fs.writeFileSync(rolesFile, JSON.stringify(roleTranslations, null, 2));
    console.log(
      `  ✅ Created ${locale}/roles.json (${Object.keys(roleTranslations).length} entries)`
    );
  }

  console.log('\n✨ Done! All translation files generated.');
}

main().catch(console.error);
```

**Run it:**

```bash
pnpm tsx scripts/sync-translations-from-api-data.ts
```

**Expected output:**

- `locales/{locale}/locations.json` for all 7 languages
- `locales/{locale}/roles.json` for all 7 languages

---

### Step 1.2: Create Translation Audit Script

Create `scripts/audit-translation-coverage.ts`:

```typescript
import * as fs from 'fs';
import * as path from 'path';

const LOCALES = ['en', 'th', 'zh', 'hi', 'es', 'fr', 'ar'] as const;
const LOCALES_DIR = path.join(__dirname, '../locales');

function flattenKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      keys = keys.concat(flattenKeys(obj[key], newKey));
    } else {
      keys.push(newKey);
    }
  }
  return keys;
}

function main() {
  console.log('🔍 Auditing translation coverage...\n');

  // Load baseline (English)
  const baselineFile = path.join(LOCALES_DIR, 'en', 'common.json');
  const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf-8'));
  const baselineKeys = flattenKeys(baseline);

  console.log(`📊 Baseline (English): ${baselineKeys.length} keys\n`);

  for (const locale of LOCALES) {
    if (locale === 'en') continue;

    const localeFile = path.join(LOCALES_DIR, locale, 'common.json');
    if (!fs.existsSync(localeFile)) {
      console.log(`❌ ${locale}: File not found`);
      continue;
    }

    const localeData = JSON.parse(fs.readFileSync(localeFile, 'utf-8'));
    const localeKeys = flattenKeys(localeData);

    const missing = baselineKeys.filter((k) => !localeKeys.includes(k));
    const extra = localeKeys.filter((k) => !baselineKeys.includes(k));

    const coverage = ((localeKeys.length / baselineKeys.length) * 100).toFixed(1);

    console.log(
      `${locale.toUpperCase()}: ${coverage}% coverage (${localeKeys.length}/${baselineKeys.length} keys)`
    );

    if (missing.length > 0) {
      console.log(`  ⚠️  Missing ${missing.length} keys:`);
      missing.slice(0, 5).forEach((k) => console.log(`     - ${k}`));
      if (missing.length > 5) {
        console.log(`     ... and ${missing.length - 5} more`);
      }
    }

    if (extra.length > 0) {
      console.log(`  ℹ️  Extra ${extra.length} keys (safe to ignore)`);
    }

    console.log();
  }
}

main();
```

**Run it:**

```bash
pnpm tsx scripts/audit-translation-coverage.ts
```

**Expected output:**

- Coverage report for each language
- List of missing keys to translate

---

## Phase 2: Complete UI Translations

### Step 2.1: Identify Missing Translations

Use the audit script output to identify which keys need translation in each language.

### Step 2.2: Add Missing Keys

For each locale with < 100% coverage:

1. Open `locales/{locale}/common.json`
2. Compare with `locales/en/common.json`
3. Add missing keys with translated values

**Option A: Manual translation** (preferred for quality)

- Copy missing keys from English
- Translate each value appropriately
- Verify grammatical correctness

**Option B: Scaffold for later** (temporary)

- Copy missing keys from English
- Add comment `// TODO: Translate from English`
- Plan to get proper translations before deployment

**Example for Spanish (`es/common.json`):**

```json
{
  "button": {
    "createRoom": "Crear Sala",
    "joinRoom": "Unirse a Sala",
    "startGame": "Iniciar Juego"
  },
  "label": {
    "roomCode": "Código de Sala",
    "playerName": "Nombre del Jugador"
  }
}
```

---

## Phase 3: Fix Language Switching

### Step 3.1: Update Locale Layout for Dynamic Lang/Dir

Edit `app/[locale]/layout.tsx`:

**Current code** (static wrapper):

```tsx
export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  // ... existing validation and message loading ...

  return (
    <div lang={locale} dir={direction}>
      <TranslationProvider locale={locale} messages={messages}>
        {children}
      </TranslationProvider>
    </div>
  );
}
```

**Problem**: The `<div>` wrapper doesn't set HTML document attributes.

**Fix**: Return fragment and update root layout to be dynamic, OR move lang/dir to a client component wrapper.

**Recommended approach** - Update the existing structure to properly set attributes:

```tsx
export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  // Validate locale
  if (!(LOCALE_CODES as readonly string[]).includes(params.locale)) {
    notFound();
  }

  const locale = params.locale as LocaleCode;
  const direction = getDirectionAttr(locale);
  const messages = await getMessages(locale);

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body>
        <TranslationProvider locale={locale} messages={messages}>
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}
```

**Note**: If root layout already has `<html>` and `<body>`, you'll need to coordinate. The cleanest approach is to make locale layout control these tags since locale is dynamic.

### Step 3.2: Verify Root Layout Compatibility

Check `app/layout.tsx` - ensure it doesn't conflict with locale-specific settings. Root layout should focus on:

- Theme provider
- Global metadata
- Font loading

Locale-specific concerns (lang, dir, messages) should be in `[locale]/layout.tsx`.

---

## Phase 4: Validation Playground

### Step 4.1: Manual Validation Checklist

Test each language systematically:

**For each locale (en, th, zh, hi, es, fr, ar):**

1. **Homepage:**
   - [ ] Open `/{locale}/` (e.g., `/en/`, `/th/`, `/ar/`)
   - [ ] Verify all UI text is in selected language
   - [ ] Check language selector shows current language selected
   - [ ] Verify layout direction (LTR for most, RTL for Arabic)

2. **Language Switching:**
   - [ ] Change language via selector
   - [ ] URL updates to new locale (e.g., `/en/` → `/th/`)
   - [ ] All text updates instantly
   - [ ] Page direction updates (especially check LTR ↔ RTL)
   - [ ] No console errors

3. **Persistence:**
   - [ ] Reload page
   - [ ] Verify language persists (URL still has locale)
   - [ ] Navigate to `/room/ABC123`
   - [ ] Verify URL becomes `/{locale}/room/ABC123`

4. **Lobby Screen:**
   - [ ] Create room in current locale
   - [ ] Verify all labels/buttons translated
   - [ ] Check player list labels
   - [ ] Verify game settings text

5. **Game Screen:**
   - [ ] Start game
   - [ ] Open role card → verify role name translated
   - [ ] Open location browser → verify location names translated
   - [ ] Check chat interface labels
   - [ ] Verify voting interface text

6. **Results Screen:**
   - [ ] Complete game
   - [ ] Verify all results labels translated
   - [ ] Check score display text

### Step 4.2: RTL-Specific Validation (Arabic)

- [ ] Text flows right-to-left
- [ ] UI elements mirror correctly (e.g., chevrons point opposite direction)
- [ ] Number/score displays work correctly
- [ ] No text overflow or layout breaks
- [ ] Language selector dropdown works

---

## Phase 5: Testing Commands

```bash
# Install dependencies
pnpm install

# Generate translation files
pnpm tsx scripts/sync-translations-from-api-data.ts

# Audit coverage
pnpm tsx scripts/audit-translation-coverage.ts

# Start dev server
pnpm dev

# Build for production (validates all locales)
pnpm build

# Lint code
pnpm lint
```

---

## Troubleshooting

### Problem: Translation key not found

**Symptom**: Console warning "Missing translation: key for locale en"

**Solution:**

1. Check `locales/en/common.json` has the key
2. Verify key path is correct (e.g., `t('button.createRoom')` not `t('createRoom')`)
3. Check namespace: `useTranslations('common')` is correct

### Problem: Language switch doesn't update all text

**Symptom**: Some UI elements stay in old language after switch

**Solution:**

1. Verify component uses `useTranslations('common')` hook (not hardcoded)
2. Check if component is outside `TranslationProvider` tree
3. Ensure locale layout is rendering correctly

### Problem: RTL layout breaks in Arabic

**Symptom**: Elements overlap or misalign in Arabic

**Solution:**

1. Check Tailwind RTL utilities are used (`rtl:flex-row-reverse`)
2. Verify `dir="rtl"` is set on HTML element
3. Use logical properties (`ms-` for margin-start instead of `ml-`)
4. Check existing `lib/i18n/rtl.ts` utility functions

### Problem: Build fails with "Invalid locale"

**Symptom**: Next.js build error about locale configuration

**Solution:**

1. Verify `LOCALE_CODES` in `lib/i18n/config.ts` matches folders
2. Check `generateStaticParams` in locale layout returns all codes
3. Ensure middleware config matches locale codes

---

## Performance Notes

**Bundle Size:**

- Each locale adds ~55KB (uncompressed) to page bundle
- Only active locale is loaded (not all 7)
- Compressed: ~15KB per locale (gzipped)

**Runtime:**

- Translation lookup is O(1) (simple object key access)
- Language switch triggers navigation (expected)
- No performance optimization needed

---

## Deployment Checklist

Before merging to main:

- [ ] All translation files generated and committed
- [ ] UI translation coverage ≥ 90% for all locales
- [ ] Manual validation passed for all 7 languages
- [ ] RTL (Arabic) works without layout issues
- [ ] Build succeeds: `pnpm build`
- [ ] Lint passes: `pnpm lint`
- [ ] No console errors in production build
- [ ] Language persistence works after deploy
- [ ] Locale URLs are indexed correctly (check robots.txt, sitemap)

---

## References

- Spec: `specs/001-fix-i18n-translations/spec.md`
- Research: `specs/001-fix-i18n-translations/research.md`
- Data Model: `specs/001-fix-i18n-translations/data-model.md`
- Contracts: `specs/001-fix-i18n-translations/contracts/`
- next-intl docs: https://next-intl-docs.vercel.app/
- Next.js i18n: https://nextjs.org/docs/app/building-your-application/routing/internationalization
