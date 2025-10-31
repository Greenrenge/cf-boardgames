/**
 * Location Merge Utility
 *
 * Implements intelligent merging of API location data with localStorage selections.
 *
 * Merge Strategy:
 * 1. Matching IDs (API + localStorage): Use API data, apply localStorage selection state
 * 2. New Locations (API only): Add with isSelected: true (default)
 * 3. Custom Locations (localStorage only): Preserve from localStorage
 * 4. Role Selections: Apply localStorage role selections to matching roles
 */

import type { Location } from './types';
import { getLocationSelections } from './locationStorage';

/**
 * Merge API locations with localStorage selections
 *
 * @param apiLocations - Fresh location data from API
 * @returns Merged locations with selection states applied
 */
export function mergeLocations(apiLocations: Location[]): Location[] {
  const config = getLocationSelections();

  // If no localStorage data, return API locations with default selected state
  if (!config || Object.keys(config.selections).length === 0) {
    return apiLocations.map((loc) => ({
      ...loc,
      isSelected: true, // Default to selected
      roles: loc.roles.map((role) => ({
        ...role,
        isSelected: true, // Default to selected
      })),
    }));
  }

  const selections = config.selections;
  const apiLocationIds = new Set(apiLocations.map((loc) => loc.id));
  const mergedMap = new Map<string, Location>();

  // Process API locations (Scenarios 1 & 2)
  for (const apiLocation of apiLocations) {
    const selection = selections[apiLocation.id];

    if (selection) {
      // Scenario 1: Matching ID - apply localStorage selection
      mergedMap.set(apiLocation.id, {
        ...apiLocation,
        isSelected: selection.isSelected,
        roles: applyRoleSelections(apiLocation.roles, selection.selectedRoles),
      });
    } else {
      // Scenario 2: New location - default to selected
      mergedMap.set(apiLocation.id, {
        ...apiLocation,
        isSelected: true,
        roles: apiLocation.roles.map((role) => ({
          ...role,
          isSelected: true,
        })),
      });
    }
  }

  // Process custom/removed locations from localStorage (Scenario 3)
  for (const [locationId, selection] of Object.entries(selections)) {
    if (!apiLocationIds.has(locationId)) {
      // This location is in localStorage but not in API
      // Create a minimal location entry to preserve user's selection
      const customLocation: Location = {
        id: locationId,
        names: {
          en: locationId, // Fallback name
          th: locationId,
          zh: locationId,
          hi: locationId,
          es: locationId,
          fr: locationId,
          ar: locationId,
        },
        roles: [],
        isSelected: selection.isSelected,
        imageUrl: undefined,
      };

      mergedMap.set(locationId, customLocation);
    }
  }

  // Convert map to array and ensure no duplicates
  const merged = Array.from(mergedMap.values());

  // Validate: ensure no duplicate IDs
  const idCounts = new Map<string, number>();
  for (const location of merged) {
    idCounts.set(location.id, (idCounts.get(location.id) || 0) + 1);
  }

  const duplicates = Array.from(idCounts.entries()).filter(([, count]) => count > 1);
  if (duplicates.length > 0) {
    console.error('[Location Merge] Duplicate location IDs found:', duplicates);
  }

  return merged;
}

/**
 * Apply role selections from localStorage to API roles
 *
 * @param apiRoles - Roles from API
 * @param selectedRoleIds - Role IDs selected in localStorage (undefined = all selected)
 * @returns Roles with selection state applied
 */
function applyRoleSelections(
  apiRoles: Location['roles'],
  selectedRoleIds?: string[]
): Location['roles'] {
  // If selectedRoleIds is undefined or empty, all roles are selected
  if (!selectedRoleIds || selectedRoleIds.length === 0) {
    return apiRoles.map((role) => ({
      ...role,
      isSelected: true,
    }));
  }

  // Otherwise, only roles in selectedRoleIds are selected
  const selectedSet = new Set(selectedRoleIds);
  return apiRoles.map((role) => ({
    ...role,
    isSelected: selectedSet.has(role.id),
  }));
}

/**
 * Get merge statistics for debugging/display
 *
 * @param apiLocations - Locations from API
 * @returns Statistics about the merge operation
 */
export function getMergeStats(apiLocations: Location[]): {
  apiOnlyCount: number;
  localStorageOnlyCount: number;
  bothCount: number;
  totalCount: number;
} {
  const config = getLocationSelections();

  if (!config || Object.keys(config.selections).length === 0) {
    return {
      apiOnlyCount: apiLocations.length,
      localStorageOnlyCount: 0,
      bothCount: 0,
      totalCount: apiLocations.length,
    };
  }

  const selections = config.selections;
  const apiLocationIds = new Set(apiLocations.map((loc) => loc.id));
  const localStorageIds = new Set(Object.keys(selections));

  let apiOnlyCount = 0;
  let localStorageOnlyCount = 0;
  let bothCount = 0;

  apiLocationIds.forEach((id) => {
    if (localStorageIds.has(id)) {
      bothCount++;
    } else {
      apiOnlyCount++;
    }
  });

  localStorageIds.forEach((id) => {
    if (!apiLocationIds.has(id)) {
      localStorageOnlyCount++;
    }
  });

  return {
    apiOnlyCount,
    localStorageOnlyCount,
    bothCount,
    totalCount: apiOnlyCount + localStorageOnlyCount + bothCount,
  };
}
