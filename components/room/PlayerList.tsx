'use client';

import type { Player } from '@/lib/types';

interface PlayerListProps {
  players: Player[];
  hostId: string;
  currentPlayerId?: string;
}

export function PlayerList({ players, hostId, currentPlayerId }: PlayerListProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">ผู้เล่น ({players.length}/8)</h3>
      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className={`
              flex items-center justify-between p-3 rounded-lg
              ${player.id === currentPlayerId ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}
            `}
          >
            <div className="flex items-center space-x-2">
              <div
                className={`
                  w-2 h-2 rounded-full
                  ${player.connectionStatus === 'connected' ? 'bg-green-500' : 'bg-gray-300'}
                `}
                title={player.connectionStatus === 'connected' ? 'ออนไลน์' : 'ออฟไลน์'}
              />
              <span className="font-medium text-gray-900">
                {player.name}
                {player.id === currentPlayerId && (
                  <span className="ml-1 text-xs text-blue-600">(คุณ)</span>
                )}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {player.id === hostId && (
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                  เจ้าห้อง
                </span>
              )}
              {player.score > 0 && (
                <span className="text-sm text-gray-600">{player.score} คะแนน</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {players.length < 3 && (
        <p className="text-sm text-gray-500 italic">ต้องมีผู้เล่นอย่างน้อย 3 คนเพื่อเริ่มเกม</p>
      )}
    </div>
  );
}
