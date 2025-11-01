'use client';

/**
 * LocationList Component
 *
 * Main container for location customization UI.
 * Displays all locations with selection controls and bulk actions.
 *
 * Features:
 * - Full keyboard navigation with arrow keys
 * - Comprehensive ARIA labels and roles
 * - Error boundary protection
 * - Performance optimized rendering
 * - Screen reader friendly
 */

import React, { useRef, useCallback } from 'react';
import { LocationItem } from './LocationItem';
import { LocationErrorBoundary } from './LocationErrorBoundary';
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
  const {
    stats,
    toggleLocation,
    toggleRole,
    selectAll,
    deselectAll,
    resetToDefault,
    locationsWithState,
  } = useLocationSelection(locations, onSelectionChange);

  const listRef = useRef<HTMLDivElement>(null);
  const selectedCount = stats.selectedLocations;
  const totalCount = stats.totalLocations;
  const hasSelections = selectedCount > 0;

  // Keyboard navigation handler
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!listRef.current) return;

    const focusableElements = listRef.current.querySelectorAll(
      'input[type="checkbox"], button'
    ) as NodeListOf<HTMLElement>;

    const currentIndex = Array.from(focusableElements).indexOf(
      document.activeElement as HTMLElement
    );

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = Math.min(currentIndex + 1, focusableElements.length - 1);
        focusableElements[nextIndex]?.focus();
        break;

      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        focusableElements[prevIndex]?.focus();
        break;

      case 'Home':
        event.preventDefault();
        focusableElements[0]?.focus();
        break;

      case 'End':
        event.preventDefault();
        focusableElements[focusableElements.length - 1]?.focus();
        break;
    }
  }, []);

  // Error reporting for production monitoring
  const handleError = useCallback((error: Error) => {
    console.error('[LocationList] Component error:', error);
    // In production, this could send to an error reporting service
    if (typeof window !== 'undefined' && 'gtag' in window) {
      // Example: Google Analytics error tracking
      const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
      gtag?.('event', 'exception', {
        description: `LocationList: ${error.message}`,
        fatal: false,
      });
    }
  }, []);

  return (
    <LocationErrorBoundary onError={handleError}>
      <div
        className={`space-y-4 ${className}`}
        ref={listRef}
        onKeyDown={handleKeyDown}
        role="application"
        aria-label="Location selection interface"
      >
        {/* Header with count and bulk actions */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Selection count with live region for screen readers */}
          <div
            className={`text-lg font-semibold ${
              hasSelections ? 'text-gray-900 dark:text-gray-100' : 'text-red-600 dark:text-red-400'
            }`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
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
              aria-describedby={selectedCount === totalCount ? 'all-selected-hint' : undefined}
            >
              Select All
            </button>
            <button
              onClick={deselectAll}
              className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              disabled={selectedCount === 0}
              aria-label={`Deselect all ${selectedCount} selected locations`}
              aria-describedby={selectedCount === 0 ? 'none-selected-hint' : undefined}
            >
              Deselect All
            </button>
            <button
              onClick={resetToDefault}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Reset all locations to default selection"
              aria-describedby="reset-hint"
            >
              Reset to Default
            </button>
          </div>
        </div>

        {/* Hidden hints for screen readers */}
        <div className="sr-only">
          <div id="all-selected-hint">All locations are already selected</div>
          <div id="none-selected-hint">No locations are currently selected</div>
          <div id="reset-hint">Restores the default location selection</div>
          <div id="keyboard-hint">
            Use arrow keys to navigate, Space to toggle selections, Home/End to jump to first/last
            item
          </div>
        </div>

        {/* Validation warning */}
        {!hasSelections && (
          <div
            className="bg-red-50 dark:bg-red-900/20 border border-red-500 rounded-md p-4 flex items-start gap-3"
            role="alert"
            aria-describedby="no-selection-details"
          >
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
              <div
                id="no-selection-details"
                className="text-sm text-red-700 dark:text-red-300 mt-1"
              >
                You must select at least 1 location to start the game
              </div>
            </div>
          </div>
        )}

        {/* Location list */}
        <div
          className="space-y-2"
          role="list"
          aria-label="Available locations"
          aria-describedby="keyboard-hint"
        >
          {locationsWithState.map((location, index) => (
            <LocationItem
              key={location.id}
              location={location}
              onToggleLocation={toggleLocation}
              onToggleRole={toggleRole}
              aria-setsize={locationsWithState.length}
              aria-posinset={index + 1}
            />
          ))}
        </div>
      </div>
    </LocationErrorBoundary>
  );
});
