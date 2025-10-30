'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocationTranslations } from '@/lib/useLocationTranslations';
import { Location } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface SpyGuessProps {
  onGuess: (locationId: string) => void;
}

export function SpyGuess({ onGuess }: SpyGuessProps) {
  const t = useTranslations('common');
  const { getLocationName } = useLocationTranslations();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the backend URL from environment or use localhost
      // Convert ws:// to http:// for the API endpoint
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8787';
      const backendUrl = wsUrl.replace('ws://', 'http://').replace('wss://', 'https://');
      const response = await fetch(`${backendUrl}/api/locations`);

      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }

      const data = (await response.json()) as { locations?: Location[] };
      console.log('[SpyGuess] Fetched locations:', data.locations?.length || 0);
      setLocations(data.locations || []);
    } catch (err) {
      console.error('[SpyGuess] Error fetching locations:', err);
      setError(t('game.cannotLoadLocations'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGuess = () => {
    if (selectedLocationId) {
      onGuess(selectedLocationId);
    }
  };

  // Filter locations based on search query
  const filteredLocations = locations.filter((location) =>
    getLocationName(location.id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group locations by difficulty
  const locationsByDifficulty = {
    easy: filteredLocations.filter((l) => l.difficulty === 'easy'),
    medium: filteredLocations.filter((l) => l.difficulty === 'medium'),
    hard: filteredLocations.filter((l) => l.difficulty === 'hard'),
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('game.loadingLocations')}</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchLocations}>{t('game.tryAgain')}</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-400 dark:from-red-900 dark:to-red-800">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-red-800 dark:text-red-100 mb-2">
            {t('game.youAreTheSpy')}
          </h2>
          <p className="text-red-700 dark:text-red-200">{t('game.guessLocation')}</p>
          <p className="text-sm text-red-600 dark:text-red-300 mt-2">
            {t('game.guessCorrectReward')}
          </p>
        </div>

        {/* Search Box */}
        <div className="mb-6">
          <input
            type="text"
            placeholder={t('game.searchLocations')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />
          {searchQuery && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              {t('game.locationsFound', { count: filteredLocations.length })}
            </p>
          )}
        </div>

        {/* Location List */}
        <div className="max-h-96 overflow-y-auto space-y-6">
          {/* Easy Locations */}
          {locationsByDifficulty.easy.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-3 sticky top-0 bg-green-50 dark:bg-green-900 py-2 px-3 rounded">
                {t('game.easy')} ({locationsByDifficulty.easy.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {locationsByDifficulty.easy.map((location) => {
                  const locationName = getLocationName(location.id);
                  return (
                    <button
                      key={location.id}
                      onClick={() => setSelectedLocationId(location.id)}
                      className={`p-3 text-left rounded-lg border-2 transition-all ${
                        selectedLocationId === location.id
                          ? 'bg-red-500 text-white border-red-600 shadow-lg scale-105'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-300 hover:border-red-400 hover:shadow-md'
                      }`}
                    >
                      <div className="font-medium">{locationName}</div>
                      <div className="text-xs opacity-75 mt-1">
                        {location.roles.length} {t('game.roles')}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Medium Locations */}
          {locationsByDifficulty.medium.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400 mb-3 sticky top-0 bg-yellow-50 dark:bg-yellow-900 py-2 px-3 rounded">
                {t('game.medium')} ({locationsByDifficulty.medium.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {locationsByDifficulty.medium.map((location) => {
                  const locationName = getLocationName(location.id);
                  return (
                    <button
                      key={location.id}
                      onClick={() => setSelectedLocationId(location.id)}
                      className={`p-3 text-left rounded-lg border-2 transition-all ${
                        selectedLocationId === location.id
                          ? 'bg-red-500 text-white border-red-600 shadow-lg scale-105'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-300 hover:border-red-400 hover:shadow-md'
                      }`}
                    >
                      <div className="font-medium">{locationName}</div>
                      <div className="text-xs opacity-75 mt-1">
                        {location.roles.length} {t('game.roles')}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hard Locations */}
          {locationsByDifficulty.hard.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-3 sticky top-0 bg-red-50 dark:bg-red-900 py-2 px-3 rounded">
                {t('game.hard')} ({locationsByDifficulty.hard.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {locationsByDifficulty.hard.map((location) => {
                  const locationName = getLocationName(location.id);
                  return (
                    <button
                      key={location.id}
                      onClick={() => setSelectedLocationId(location.id)}
                      className={`p-3 text-left rounded-lg border-2 transition-all ${
                        selectedLocationId === location.id
                          ? 'bg-red-500 text-white border-red-600 shadow-lg scale-105'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-300 hover:border-red-400 hover:shadow-md'
                      }`}
                    >
                      <div className="font-medium">{locationName}</div>
                      <div className="text-xs opacity-75 mt-1">
                        {location.roles.length} {t('game.roles')}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredLocations.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {t('game.noLocationsFound')}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-6 pt-6 border-t-2 border-red-300">
          <Button
            onClick={handleGuess}
            disabled={!selectedLocationId}
            className={`w-full py-4 text-lg font-bold ${
              selectedLocationId
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {selectedLocationId ? t('game.confirmGuess') : t('game.selectLocationFirst')}
          </Button>
          {selectedLocationId && (
            <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-2">
              {t('game.youSelected')}{' '}
              <span className="font-bold text-red-700 dark:text-red-400">
                {getLocationName(selectedLocationId)}
              </span>
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
