# Quickstart Guide: Multi-Language Support

**Feature**: 004-multi-language  
**Date**: October 30, 2025  
**Audience**: Developers working on multi-language features

## Overview

This guide provides step-by-step instructions for common tasks when working with the multi-language feature. Follow these patterns to maintain consistency and avoid common pitfalls.

---

## Setup & Installation

### 1. Install Dependencies

```bash
npm install next-intl
npm install --save-dev tailwindcss-rtl
```

### 2. Configure next-intl

Create or update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable i18n routing
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
```

### 3. Configure Tailwind for RTL

Update `tailwind.config.js`:

```javascript
module.exports = {
  // ... existing config
  plugins: [
    require('tailwindcss-rtl'),
    // ... other plugins
  ],
};
```

---

## Common Tasks

### Task 1: Add a New Translation Key

**Scenario**: You need to add a new button with text "Edit Profile"

**Steps**:

1. **Add English translation** (source of truth):

   ```json
   // locales/en/common.json
   {
     "button": {
       "editProfile": "Edit Profile" // ← Add this
     }
   }
   ```

2. **Add placeholder in other languages**:

   ```json
   // locales/th/common.json
   {
     "button": {
       "editProfile": "แก้ไขโปรไฟล์"
     }
   }

   // locales/zh/common.json, etc.
   {
     "button": {
       "editProfile": "TODO"  // ← Placeholder for translator
     }
   }
   ```

3. **Use in component**:

   ```tsx
   import { useTranslations } from 'next-intl';

   function ProfileButton() {
     const t = useTranslations('common.button');
     return <button>{t('editProfile')}</button>;
   }
   ```

**Validation**: Run `npm run i18n:check` to verify all locales have the key

---

### Task 2: Translate a Location Name

**Scenario**: Add a new location "Coffee Shop" to the game

**Steps**:

1. **Add to locations.json** (existing Thai data):

   ```json
   // data/locations.json
   {
     "id": "loc-coffee-shop",
     "nameTh": "ร้านกาแฟ",
     "difficulty": "easy",
     "roles": [...],
     "imageUrl": "..."
   }
   ```

2. **Add translations for all locales**:

   ```json
   // locales/en/locations.json
   {
     "loc-coffee-shop": {
       "name": "Coffee Shop"
     }
   }

   // locales/zh/locations.json
   {
     "loc-coffee-shop": {
       "name": "咖啡店"
     }
   }

   // locales/ar/locations.json
   {
     "loc-coffee-shop": {
       "name": "مقهى"
     }
   }
   // ... repeat for all 7 locales
   ```

3. **Use in component**:

   ```tsx
   import { useTranslations } from 'next-intl';

   function LocationCard({ locationId }) {
     const t = useTranslations('locations');
     return <h3>{t(`${locationId}.name`)}</h3>;
   }
   ```

---

### Task 3: Translate Role Names

**Scenario**: Add role translations for a new location

**Steps**:

1. **Add to roles.json for each locale**:

   ```json
   // locales/en/roles.json
   {
     "loc-coffee-shop": {
       "roles": [
         "Barista",
         "Customer",
         "Manager",
         "Baker",
         "Dishwasher",
         "Delivery Driver",
         "Owner"
       ]
     }
   }

   // locales/th/roles.json
   {
     "loc-coffee-shop": {
       "roles": [
         "บาริสต้า",
         "ลูกค้า",
         "ผู้จัดการ",
         "คนทำขนม",
         "คนล้างจาน",
         "พนักงานส่งของ",
         "เจ้าของร้าน"
       ]
     }
   }
   // ... repeat for all 7 locales
   ```

2. **Ensure exactly 7 roles** (validation will fail otherwise)

3. **Use in component**:

   ```tsx
   import { useTranslations } from 'next-intl';

   function RoleCard({ locationId, roleIndex }) {
     const t = useTranslations('roles');
     const roles = t(`${locationId}.roles`);
     return <span>{roles[roleIndex]}</span>;
   }
   ```

---

### Task 4: Add a Parameterized Translation

**Scenario**: Show "Alice has joined the room" with player name

**Steps**:

1. **Add translation with parameter**:

   ```json
   // locales/en/common.json
   {
     "message": {
       "playerJoined": "{playerName} has joined the room"
     }
   }

   // locales/th/common.json
   {
     "message": {
       "playerJoined": "{playerName} เข้าร่วมห้องแล้ว"
     }
   }
   ```

2. **Use with parameters**:

   ```tsx
   import { useTranslations } from 'next-intl';

   function PlayerJoinedMessage({ playerName }) {
     const t = useTranslations('common.message');
     return <p>{t('playerJoined', { playerName })}</p>;
   }
   ```

**Result**: Shows "Alice has joined the room" (English) or "Alice เข้าร่วมห้องแล้ว" (Thai)

---

### Task 5: Handle Pluralization

**Scenario**: Show "1 player" vs "5 players"

**Steps**:

1. **Add plural translation** (ICU MessageFormat):

   ```json
   // locales/en/common.json
   {
     "message": {
       "playersCount": "{count, plural, =0 {No players} =1 {1 player} other {# players}}"
     }
   }

   // locales/th/common.json
   {
     "message": {
       "playersCount": "{count, plural, other {# ผู้เล่น}}"
     }
   }
   ```

2. **Use with count parameter**:

   ```tsx
   import { useTranslations } from 'next-intl';

   function PlayerCount({ count }) {
     const t = useTranslations('common.message');
     return <p>{t('playersCount', { count })}</p>;
   }
   ```

**Result**:

- English: "No players", "1 player", "5 players"
- Thai: "0 ผู้เล่น", "1 ผู้เล่น", "5 ผู้เล่น"

---

### Task 6: Switch Language

**Scenario**: User clicks a language in the language switcher

**Steps**:

1. **Create language switcher component**:

   ```tsx
   'use client';

   import { useLocale } from 'next-intl';
   import { useRouter, usePathname } from 'next/navigation';

   const LOCALES = ['en', 'th', 'zh', 'hi', 'es', 'fr', 'ar'];

   export function LanguageSwitcher() {
     const locale = useLocale();
     const router = useRouter();
     const pathname = usePathname();

     const switchLocale = (newLocale: string) => {
       // Update localStorage
       localStorage.setItem(
         'cf-boardgames-locale',
         JSON.stringify({
           locale: newLocale,
           source: 'user-selected',
           timestamp: Date.now(),
         })
       );

       // Navigate to new locale
       const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
       router.push(newPathname);
     };

     return (
       <select value={locale} onChange={(e) => switchLocale(e.target.value)}>
         <option value="en">English</option>
         <option value="th">ไทย</option>
         <option value="zh">中文</option>
         <option value="hi">हिंदी</option>
         <option value="es">Español</option>
         <option value="fr">Français</option>
         <option value="ar">العربية</option>
       </select>
     );
   }
   ```

2. **Add to layout**:

   ```tsx
   import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           <nav>
             <LanguageSwitcher />
           </nav>
           {children}
         </body>
       </html>
     );
   }
   ```

---

### Task 7: Support RTL for Arabic

**Scenario**: Ensure layout mirrors correctly for Arabic

**Steps**:

1. **Set `dir` attribute on `<html>`**:

   ```tsx
   // app/[locale]/layout.tsx
   import { useLocale } from 'next-intl';

   export default function LocaleLayout({ children }) {
     const locale = useLocale();
     const direction = locale === 'ar' ? 'rtl' : 'ltr';

     return (
       <html lang={locale} dir={direction}>
         <body>{children}</body>
       </html>
     );
   }
   ```

2. **Use logical properties in Tailwind**:

   ```tsx
   // ❌ Bad (doesn't mirror for RTL)
   <div className="ml-4">...</div>

   // ✅ Good (mirrors automatically)
   <div className="ms-4">...</div>  // margin-start

   // ❌ Bad
   <div className="text-left">...</div>

   // ✅ Good
   <div className="text-start">...</div>  // text-align-start
   ```

3. **Test with Arabic**: Switch to Arabic and verify layout mirrors

---

### Task 8: Detect Browser Language

**Scenario**: Auto-detect user's preferred language on first visit

**Steps**:

1. **Create locale detector**:

   ```tsx
   // lib/i18n/utils.ts
   export function detectBrowserLocale(): string {
     // Check localStorage first
     const stored = localStorage.getItem('cf-boardgames-locale');
     if (stored) {
       return JSON.parse(stored).locale;
     }

     // Check browser language
     const browserLang = navigator.language.toLowerCase();
     const langCode = browserLang.split('-')[0]; // 'en-US' → 'en'

     // Map to supported locale
     const supported = ['en', 'th', 'zh', 'hi', 'es', 'fr', 'ar'];
     if (supported.includes(langCode)) {
       return langCode;
     }

     // Default to Thai
     return 'th';
   }
   ```

2. **Use in middleware or client component**:

   ```tsx
   'use client';

   import { useEffect } from 'react';
   import { useRouter } from 'next/navigation';
   import { detectBrowserLocale } from '@/lib/i18n/utils';

   export function LocaleDetector() {
     const router = useRouter();

     useEffect(() => {
       const detectedLocale = detectBrowserLocale();
       router.push(`/${detectedLocale}`);
     }, []);

     return null;
   }
   ```

---

## Validation & Testing

### Run Translation Validation

```bash
# Check for missing keys across all locales
npm run i18n:check

