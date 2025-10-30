# Playground: Language Selection (User Story 1)

**Feature**: 004-multi-language  
**User Story**: P1 - Language Selection  
**Status**: Ready for Implementation

## Purpose

Demonstrate the language selection and switching functionality across all pages of the application.

## What This Demonstrates

- ✅ Language switcher component visible on all pages
- ✅ All 7 supported languages available in switcher
- ✅ Immediate UI update when language is changed
- ✅ Language preference persists across page navigation
- ✅ Language preference persists across browser restarts
- ✅ Browser language auto-detection on first visit

## Implementation Checklist

- [ ] Install `next-intl` package
- [ ] Create `LanguageSwitcher` component
- [ ] Add language switcher to main layout
- [ ] Implement localStorage persistence
- [ ] Implement browser language detection
- [ ] Test on all main pages (home, lobby, game, results)

## Test Scenarios

### Scenario 1: Language Switcher Visibility

**Steps**:

1. Open the application homepage
2. Look for the language switcher in the navigation area

**Expected Result**: Language switcher is visible and shows current language

---

### Scenario 2: Switch Language

**Steps**:

1. Click on the language switcher
2. Select "English" from the dropdown
3. Observe the UI

**Expected Result**: All text on the page immediately updates to English

---

### Scenario 3: Persistence Across Navigation

**Steps**:

1. Select "French" from language switcher
2. Navigate to "Create Room" page
3. Navigate to "Join Room" page

**Expected Result**: UI remains in French on all pages

---

### Scenario 4: Persistence Across Sessions

**Steps**:

1. Select "Spanish" from language switcher
2. Close the browser completely
3. Reopen the browser and visit the application

**Expected Result**: Application starts in Spanish (preference remembered)

---

### Scenario 5: Browser Language Detection

**Steps**:

1. Clear all localStorage and cookies
2. Set browser language to Hindi (in browser settings)
3. Visit the application for the first time

**Expected Result**: Application automatically starts in Hindi

---

### Scenario 6: All Languages Accessible

**Steps**:

1. Open language switcher
2. Count available languages

**Expected Result**: Exactly 7 languages displayed:

- English
- ไทย (Thai)
- 中文 (Chinese)
- हिंदी (Hindi)
- Español (Spanish)
- Français (French)
- العربية (Arabic)

---

### Scenario 7: Current Language Indication

**Steps**:

1. Select "Mandarin Chinese"
2. Open language switcher again

**Expected Result**: Chinese is visually indicated as the current selection (highlighted, checkmark, or similar)

---

## Code Example

### LanguageSwitcher Component

```tsx
'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

const LOCALES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Persist to localStorage
    localStorage.setItem(
      'cf-boardgames-locale',
      JSON.stringify({
        locale: newLocale,
        source: 'user-selected',
        timestamp: Date.now(),
      })
    );

    // Navigate to new locale
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  return (
    <select
      value={locale}
      onChange={(e) => switchLocale(e.target.value)}
      className="px-3 py-2 border rounded"
    >
      {LOCALES.map((loc) => (
        <option key={loc.code} value={loc.code}>
          {loc.native}
        </option>
      ))}
    </select>
  );
}
```

### Usage in Layout

```tsx
// app/[locale]/layout.tsx
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <nav className="flex justify-between items-center p-4">
          <h1>CF Boardgames</h1>
          <LanguageSwitcher />
        </nav>
        {children}
      </body>
    </html>
  );
}
```

---

## Success Criteria

- ✅ Language switcher loads in <50ms
- ✅ Language switch completes in <2 seconds
- ✅ Preference persists 100% of the time across restarts
- ✅ Browser language detection works for all supported languages
- ✅ UI updates immediately without page reload

---

## Known Issues / Edge Cases

- If localStorage is disabled, falls back to session-only (cookie)
- If browser language is not supported, defaults to Thai
- First load may show brief flash of default language before detection completes

---

## Next Steps

After this story is complete and validated:

- Move to User Story 2: Location Names Translation
- Ensure language switcher remains accessible on all subsequent pages
