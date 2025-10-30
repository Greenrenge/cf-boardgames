'use client';

/**
 * useLocationTranslations Hook
 *
 * Custom hook to access translated location names in components
 */

import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import type { LocaleCode } from './i18n/types';

/**
 * Hook to load and access location translations for current locale
 */
export function useLocationTranslations() {
  const locale = useLocale() as LocaleCode;
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTranslations() {
      try {
        setIsLoading(true);
        const locationsModule = await import(`@/locales/${locale}/locations.json`);
        setTranslations(locationsModule.default || locationsModule);
      } catch (error) {
        console.error(`Failed to load location translations for ${locale}:`, error);
        // Try fallback to English
        if (locale !== 'en') {
          try {
            const fallbackModule = await import(`@/locales/en/locations.json`);
            setTranslations(fallbackModule.default || fallbackModule);
          } catch {
            setTranslations({});
          }
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadTranslations();
  }, [locale]);

  /**
   * Get translated name for a location ID
   */
  const getLocationName = (locationId: string): string => {
    return translations[locationId] || locationId;
  };

  return {
    translations,
    getLocationName,
    isLoading,
    locale,
  };
}
