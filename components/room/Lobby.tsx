'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PlayerList } from './PlayerList';
import type { Player, Difficulty } from '@/lib/types';

interface LobbyProps {
  roomCode: string;
  players: Player[];
  hostId: string;
  currentPlayerId: string;
  onStartGame: (difficulty: Difficulty[], timerDuration: number) => void;
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
  const isHost = currentPlayerId === hostId;

  // Calculate minimum players needed for current spy count (3:1 ratio)
  const minPlayersForSpyCount = spyCount * 3 + spyCount;
  const canStart =
    players.length >= Math.max(4, minPlayersForSpyCount) && players.length <= maxPlayers;

  // Game settings state (host only)
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([
    'easy',
    'medium',
    'hard',
  ]);
  const [timerDuration, setTimerDuration] = useState<number>(8);
  const [localMaxPlayers, setLocalMaxPlayers] = useState<number>(maxPlayers);
  const [localSpyCount, setLocalSpyCount] = useState<number>(spyCount);

  // Update local state when props change
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
    if (playerCount < 4) return 0;
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
    console.log('[Lobby] Starting game with:', {
      selectedDifficulties,
      timerDuration,
      canStart,
      isStarting,
    });
    onStartGame(selectedDifficulties, timerDuration);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">ห้อง</h2>
          <div className="flex items-center justify-center space-x-2">
            <code className="px-4 py-2 text-3xl font-mono font-bold bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg">
              {roomCode}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(roomCode)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              title="คัดลอกรหัส"
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
          <p className="text-sm text-gray-600 dark:text-gray-400">แชร์รหัสนี้กับเพื่อนเพื่อเข้าร่วมห้อง</p>

          {/* Player count display */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {players.length}/{maxPlayers} ผู้เล่น
            </p>
            {players.length >= maxPlayers && (
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">🚫 ห้องเต็ม</p>
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">ตั้งค่าเกม</h3>

            {/* Capacity Slider - HOST ONLY */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                จำนวนผู้เล่นสูงสุด: {localMaxPlayers} คน
              </label>
              <input
                type="range"
                min={Math.max(4, players.length)}
                max={20}
                value={localMaxPlayers}
                onChange={(e) => handleMaxPlayersChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-400"
                disabled={!onUpdateConfig}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>4 คน</span>
                <span>20 คน</span>
              </div>
              {localMaxPlayers < maxPlayers && (
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  ไม่สามารถลดต่ำกว่าจำนวนผู้เล่นปัจจุบัน ({players.length} คน)
                </p>
              )}
            </div>

            {/* Spy Count Button Group - HOST ONLY */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                จำนวนสปาย: {localSpyCount} คน
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
                          ? `ต้องมีผู้เล่นอย่างน้อย ${minPlayersNeeded} คนสำหรับ ${count} สปาย`
                          : `เลือก ${count} สปาย`
                      }
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-xs mt-1">{count === 1 ? 'สปาย' : `สปาย`}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>ต้องมี 3 ผู้เล่นปกติต่อ 1 สปาย (อย่างน้อย {localSpyCount * 4} คน)</p>
                {maxSpyCountForCurrentPlayers < 3 && (
                  <p className="text-orange-600 dark:text-orange-400 mt-1">
                    ⚠️ ต้องมีผู้เล่น {(maxSpyCountForCurrentPlayers + 1) * 4} คนขึ้นไปสำหรับ{' '}
                    {maxSpyCountForCurrentPlayers + 1} สปาย
                  </p>
                )}
              </div>
            </div>

            {/* Timer Duration Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ระยะเวลาต่อรอบ</label>
              <select
                value={timerDuration}
                onChange={(e) => setTimerDuration(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                <option value={5}>5 นาที</option>
                <option value={6}>6 นาที</option>
                <option value={7}>7 นาที</option>
                <option value={8}>8 นาที</option>
                <option value={9}>9 นาที</option>
                <option value={10}>10 นาที</option>
                <option value={12}>12 นาที</option>
                <option value={15}>15 นาที</option>
              </select>
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ระดับความยาก</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDifficulties.includes('easy')}
                    onChange={() => handleDifficultyToggle('easy')}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">ง่าย (Easy)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDifficulties.includes('medium')}
                    onChange={() => handleDifficultyToggle('medium')}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">ปานกลาง (Medium)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDifficulties.includes('hard')}
                    onChange={() => handleDifficultyToggle('hard')}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">ยาก (Hard)</span>
                </label>
              </div>
              {selectedDifficulties.length === 0 && (
                <p className="text-xs text-red-600 dark:text-red-400">กรุณาเลือกอย่างน้อย 1 ระดับ</p>
              )}
            </div>

            <Button
              onClick={handleStartGame}
              disabled={!canStart || isStarting || selectedDifficulties.length === 0}
              className="w-full"
            >
              {isStarting
                ? 'กำลังเริ่มเกม...'
                : !canStart
                  ? players.length < minPlayersForSpyCount
                    ? `ต้องมีผู้เล่นอย่างน้อย ${minPlayersForSpyCount} คนสำหรับ ${localSpyCount} สปาย (ตอนนี้ ${players.length} คน)`
                    : `ต้องมีผู้เล่น 4-${maxPlayers} คน (ตอนนี้ ${players.length} คน)`
                  : 'เริ่มเกม'}
            </Button>
          </div>
        </Card>
      )}

      {!isHost && (
        <Card>
          <p className="text-center text-gray-600 dark:text-gray-400">รอเจ้าห้องเริ่มเกม...</p>
        </Card>
      )}
    </div>
  );
}
