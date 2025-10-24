'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { storage } from '@/lib/storage';

export function CreateRoom() {
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCreate = async () => {
    if (!playerName.trim()) {
      setError('กรุณาใส่ชื่อของคุณ');
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
        throw new Error('ไม่สามารถสร้างห้องได้');
      }

      const data = (await response.json()) as { roomCode: string };
      storage.updateRoomCode(data.roomCode);

      // Navigate to room
      router.push(`/room/${data.roomCode}`);
    } catch (err) {
      console.error('Error creating room:', err);
      setError('เกิดข้อผิดพลาดในการสร้างห้อง กรุณาลองอีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="สร้างห้องใหม่">
      <div className="space-y-4">
        <Input
          label="ชื่อของคุณ"
          placeholder="ใส่ชื่อของคุณ"
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
          {isLoading ? 'กำลังสร้างห้อง...' : 'สร้างห้อง'}
        </Button>
      </div>
    </Card>
  );
}
