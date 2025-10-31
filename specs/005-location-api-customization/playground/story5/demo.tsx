'use client';

/**
 * Demo Page for User Story 5: Local Storage and API Merge Strategy
 * 
 * This component demonstrates:
 * - Merging localStorage selections with API data
 * - localStorage overrides for matching IDs
 * - New API locations defaulting to selected
 * - Custom locations preserved from localStorage
 * - Role-level selection state
 */

import { useState, useEffect } from 'react';
import { useLocations } from '@/lib/hooks/useLocations';
import { fetchLocations } from '@/lib/api/locationsApi';
import { getLocationSelections, saveLocationSelections, clearLocationSelections } from '@/lib/locationStorage';
import { getMergeStats } from '@/lib/locationMerge';
import type { Location, LocationSelection } from '@/lib/types';

export default function MergeDemo() {
  const { locations, isLoading, refetch } = useLocations();
  const [apiLocations, setApiLocations] = useState<Location[]>([]);
  const [mergeStats, setMergeStats] = useState({
    apiOnlyCount: 0,
    localStorageOnlyCount: 0,
    bothCount: 0,
    totalCount: 0,
  });
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  useEffect(() => {
    // Load raw API data for comparison
    fetchLocations().then(setApiLocations);
    
    // Update merge stats
    fetchLocations().then((api) => {
      setMergeStats(getMergeStats(api));
    });
  }, [locations]);

  const handleAddTestData = () => {
    const selections: Record<string, LocationSelection> = {};
    
    // Deselect first 3 locations
    if (apiLocations.length > 0) {
      selections[apiLocations[0].id] = {
        locationId: apiLocations[0].id,
        isSelected: false,
        selectedRoles: [],
        timestamp: new Date().toISOString(),
      };
    }
    if (apiLocations.length > 1) {
      selections[apiLocations[1].id] = {
        locationId: apiLocations[1].id,
        isSelected: false,
        selectedRoles: [],
        timestamp: new Date().toISOString(),
      };
    }
    if (apiLocations.length > 2) {
      selections[apiLocations[2].id] = {
        locationId: apiLocations[2].id,
        isSelected: false,
        selectedRoles: [],
        timestamp: new Date().toISOString(),
      };
    }

    // Add a custom location
    selections['custom-secret-base'] = {
      locationId: 'custom-secret-base',
      isSelected: true,
      selectedRoles: [],
      timestamp: new Date().toISOString(),
    };

    saveLocationSelections(selections);
    refetch();
  };

  const handleClearStorage = () => {
    clearLocationSelections();
    refetch();
  };

  const storageConfig = getLocationSelections();
  const selectedLocation = locations.find((loc) => loc.id === selectedLocationId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            User Story 5: Merge Strategy Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Testing intelligent merge of localStorage selections with API data
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>
          <div className="flex gap-4">
            <button
              onClick={handleAddTestData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Test Data (3 deselected + 1 custom)
            </button>
            <button
              onClick={handleClearStorage}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Clear localStorage
            </button>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Re-merge
            </button>
          </div>
        </div>

        {/* Merge Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-blue-600">{mergeStats.totalCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Locations</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-green-600">{mergeStats.apiOnlyCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">API Only (New)</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-orange-600">{mergeStats.bothCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Both (Overridden)</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-purple-600">{mergeStats.localStorageOnlyCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">localStorage Only (Custom)</div>
          </div>
        </div>

        {/* Storage Inspector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">localStorage Inspector</h2>
          {storageConfig ? (
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Version:</span> {storageConfig.version}</div>
              <div><span className="font-medium">Timestamp:</span> {new Date(storageConfig.timestamp).toLocaleString()}</div>
              <div><span className="font-medium">Selection Count:</span> {Object.keys(storageConfig.selections).length}</div>
              <details className="mt-4">
                <summary className="cursor-pointer font-medium">View Raw Data</summary>
                <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-900 rounded-md overflow-auto text-xs">
                  {JSON.stringify(storageConfig, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">No localStorage data</div>
          )}
        </div>

        {/* Merged Locations List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Merged Locations ({isLoading ? '...' : locations.length})
          </h2>

          {isLoading ? (
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          ) : (
            <div className="space-y-2">
              {locations.slice(0, 20).map((location) => {
                const isInApi = apiLocations.some((api) => api.id === location.id);
                const isInStorage = storageConfig?.selections[location.id] !== undefined;
                
                let badge = '';
                let badgeColor = '';
                
                if (isInApi && isInStorage) {
                  badge = 'Overridden';
                  badgeColor = 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
                } else if (isInApi) {
                  badge = 'API Only';
                  badgeColor = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
                } else {
                  badge = 'Custom';
                  badgeColor = 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
                }

                return (
                  <button
                    key={location.id}
                    onClick={() => setSelectedLocationId(
                      selectedLocationId === location.id ? null : location.id
                    )}
                    className={`w-full px-4 py-3 border rounded-md text-left transition-colors ${
                      selectedLocationId === location.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full ${
                          location.isSelected ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <div>
                          <div className="font-medium">{location.names.en}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {location.id}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${badgeColor}`}>
                        {badge}
                      </span>
                    </div>
                  </button>
                );
              })}
              {locations.length > 20 && (
                <div className="text-center text-gray-500 dark:text-gray-500 py-4">
                  Showing first 20 of {locations.length} locations
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Location Details */}
        {selectedLocation && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Location Details</h3>
            <div className="space-y-4">
              <div>
                <span className="font-medium">Name:</span> {selectedLocation.names.en}
              </div>
              <div>
                <span className="font-medium">ID:</span> {selectedLocation.id}
              </div>
              <div>
                <span className="font-medium">Selected:</span>{' '}
                {selectedLocation.isSelected ? 'Yes' : 'No'}
              </div>
              <div>
                <span className="font-medium">Roles:</span> {selectedLocation.roles.length}
                <div className="mt-2 space-y-1 text-sm">
                  {selectedLocation.roles.slice(0, 5).map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        role.isSelected ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      {role.names.en}
                    </div>
                  ))}
                  {selectedLocation.roles.length > 5 && (
                    <div className="text-gray-500 dark:text-gray-500">
                      ... and {selectedLocation.roles.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Testing Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Testing Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click &quot;Add Test Data&quot; - 3 locations deselected + 1 custom added</li>
            <li>Check merge stats - should show overridden and custom counts</li>
            <li>Open DevTools → Application → localStorage</li>
            <li>View &quot;location-selections&quot; key to see stored data</li>
            <li>Click locations to see role-level selection states</li>
            <li>Click &quot;Clear localStorage&quot; - all locations revert to selected</li>
            <li>Custom location should disappear after clearing</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
