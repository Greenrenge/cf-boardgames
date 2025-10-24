'use client';

import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Player } from '@/lib/types';

interface VotingInterfaceProps {
  players: Player[];
  currentPlayerId: string;
  votesCount: number;
  requiredVotes: number;
  onVote: (suspectId: string) => void;
  hasVoted: boolean;
  disabled?: boolean;
}

export function VotingInterface({
  players,
  currentPlayerId,
  votesCount,
  requiredVotes,
  onVote,
  hasVoted,
  disabled = false,
}: VotingInterfaceProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const handleVote = () => {
    if (selectedPlayerId && !hasVoted && !disabled) {
      onVote(selectedPlayerId);
      setSelectedPlayerId(null);
    }
  };

  const handleSkip = () => {
    if (!hasVoted && !disabled) {
      onVote('skip');
    }
  };

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900">🗳️ ลงคะแนนเสียง</h3>
          <p className="text-sm text-gray-600 mt-1">เลือกผู้เล่นที่คุณสงสัยว่าเป็นสปาย</p>
          <div className="mt-2 text-sm font-medium text-gray-700">
            โหวตแล้ว: {votesCount}/{requiredVotes}
          </div>
        </div>

        {hasVoted ? (
          <div className="text-center p-6 bg-green-100 rounded-lg border-2 border-green-400">
            <p className="text-green-900 font-medium text-lg">✓ คุณลงคะแนนแล้ว</p>
            <p className="text-sm text-green-800 mt-2">รอผู้เล่นคนอื่นลงคะแนน...</p>
          </div>
        ) : (
          <>
            {/* Player List */}
            <div className="space-y-2">
              {players
                .filter((p) => p.id !== currentPlayerId)
                .map((player) => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedPlayerId(player.id)}
                    disabled={disabled}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      selectedPlayerId === player.id
                        ? 'border-orange-500 bg-orange-100'
                        : 'border-gray-300 bg-white hover:border-orange-300 hover:bg-orange-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            player.connectionStatus === 'connected' ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                        <span className="font-medium text-gray-900">{player.name}</span>
                        {player.isHost && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                            เจ้าห้อง
                          </span>
                        )}
                      </div>
                      {selectedPlayerId === player.id && (
                        <span className="text-orange-600 font-bold">✓</span>
                      )}
                    </div>
                  </button>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                onClick={handleVote}
                disabled={!selectedPlayerId || disabled}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                ลงคะแนน
              </Button>
              <Button
                onClick={handleSkip}
                disabled={disabled}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
              >
                ข้าม
              </Button>
            </div>

            <p className="text-xs text-gray-600 text-center">
              เลือก "ข้าม" ถ้าคุณไม่แน่ใจว่าใครเป็นสปาย
            </p>
          </>
        )}
      </div>
    </Card>
  );
}
