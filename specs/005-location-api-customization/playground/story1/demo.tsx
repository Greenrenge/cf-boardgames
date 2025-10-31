'use client';

/**
 * Demo Page for User Story 1: API as Single Source of Truth
 *
 * This component demonstrates:
 * - Fetching location data from the API
 * - Displaying skeleton UI during loading
 * - Handling errors with retry functionality
 * - Showing cache status for debugging
 * - Working with translations in multiple languages
 *
 * To use this demo:
 * 1. Copy this file to app/[locale]/test-locations/page.tsx
 * 2. Navigate to http://localhost:3000/en/test-locations
 * 3. Open browser DevTools Network tab to see API call
 * 4. Check localStorage to see cached data
 */

import { useState } from 'react';
import { useLocations } from '@/lib/hooks/useLocations';
import { LocationSkeleton } from '@/components/location/LocationSkeleton';
import { LocationLoadError } from '@/components/location/LocationLoadError';
import { CacheStatusDisplay } from '@/components/location/CacheStatusDisplay';
import { clearLocationCache } from '@/lib/api/locationsApi';
import type { Location } from '@/lib/types';

export default function LocationsDemo() {
  const { locations, isLoading, error, refetch } = useLocations();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleClearCache = () => {
    clearLocationCache();
    refetch();
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">User Story 1: API Integration Demo</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Testing location data fetching from API with caching and skeleton UI
          </p>
        </div>

        {/* Cache Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Cache Status</h2>
            <button
              onClick={handleClearCache}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Clear Cache & Refetch
            </button>
          </div>
          <CacheStatusDisplay
            cacheKey="locations"
            refreshInterval={1000}
            className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md"
          />
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <p>💡 Cache expires after 24 hours</p>
            <p>💡 Check Network tab: First load = API call, subsequent loads = cached</p>
            <p>💡 Check localStorage: Key = &quot;api-cache:locations&quot;</p>
          </div>
        </div>

        {/* Location List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Locations ({isLoading ? '...' : locations.length})
          </h2>

          {/* Loading State */}
          {isLoading && <LocationSkeleton />}

          {/* Error State */}
          {error && !isLoading && <LocationLoadError error={error} onRetry={refetch} />}

          {/* Success State */}
          {!isLoading && !error && locations.length > 0 && (
            <div className="space-y-2">
              {locations.slice(0, 10).map((location: Location) => (
                <div
                  key={location.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden"
                >
                  {/* Location Header */}
                  <button
                    onClick={() => toggleExpand(location.id)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{location.names.en}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        ID: {location.id} • Roles: {location.roles.length}
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 transition-transform ${
                        expandedId === location.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Expanded Content */}
                  {expandedId === location.id && (
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                      {/* Translations */}
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Translations:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">EN:</span> {location.names.en}
                          </div>
                          <div>
                            <span className="font-medium">TH:</span> {location.names.th}
                          </div>
                          <div>
                            <span className="font-medium">ZH:</span> {location.names.zh}
                          </div>
                          <div>
                            <span className="font-medium">HI:</span> {location.names.hi}
                          </div>
                          <div>
                            <span className="font-medium">ES:</span> {location.names.es}
                          </div>
                          <div>
                            <span className="font-medium">FR:</span> {location.names.fr}
                          </div>
                          <div>
                            <span className="font-medium">AR:</span> {location.names.ar}
                          </div>
                        </div>
                      </div>

                      {/* Roles */}
                      <div>
                        <h4 className="font-medium mb-2">Roles ({location.roles.length}):</h4>
                        <div className="text-sm space-y-1">
                          {location.roles.slice(0, 5).map((role) => (
                            <div key={role.id} className="text-gray-600 dark:text-gray-400">
                              • {role.names.en}
                            </div>
                          ))}
                          {location.roles.length > 5 && (
                            <div className="text-gray-500 dark:text-gray-500">
                              ... and {location.roles.length - 5} more
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {locations.length > 10 && (
                <div className="text-center text-gray-500 dark:text-gray-500 py-4">
                  Showing first 10 of {locations.length} locations
                </div>
              )}
            </div>
          )}
        </div>

        {/* Testing Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Testing Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Open browser DevTools → Network tab</li>
            <li>Refresh page - you should see 1 request to /api/locations</li>
            <li>Refresh again - no new request (data from cache)</li>
            <li>Click &quot;Clear Cache &amp; Refetch&quot; - new API request appears</li>
            <li>Open DevTools → Application → localStorage</li>
            <li>Find key &quot;api-cache:locations&quot; - this is the cached data</li>
            <li>Expand a location to see all 7 language translations</li>
            <li>Test in different languages: /th/test-locations, /zh/test-locations, etc.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
