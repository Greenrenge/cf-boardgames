'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { storage } from '@/lib/storage';

export function CreateRoom() {
  const t = useTranslations('common');
  const params = useParams();
  const locale = params.locale as string;
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCreate = async () => {
    if (!playerName.trim()) {
      setError(t('message.invalidRoomCode'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Initialize session
      const session = storage.initializeSession();
      storage.updatePlayerName(playerName.trim());

      // Create room via API
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostPlayerId: session.playerId,
          hostPlayerName: playerName.trim(),
          gameType: 'spyfall',
        }),
      });

      if (!response.ok) {
        throw new Error(t('message.roomNotFound'));
      }

      const data = (await response.json()) as { roomCode: string };
      storage.updateRoomCode(data.roomCode);

      // Navigate to room with locale
      router.push(`/${locale}/room/${data.roomCode}`);
    } catch (err) {
      console.error('Error creating room:', err);
      setError(t('message.connectionLost'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title={t('heading.createRoom')}>
      <div className="space-y-4">
        <Input
          label={t('label.playerName')}
          placeholder={t('label.playerName')}
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          error={error}
          maxLength={20}
          disabled={isLoading}
        />
        <Button
          onClick={handleCreate}
          disabled={isLoading || !playerName.trim()}
          className="w-full"
        >
          {isLoading ? t('message.waitingForPlayers') : t('button.createRoom')}
        </Button>
      </div>
    </Card>
  );
}
