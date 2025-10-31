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
}

export const LocationItem = React.memo(function LocationItem({
  location,
  onToggleLocation,
  onToggleRole,
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

  return (
    <div
      className={`border rounded-md transition-all duration-200 ${
        location.isSelected
          ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
          : 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
      }`}
      role="listitem"
    >
      {/* Location header */}
      <div className="flex items-center gap-3 p-4">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={location.isSelected}
          onChange={handleToggle}
          className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2 cursor-pointer"
          aria-label={`Toggle ${locationName}`}
        />

        {/* Location name and info */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {locationName}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedRoleCount} of {totalRoleCount} roles selected
          </div>
        </div>

        {/* Expand button */}
        {totalRoleCount > 0 && (
          <button
            onClick={handleExpand}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            aria-label={
              isExpanded ? `Collapse ${locationName} roles` : `Expand ${locationName} roles`
            }
            aria-expanded={isExpanded}
            aria-controls={`roles-${location.id}`}
          >
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
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
        )}
      </div>

      {/* Expanded role selector */}
      {isExpanded && totalRoleCount > 0 && (
        <div
          id={`roles-${location.id}`}
          className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900/50"
          role="region"
          aria-label={`Roles for ${locationName}`}
        >
          <RoleSelector location={location} onToggleRole={onToggleRole} />
        </div>
      )}
    </div>
  );
});
