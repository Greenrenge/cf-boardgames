'use client';

/**
 * Test Page: Location Customization UI
 * 
 * This page demonstrates the complete location customization interface
 * with all interactive features for hosts to configure their game.
 */

import React from 'react';
import { useLocations } from '@/lib/hooks/useLocations';
import { LocationList } from '@/components/location/LocationList';
import { LocationErrorBoundary } from '@/components/location/LocationErrorBoundary';
import { LocationListSkeleton } from '@/components/location/LoadingStates';

export default function TestCustomizationPage() {
  const { locations, isLoading, error, refetch } = useLocations();

  return (
    <LocationErrorBoundary>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🎮 Location Customization Interface
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This page demonstrates the complete host interface for customizing location 
            and role selections before starting a game.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={refetch}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Loading...' : 'Refresh Data'}
            </button>
            
            <button
              onClick={async () => {
                if (locations) {
                  const { exportConfiguration } = await import('@/lib/utils/locationStorage');
                  exportConfiguration(locations);
                }
              }}
              disabled={!locations}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Export Config
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-500 rounded-md p-4 mb-6">
            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
              Configuration Error
            </h3>
            <p className="text-red-700 dark:text-red-300">{error.message}</p>
            <button
              onClick={refetch}
              className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Customization Interface */}
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              🎯 How to Use This Interface
            </h2>
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <div className="flex items-start gap-2">
                <span className="font-semibold">1.</span>
                <span>Use checkboxes to select/deselect entire locations</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold">2.</span>
                <span>Click the expand arrow to customize individual roles within locations</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold">3.</span>
                <span>Use bulk actions: Select All, Deselect All, or Reset to Default</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold">4.</span>
                <span>Your selections are automatically saved and will persist</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold">5.</span>
                <span>Test keyboard navigation: Tab, Arrow keys, Space, Enter</span>
              </div>
            </div>
          </div>

          {/* Customization Interface */}
          {isLoading ? (
            <LocationListSkeleton count={6} showBulkActions={true} />
          ) : locations ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <LocationList 
                locations={locations}
                onSelectionChange={() => {
                  // This would trigger save in a real implementation
                  console.log('Selection changed - would save to storage');
                }}
                className="space-y-4"
              />
            </div>
          ) : null}
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-2xl mb-3">♿</div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Accessibility
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Full keyboard navigation, screen reader support, and ARIA labels throughout
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Performance
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Optimized rendering, debounced interactions, and efficient state management
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-2xl mb-3">🛡️</div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Error Handling
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Comprehensive error boundaries, graceful fallbacks, and retry mechanisms
            </p>
          </div>
        </div>

        {/* Testing Checklist */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            🧪 Testing Checklist
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="space-y-1">
              <div>□ Location selection/deselection works</div>
              <div>□ Role expansion and selection works</div>
              <div>□ Bulk actions function correctly</div>
              <div>□ Validation prevents zero selections</div>
            </div>
            <div className="space-y-1">
              <div>□ Keyboard navigation works</div>
              <div>□ Screen reader compatibility</div>
              <div>□ Error states display properly</div>
              <div>□ Export functionality works</div>
            </div>
          </div>
        </div>
      </div>
    </LocationErrorBoundary>
  );
}