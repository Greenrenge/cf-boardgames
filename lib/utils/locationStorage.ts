/**
 * Location Storage Utilities
 * 
 * Manages localStorage persistence for location customization settings.
 * Handles host preferences and user selections with proper serialization.
 */

import type { Location, LocaleCode } from '@/lib/types';

const STORAGE_KEY = 'cf-boardgames-location-preferences';
const STORAGE_VERSION = '1.0';

interface StoredLocationData {
  version: string;
  timestamp: number;
  hostPreferences: {
    selectedLocationIds: string[];
    selectedRoleIds: Record<string, string[]>;
  };
  playerPreferences?: {
    lastSelectedLocale: LocaleCode;
  };
}

/**
 * Save location selection to localStorage
 */
export function saveLocationSelection(locations: Location[]): void {
  try {
    const selectedLocationIds = locations
      .filter(loc => loc.isSelected)
      .map(loc => loc.id);
    
    const selectedRoleIds: Record<string, string[]> = {};
    locations.forEach(location => {
      const selectedRoles = location.roles
        .filter(role => role.isSelected)
        .map(role => role.id);
      if (selectedRoles.length > 0) {
        selectedRoleIds[location.id] = selectedRoles;
      }
    });

    const data: StoredLocationData = {
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      hostPreferences: {
        selectedLocationIds,
        selectedRoleIds,
      },
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[LocationStorage] Failed to save preferences:', error);
    }
  }
}

/**
 * Load location selection from localStorage
 */
export function loadLocationSelection(): {
  selectedLocationIds: string[];
  selectedRoleIds: Record<string, string[]>;
} | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data: StoredLocationData = JSON.parse(stored);
    
    // Check version compatibility
    if (data.version !== STORAGE_VERSION) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[LocationStorage] Version mismatch, clearing preferences');
      }
      clearLocationSelection();
      return null;
    }

    // Return preferences
    return data.hostPreferences;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[LocationStorage] Failed to load preferences:', error);
    }
    return null;
  }
}

/**
 * Clear stored location preferences
 */
export function clearLocationSelection(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[LocationStorage] Failed to clear preferences:', error);
    }
  }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Export configuration as JSON file
 */
export function exportConfiguration(locations: Location[]): void {
  try {
    const config = {
      appIdentifier: 'cf-boardgames-spyfall',
      version: STORAGE_VERSION,
      exportDate: new Date().toISOString(),
      locations: locations.map(location => ({
        id: location.id,
        isSelected: location.isSelected,
        roles: location.roles.map(role => ({
          id: role.id,
          isSelected: role.isSelected,
        })),
      })),
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spyfall-locations-${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('[LocationStorage] Failed to export configuration:', error);
    throw new Error('Failed to export configuration');
  }
}