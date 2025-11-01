'use client';

/**
 * Test Page: Location Data Merging
 * 
 * This page demonstrates the location merge functionality between
 * static data and API data with intelligent conflict resolution.
 */

import React, { useState } from 'react';
import { useLocations } from '@/lib/hooks/useLocations';
import { LocationErrorBoundary } from '@/components/location/LocationErrorBoundary';

export default function TestMergePage() {
  const { locations, isLoading, error } = useLocations();
  const [showMergeDetails, setShowMergeDetails] = useState(false);

  return (
    <LocationErrorBoundary>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🔀 Location Data Merge Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This page tests the intelligent merging of static location data with API data,
            showing how conflicts are resolved and selections are preserved.
          </p>
          
          <button
            onClick={() => setShowMergeDetails(!showMergeDetails)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {showMergeDetails ? 'Hide' : 'Show'} Merge Details
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading and merging location data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-500 rounded-md p-4 mb-6">
            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
              Merge Error
            </h3>
            <p className="text-red-700 dark:text-red-300">{error.message}</p>
          </div>
        )}

        {locations && (
          <div className="space-y-6">
            {/* Merge Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {locations.length}
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  Total Merged
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {locations.filter(loc => loc.id.startsWith('static_')).length}
                </div>
                <div className="text-sm text-green-800 dark:text-green-200">
                  From Static Data
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {locations.filter(loc => loc.id.startsWith('api_')).length}
                </div>
                <div className="text-sm text-purple-800 dark:text-purple-200">
                  From API Data
                </div>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {locations.filter(loc => !loc.id.startsWith('static_') && !loc.id.startsWith('api_')).length}
                </div>
                <div className="text-sm text-orange-800 dark:text-orange-200">
                  Conflicted/Merged
                </div>
              </div>
            </div>

            {/* Merge Details */}
            {showMergeDetails && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Merge Process Details
                </h2>
                
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-medium">Step 1: Load Static Data</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Load base location data from static JSON files in the project
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-medium">Step 2: Fetch API Data</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Fetch enhanced location data from the Cloudflare Workers API
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-medium">Step 3: Intelligent Merge</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Merge data using ID matching, prefer API data for content, preserve user selections
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-medium">Step 4: Apply User Preferences</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Restore previous selections from localStorage and validate against merged data
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Source Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Merged Location Data
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Showing data source and merge status for each location
                </p>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {locations.map((location, index) => {
                  const isStatic = location.id.startsWith('static_');
                  const isApi = location.id.startsWith('api_');
                  
                  return (
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
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            isStatic 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                              : isApi
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200'
                              : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200'
                          }`}>
                            {isStatic ? 'Static' : isApi ? 'API' : 'Merged'}
                          </span>
                          
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            location.isSelected
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {location.isSelected ? 'Selected' : 'Available'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Test Instructions */}
        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Testing Instructions
          </h3>
          <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <div>1. Check the merge statistics to see data from different sources</div>
            <div>2. Toggle "Show Merge Details" to understand the merge process</div>
            <div>3. Look for locations with different source labels (Static/API/Merged)</div>
            <div>4. Verify that user selections are preserved across page reloads</div>
            <div>5. Test offline behavior by disconnecting network</div>
          </div>
        </div>
      </div>
    </LocationErrorBoundary>
  );
}