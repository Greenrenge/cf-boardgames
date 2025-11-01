'use client';

export const runtime = 'edge';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Lobby } from '@/components/room/Lobby';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { RoleCard } from '@/components/game/RoleCard';
import { LocationReference } from '@/components/game/LocationReference';
import { ChatPanel } from '@/components/game/ChatPanel';
import { GameTimer } from '@/components/game/GameTimer';
import { VotingInterface } from '@/components/game/VotingInterface';
import { ResultsScreen } from '@/components/game/ResultsScreen';
import { SpyGuess } from '@/components/game/SpyGuess';
import { storage } from '@/lib/storage';
import { createWebSocketClient, WebSocketClient } from '@/lib/websocket';
import type {
  Player,
  WebSocketMessage,
  Difficulty,
  Message,
  GamePhase,
  Location,
} from '@/lib/types';
import { useLocations } from '@/lib/hooks/useLocations';

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
  const [maxPlayers, setMaxPlayers] = useState<number>(10);
  const [spyCount, setSpyCount] = useState<number>(1);

  // Game state
  const [gamePhase, setGamePhase] = useState<GamePhase>('lobby');
  const [playerRole, setPlayerRole] = useState<string | null>(null);
  const [playerLocation, setPlayerLocation] = useState<string | null>(null);
  const [locationRoles, setLocationRoles] = useState<string[]>([]);
  const [isDuplicateRole, setIsDuplicateRole] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [timerEndsAt, setTimerEndsAt] = useState<number>(0);
  const [votesCount, setVotesCount] = useState<number>(0);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [votingResults, setVotingResults] = useState<any>(null);
  const [spyGuessResult, setSpyGuessResult] = useState<any>(null);

  // Load translated locations from API
  const { locations: locationsData } = useLocations();

  const wsRef = useRef<WebSocketClient | null>(null);
  const isConnectingRef = useRef(false); // Prevent duplicate connections

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'ROOM_STATE':
        handleRoomState(message.payload as { players: Player[]; hostId: string; phase: string });
        break;
      case 'ROOM_CONFIG_UPDATE':
        handleRoomConfigUpdate(message.payload as { maxPlayers?: number; spyCount?: number });
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
          message.payload as {
            role: string;
            location: string | null;
            locationRoles?: string[];
            isDuplicateRole?: boolean;
            totalSpies?: number;
          }
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
      case 'PHASE_CHANGE':
        handlePhaseChange(message.payload as { phase: GamePhase });
        break;
      case 'VOTE_COUNT':
        handleVoteCount(message.payload as { totalVotes: number; requiredVotes: number });
        break;
      case 'SPY_GUESS_RESULT':
        handleSpyGuessResult(message.payload as any);
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

  const handleRoomState = (payload: {
    players: Player[];
    hostId: string;
    phase: string;
    maxPlayers?: number;
    spyCount?: number;
  }) => {
    setPlayers(payload.players);
    setHostId(payload.hostId);

    // Update room configuration if provided
    if (payload.maxPlayers !== undefined) {
      setMaxPlayers(payload.maxPlayers);
    }
    if (payload.spyCount !== undefined) {
      setSpyCount(payload.spyCount);
    }

    // If game was reset to lobby, clear game state
    if (payload.phase === 'lobby' && gamePhase !== 'lobby') {
      console.log('[Room] Game reset detected, returning to lobby');
      handleBackToLobby();
    }
  };

  const handleRoomConfigUpdate = (payload: { maxPlayers?: number; spyCount?: number }) => {
    console.log('[Room] Room config updated:', payload);
    if (payload.maxPlayers !== undefined) {
      setMaxPlayers(payload.maxPlayers);
    }
    if (payload.spyCount !== undefined) {
      setSpyCount(payload.spyCount);
    }
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
    isDuplicateRole?: boolean;
    totalSpies?: number;
  }) => {
    console.log('[Room] Role assigned:', payload);
    setPlayerRole(payload.role);
    setPlayerLocation(payload.location);
    setLocationRoles(payload.locationRoles || []);
    setIsDuplicateRole(payload.isDuplicateRole || false);
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

  const handlePhaseChange = (payload: { phase: GamePhase }) => {
    console.log('[Room] Phase changed to:', payload.phase);
    setGamePhase(payload.phase);
  };

  const handleVoteCount = (payload: {
    totalVotes: number;
    requiredVotes: number;
    hasVoted?: boolean;
  }) => {
    console.log('[Room] Vote count updated:', payload);
    setVotesCount(payload.totalVotes);
    if (payload.hasVoted !== undefined) {
      setHasVoted(payload.hasVoted);
    }
  };

  const handleSpyGuessResult = async (payload: any) => {
    console.log('[Room] Spy guess result:', payload);
    setSpyGuessResult(payload);

    // Fetch location name from ID if payload contains ID instead of name
    let guessedName = payload.guessedLocationName;
    if (payload.guessedLocationId && payload.guessedLocationId.startsWith('loc-')) {
      try {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8787';
        const backendUrl = wsUrl.replace('ws://', 'http://').replace('wss://', 'https://');
        const response = await fetch(`${backendUrl}/api/locations`);
        if (response.ok) {
          const data = (await response.json()) as {
            locations?: Array<{ id: string; nameTh: string }>;
          };
          const location = data.locations?.find((loc) => loc.id === payload.guessedLocationId);
          if (location) {
            guessedName = location.nameTh;
            console.log('[Room] Resolved guessed location:', guessedName);
          }
        }
      } catch (err) {
        console.error('[Room] Failed to fetch location name:', err);
      }
    }

    // Merge spy guess result with voting results for display
    setVotingResults((prev: any) => ({
      ...prev,
      location: payload.actualLocationName,
      scores: payload.scores,
      spyGuessResult: {
        wasCorrect: payload.wasCorrect,
        guessedLocationId: payload.guessedLocationId,
        guessedLocationName: guessedName || payload.guessedLocationId,
        actualLocationName: payload.actualLocationName,
      },
    }));
    setGamePhase('results');
  };

  const handleSpyGuess = (locationId: string) => {
    if (!wsRef.current?.isConnected()) {
      console.error('[Room] WebSocket not connected');
      setError('ไม่ได้เชื่อมต่อกับเซิร์ฟเวอร์');
      return;
    }

    console.log('[Room] Spy guessing location:', locationId);
    wsRef.current.send('SPY_GUESS', {
      locationId,
    });
  };

  const handleUpdateRoomConfig = async (config: { maxPlayers?: number; spyCount?: number }) => {
    try {
      const response = await fetch(`/api/rooms/${roomCode}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Room] Failed to update config:', errorData);
        setError(errorData.error?.message || 'Failed to update room configuration');
      } else {
        console.log('[Room] Room config updated successfully');
      }
    } catch (error) {
      console.error('[Room] Error updating room config:', error);
      setError('Failed to update room configuration');
    }
  };

  const handleStartGame = (
    difficulty: Difficulty[],
    timerDuration: number,
    customLocations?: Array<{ locationId: string; roleIds: string[] }>
  ) => {
    console.log('[Room] Starting game with:', { difficulty, timerDuration, customLocations });

    if (!wsRef.current?.isConnected()) {
      console.error('[Room] WebSocket not connected');
      setError('Not connected to server');
      return;
    }

    setIsStarting(true);
    wsRef.current.send('START_GAME', {
      difficulty,
      timerDuration,
      customLocations, // Pass custom location and role selections to server
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
    setHasVoted(true);
  };

  const handleSkipTimer = () => {
    if (!wsRef.current?.isConnected()) {
      setError('ไม่ได้เชื่อมต่อกับเซิร์ฟเวอร์');
      return;
    }

    if (currentPlayerId !== hostId) {
      setError('เฉพาะเจ้าห้องเท่านั้นที่สามารถข้ามเวลาได้');
      return;
    }

    console.log('[Room] Skipping timer');
    wsRef.current.send('SKIP_TIMER', {});
  };

  const handleResetGame = () => {
    if (!wsRef.current?.isConnected()) {
      setError('ไม่ได้เชื่อมต่อกับเซิร์ฟเวอร์');
      return;
    }

    if (currentPlayerId !== hostId) {
      setError('เฉพาะเจ้าห้องเท่านั้นที่สามารถรีเซ็ตเกมได้');
      return;
    }

    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตเกม? เกมปัจจุบันจะสิ้นสุดลง')) {
      console.log('[Room] Resetting game');
      wsRef.current.send('RESET_GAME', {});
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
        <ThemeToggle />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">กำลังเชื่อมต่อ...</p>
          {error && <p className="text-red-600 dark:text-red-400 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
      <ThemeToggle />
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handleBackToHome}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-700"
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
          <div className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="w-2 h-2 rounded-full bg-green-500" title="คุณออนไลน์"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">
              {currentPlayerName}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
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
          maxPlayers={maxPlayers}
          spyCount={spyCount}
          onUpdateConfig={handleUpdateRoomConfig}
        />
      )}

      {/* Playing Phase */}
      {(gamePhase === 'playing' || gamePhase === 'voting') && playerRole && (
        <div className="max-w-6xl mx-auto">
          {/* Admin Controls */}
          {currentPlayerId === hostId && (
            <div className="mb-6">
              <Card>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ควบคุมเจ้าห้อง
                  </h3>
                  <div className="flex space-x-2">
                    {gamePhase === 'playing' && (
                      <Button
                        onClick={handleSkipTimer}
                        className="text-sm px-3 py-1 bg-yellow-600 hover:bg-yellow-700"
                      >
                        ⏩ ข้ามเวลา
                      </Button>
                    )}
                    <Button
                      onClick={handleResetGame}
                      className="text-sm px-3 py-1 bg-red-600 hover:bg-red-700"
                    >
                      🔄 รีเซ็ตเกม
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Role & Timer */}
            <div className="space-y-6">
              <RoleCard
                role={playerRole}
                location={playerLocation}
                isSpy={playerRole === 'Spy'}
                locations={locationsData as unknown as Location[]}
                isDuplicateRole={isDuplicateRole}
              />

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

          {/* Timer or Voting UI */}
          {(playerLocation || gamePhase === 'voting') && (
            <div className="max-w-6xl mx-auto mt-6">
              {gamePhase === 'voting' ? (
                <VotingInterface
                  players={players}
                  currentPlayerId={currentPlayerId}
                  votesCount={votesCount}
                  requiredVotes={players.length}
                  onVote={handleVote}
                  hasVoted={hasVoted}
                  disabled={false}
                />
              ) : (
                <GameTimer remainingSeconds={remainingSeconds} timerEndsAt={timerEndsAt} />
              )}
            </div>
          )}
        </div>
      )}

      {/* Spy Guess Phase */}
      {gamePhase === 'spy_guess' && (
        <div className="max-w-4xl mx-auto">
          {playerRole === 'Spy' ? (
            <SpyGuess onGuess={handleSpyGuess} />
          ) : (
            <Card className="p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🕵️</div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  สายลับกำลังเดาสถานที่...
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  กรุณารอสักครู่ สายลับกำลังตัดสินใจว่าสถานที่นี้คือที่ไหน
                </p>
                <div className="mt-6">
                  <div className="inline-block animate-pulse">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-3 h-3 bg-red-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-3 h-3 bg-red-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
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
            spyGuessResult={votingResults.spyGuessResult}
            onBackToLobby={handleBackToLobby}
          />
        </div>
      )}
    </div>
  );
}
