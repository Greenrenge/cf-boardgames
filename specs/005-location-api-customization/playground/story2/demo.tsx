'use client';

/**
 * Demo Page for User Story 2: Location and Role Customization
 *
 * This component demonstrates:
 * - Interactive location and role selection UI
 * - Bulk actions (Select All, Deselect All, Reset)
 * - Validation preventing game start with no selections
 * - Real-time selection count updates
 * - localStorage persistence
 */

import { useState } from 'react';
import { useLocations } from '@/lib/hooks/useLocations';
import { useLocationSelection } from '@/lib/hooks/useLocationSelection';
import { LocationList } from '@/components/location/LocationList';
import { LocationSkeleton } from '@/components/location/LocationSkeleton';
import { LocationLoadError } from '@/components/location/LocationLoadError';
import { SelectionValidationError } from '@/components/location/SelectionValidationError';

export default function CustomizationDemo() {
  const { locations, isLoading, error, refetch } = useLocations();
  const { stats } = useLocationSelection(locations);
  const [showValidation, setShowValidation] = useState(false);

  const handleStartGame = () => {
    if (stats.selectedLocations === 0) {
      setShowValidation(true);
      setTimeout(() => setShowValidation(false), 5000);
    } else {
      alert(`Starting game with ${stats.selectedLocations} locations!`);
    }
  };

  const canStartGame = stats.selectedLocations > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">User Story 2: Customization UI Demo</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Testing location and role selection interface with validation
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalLocations}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Locations</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div
              className={`text-2xl font-bold ${
                stats.selectedLocations > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {stats.selectedLocations}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Selected Locations</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.totalRoles}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Roles</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.selectedRoles}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Selected Roles</div>
          </div>
        </div>

        {/* Validation Error */}
        {showValidation && (
          <div className="mb-6 animate-fade-in">
            <SelectionValidationError message="You must select at least 1 location to start the game" />
          </div>
        )}

        {/* Location List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          {isLoading && <LocationSkeleton />}

          {error && !isLoading && <LocationLoadError error={error} onRetry={refetch} />}

          {!isLoading && !error && (
            <LocationList
              locations={locations}
              onSelectionChange={() => {
                // This triggers re-render when selections change
                setShowValidation(false);
              }}
            />
          )}
        </div>

        {/* Start Game Button */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Ready to start?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {canStartGame
                  ? `${stats.selectedLocations} location${stats.selectedLocations === 1 ? '' : 's'} and ${stats.selectedRoles} role${stats.selectedRoles === 1 ? '' : 's'} selected`
                  : 'Please select at least one location'}
              </p>
            </div>
            <button
              onClick={handleStartGame}
              disabled={!canStartGame}
              className={`px-6 py-3 rounded-md font-semibold transition-colors ${
                canStartGame
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              Start Game
            </button>
          </div>
        </div>

        {/* Testing Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Testing Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Try clicking location checkboxes - selection count updates</li>
            <li>Click expand button to view roles for a location</li>
            <li>Toggle individual role checkboxes - role count updates</li>
            <li>Click &quot;Deselect All&quot; - all locations unchecked</li>
            <li>Try to start game - validation error appears</li>
            <li>Click &quot;Select All&quot; - all locations checked</li>
            <li>Click &quot;Reset to Default&quot; - clears localStorage</li>
            <li>Refresh page - selections should persist (from localStorage)</li>
            <li>Open DevTools → Application → localStorage to see data</li>
            <li>Test with 80+ locations for performance</li>
          </ol>
        </div>

        {/* Performance Notes */}
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Performance Requirements:</h3>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Toggle location: &lt;50ms</li>
            <li>Expand location: &lt;100ms</li>
            <li>Bulk select all: &lt;200ms</li>
            <li>Smooth scrolling with 80-120 locations</li>
            <li>React.memo optimization on LocationItem components</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
