'use client';

import { useState } from 'react';
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
}

export function Lobby({
  roomCode,
  players,
  hostId,
  currentPlayerId,
  onStartGame,
  onKickPlayer,
  isStarting,
}: LobbyProps) {
  const isHost = currentPlayerId === hostId;
  const canStart = players.length >= 3 && players.length <= 8;

  // Game settings state (host only)
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([
    'easy',
    'medium',
    'hard',
  ]);
  const [timerDuration, setTimerDuration] = useState<number>(8);

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
          <h2 className="text-2xl font-bold text-gray-900">ห้อง</h2>
          <div className="flex items-center justify-center space-x-2">
            <code className="px-4 py-2 text-3xl font-mono font-bold bg-gray-100 rounded-lg">
              {roomCode}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(roomCode)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
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
          <p className="text-sm text-gray-600">แชร์รหัสนี้กับเพื่อนเพื่อเข้าร่วมห้อง</p>
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
            <h3 className="text-lg font-medium text-gray-900">ตั้งค่าเกม</h3>

            {/* Timer Duration Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">ระยะเวลาต่อรอบ</label>
              <select
                value={timerDuration}
                onChange={(e) => setTimerDuration(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700">ระดับความยาก</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDifficulties.includes('easy')}
                    onChange={() => handleDifficultyToggle('easy')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">ง่าย (Easy)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDifficulties.includes('medium')}
                    onChange={() => handleDifficultyToggle('medium')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">ปานกลาง (Medium)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDifficulties.includes('hard')}
                    onChange={() => handleDifficultyToggle('hard')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">ยาก (Hard)</span>
                </label>
              </div>
              {selectedDifficulties.length === 0 && (
                <p className="text-xs text-red-600">กรุณาเลือกอย่างน้อย 1 ระดับ</p>
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
                  ? `ต้องมีผู้เล่น 3-8 คน (ตอนนี้ ${players.length} คน)`
                  : 'เริ่มเกม'}
            </Button>
          </div>
        </Card>
      )}

      {!isHost && (
        <Card>
          <p className="text-center text-gray-600">รอเจ้าห้องเริ่มเกม...</p>
        </Card>
      )}
    </div>
  );
}
