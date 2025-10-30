'use client';

/**
 * USER STORY 2 - Location Names Translation Playground Demo
 *
 * Purpose: Demonstrate location translation functionality
 * Features:
 * - Display all locations with their translated names
 * - Show translations in all 7 languages
 * - Test location name loading and display
 */

import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import type { LocaleCode } from '@/lib/i18n/types';

export default function LocationTranslationsDemo() {
  const locale = useLocale() as LocaleCode;
  const [locations, setLocations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLocations() {
      try {
        const locationsModule = await import(`@/locales/${locale}/locations.json`);
        setLocations(locationsModule.default || locationsModule);
      } catch (error) {
        console.error('Failed to load locations:', error);
      } finally {
        setLoading(false);
      }
    }
    loadLocations();
  }, [locale]);

  const locationEntries = Object.entries(locations);
  const sampleLocations = locationEntries.slice(0, 20);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
            🗺️ Location Names Translation
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            User Story 2: All location names displayed in your selected language
          </p>
          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">Current Language:</span>
            <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-lg font-semibold text-blue-800 dark:text-blue-200">
              {locale.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {locationEntries.length}
            </div>
            <div className="text-gray-600 dark:text-gray-300">Total Locations</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">7</div>
            <div className="text-gray-600 dark:text-gray-300">Languages Supported</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {loading ? '...' : '✓'}
            </div>
            <div className="text-gray-600 dark:text-gray-300">Translation Status</div>
          </div>
        </div>

        {/* Location List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
            Sample Locations (First 20)
          </h2>
          {loading ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              Loading locations...
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {sampleLocations.map(([id, name]) => (
                <div
                  key={id}
                  className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 hover:shadow-md transition-shadow"
                >
                  <div className="font-semibold text-gray-800 dark:text-white mb-1">{name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{id}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Locations (Collapsed) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8">
          <details className="cursor-pointer">
            <summary className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              All {locationEntries.length} Locations (Click to expand)
            </summary>
            <div className="mt-6 grid md:grid-cols-3 gap-3">
              {locationEntries.map(([id, name]) => (
                <div key={id} className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg text-sm">
                  <div className="font-medium text-gray-800 dark:text-white">{name}</div>
                </div>
              ))}
            </div>
          </details>
        </div>

        {/* Testing Instructions */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl shadow-xl p-8 border-2 border-amber-200 dark:border-amber-800">
          <h2 className="text-2xl font-semibold mb-6 text-amber-900 dark:text-amber-300">
            🧪 Testing Instructions
          </h2>
          <ol className="space-y-3 text-gray-700 dark:text-gray-300 list-decimal list-inside">
            <li>Switch to different languages using the language switcher in the top-right</li>
            <li>Verify that location names change to match the selected language</li>
            <li>Check that all {locationEntries.length} locations have translations</li>
            <li>
              Test with all 7 languages: Thai, English, Chinese, Hindi, Spanish, French, Arabic
            </li>
            <li>Verify Arabic displays correctly with RTL text direction</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
