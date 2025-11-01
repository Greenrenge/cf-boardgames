'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PlayerList } from './PlayerList';
import { LocationList } from '../location/LocationList';
import { useLocations } from '@/lib/hooks/useLocations';
import { useLocationSelection } from '@/lib/hooks/useLocationSelection';
import type { Player, Difficulty } from '@/lib/types';

interface LobbyProps {
  roomCode: string;
  players: Player[];
  hostId: string;
  currentPlayerId: string;
  onStartGame: (
    difficulty: Difficulty[],
    timerDuration: number,
    selectedLocationIds?: string[]
  ) => void;
  onKickPlayer: (targetPlayerId: string) => void;
  isStarting: boolean;
  maxPlayers?: number;
  spyCount?: number;
  onUpdateConfig?: (config: { maxPlayers?: number; spyCount?: number }) => void;
}

export function Lobby({
  roomCode,
  players,
  hostId,
  currentPlayerId,
  onStartGame,
  onKickPlayer,
  isStarting,
  maxPlayers = 10,
  spyCount = 1,
  onUpdateConfig,
}: LobbyProps) {
  const t = useTranslations('common');
  const isHost = currentPlayerId === hostId;

  // Load locations and selection state
  const { locations } = useLocations();
  const { stats } = useLocationSelection(locations);

  // Check for saved selections
  const [savedTimestamp, setSavedTimestamp] = useState<string | null>(null);

  useEffect(() => {
    if (isHost && typeof window !== 'undefined') {
      const stored = localStorage.getItem('location-selections');
      if (stored) {
        try {
          const config = JSON.parse(stored);
          if (config.timestamp) {
            setSavedTimestamp(config.timestamp);
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, [isHost]);

  // Calculate minimum players needed for current spy count (3:1 ratio)
  const minPlayersForSpyCount = spyCount * 3 + spyCount;
  const hasLocationSelections = stats.selectedLocations > 0;
  const canStart =
    players.length >= Math.max(3, minPlayersForSpyCount) &&
    players.length <= maxPlayers &&
    hasLocationSelections;

  // Game settings state (host only)
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([
    'easy',
    'medium',
    'hard',
  ]);
  const [timerDuration, setTimerDuration] = useState<number>(8);
  const [localMaxPlayers, setLocalMaxPlayers] = useState<number>(maxPlayers);
  const [localSpyCount, setLocalSpyCount] = useState<number>(spyCount);
  const [showLocationSettings, setShowLocationSettings] = useState<boolean>(false); // Update local state when props change
  useEffect(() => {
    setLocalMaxPlayers(maxPlayers);
  }, [maxPlayers]);

  useEffect(() => {
    setLocalSpyCount(spyCount);
  }, [spyCount]);

  const handleMaxPlayersChange = (newValue: number) => {
    setLocalMaxPlayers(newValue);
    if (onUpdateConfig) {
      onUpdateConfig({ maxPlayers: newValue });
    }
  };

  const handleSpyCountChange = (newValue: number) => {
    setLocalSpyCount(newValue);
    if (onUpdateConfig) {
      onUpdateConfig({ spyCount: newValue });
    }
  };

  // Calculate max spy count based on current player count (3:1 ratio)
  const getMaxSpyCount = (playerCount: number) => {
    if (playerCount < 3) return 0;
    return Math.min(3, Math.floor(playerCount / 4));
  };

  const maxSpyCountForCurrentPlayers = getMaxSpyCount(players.length);

  const handleDifficultyToggle = (difficulty: Difficulty) => {
    setSelectedDifficulties((prev) => {
      if (prev.includes(difficulty)) {
        // Don't allow deselecting all difficulties
        if (prev.length === 1) return prev;
        return prev.filter((d) => d !== difficulty);
      } else {
        return [...prev, difficulty];
      }
    });
  };

  const handleStartGame = () => {
    // Get selected location IDs from locationsWithState
    const selectedLocationIds = locations.filter((loc) => loc.isSelected).map((loc) => loc.id);

    console.log('[Lobby] Starting game with:', {
      selectedDifficulties,
      timerDuration,
      selectedLocationIds,
      canStart,
      isStarting,
    });
    onStartGame(selectedDifficulties, timerDuration, selectedLocationIds);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('lobby.room')}</h2>
          <div className="flex items-center justify-center space-x-2">
            <code className="px-4 py-2 text-3xl font-mono font-bold bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg">
              {roomCode}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(roomCode)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              title={t('lobby.copyCode')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('lobby.shareCode')}</p>

          {/* Player count display */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('lobby.playerCount', { current: players.length, max: maxPlayers })}
            </p>
            {players.length >= maxPlayers && (
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                {t('lobby.roomFull')}
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <PlayerList
          players={players}
          hostId={hostId}
          currentPlayerId={currentPlayerId}
          onKickPlayer={onKickPlayer}
        />
      </Card>

      {isHost && (
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {t('lobby.gameSettings')}
            </h3>

            {/* Capacity Slider - HOST ONLY */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('lobby.maxPlayers', { count: localMaxPlayers })}
              </label>
              <input
                type="range"
                min={Math.max(3, players.length)}
                max={20}
                value={localMaxPlayers}
                onChange={(e) => handleMaxPlayersChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-400"
                disabled={!onUpdateConfig}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{t('lobby.people', { count: 3 })}</span>
                <span>{t('lobby.people', { count: 20 })}</span>
              </div>
              {localMaxPlayers < maxPlayers && (
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  {t('lobby.cannotReduceBelowCurrent', { count: players.length })}
                </p>
              )}
            </div>

            {/* Spy Count Button Group - HOST ONLY */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('lobby.spyCount', { count: localSpyCount })}
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3].map((count) => {
                  const minPlayersNeeded = count * 4; // 3:1 ratio + spy itself
                  const isDisabled = players.length < minPlayersNeeded;
                  const isSelected = localSpyCount === count;

                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => handleSpyCountChange(count)}
                      disabled={isDisabled || !onUpdateConfig}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 font-semibold'
                          : isDisabled
                            ? 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                            : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:border-red-300 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'
                      }`}
                      title={
                        isDisabled
                          ? t('lobby.minPlayersForSpies', { min: minPlayersNeeded, spies: count })
                          : t('lobby.selectSpies', { count })
                      }
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-xs mt-1">{t('lobby.spy')}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>{t('lobby.ratioExplanation', { min: localSpyCount * 4 })}</p>
                {maxSpyCountForCurrentPlayers < 3 && (
                  <p className="text-orange-600 dark:text-orange-400 mt-1">
                    {t('lobby.needMorePlayers', {
                      needed: (maxSpyCountForCurrentPlayers + 1) * 4,
                      spies: maxSpyCountForCurrentPlayers + 1,
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Timer Duration Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('lobby.timerDuration')}
              </label>
              <select
                value={timerDuration}
                onChange={(e) => setTimerDuration(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                <option value={5}>{t('lobby.minutes', { count: 5 })}</option>
                <option value={6}>{t('lobby.minutes', { count: 6 })}</option>
                <option value={7}>{t('lobby.minutes', { count: 7 })}</option>
                <option value={8}>{t('lobby.minutes', { count: 8 })}</option>
                <option value={9}>{t('lobby.minutes', { count: 9 })}</option>
                <option value={10}>{t('lobby.minutes', { count: 10 })}</option>
                <option value={12}>{t('lobby.minutes', { count: 12 })}</option>
                <option value={15}>{t('lobby.minutes', { count: 15 })}</option>
              </select>
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('lobby.difficulty')}
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDifficulties.includes('easy')}
                    onChange={() => handleDifficultyToggle('easy')}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('lobby.easy')}
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDifficulties.includes('medium')}
                    onChange={() => handleDifficultyToggle('medium')}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('lobby.medium')}
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDifficulties.includes('hard')}
                    onChange={() => handleDifficultyToggle('hard')}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('lobby.hard')}
                  </span>
                </label>
              </div>
              {selectedDifficulties.length === 0 && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {t('lobby.selectAtLeastOne')}
                </p>
              )}
            </div>

            {/* Location Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Location Selection
                </label>
                <button
                  onClick={() => setShowLocationSettings(!showLocationSettings)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {showLocationSettings ? 'Hide' : 'Customize'}
                </button>
              </div>

              {/* Saved selections indicator */}
              {savedTimestamp && (
                <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Using your saved selections from {new Date(savedTimestamp).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Location stats summary */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span
                  className={
                    hasLocationSelections
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }
                >
                  {stats.selectedLocations} of {stats.totalLocations} locations
                </span>
                <span>•</span>
                <span>{stats.selectedRoles} roles</span>
              </div>

              {/* Expandable location list */}
              {showLocationSettings && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg max-h-96 overflow-y-auto">
                  <LocationList locations={locations} />
                </div>
              )}

              {!hasLocationSelections && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  You must select at least one location to start
                </p>
              )}
            </div>

            <Button
              onClick={handleStartGame}
              disabled={!canStart || isStarting || selectedDifficulties.length === 0}
              className="w-full"
            >
              {isStarting
                ? t('lobby.starting')
                : !hasLocationSelections
                  ? 'Select at least 1 location'
                  : !canStart
                    ? players.length < minPlayersForSpyCount
                      ? t('lobby.needMinPlayersForSpies', {
                          min: minPlayersForSpyCount,
                          spies: localSpyCount,
                          current: players.length,
                        })
                      : t('lobby.needPlayers', {
                          min: 3,
                          max: maxPlayers,
                          current: players.length,
                        })
                    : t('lobby.startGame')}
            </Button>
          </div>
        </Card>
      )}

      {!isHost && (
        <Card>
          <p className="text-center text-gray-600 dark:text-gray-400">
            {t('lobby.waitingForHost')}
          </p>
        </Card>
      )}
    </div>
  );
}
