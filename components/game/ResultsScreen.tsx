'use client';

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Player } from '@/lib/types';

interface ResultsScreenProps {
  eliminatedPlayerId: string | null;
  spyPlayerId: string;
  spyWasEliminated: boolean;
  location: string;
  scores: Record<string, number>;
  players: Player[];
  voteTally: Record<string, number>;
  spyGuessResult?: {
    wasCorrect: boolean;
    guessedLocationId: string;
    guessedLocationName: string;
    actualLocationName: string;
  };
  onNextRound?: () => void;
  onBackToLobby: () => void;
}

export function ResultsScreen({
  eliminatedPlayerId,
  spyPlayerId,
  spyWasEliminated,
  location,
  scores,
  players,
  voteTally,
  spyGuessResult,
  onNextRound,
  onBackToLobby,
}: ResultsScreenProps) {
  const getPlayerName = (playerId: string) => {
    return players.find((p) => p.id === playerId)?.name || 'Unknown';
  };

  const sortedPlayers = [...players].sort((a, b) => {
    const scoreA = scores[a.id] || 0;
    const scoreB = scores[b.id] || 0;
    return scoreB - scoreA;
  });

  return (
    <div className="space-y-6">
      {/* Main Result */}
      <Card
        className={`text-center ${
          spyWasEliminated
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 dark:from-green-900 dark:to-emerald-900 dark:border-green-700'
            : 'bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-400 dark:from-red-900 dark:to-pink-900 dark:border-red-700'
        }`}
      >
        <div className="space-y-4">
          <div className="text-6xl mb-2">{spyWasEliminated ? '🎉' : '😈'}</div>
          <h2
            className={`text-3xl font-bold ${spyWasEliminated ? 'text-green-700 dark:text-green-200' : 'text-red-700 dark:text-red-200'}`}
          >
            {spyWasEliminated ? 'สปายถูกจับได้!' : 'สปายหนีรอด!'}
          </h2>
          <div className="space-y-2">
            <p className="text-lg text-gray-700 dark:text-gray-200">
              <span className="font-medium dark:text-gray-300">สปาย:</span>{' '}
              <span className="font-bold text-red-600 dark:text-red-300">
                {getPlayerName(spyPlayerId)}
              </span>
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-200">
              <span className="font-medium dark:text-gray-300">สถานที่:</span>{' '}
              <span className="font-bold text-blue-600 dark:text-blue-300">{location}</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Spy Guess Result */}
      {spyGuessResult && (
        <Card
          className={`text-center ${
            spyGuessResult.wasCorrect
              ? 'bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-400 dark:from-red-900 dark:to-pink-900 dark:border-red-700'
              : 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 dark:from-green-900 dark:to-emerald-900 dark:border-green-700'
          }`}
        >
          <div className="space-y-4">
            <div className="text-5xl mb-2">{spyGuessResult.wasCorrect ? '🎯' : '❌'}</div>
            <h3
              className={`text-2xl font-bold ${
                spyGuessResult.wasCorrect
                  ? 'text-red-700 dark:text-red-200'
                  : 'text-green-700 dark:text-green-200'
              }`}
            >
              {spyGuessResult.wasCorrect ? 'สปายเดาถูก!' : 'สปายเดาผิด!'}
            </h3>
            <div className="space-y-3 pt-2">
              <div
                className={`p-3 rounded-lg ${
                  spyGuessResult.wasCorrect
                    ? 'bg-red-100 dark:bg-red-900'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <p className="text-sm text-gray-600 dark:text-gray-200 mb-1">สปายเดาว่าเป็น:</p>
                <p
                  className={`text-lg font-bold ${
                    spyGuessResult.wasCorrect
                      ? 'text-red-800 dark:text-red-200'
                      : 'text-gray-800 dark:text-gray-100'
                  }`}
                >
                  {spyGuessResult.guessedLocationName || spyGuessResult.guessedLocationId}
                </p>
              </div>
              {!spyGuessResult.wasCorrect && (
                <div className="p-3 bg-green-100 rounded-lg dark:bg-green-900">
                  <p className="text-sm text-gray-600 dark:text-gray-200 mb-1">สถานที่จริงคือ:</p>
                  <p className="text-lg font-bold text-green-800 dark:text-green-200">
                    {spyGuessResult.actualLocationName}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Vote Tally */}
      <Card>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">📊 ผลการลงคะแนน</h3>
        <div className="space-y-2">
          {eliminatedPlayerId ? (
            <div className="p-3 bg-red-100 rounded-lg border-2 border-red-300 dark:bg-red-900 dark:border-red-700">
              <p className="text-red-900 dark:text-red-100 font-medium">
                <span className="font-bold dark:text-white">
                  {getPlayerName(eliminatedPlayerId)}
                </span>{' '}
                ถูกโหวตออก ({voteTally[eliminatedPlayerId] || 0} คะแนน)
              </p>
            </div>
          ) : (
            <div className="p-3 bg-gray-100 rounded-lg dark:bg-gray-800">
              <p className="text-gray-700 dark:text-gray-200 font-medium">
                ไม่มีผู้เล่นถูกโหวตออก (คะแนนเสมอกัน)
              </p>
            </div>
          )}

          {Object.entries(voteTally)
            .filter(([playerId]) => playerId !== eliminatedPlayerId)
            .sort((a, b) => b[1] - a[1])
            .map(([playerId, votes]) => (
              <div
                key={playerId}
                className="flex justify-between items-center p-2 bg-gray-50 rounded dark:bg-gray-900"
              >
                <span className="text-gray-800 dark:text-gray-100">{getPlayerName(playerId)}</span>
                <span className="text-gray-600 dark:text-gray-300 font-medium">{votes} คะแนน</span>
              </div>
            ))}
        </div>
      </Card>

      {/* Scores */}
      <Card>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">🏆 คะแนน</h3>
        <div className="space-y-2">
          {sortedPlayers.map((player, index) => {
            const score = scores[player.id] || 0;
            const isSpy = player.id === spyPlayerId;
            return (
              <div
                key={player.id}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  index === 0
                    ? 'bg-yellow-100 border-2 border-yellow-400 dark:bg-yellow-900 dark:border-yellow-700'
                    : 'bg-gray-50 dark:bg-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-600 dark:text-gray-200">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {player.name}
                  </span>
                  {isSpy && (
                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full dark:bg-red-900 dark:text-red-200">
                      สปาย
                    </span>
                  )}
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">+{score}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex space-x-4">
        {onNextRound && (
          <Button
            onClick={onNextRound}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-800 dark:hover:bg-blue-900 dark:text-white"
          >
            รอบถัดไป
          </Button>
        )}
        <Button
          onClick={onBackToLobby}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white dark:bg-gray-800 dark:hover:bg-gray-900 dark:text-white"
        >
          กลับล็อบบี้
        </Button>
      </div>
    </div>
  );
}
