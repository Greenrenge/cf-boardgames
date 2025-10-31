'use client';

/**
 * Demo Page for User Story 3: Host Location Selection Persistence
 *
 * This component demonstrates:
 * - Automatic persistence of host selections
 * - Automatic restoration when creating new room
 * - Visual indicator showing saved selections
 * - Timestamp display
 */

import { useState, useEffect } from 'react';
import { useLocations } from '@/lib/hooks/useLocations';
import { useLocationSelection } from '@/lib/hooks/useLocationSelection';
import { LocationList } from '@/components/location/LocationList';
import { getLocationSelections, clearLocationSelections } from '@/lib/locationStorage';
import type { LocalStorageConfig } from '@/lib/types';

export default function HostPersistenceDemo() {
  const { locations, refetch } = useLocations();
  const { stats } = useLocationSelection(locations);
  const [savedConfig, setSavedConfig] = useState<LocalStorageConfig | null>(null);
  const [showSimulation, setShowSimulation] = useState(false);

  useEffect(() => {
    loadSavedConfig();
  }, []);

  const loadSavedConfig = () => {
    const config = getLocationSelections();
    setSavedConfig(config);
  };

  const simulateStartGame = () => {
    // Selections are already saved automatically through useLocationSelection
    loadSavedConfig();
    alert('Game started! Your selections have been saved.');
  };

  const simulateNewRoom = () => {
    // Selections are automatically loaded through merge logic
    refetch();
    alert('New room created! Your saved selections have been restored.');
  };

  const handleClearSelections = () => {
    clearLocationSelections();
    loadSavedConfig();
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">User Story 3: Host Persistence Demo</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Testing automatic save and restore of host&apos;s location selections
          </p>
        </div>

        {/* Simulation Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Game Flow Simulation</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => setShowSimulation(!showSimulation)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {showSimulation ? 'Hide' : 'Show'} Location Settings
              </button>
              <button
                onClick={simulateStartGame}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Simulate &quot;Start Game&quot;
              </button>
              <button
                onClick={simulateNewRoom}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Simulate &quot;Create New Room&quot;
              </button>
              <button
                onClick={handleClearSelections}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Clear Saved Selections
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              💡 Customize your selections above, then click &quot;Start Game&quot; to save them.
              Click &quot;Create New Room&quot; to see them restored.
            </p>
          </div>
        </div>

        {/* Saved Selections Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Saved Selections Info</h2>
          {savedConfig ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Version:
                  </span>
                  <p className="text-lg">{savedConfig.version}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Saved On:
                  </span>
                  <p className="text-lg">{new Date(savedConfig.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Locations with Custom Settings:
                  </span>
                  <p className="text-lg">{Object.keys(savedConfig.selections).length}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current Selected:
                  </span>
                  <p className="text-lg text-green-600 dark:text-green-400">
                    {stats.selectedLocations} of {stats.totalLocations}
                  </p>
                </div>
              </div>

              {/* Visual Indicator Preview */}
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Indicator shown in Lobby:
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 bg-white dark:bg-blue-900/10 p-2 rounded-md flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Using your saved selections from{' '}
                    {new Date(savedConfig.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <details className="mt-4">
                <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">
                  View Raw localStorage Data
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-900 rounded-md overflow-auto text-xs">
                  {JSON.stringify(savedConfig, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">
              No saved selections found. Customize locations and start a game to save them.
            </div>
          )}
        </div>

        {/* Location Customization */}
        {showSimulation && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Customize Locations</h2>
            <LocationList locations={locations} onSelectionChange={loadSavedConfig} />
          </div>
        )}

        {/* Testing Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Testing Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click &quot;Show Location Settings&quot;</li>
            <li>Customize some location selections (deselect 3-5 locations)</li>
            <li>Click &quot;Simulate Start Game&quot; - selections are saved</li>
            <li>Refresh the browser page</li>
            <li>Click &quot;Simulate Create New Room&quot; - selections restored</li>
            <li>Check &quot;Saved Selections Info&quot; to see timestamp and count</li>
            <li>Open DevTools → Application → localStorage to verify</li>
            <li>Click &quot;Clear Saved Selections&quot; to reset</li>
            <li>
              Test in real Lobby: Create a room, customize, start game, leave, create new room
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
