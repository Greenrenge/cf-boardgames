'use client';

/**
 * useLocationTranslations Hook
 *
 * Custom hook to access translated location names from API data
 */

import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import type { LocaleCode } from './i18n/types';
import { fetchLocations } from './api/locationsApi';

/**
 * Hook to load and access location translations for current locale from API
 */
export function useLocationTranslations() {
  const locale = useLocale() as LocaleCode;
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTranslations() {
      try {
        setIsLoading(true);
        const locations = await fetchLocations();
        
        // Build translations map from API data
        const translationsMap: Record<string, string> = {};
        locations.forEach((location) => {
          translationsMap[location.id] = location.names[locale] || location.names.en;
        });
        
        setTranslations(translationsMap);
      } catch (error) {
        console.error(`Failed to load location translations from API for ${locale}:`, error);
        setTranslations({});
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
