/**
 * useLocationSelection Hook
 *
 * Manages location and role selection state with localStorage persistence.
 * Provides functions to toggle selections and get selection statistics.
 */

'use client';

import { useState, useCallback } from 'react';
import type { Location } from '../types';
import {
  getLocationSelections,
  toggleLocationSelection as storageToggleLocation,
  toggleRoleSelection as storageToggleRole,
  saveLocationSelections,
  clearLocationSelections,
} from '../locationStorage';

export interface LocationSelectionStats {
  totalLocations: number;
  selectedLocations: number;
  totalRoles: number;
  selectedRoles: number;
}

export interface UseLocationSelectionResult {
  stats: LocationSelectionStats;
  locationsWithState: Location[];
  toggleLocation: (locationId: string) => void;
  toggleRole: (locationId: string, roleId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  resetToDefault: () => void;
  getSelectionState: (locationId: string) => {
    isSelected: boolean;
    selectedRoles: string[];
  };
}

/**
 * Hook to manage location and role selections
 *
 * @param locations - Array of locations (from useLocations hook)
 * @param onSelectionChange - Callback fired when selections change
 */
export function useLocationSelection(
  locations: Location[],
  onSelectionChange?: () => void
): UseLocationSelectionResult {
  const [, forceUpdate] = useState({});

  // Force re-render when selections change
  const triggerUpdate = useCallback(() => {
    forceUpdate({});
    onSelectionChange?.();
  }, [onSelectionChange]);

  // Apply selection state from localStorage to locations
  const locationsWithState = locations.map((location) => {
    const config = getLocationSelections();
    const selection = config?.selections[location.id];

    if (selection) {
      return {
        ...location,
        isSelected: selection.isSelected,
        roles: location.roles.map((role) => ({
          ...role,
          isSelected: selection.selectedRoles?.includes(role.id) ?? true,
        })),
      };
    }

    return location;
  });

  // Calculate statistics
  const stats: LocationSelectionStats = {
    totalLocations: locationsWithState.length,
    selectedLocations: locationsWithState.filter((loc) => loc.isSelected).length,
    totalRoles: locationsWithState.reduce((sum, loc) => sum + loc.roles.length, 0),
    selectedRoles: locationsWithState.reduce(
      (sum, loc) => sum + loc.roles.filter((role) => role.isSelected).length,
      0
    ),
  };

  // Toggle location selection
  const toggleLocation = useCallback(
    (locationId: string) => {
      storageToggleLocation(locationId);
      triggerUpdate();
    },
    [triggerUpdate]
  );

  // Toggle role selection
  const toggleRole = useCallback(
    (locationId: string, roleId: string) => {
      storageToggleRole(locationId, roleId);
      triggerUpdate();
    },
    [triggerUpdate]
  );

  // Select all locations
  const selectAll = useCallback(() => {
    const selections = getLocationSelections();
    const newSelections = selections?.selections ? { ...selections.selections } : {};

    locations.forEach((location) => {
      newSelections[location.id] = {
        locationId: location.id,
        isSelected: true,
        selectedRoles: location.roles.map((role) => role.id),
        timestamp: new Date().toISOString(),
      };
    });

    saveLocationSelections(newSelections);
    triggerUpdate();
  }, [locations, triggerUpdate]);

  // Deselect all locations
  const deselectAll = useCallback(() => {
    const selections = getLocationSelections();
    const newSelections = selections?.selections ? { ...selections.selections } : {};

    locations.forEach((location) => {
      newSelections[location.id] = {
        locationId: location.id,
        isSelected: false,
        selectedRoles: [],
        timestamp: new Date().toISOString(),
      };
    });

    saveLocationSelections(newSelections);
    triggerUpdate();
  }, [locations, triggerUpdate]);

  // Reset to default (clear localStorage)
  const resetToDefault = useCallback(() => {
    clearLocationSelections();
    triggerUpdate();
  }, [triggerUpdate]);

  // Get selection state for a specific location
  const getSelectionState = useCallback((locationId: string) => {
    const config = getLocationSelections();
    const selection = config?.selections[locationId];

    if (selection) {
      return {
        isSelected: selection.isSelected,
        selectedRoles: selection.selectedRoles || [],
      };
    }

    // Default state
    return {
      isSelected: true,
      selectedRoles: [],
    };
  }, []);

  return {
    stats,
    locationsWithState,
    toggleLocation,
    toggleRole,
    selectAll,
    deselectAll,
    resetToDefault,
    getSelectionState,
  };
}
