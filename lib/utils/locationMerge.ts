/**
 * Location Data Merge Utilities
 * 
 * Intelligent merging of static location data with API data.
 * Handles conflicts, preserves user selections, and provides fallbacks.
 */

import type { Location, Role } from '@/lib/types';

export interface MergeResult {
  locations: Location[];
  mergeStats: {
    totalLocations: number;
    staticLocations: number;
    apiLocations: number;
    mergedLocations: number;
    conflicts: number;
  };
}

/**
 * Merge static location data with API data
 * Priority: API data > Static data, but preserve user selections
 */
export function mergeLocationData(
  staticLocations: Location[],
  apiLocations: Location[],
  userSelections?: {
    selectedLocationIds: string[];
    selectedRoleIds: Record<string, string[]>;
  }
): MergeResult {
  const merged = new Map<string, Location>();
  const conflicts: string[] = [];

  // First, add all static locations
  staticLocations.forEach(location => {
    merged.set(location.id, {
      ...location,
      id: `static_${location.id}`,
    });
  });

  // Then, add/merge API locations
  apiLocations.forEach(apiLocation => {
    const existingLocation = Array.from(merged.values())
      .find(loc => loc.id.endsWith(apiLocation.id));

    if (existingLocation) {
      // Conflict: merge the data, prefer API content
      conflicts.push(apiLocation.id);
      
      const mergedLocation: Location = {
        ...existingLocation,
        id: apiLocation.id, // Use clean ID
        names: { ...existingLocation.names, ...apiLocation.names },
        roles: mergeRoles(existingLocation.roles, apiLocation.roles),
        isSelected: existingLocation.isSelected, // Preserve selection
      };

      merged.delete(existingLocation.id);
      merged.set(apiLocation.id, mergedLocation);
    } else {
      // New location from API
      merged.set(apiLocation.id, {
        ...apiLocation,
        id: `api_${apiLocation.id}`,
      });
    }
  });

  // Apply user selections if provided
  if (userSelections) {
    merged.forEach(location => {
      const cleanId = location.id.replace(/^(static_|api_)/, '');
      
      // Apply location selection
      if (userSelections.selectedLocationIds.includes(cleanId) || 
          userSelections.selectedLocationIds.includes(location.id)) {
        location.isSelected = true;
      }

      // Apply role selections
      const roleSelections = userSelections.selectedRoleIds[cleanId] || 
                           userSelections.selectedRoleIds[location.id];
      
      if (roleSelections) {
        location.roles.forEach(role => {
          if (roleSelections.includes(role.id)) {
            role.isSelected = true;
          }
        });
      }
    });
  }

  const locations = Array.from(merged.values());
  
  return {
    locations,
    mergeStats: {
      totalLocations: locations.length,
      staticLocations: locations.filter(l => l.id.startsWith('static_')).length,
      apiLocations: locations.filter(l => l.id.startsWith('api_')).length,
      mergedLocations: conflicts.length,
      conflicts: conflicts.length,
    },
  };
}

/**
 * Merge role arrays from different sources
 */
function mergeRoles(staticRoles: Role[], apiRoles: Role[]): Role[] {
  const roleMap = new Map<string, Role>();

  // Add static roles first
  staticRoles.forEach(role => {
    roleMap.set(role.id, role);
  });

  // Merge with API roles (API data takes precedence for content)
  apiRoles.forEach(apiRole => {
    const existingRole = roleMap.get(apiRole.id);
    
    if (existingRole) {
      // Merge role data, preserve selection state
      roleMap.set(apiRole.id, {
        ...apiRole,
        names: { ...existingRole.names, ...apiRole.names },
        isSelected: existingRole.isSelected,
      });
    } else {
      // New role from API
      roleMap.set(apiRole.id, apiRole);
    }
  });

  return Array.from(roleMap.values());
}

/**
 * Validate merged location data
 */
export function validateMergedData(locations: Location[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (locations.length === 0) {
    errors.push('No locations available after merge');
  }

  const hasSelectedLocations = locations.some(loc => loc.isSelected);
  if (!hasSelectedLocations) {
    warnings.push('No locations are selected - game cannot start');
  }

  // Check for duplicate IDs
  const ids = locations.map(loc => loc.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate location IDs found: ${duplicates.join(', ')}`);
  }

  // Check for locations without roles
  const locationsWithoutRoles = locations.filter(loc => loc.roles.length === 0);
  if (locationsWithoutRoles.length > 0) {
    warnings.push(`${locationsWithoutRoles.length} locations have no roles`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Apply default selections to locations
 */
export function applyDefaultSelections(locations: Location[]): Location[] {
  return locations.map(location => ({
    ...location,
    isSelected: true, // Select all locations by default
    roles: location.roles.map(role => ({
      ...role,
      isSelected: true, // Select all roles by default
    })),
  }));
}