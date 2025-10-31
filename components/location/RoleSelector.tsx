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

  return (
    <div className="space-y-3">
      {/* Role count header */}
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Roles ({selectedCount} of {totalCount} selected)
      </div>

      {/* Role list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {location.roles.map((role) => {
          const roleName = role.names[locale] || role.names.en;

          return (
            <label
              key={role.id}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={role.isSelected}
                onChange={() => onToggleRole(location.id, role.id)}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2 cursor-pointer"
                aria-label={`Toggle ${roleName}`}
              />
              <span className="text-sm text-gray-900 dark:text-gray-100 truncate">{roleName}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
});
