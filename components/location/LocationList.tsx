'use client';

/**
 * LocationList Component
 *
 * Main container for location customization UI.
 * Displays all locations with selection controls and bulk actions.
 */

import React from 'react';
import { LocationItem } from './LocationItem';
import type { Location } from '@/lib/types';
import { useLocationSelection } from '@/lib/hooks/useLocationSelection';

interface LocationListProps {
  locations: Location[];
  onSelectionChange?: () => void;
  className?: string;
}

export const LocationList = React.memo(function LocationList({
  locations,
  onSelectionChange,
  className = '',
}: LocationListProps) {
  const { stats, toggleLocation, toggleRole, selectAll, deselectAll, resetToDefault } =
    useLocationSelection(locations, onSelectionChange);

  const selectedCount = stats.selectedLocations;
  const totalCount = stats.totalLocations;
  const hasSelections = selectedCount > 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with count and bulk actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Selection count */}
        <div
          className={`text-lg font-semibold ${
            hasSelections ? 'text-gray-900 dark:text-gray-100' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {selectedCount} of {totalCount} locations selected
        </div>

        {/* Bulk action buttons */}
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Bulk location actions">
          <button
            onClick={selectAll}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            disabled={selectedCount === totalCount}
            aria-label={`Select all ${totalCount} locations`}
          >
            Select All
          </button>
          <button
            onClick={deselectAll}
            className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            disabled={selectedCount === 0}
            aria-label={`Deselect all ${selectedCount} selected locations`}
          >
            Deselect All
          </button>
          <button
            onClick={resetToDefault}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Reset all locations to default selection"
          >
            Reset to Default
          </button>
        </div>
      </div>

      {/* Validation warning */}
      {!hasSelections && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-500 rounded-md p-4 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <div className="font-semibold text-red-800 dark:text-red-200">
              No locations selected
            </div>
            <div className="text-sm text-red-700 dark:text-red-300 mt-1">
              You must select at least 1 location to start the game
            </div>
          </div>
        </div>
      )}

      {/* Location list */}
      <div className="space-y-2" role="list" aria-label="Available locations">
        {locations.map((location) => (
          <LocationItem
            key={location.id}
            location={location}
            onToggleLocation={toggleLocation}
            onToggleRole={toggleRole}
          />
        ))}
      </div>
    </div>
  );
});
