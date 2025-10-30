/**
 * Locations API Client
 * Fetches location data from API with 24-hour caching
 */

import type { Location, APIResponse } from '../types';
import { getCachedData, setCachedData, clearCache } from './apiCache';

const LOCATIONS_CACHE_KEY = 'locations';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Fetch locations from API with caching
 *
 * @returns Array of locations with all translations
 * @throws Error if API request fails and no cache is available
 */
export async function fetchLocations(): Promise<Location[]> {
  // Try to get from cache first
  const cached = getCachedData<APIResponse>(LOCATIONS_CACHE_KEY);

  if (cached) {
    console.log('[Locations API] Using cached data');
    return cached.locations;
  }

  try {
    console.log('[Locations API] Fetching from API...');
    const response = await fetch(`${API_BASE_URL}/locations`);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: APIResponse = await response.json();

    // Validate response structure
    if (!data.version || !data.timestamp || !Array.isArray(data.locations)) {
      throw new Error('Invalid API response structure');
    }

    // Cache the response
    setCachedData(LOCATIONS_CACHE_KEY, data, data.version);
    console.log(`[Locations API] Fetched ${data.locations.length} locations`);

    return data.locations;
  } catch (error) {
    console.error('[Locations API] Error fetching locations:', error);

    // Try to use expired cache as fallback
    const expiredCache = getCachedData<APIResponse>(LOCATIONS_CACHE_KEY);
    if (expiredCache) {
      console.warn('[Locations API] Using expired cache as fallback');
      return expiredCache.locations;
    }

    // No cache available, throw error
    throw new Error(
      error instanceof Error
        ? `Failed to fetch locations: ${error.message}`
        : 'Failed to fetch locations'
    );
  }
}

/**
 * Clear location cache and force fresh fetch on next call
 */
export function clearLocationCache(): void {
  clearCache(LOCATIONS_CACHE_KEY);
  console.log('[Locations API] Cache cleared');
}

/**
 * Prefetch locations data (useful for SSR or early loading)
 */
export async function prefetchLocations(): Promise<void> {
  try {
    await fetchLocations();
  } catch (error) {
    console.warn('[Locations API] Prefetch failed:', error);
  }
}

export default fetchLocations;
