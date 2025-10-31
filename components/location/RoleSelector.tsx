'use client';

/**
 * RoleSelector Component
 *
 * Displays and manages role selection within a location.
 * Shows checkboxes for each role with bulk actions.
 */

import React from 'react';
import { useLocale } from 'next-intl';
import type { Location, LocaleCode } from '@/lib/types';

interface RoleSelectorProps {
  location: Location;
  onToggleRole: (locationId: string, roleId: string) => void;
}

export const RoleSelector = React.memo(function RoleSelector({
  location,
  onToggleRole,
}: RoleSelectorProps) {
  const locale = useLocale() as LocaleCode;

  const selectedCount = location.roles.filter((role) => role.isSelected).length;
  const totalCount = location.roles.length;

  // Enhanced keyboard support for role checkboxes
  const handleRoleKeyDown = (event: React.KeyboardEvent, roleId: string) => {
    if (event.key === ' ') {
      event.preventDefault();
      onToggleRole(location.id, roleId);
    }
  };

  return (
    <div className="space-y-3">
      {/* Role count header with live region */}
      <div
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        id={`role-count-${location.id}`}
      >
        Roles ({selectedCount} of {totalCount} selected)
      </div>

      {/* Role list */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
        role="group"
        aria-label={`Role selection for ${location.names[locale] || location.names.en}`}
        aria-describedby={`role-count-${location.id} role-instructions-${location.id}`}
      >
        {location.roles.map((role) => {
          const roleName = role.names[locale] || role.names.en;

          return (
            <label
              key={role.id}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-blue-500"
              title={`${role.isSelected ? 'Deselect' : 'Select'} ${roleName}`}
            >
              <input
                type="checkbox"
                checked={role.isSelected}
                onChange={() => onToggleRole(location.id, role.id)}
                onKeyDown={(e) => handleRoleKeyDown(e, role.id)}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2 cursor-pointer"
                aria-label={`${role.isSelected ? 'Deselect' : 'Select'} role: ${roleName}`}
                aria-describedby={`role-status-${role.id}`}
              />
              <span
                className="text-sm text-gray-900 dark:text-gray-100 truncate"
                id={`role-status-${role.id}`}
              >
                {roleName}
                {role.isSelected && <span className="sr-only"> (selected)</span>}
              </span>
            </label>
          );
        })}
      </div>

      {/* Hidden instructions for screen readers */}
      <div id={`role-instructions-${location.id}`} className="sr-only">
        Use checkboxes to select individual roles. Press Space to toggle selection.
      </div>
    </div>
  );
});
