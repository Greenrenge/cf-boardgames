'use client';

import { useTranslations } from 'next-intl';
import type { Player } from '@/lib/types';

interface PlayerListProps {
  players: Player[];
  hostId: string;
  currentPlayerId?: string;
  onKickPlayer?: (targetPlayerId: string) => void;
}

export function PlayerList({ players, hostId, currentPlayerId, onKickPlayer }: PlayerListProps) {
  const t = useTranslations('common.playerList');
  const isHost = currentPlayerId === hostId;
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('title', { count: players.length, max: 8 })}
      </h3>
      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className={`
              flex items-center justify-between p-3 rounded-lg
              ${
                player.id === currentPlayerId
                  ? 'bg-blue-50 border border-blue-200 dark:bg-blue-900 dark:border-blue-700'
                  : 'bg-gray-50 dark:bg-gray-800'
              }
            `}
          >
            <div className="flex items-center space-x-2">
              <div
                className={`
                  w-2 h-2 rounded-full
                  ${player.connectionStatus === 'connected' ? 'bg-green-500 dark:bg-green-400' : 'bg-gray-300 dark:bg-gray-500'}
                `}
                title={player.connectionStatus === 'connected' ? t('online') : t('offline')}
              />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {player.name}
                {player.id === currentPlayerId && (
                  <span className="ml-1 text-xs text-blue-600 dark:text-blue-300">{t('you')}</span>
                )}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {player.id === hostId && (
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded dark:bg-yellow-900 dark:text-yellow-200">
                  {t('host')}
                </span>
              )}
              {player.score > 0 && (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {t('points', { score: player.score })}
                </span>
              )}
              {isHost && player.id !== currentPlayerId && player.id !== hostId && onKickPlayer && (
                <button
                  onClick={() => onKickPlayer(player.id)}
                  className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 transition-colors"
                  title={t('kick')}
                >
                  {t('kick')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {players.length < 3 && (
        <p className="text-sm text-gray-500 dark:text-gray-300 italic">{t('minPlayersNeeded')}</p>
      )}
    </div>
  );
}