# Validate JSON schema
npm run i18n:validate

# Format all translation files
npm run format
```

### Manual Testing Checklist

- [ ] Switch between all 7 languages on homepage
- [ ] Verify all UI text updates immediately
- [ ] Check location names in game lobby
- [ ] Check role names on role cards
- [ ] Test Arabic RTL layout
- [ ] Test language persistence (close/reopen browser)
- [ ] Test browser language auto-detection
- [ ] Test multi-player with different languages

---

## Common Pitfalls & Solutions

### Pitfall 1: Missing Translation Keys

**Problem**: Translation key exists in English but not in other locales

**Solution**: Run `npm run i18n:check` to detect missing keys. Add placeholders:

```json
{
  "key": "TODO - needs translation"
}
```

### Pitfall 2: Hardcoded Text

**Problem**: Text directly in JSX instead of using translations

**Bad**:

```tsx
<button>Create Room</button>
```

**Good**:

```tsx
const t = useTranslations('common.button');
<button>{t('createRoom')}</button>;
```

### Pitfall 3: Wrong Translation Namespace

**Problem**: Using wrong namespace causes translation not found

**Bad**:

```tsx
const t = useTranslations('common'); // Too broad
t('button.createRoom'); // Works but inefficient
```

**Good**:

```tsx
const t = useTranslations('common.button'); // Specific namespace
t('createRoom'); // Clean and efficient
```

### Pitfall 4: Forgetting RTL Support

**Problem**: Using directional CSS that doesn't mirror for Arabic

**Solution**: Always use logical properties:

- `ms-*` instead of `ml-*` (margin-start)
- `me-*` instead of `mr-*` (margin-end)
- `ps-*` instead of `pl-*` (padding-start)
- `pe-*` instead of `pr-*` (padding-end)
- `text-start` instead of `text-left`

### Pitfall 5: Not Handling Loading State

**Problem**: Translation files loading causes flash of untranslated text

**Solution**: Pre-load common namespace, show loading state for lazy-loaded:

```tsx
import { useTranslations } from 'next-intl';

