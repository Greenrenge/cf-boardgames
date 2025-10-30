/**
 * Location Translation Utilities
 *
 * Functions to load and access translated location names
 */

import type { LocaleCode } from './i18n/types';

/**
 * Load location translations for a specific locale
 */
export async function getLocationTranslations(locale: LocaleCode): Promise<Record<string, string>> {
  try {
    const translations = await import(`@/locales/${locale}/locations.json`);
    return translations.default || translations;
  } catch (error) {
    console.error(`Failed to load location translations for locale: ${locale}`, error);
    // Fallback to English
    if (locale !== 'en') {
      return getLocationTranslations('en');
    }
    return {};
  }
}

/**
 * Get translated location name by ID
 */
export function getLocationName(locationId: string, translations: Record<string, string>): string {
  return translations[locationId] || locationId;
}
