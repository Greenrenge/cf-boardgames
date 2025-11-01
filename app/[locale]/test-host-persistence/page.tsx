'use client';

/**
 * Test Page: Host Persistence
 *
 * This page demonstrates host-specific configuration persistence
 * and how settings are shared between host and players.
 */

import React, { useState, useEffect } from 'react';
import { useLocations } from '@/lib/hooks/useLocations';
import { LocationErrorBoundary } from '@/components/location/LocationErrorBoundary';
import { loadLocationSelection, saveLocationSelection } from '@/lib/utils/locationStorage';

export default function TestHostPersistencePage() {
  const { locations, isLoading } = useLocations();
  const [persistenceData, setPersistenceData] = useState<{
    selectedLocationIds: string[];
    selectedRoleIds: Record<string, string[]>;
  } | null>(null);
  const [testMode, setTestMode] = useState<'host' | 'player'>('host');

  // Load persistence data on mount
  useEffect(() => {
    const saved = loadLocationSelection();
    setPersistenceData(saved);
  }, []);

  const handleSaveTest = () => {
    if (locations) {
      saveLocationSelection(locations);
      const saved = loadLocationSelection();
      setPersistenceData(saved);
    }
  };

  const simulatePlayerView = () => {
    // In a real implementation, this would show the host's configuration
    setTestMode('player');
  };

  const simulateHostView = () => {
    setTestMode('host');
  };

  return (
    <LocationErrorBoundary>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            💾 Host Persistence Testing
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This page tests host-specific configuration persistence and how customized settings are
            shared with players in the room.
          </p>

          {/* Mode Toggle */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={simulateHostView}
              className={`px-4 py-2 rounded-md transition-colors ${
                testMode === 'host'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              👑 Host View
            </button>

            <button
              onClick={simulatePlayerView}
              className={`px-4 py-2 rounded-md transition-colors ${
                testMode === 'player'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              🎮 Player View
            </button>
          </div>
        </div>

        {/* Current Mode Display */}
        <div
          className={`p-4 rounded-lg mb-6 ${
            testMode === 'host'
              ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
              : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
          }`}
        >
          <h2
            className={`text-lg font-semibold mb-2 ${
              testMode === 'host'
                ? 'text-blue-900 dark:text-blue-100'
                : 'text-green-900 dark:text-green-100'
            }`}
          >
            {testMode === 'host' ? '👑 Host Mode' : '🎮 Player Mode'}
          </h2>
          <p
            className={`text-sm ${
              testMode === 'host'
                ? 'text-blue-800 dark:text-blue-200'
                : 'text-green-800 dark:text-green-200'
            }`}
          >
            {testMode === 'host'
              ? 'You can customize location selections and save preferences'
              : 'You see the location configuration set by the room host'}
          </p>
        </div>

        {/* Persistence Controls */}
        {testMode === 'host' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Host Configuration Controls
            </h2>

            <div className="flex flex-wrap gap-4 mb-4">
              <button
                onClick={handleSaveTest}
                disabled={!locations || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Save Current Configuration
              </button>

              <button
                onClick={() => {
                  localStorage.clear();
                  setPersistenceData(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Clear All Storage
              </button>

              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Test Persistence (Reload)
              </button>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>
                Use these controls to test configuration persistence across page reloads and
                sessions.
              </p>
            </div>
          </div>
        )}

        {/* Persistence Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Persistence Status
          </h2>

          {persistenceData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {persistenceData.selectedLocationIds?.length || 0}
                  </div>
                  <div className="text-sm text-green-800 dark:text-green-200">Saved Locations</div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Object.keys(persistenceData.selectedRoleIds || {}).length}
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    Locations with Custom Roles
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {Object.values(persistenceData.selectedRoleIds || {}).flat().length}
                  </div>
                  <div className="text-sm text-purple-800 dark:text-purple-200">
                    Total Custom Roles
                  </div>
                </div>
              </div>

              {/* Detailed Data */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Stored Configuration
                </h3>
                <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-32">
                  {JSON.stringify(persistenceData, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2">📭</div>
              <p>No persistence data found</p>
              <p className="text-sm">Make some selections and save to test persistence</p>
            </div>
          )}
        </div>

        {/* Room Simulation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Room Configuration Simulation
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Room ID</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">DEMO-ROOM-123</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-gray-100">Host</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">TestHost</div>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Configuration Status
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                {persistenceData
                  ? 'Host has customized location settings - players will use this configuration'
                  : 'No custom configuration - players will use default location set'}
              </div>
            </div>
          </div>
        </div>

        {/* Testing Instructions */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🧪 Persistence Testing Steps
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <div>1. Switch to Host mode and make location/role selections</div>
            <div>2. Click Save Current Configuration to persist settings</div>
            <div>3. Reload the page to verify settings are restored</div>
            <div>4. Switch to Player mode to see the host configuration view</div>
            <div>5. Test across different browser tabs/windows</div>
            <div>6. Clear storage and verify fallback to defaults</div>
          </div>
        </div>
      </div>
    </LocationErrorBoundary>
  );
}
