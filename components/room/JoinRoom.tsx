'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { storage } from '@/lib/storage';

export function JoinRoom() {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleJoin = async () => {
    if (!playerName.trim()) {
      setError('กรุณาใส่ชื่อของคุณ');
      return;
    }

    if (!roomCode.trim()) {
      setError('กรุณาใส่รหัสห้อง');
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
        throw new Error('ไม่พบห้องนี้');
      }

      const roomInfo = (await response.json()) as {
        playerCount: number;
        maxPlayers: number;
      };

      // Check if room is full
      if (roomInfo.playerCount >= roomInfo.maxPlayers) {
        throw new Error('ห้องเต็มแล้ว');
      }

      // Navigate to room (WebSocket will handle joining)
      router.push(`/room/${roomCode.trim().toUpperCase()}`);
    } catch (err) {
      console.error('Error joining room:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('เกิดข้อผิดพลาดในการเข้าห้อง กรุณาลองอีกครั้ง');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="เข้าร่วมห้อง">
      <div className="space-y-4">
        <Input
          label="ชื่อของคุณ"
          placeholder="ใส่ชื่อของคุณ"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={20}
          disabled={isLoading}
        />
        <Input
          label="รหัสห้อง"
          placeholder="ใส่รหัส 6 ตัว"
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
          {isLoading ? 'กำลังเข้าห้อง...' : 'เข้าร่วม'}
        </Button>
      </div>
    </Card>
  );
}
