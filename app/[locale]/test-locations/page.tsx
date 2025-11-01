'use client';

/**
 * Test Page: Location API Integration
 *
 * This page demonstrates the complete location loading and display functionality.
 * Tests the API integration, caching, and fallback mechanisms.
 */

import React from 'react';
import { useLocations } from '@/lib/hooks/useLocations';
import { LocationListSkeleton, ApiLoadingState } from '@/components/location/LoadingStates';
import { LocationErrorBoundary } from '@/components/location/LocationErrorBoundary';

export default function TestLocationsPage() {
  const { locations, isLoading, error, refetch } = useLocations();

  return (
    <LocationErrorBoundary>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🧪 Location API Integration Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This page tests the complete location loading pipeline: API calls, caching, error
            handling, and fallback mechanisms.
          </p>

          {/* Test Controls */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={refetch}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Loading...' : 'Reload Locations'}
            </button>

            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Full Page Reload
            </button>
          </div>
        </div>

        {/* Main Content */}
        <ApiLoadingState
          isLoading={isLoading}
          error={error?.message || null}
          retry={refetch}
          loadingComponent={<LocationListSkeleton count={8} />}
        >
          {locations && (
            <div className="space-y-6">
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {locations.length}
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">Total Locations</div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {locations.reduce((sum, loc) => sum + loc.roles.length, 0)}
                  </div>
                  <div className="text-sm text-green-800 dark:text-green-200">Total Roles</div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {locations.filter((loc) => loc.isSelected).length}
                  </div>
                  <div className="text-sm text-purple-800 dark:text-purple-200">
                    Selected Locations
                  </div>
                </div>
              </div>

              {/* Location List */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Loaded Locations
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    All locations loaded from the API with their roles and metadata
                  </p>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {locations.map((location, index) => (
                    <div
                      key={location.id}
                      className={`px-6 py-4 ${
                        index !== locations.length - 1
                          ? 'border-b border-gray-200 dark:border-gray-700'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {location.names.en}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {location.roles.length} roles • ID: {location.id}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              location.isSelected
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}
                          >
                            {location.isSelected ? 'Selected' : 'Available'}
                          </span>
                        </div>
                      </div>

                      {/* Role List */}
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {location.roles.slice(0, 5).map((role) => (
                            <span
                              key={role.id}
                              className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                            >
                              {role.names.en}
                            </span>
                          ))}
                          {location.roles.length > 5 && (
                            <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                              +{location.roles.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ApiLoadingState>

        {/* Debug Information */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">Debug Information</h3>
          <div className="space-y-1 text-gray-600 dark:text-gray-400">
            <div>Loading State: {isLoading ? 'Loading' : 'Idle'}</div>
            <div>Error State: {error ? error.message : 'None'}</div>
            <div>Locations Loaded: {locations?.length || 0}</div>
            <div>Cache Status: Check browser localStorage for cached data</div>
          </div>
        </div>
      </div>
    </LocationErrorBoundary>
  );
}
