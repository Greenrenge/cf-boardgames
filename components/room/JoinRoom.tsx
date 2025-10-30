'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { storage } from '@/lib/storage';

export function JoinRoom() {
  const t = useTranslations('common');
  const params = useParams();
  const locale = params.locale as string;
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleJoin = async () => {
    if (!playerName.trim()) {
      setError(t('message.invalidRoomCode'));
      return;
    }

    if (!roomCode.trim()) {
      setError(t('message.invalidRoomCode'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Initialize session
      storage.initializeSession();
      storage.updatePlayerName(playerName.trim());
      storage.updateRoomCode(roomCode.trim().toUpperCase());

      // Verify room exists
      const response = await fetch(`/api/rooms/${roomCode.trim().toUpperCase()}`);

      if (!response.ok) {
        throw new Error(t('message.roomNotFound'));
      }

      const roomInfo = (await response.json()) as {
        playerCount: number;
        maxPlayers: number;
      };

      // Check if room is full
      if (roomInfo.playerCount >= roomInfo.maxPlayers) {
        throw new Error(t('message.roomFull'));
      }

      // Navigate to room with locale (WebSocket will handle joining)
      router.push(`/${locale}/room/${roomCode.trim().toUpperCase()}`);
    } catch (err) {
      console.error('Error joining room:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('message.connectionLost'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title={t('heading.joinRoom')}>
      <div className="space-y-4">
        <Input
          label={t('label.playerName')}
          placeholder={t('label.playerName')}
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={20}
          disabled={isLoading}
        />
        <Input
          label={t('label.roomCode')}
          placeholder={t('label.roomCode')}
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          maxLength={6}
          disabled={isLoading}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button
          onClick={handleJoin}
          disabled={isLoading || !playerName.trim() || !roomCode.trim()}
          className="w-full"
        >
          {isLoading ? t('message.reconnecting') : t('button.joinRoom')}
        </Button>
      </div>
    </Card>
  );
}
