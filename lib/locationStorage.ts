/**
 * Location Storage Utility
 * 
 * Manages localStorage operations for location and role selections.
 * Provides persistence for user customization across sessions.
 */

import type { LocationSelection, LocalStorageConfig } from './types';

const LOCATION_SELECTIONS_KEY = 'location-selections';
const STORAGE_VERSION = '1.0.0';

/**
 * Get all location selections from localStorage
 */
export function getLocationSelections(): LocalStorageConfig | null {
  if (typeof window === 'undefined') {
    return null; // SSR safety
  }

  try {
    const stored = localStorage.getItem(LOCATION_SELECTIONS_KEY);
    if (!stored) {
      return null;
    }

    const config: LocalStorageConfig = JSON.parse(stored);
    return config;
  } catch (error) {
    console.warn('[Location Storage] Error reading selections:', error);
    return null;
  }
}

/**
 * Save location selections to localStorage
 */
export function saveLocationSelections(
  selections: Record<string, LocationSelection>
): void {
  if (typeof window === 'undefined') {
    return; // SSR safety
  }

  try {
    const config: LocalStorageConfig = {
      version: STORAGE_VERSION,
      timestamp: new Date().toISOString(),
      selections,
    };

    localStorage.setItem(LOCATION_SELECTIONS_KEY, JSON.stringify(config));
  } catch (error) {
    console.warn('[Location Storage] Error saving selections:', error);
    
    // Handle quota exceeded errors
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('[Location Storage] localStorage quota exceeded');
    }
  }
}

/**
 * Get selection state for a specific location
 */
export function getLocationSelection(locationId: string): LocationSelection | null {
  const config = getLocationSelections();
  if (!config) {
    return null;
  }

  return config.selections[locationId] || null;
}

/**
 * Toggle a location's selected state
 */
export function toggleLocationSelection(locationId: string): void {
  const config = getLocationSelections() || {
    version: STORAGE_VERSION,
    timestamp: new Date().toISOString(),
    selections: {},
  };

  const currentSelection = config.selections[locationId];
  
  if (currentSelection) {
    // Toggle existing selection
    config.selections[locationId] = {
      ...currentSelection,
      isSelected: !currentSelection.isSelected,
      timestamp: new Date().toISOString(),
    };
  } else {
    // Create new selection (default to deselected since we're toggling from implicit selected)
    config.selections[locationId] = {
      locationId,
      isSelected: false,
      selectedRoles: [],
      timestamp: new Date().toISOString(),
    };
  }

  saveLocationSelections(config.selections);
}

/**
 * Toggle a role's selected state within a location
 */
export function toggleRoleSelection(locationId: string, roleId: string): void {
  const config = getLocationSelections() || {
    version: STORAGE_VERSION,
    timestamp: new Date().toISOString(),
    selections: {},
  };

  const currentSelection = config.selections[locationId] || {
    locationId,
    isSelected: true,
    selectedRoles: [],
    timestamp: new Date().toISOString(),
  };

  const selectedRoles = currentSelection.selectedRoles || [];
  const roleIndex = selectedRoles.indexOf(roleId);

  if (roleIndex > -1) {
    // Role is selected, deselect it
    selectedRoles.splice(roleIndex, 1);
  } else {
    // Role is not selected, select it
    selectedRoles.push(roleId);
  }

  config.selections[locationId] = {
    ...currentSelection,
    selectedRoles,
    timestamp: new Date().toISOString(),
  };

  saveLocationSelections(config.selections);
}

/**
 * Set selection state for a specific location
 */
export function setLocationSelection(
  locationId: string,
  isSelected: boolean,
  selectedRoles?: string[]
): void {
  const config = getLocationSelections() || {
    version: STORAGE_VERSION,
    timestamp: new Date().toISOString(),
    selections: {},
  };

  config.selections[locationId] = {
    locationId,
    isSelected,
    selectedRoles: selectedRoles || [],
    timestamp: new Date().toISOString(),
  };

  saveLocationSelections(config.selections);
}

/**
 * Clear all location selections
 */
export function clearLocationSelections(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(LOCATION_SELECTIONS_KEY);
  } catch (error) {
    console.warn('[Location Storage] Error clearing selections:', error);
  }
}

/**
 * Get storage metadata
 */
export function getStorageMetadata(): {
  exists: boolean;
  version?: string;
  timestamp?: string;
  count?: number;
} {
  const config = getLocationSelections();
  
  if (!config) {
    return { exists: false };
  }

  return {
    exists: true,
    version: config.version,
    timestamp: config.timestamp,
    count: Object.keys(config.selections).length,
  };
}
