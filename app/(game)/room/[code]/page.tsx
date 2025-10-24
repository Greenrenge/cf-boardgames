'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Lobby } from '@/components/room/Lobby';
import { RoleCard } from '@/components/game/RoleCard';
import { LocationReference } from '@/components/game/LocationReference';
import { ChatPanel } from '@/components/game/ChatPanel';
import { GameTimer } from '@/components/game/GameTimer';
import { VotingInterface } from '@/components/game/VotingInterface';
import { ResultsScreen } from '@/components/game/ResultsScreen';
import { storage } from '@/lib/storage';
import { createWebSocketClient, WebSocketClient } from '@/lib/websocket';
import type { Player, WebSocketMessage, Difficulty, Message, GamePhase } from '@/lib/types';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.code as string;

  const [players, setPlayers] = useState<Player[]>([]);
  const [hostId, setHostId] = useState<string>('');
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('');
  const [currentPlayerName, setCurrentPlayerName] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Game state
  const [gamePhase, setGamePhase] = useState<GamePhase>('lobby');
  const [playerRole, setPlayerRole] = useState<string | null>(null);
  const [playerLocation, setPlayerLocation] = useState<string | null>(null);
  const [locationRoles, setLocationRoles] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [timerEndsAt, setTimerEndsAt] = useState<number>(0);
  const [votesCount, setVotesCount] = useState<number>(0);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [votingResults, setVotingResults] = useState<any>(null);

  const wsRef = useRef<WebSocketClient | null>(null);
  const isConnectingRef = useRef(false); // Prevent duplicate connections

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
      case 'KICKED':
        handleKicked(message.payload as { reason: string });
        break;
      case 'ROLE_ASSIGNMENT':
        handleRoleAssignment(
          message.payload as { role: string; location: string | null; locationRoles?: string[] }
        );
        break;
      case 'TIMER_TICK':
        handleTimerTick(message.payload as { remainingSeconds: number });
        break;
      case 'MESSAGE':
        handleMessage(message.payload as Message);
        break;
      case 'VOTE_CAST':
        handleVoteCast(
          message.payload as {
            voterId: string;
            voterName: string;
            totalVotes: number;
            requiredVotes: number;
          }
        );
        break;
      case 'VOTING_RESULTS':
        handleVotingResults(message.payload as any);
        break;
      default:
        console.log('[Room] Unhandled message type:', message.type);
    }
  };

  useEffect(() => {
    // Prevent duplicate connections
    if (isConnectingRef.current || wsRef.current) {
      console.log('[Room] WebSocket already exists or is connecting, skipping...');
      return;
    }

    // Initialize session
    const session = storage.getSession();
    if (!session) {
      router.push('/');
      return;
    }

    if (!roomCode) {
      console.log('[Room] No room code provided');
      return;
    }

    setCurrentPlayerId(session.playerId);
    setCurrentPlayerName(session.playerName);

    // Mark as connecting
    isConnectingRef.current = true;

    // Connect to WebSocket
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8787'}/api/ws/${roomCode}`;

    console.log('[Room] Creating WebSocket connection to', wsUrl);
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
        isConnectingRef.current = false;
      },
      onClose: () => {
        console.log('[Room] WebSocket disconnected');
        setIsConnected(false);
        isConnectingRef.current = false;
      },
      onError: (error) => {
        console.error('[Room] WebSocket error:', error);
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        isConnectingRef.current = false;
      },
    });

    wsRef.current.connect();

    // Cleanup function
    return () => {
      console.log('[Room] Cleaning up WebSocket connection');
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
      isConnectingRef.current = false;
    };
  }, [roomCode]); // Include all dependencies

  const handleRoomState = (payload: { players: Player[]; hostId: string; phase: string }) => {
    setPlayers(payload.players);
    setHostId(payload.hostId);
  };

  const handlePlayerJoined = (player: Player) => {
    setPlayers((prev) => {
      const exists = prev.some((p) => p.id === player.id);
      if (exists) {
        return prev.map((p) => (p.id === player.id ? player : p));
      }
      return [...prev, player];
    });

    if (!hostId && player.isHost) {
      setHostId(player.id);
    }
  };

  const handlePlayerDisconnected = (payload: { playerId: string }) => {
    console.log('[Room] Player disconnected:', payload.playerId);
    setPlayers((prev) =>
      prev.map((p) => (p.id === payload.playerId ? { ...p, connectionStatus: 'disconnected' } : p))
    );
  };

  const handlePlayerLeft = (payload: { playerId: string }) => {
    console.log('[Room] Player left:', payload.playerId);
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
    console.log('[Room] Game started');
    setIsStarting(false);
    // Note: Timer and phase will be set by ROLE_ASSIGNMENT and TIMER_TICK messages
  };

  const handleError = (payload: { code: string; message: string }) => {
    setError(payload.message);
    setIsStarting(false);
  };

  const handlePlayerReconnected = (payload: { playerId: string }) => {
    console.log('[Room] Player reconnected:', payload.playerId);
    setPlayers((prev) =>
      prev.map((p) => (p.id === payload.playerId ? { ...p, connectionStatus: 'connected' } : p))
    );
  };

  const handleKicked = (payload: { reason: string }) => {
    console.log('[Room] Kicked from room:', payload.reason);
    setError(payload.reason || 'คุณถูกเจ้าห้องเตะออก');

    wsRef.current?.disconnect();
    wsRef.current = null;

    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  const handleRoleAssignment = (payload: {
    role: string;
    location: string | null;
    locationRoles?: string[];
  }) => {
    console.log('[Room] Role assigned:', payload);
    setPlayerRole(payload.role);
    setPlayerLocation(payload.location);
    setLocationRoles(payload.locationRoles || []);
    setGamePhase('playing');
    // Set initial timer - will be updated by TIMER_TICK
    setTimerEndsAt(Date.now() + 8 * 60 * 1000); // Default 8 minutes
  };

  const handleTimerTick = (payload: { remainingSeconds: number }) => {
    setRemainingSeconds(payload.remainingSeconds);
  };

  const handleMessage = (payload: Message) => {
    setMessages((prev) => [...prev, payload]);
  };

  const handleVoteCast = (payload: {
    voterId: string;
    voterName: string;
    totalVotes: number;
    requiredVotes: number;
  }) => {
    console.log('[Room] Vote cast:', payload);
    setVotesCount(payload.totalVotes);
    if (payload.voterId === currentPlayerId) {
      setHasVoted(true);
    }
  };

  const handleVotingResults = (payload: any) => {
    console.log('[Room] Voting results:', payload);
    setVotingResults(payload);
    setGamePhase('results');
  };

  const handleStartGame = (difficulty: Difficulty[], timerDuration: number) => {
    console.log('[Room] Starting game with:', { difficulty, timerDuration });

    if (!wsRef.current?.isConnected()) {
      console.error('[Room] WebSocket not connected');
      setError('ไม่ได้เชื่อมต่อกับเซิร์ฟเวอร์');
      return;
    }

    setIsStarting(true);
    wsRef.current.send('START_GAME', {
      difficulty,
      timerDuration,
    });
  };

  const handleKickPlayer = (targetPlayerId: string) => {
    if (!wsRef.current?.isConnected()) {
      setError('ไม่ได้เชื่อมต่อกับเซิร์ฟเวอร์');
      return;
    }

    if (currentPlayerId !== hostId) {
      setError('เฉพาะเจ้าห้องเท่านั้นที่สามารถเตะผู้เล่นได้');
      return;
    }

    wsRef.current.send('KICK', {
      targetPlayerId,
    });
  };

  const handleBackToHome = () => {
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }
    router.push('/');
  };

  const handleSendMessage = (content: string, isTurnIndicator: boolean) => {
    if (!wsRef.current?.isConnected()) return;

    wsRef.current.send('CHAT', {
      content,
      isTurnIndicator,
    });
  };

  const handleVote = (suspectId: string) => {
    if (!wsRef.current?.isConnected()) return;

    wsRef.current.send('VOTE', {
      suspectId,
    });
  };

  const handleBackToLobby = () => {
    // Reset game state
    setGamePhase('lobby');
    setPlayerRole(null);
    setPlayerLocation(null);
    setLocationRoles([]);
    setMessages([]);
    setRemainingSeconds(0);
    setTimerEndsAt(0);
    setVotesCount(0);
    setHasVoted(false);
    setVotingResults(null);
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
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToHome}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>กลับ</span>
          </button>
          <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500" title="คุณออนไลน์"></div>
            <span className="text-gray-700 font-medium">{currentPlayerName}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Lobby Phase */}
      {gamePhase === 'lobby' && (
        <Lobby
          roomCode={roomCode}
          players={players}
          hostId={hostId}
          currentPlayerId={currentPlayerId}
          onStartGame={handleStartGame}
          onKickPlayer={handleKickPlayer}
          isStarting={isStarting}
        />
      )}

      {/* Playing Phase */}
      {gamePhase === 'playing' && playerRole && (
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Role & Timer */}
            <div className="space-y-6">
              <RoleCard role={playerRole} location={playerLocation} isSpy={playerRole === 'Spy'} />

              {!playerLocation && locationRoles.length === 0 && (
                <GameTimer remainingSeconds={remainingSeconds} timerEndsAt={timerEndsAt} />
              )}

              {playerLocation && locationRoles.length > 0 && (
                <LocationReference location={playerLocation} roles={locationRoles} />
              )}
            </div>

            {/* Middle Column - Chat */}
            <div className="lg:col-span-2">
              <ChatPanel
                messages={messages}
                currentPlayerId={currentPlayerId}
                onSendMessage={handleSendMessage}
                disabled={false}
              />
            </div>
          </div>

          {/* Timer for non-spy or voting UI */}
          {(playerLocation || remainingSeconds <= 60) && (
            <div className="max-w-6xl mx-auto mt-6">
              {remainingSeconds > 0 ? (
                <GameTimer remainingSeconds={remainingSeconds} timerEndsAt={timerEndsAt} />
              ) : (
                <VotingInterface
                  players={players}
                  currentPlayerId={currentPlayerId}
                  votesCount={votesCount}
                  requiredVotes={players.length}
                  onVote={handleVote}
                  hasVoted={hasVoted}
                  disabled={false}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Results Phase */}
      {gamePhase === 'results' && votingResults && (
        <div className="max-w-4xl mx-auto">
          <ResultsScreen
            eliminatedPlayerId={votingResults.eliminatedPlayerId}
            spyPlayerId={votingResults.spyPlayerId}
            spyWasEliminated={votingResults.spyWasEliminated}
            location={votingResults.location}
            scores={votingResults.scores}
            players={players}
            voteTally={votingResults.voteTally}
            onBackToLobby={handleBackToLobby}
          />
        </div>
      )}
    </div>
  );
}
