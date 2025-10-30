'use client';

/**
 * LanguageSwitcher Component
 *
 * Dropdown selector for changing application language.
 * Features:
 * - Shows all 7 supported languages with native names
 * - Persists selection to localStorage and cookie
 * - Updates URL to include locale segment
 * - Visual indication of current language
 */

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { SUPPORTED_LOCALES } from '@/lib/i18n/config';
import { setUserLanguagePreference } from '@/lib/i18n/utils';
import type { LocaleCode } from '@/lib/i18n/types';

export function LanguageSwitcher() {
  const locale = useLocale() as LocaleCode;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: LocaleCode) => {
    if (newLocale === locale) return;

    // Save preference to localStorage
    setUserLanguagePreference(newLocale);

    // Set cookie for SSR
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    // Update URL with new locale
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);

    startTransition(() => {
      router.push(newPathname);
      router.refresh();
    });
  };

  return (
    <div className="relative inline-block">
      <select
        value={locale}
        onChange={(e) => switchLocale(e.target.value as LocaleCode)}
        disabled={isPending}
        className="appearance-none bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 pr-10 text-gray-700 dark:text-gray-300 font-medium hover:border-blue-500 dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        aria-label="Select language"
      >
        {SUPPORTED_LOCALES.map((loc) => (
          <option key={loc.code} value={loc.code}>
            {loc.flag} {loc.nativeName}
          </option>
        ))}
      </select>

      {/* Custom dropdown arrow */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
        <svg
          className={`w-4 h-4 transition-transform ${isPending ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isPending ? (
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          )}
        </svg>
      </div>
    </div>
  );
}
