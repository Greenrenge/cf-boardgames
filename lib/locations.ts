/**
 * Location Translation Utilities
 *
 * Functions to load and access location data with translations from API
 */

import type { LocaleCode } from './i18n/types';
import type { Location } from './types';
import { fetchLocations } from './api/locationsApi';

/**
 * Load all locations from API
 * @deprecated Use fetchLocations() from api/locationsApi instead
 */
export async function getLocations(): Promise<Location[]> {
  return fetchLocations();
}

/**
 * Load location translations for a specific locale from API
 * This maintains backward compatibility with the old translation loading
 */
export async function getLocationTranslations(locale: LocaleCode): Promise<Record<string, string>> {
  try {
    const locations = await fetchLocations();
    const translations: Record<string, string> = {};
    
    locations.forEach((location) => {
      translations[location.id] = location.names[locale] || location.names.en;
    });
    
    return translations;
  } catch (error) {
    console.error(`Failed to load location translations from API for locale: ${locale}`, error);
    return {};
  }
}

/**
 * Get translated location name by ID
 */
export function getLocationName(locationId: string, translations: Record<string, string>): string {
  return translations[locationId] || locationId;
}

/**
 * Get location by ID from locations array
 */
export function getLocationById(locationId: string, locations: Location[]): Location | undefined {
  return locations.find((loc) => loc.id === locationId);
}
