// i18n Utility Functions

import type { LocaleCode, UserLanguagePreference } from './types';
import { DEFAULT_LOCALE, FALLBACK_LOCALE, isValidLocale, getLocaleDirection } from './config';

const STORAGE_KEY = 'cf-boardgames-locale';
const COOKIE_NAME = 'NEXT_LOCALE';

/**
 * Detect browser language preference
 * Returns a supported locale code or null if no match found
 */
export function detectBrowserLocale(): LocaleCode | null {
  if (typeof navigator === 'undefined') return null;

  // Get browser languages in order of preference
  const browserLanguages = navigator.languages || [navigator.language];

  for (const lang of browserLanguages) {
    // Extract language code (e.g., 'en' from 'en-US')
    const langCode = lang.split('-')[0].toLowerCase();

    if (isValidLocale(langCode)) {
      return langCode as LocaleCode;
    }
  }

  return null;
}

/**
 * Get user's language preference from localStorage
 */
export function getUserLanguagePreference(): UserLanguagePreference | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const preference = JSON.parse(stored) as UserLanguagePreference;

    // Validate the stored preference
    if (isValidLocale(preference.locale)) {
      return preference;
    }
  } catch (error) {
    console.error('Failed to parse language preference from localStorage:', error);
  }

  return null;
}

/**
 * Save user's language preference to localStorage
 */
export function setUserLanguagePreference(
  locale: LocaleCode,
  source: UserLanguagePreference['source'] = 'user-selected'
): void {
  if (typeof window === 'undefined') return;

  try {
    const preference: UserLanguagePreference = {
      locale,
      source,
      timestamp: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(preference));
  } catch (error) {
    console.error('Failed to save language preference to localStorage:', error);
  }
}

/**
 * Get locale from cookie (for server-side rendering)
 */
export function getLocaleFromCookie(cookies: string): LocaleCode | null {
  const match = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const locale = match?.[1];

  return locale && isValidLocale(locale) ? (locale as LocaleCode) : null;
}

/**
 * Set locale cookie (for server-side rendering)
 */
export function setLocaleCookie(locale: LocaleCode): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

/**
 * Determine the locale to use based on various sources
 * Priority: User preference > Browser language > Default
 */
export function determineLocale(): LocaleCode {
  // 1. Check user preference in localStorage
  const userPreference = getUserLanguagePreference();
  if (userPreference) {
    return userPreference.locale;
  }

  // 2. Check browser language
  const browserLocale = detectBrowserLocale();
  if (browserLocale) {
    // Save as browser-detected preference
    setUserLanguagePreference(browserLocale, 'browser-detected');
    return browserLocale;
  }

  // 3. Use default locale
  setUserLanguagePreference(DEFAULT_LOCALE, 'default');
  return DEFAULT_LOCALE;
}

/**
 * Get locale direction (ltr or rtl)
 */
export { getLocaleDirection };

/**
 * Get fallback locale for missing translations
 */
export function getFallbackLocale(): LocaleCode {
  return FALLBACK_LOCALE;
}

/**
 * Log missing translation key (for development)
 */
export function logMissingTranslation(key: string, locale: LocaleCode): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`Missing translation: "${key}" for locale "${locale}"`);
  }
}
