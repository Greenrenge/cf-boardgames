'use client';

/**
 * LocationItem Component
 *
 * Individual location card with expand/collapse for roles.
 * Optimized with React.memo for performance with large lists.
 */

import React, { useState } from 'react';
import { useLocale } from 'next-intl';
import { RoleSelector } from './RoleSelector';
import type { Location, LocaleCode } from '@/lib/types';

interface LocationItemProps {
  location: Location;
  onToggleLocation: (locationId: string) => void;
  onToggleRole: (locationId: string, roleId: string) => void;
  'aria-setsize'?: number;
  'aria-posinset'?: number;
}

export const LocationItem = React.memo(function LocationItem({
  location,
  onToggleLocation,
  onToggleRole,
  'aria-setsize': ariaSetSize,
  'aria-posinset': ariaPosInSet,
}: LocationItemProps) {
  const locale = useLocale() as LocaleCode;
  const [isExpanded, setIsExpanded] = useState(false);

  const locationName = location.names[locale] || location.names.en;
  const selectedRoleCount = location.roles.filter((role) => role.isSelected).length;
  const totalRoleCount = location.roles.length;

  const handleToggle = () => {
    onToggleLocation(location.id);
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Enhanced keyboard support for the expand button
  const handleExpandKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleExpand();
    }
  };

  // Enhanced keyboard support for checkbox
  const handleCheckboxKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <div
      className={`border rounded-md transition-all duration-200 ${
        location.isSelected
          ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
          : 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
      }`}
      role="listitem"
      aria-setsize={ariaSetSize}
      aria-posinset={ariaPosInSet}
      aria-labelledby={`location-name-${location.id}`}
      aria-describedby={`location-status-${location.id}`}
    >
      {/* Location header */}
      <div className="flex items-center gap-3 p-4">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={location.isSelected}
          onChange={handleToggle}
          onKeyDown={handleCheckboxKeyDown}
          className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2 cursor-pointer"
          aria-label={`Toggle ${locationName}`}
          aria-describedby={`location-status-${location.id}`}
        />

        {/* Location name and info */}
        <div className="flex-1 min-w-0">
          <div
            id={`location-name-${location.id}`}
            className="font-medium text-gray-900 dark:text-gray-100 truncate"
          >
            {locationName}
          </div>
          <div
            id={`location-status-${location.id}`}
            className="text-sm text-gray-600 dark:text-gray-400"
            aria-live="polite"
          >
            {selectedRoleCount} of {totalRoleCount} roles selected
            {location.isSelected && ' • Location selected'}
          </div>
        </div>

        {/* Expand button */}
        {totalRoleCount > 0 && (
          <button
            onClick={handleExpand}
            onKeyDown={handleExpandKeyDown}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            aria-label={
              isExpanded ? `Collapse ${locationName} roles` : `Expand ${locationName} roles`
            }
            aria-expanded={isExpanded}
            aria-controls={`roles-${location.id}`}
            title={isExpanded ? 'Collapse roles' : 'Expand roles'}
          >
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Expanded role selector */}
      {isExpanded && totalRoleCount > 0 && (
        <div
          id={`roles-${location.id}`}
          className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900/50"
          role="region"
          aria-label={`Roles for ${locationName}`}
          aria-describedby={`role-instructions-${location.id}`}
        >
          <div id={`role-instructions-${location.id}`} className="sr-only">
            Use checkboxes to select or deselect individual roles for this location.
          </div>
          <RoleSelector location={location} onToggleRole={onToggleRole} />
        </div>
      )}
    </div>
  );
});
