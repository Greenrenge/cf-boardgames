'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Lobby } from '@/components/room/Lobby';
import { storage } from '@/lib/storage';
import { createWebSocketClient, WebSocketClient } from '@/lib/websocket';
import type { Player, WebSocketMessage } from '@/lib/types';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.code as string;

  const [players, setPlayers] = useState<Player[]>([]);
  const [hostId, setHostId] = useState<string>('');
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocketClient | null>(null);

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'ROOM_STATE':
        handleRoomState(message.payload as { players: Player[]; hostId: string; phase: string });
        break;
      case 'PLAYER_JOINED':
        handlePlayerJoined(message.payload as Player);
        break;
      case 'PLAYER_DISCONNECTED':
        handlePlayerDisconnected(message.payload as { playerId: string });
        break;
      case 'PLAYER_LEFT':
        handlePlayerLeft(message.payload as { playerId: string });
        break;
      case 'HOST_CHANGED':
        handleHostChanged(message.payload as { newHostId: string });
        break;
      case 'GAME_STARTED':
        handleGameStarted();
        break;
      case 'ERROR':
        handleError(message.payload as { code: string; message: string });
        break;
      case 'PLAYER_RECONNECTED':
        handlePlayerReconnected(message.payload as { playerId: string });
        break;
      default:
        console.log('[Room] Unhandled message type:', message.type);
    }
  };

  useEffect(() => {
    // Initialize session
    const session = storage.getSession();
    if (!session) {
      router.push('/');
      return;
    }

    setCurrentPlayerId(session.playerId);

    // Connect to WebSocket
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8787'}/api/ws/${roomCode}`;

    wsRef.current = createWebSocketClient({
      url: wsUrl,
      playerId: session.playerId,
      playerName: session.playerName,
      roomCode,
      onMessage: handleWebSocketMessage,
      onOpen: () => {
        console.log('[Room] WebSocket connected');
        setIsConnected(true);
        setError(null);
      },
      onClose: () => {
        console.log('[Room] WebSocket disconnected');
        setIsConnected(false);
      },
      onError: (error) => {
        console.error('[Room] WebSocket error:', error);
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      },
    });

    wsRef.current.connect();

    // Cleanup
    return () => {
      wsRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  const handleRoomState = (payload: { players: Player[]; hostId: string; phase: string }) => {
    console.log('[Room] Received room state:', payload);
    setPlayers(payload.players);
    setHostId(payload.hostId);
  };

  const handlePlayerJoined = (player: Player) => {
    setPlayers((prev) => {
      // Check if player already exists
      const exists = prev.some((p) => p.id === player.id);
      if (exists) {
        return prev.map((p) => (p.id === player.id ? player : p));
      }
      return [...prev, player];
    });

    // Update host if not set
    if (!hostId && player.isHost) {
      setHostId(player.id);
    }
  };

  const handlePlayerDisconnected = (payload: { playerId: string }) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === payload.playerId ? { ...p, connectionStatus: 'disconnected' } : p))
    );
  };

  const handlePlayerLeft = (payload: { playerId: string }) => {
    setPlayers((prev) => prev.filter((p) => p.id !== payload.playerId));
  };

  const handleHostChanged = (payload: { newHostId: string }) => {
    setHostId(payload.newHostId);
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        isHost: p.id === payload.newHostId,
      }))
    );
  };

  const handleGameStarted = () => {
    // Navigate to game page (will implement in next phase)
    console.log('[Room] Game started');
    setIsStarting(false);
  };

  const handleError = (payload: { code: string; message: string }) => {
    setError(payload.message);
    setIsStarting(false);
  };

  const handlePlayerReconnected = (payload: { playerId: string }) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === payload.playerId ? { ...p, connectionStatus: 'connected' } : p))
    );
  };

  const handleStartGame = () => {
    if (!wsRef.current?.isConnected()) {
      setError('ไม่ได้เชื่อมต่อกับเซิร์ฟเวอร์');
      return;
    }

    setIsStarting(true);
    wsRef.current.send('START_GAME', {
      difficulty: ['easy', 'medium', 'hard'],
      timerDuration: 480, // 8 minutes in seconds
    });
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังเชื่อมต่อ...</p>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      {error && (
        <div className="max-w-2xl mx-auto mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      <Lobby
        roomCode={roomCode}
        players={players}
        hostId={hostId}
        currentPlayerId={currentPlayerId}
        onStartGame={handleStartGame}
        isStarting={isStarting}
      />
    </div>
  );
}