function LocationList() {
  const t = useTranslations('locations');

  if (!t) {
    return <div>Loading translations...</div>;
  }

  return <div>{t('loc-hospital.name')}</div>;
}
```

---

## File Locations Reference

```
Quick reference for where to add translations:

UI Buttons/Labels:     locales/{locale}/common.json
Location Names:        locales/{locale}/locations.json
Role Names:            locales/{locale}/roles.json
Error Messages:        locales/{locale}/errors.json
Gameplay Instructions: locales/{locale}/gameplay.json

Component Examples:    specs/004-multi-language/playground/
Translation Schema:    specs/004-multi-language/contracts/translation-schema.json
Data Model:            specs/004-multi-language/data-model.md
```

---

## Getting Help

- **Missing translation**: Check `locales/en/*.json` for the source
- **RTL issues**: Verify `dir="rtl"` is set on `<html>` for Arabic
- **Performance issues**: Check if translations are being lazy-loaded
- **Type errors**: Run `npm run build` to regenerate TypeScript types

---

## Next Steps

After completing basic setup:

1. Run playground demos to validate implementation
2. Add your own translation keys following patterns above
3. Test thoroughly in all 7 languages
4. Review with native speakers for quality
5. Set up CI/CD checks for translation completeness

**Ready to implement?** Check out the playground examples in `specs/004-multi-language/playground/story1/` for working demonstrations.
