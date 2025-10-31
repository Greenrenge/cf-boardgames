'use client';

/**
 * useRoleTranslations Hook
 *
 * Custom hook to access translated role names from API data
 */

import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import type { LocaleCode } from './i18n/types';
import { fetchLocations } from './api/locationsApi';

/**
 * Hook to load and access role translations for current locale from API
 */
export function useRoleTranslations() {
  const locale = useLocale() as LocaleCode;
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTranslations() {
      try {
        setIsLoading(true);
        const locations = await fetchLocations();

        // Build translations map from all roles in all locations
        const translationsMap: Record<string, string> = {};
        locations.forEach((location) => {
          location.roles.forEach((role) => {
            translationsMap[role.id] = role.names[locale] || role.names.en;
          });
        });

        setTranslations(translationsMap);
      } catch (error) {
        console.error(`Failed to load role translations from API for ${locale}:`, error);
        setTranslations({});
      } finally {
        setIsLoading(false);
      }
    }

    loadTranslations();
  }, [locale]);

  /**
   * Get translated name for a role ID
   * @param roleId - Role identifier from API (e.g., "loc-hospital-role-1")
   */
  const getRoleName = (roleId: string): string => {
    return translations[roleId] || roleId;
  };

  return {
    translations,
    getRoleName,
    isLoading,
    locale,
  };
}
