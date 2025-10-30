'use client';

/**
 * useRoleTranslations Hook
 *
 * Custom hook to access translated role names in components
 */

import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import type { LocaleCode } from './i18n/types';

/**
 * Hook to load and access role translations for current locale
 */
export function useRoleTranslations() {
  const locale = useLocale() as LocaleCode;
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTranslations() {
      try {
        setIsLoading(true);
        const rolesModule = await import(`@/locales/${locale}/roles.json`);
        setTranslations(rolesModule.default || rolesModule);
      } catch (error) {
        console.error(`Failed to load role translations for ${locale}:`, error);
        // Try fallback to Thai (default language)
        if (locale !== 'th') {
          try {
            const fallbackModule = await import(`@/locales/th/roles.json`);
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
   * Get translated name for a role slug
   * @param roleSlug - Slug-style role identifier (e.g., "teacher", "doctor", "security-guard")
   */
  const getRoleName = (roleSlug: string): string => {
    return translations[roleSlug] || roleSlug;
  };

  return {
    translations,
    getRoleName,
    isLoading,
    locale,
  };
}
