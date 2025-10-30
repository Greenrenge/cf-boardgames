/**
 * Location API Handler
 * Serves location data with embedded translations
 */

import type { Context } from 'hono';
import locationsData from './data';

export interface APIResponse {
  version: string;
  timestamp: string;
  locations: Location[];
}

export interface Location {
  id: string;
  names: LocalizedNames;
  roles: Role[];
  imageUrl?: string;
}

export interface Role {
  id: string;
  names: LocalizedNames;
}

export type LocaleCode = 'en' | 'th' | 'zh' | 'hi' | 'es' | 'fr' | 'ar';
export type LocalizedNames = Record<LocaleCode, string>;

/**
 * GET /api/locations
 * Returns all locations with translations
 */
export async function handleGetLocations(c: Context): Promise<Response> {
  try {
    // Return the pre-generated API response
    // Data includes version, timestamp, and locations with all translations
    return c.json(locationsData);
  } catch (error) {
    console.error('[Locations API] Error fetching locations:', error);
    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch location data',
        },
      },
      500
    );
  }
}

export default handleGetLocations;
