/**
 * useLocations Hook
 * Fetches location data from API with caching and loading states.
 * Automatically merges with localStorage selections.
 */

'use client';

import { useState, useEffect } from 'react';
import type { Location } from '../types';
import { fetchLocations } from '../api/locationsApi';
import { mergeLocations } from '../locationMerge';

export interface UseLocationsResult {
  locations: Location[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage location data
 * Automatically fetches on mount, uses 24-hour cache, and merges with localStorage
 */
export function useLocations(): UseLocationsResult {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch from API
      const apiLocations = await fetchLocations();
      
      // Merge with localStorage selections
      const merged = mergeLocations(apiLocations);
      
      setLocations(merged);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load locations'));
      console.error('[useLocations] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  return {
    locations,
    isLoading,
    error,
    refetch: loadLocations,
  };
}

export default useLocations;
