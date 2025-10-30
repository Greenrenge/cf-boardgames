/**
 * useLocations Hook
 * Fetches location data from API with caching and loading states
 */

'use client';

import { useState, useEffect } from 'react';
import type { Location } from '../types';
import { fetchLocations } from '../api/locationsApi';

export interface UseLocationsResult {
  locations: Location[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage location data
 * Automatically fetches on mount, uses 24-hour cache
 */
export function useLocations(): UseLocationsResult {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchLocations();
      setLocations(data);
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
