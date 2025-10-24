'use client';

import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PlayerList } from './PlayerList';
import type { Player } from '@/lib/types';

interface LobbyProps {
  roomCode: string;
  players: Player[];
  hostId: string;
  currentPlayerId: string;
  onStartGame: () => void;
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
            <div className="space-y-2">
              <p className="text-sm text-gray-600">• ระยะเวลาต่อรอบ: 8 นาที</p>
              <p className="text-sm text-gray-600">• ระดับความยาก: ทุกระดับ</p>
            </div>
            <Button onClick={onStartGame} disabled={!canStart || isStarting} className="w-full">
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
