// Shared TypeScript types for Spyfall Online

export type GamePhase = 'lobby' | 'playing' | 'voting' | 'spy_guess' | 'results';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';
export type GameType = 'spyfall' | 'werewolf';

export interface Room {
  code: string;
  hostPlayerId: string;
  gameType: GameType;
  difficulty: Difficulty[];
  timerDuration: number;
  phase: GamePhase;
  players: string[];
  createdAt: number;
  lastActivityAt: number;
}

export interface Player {
  id: string;
  name: string;
  roomCode: string;
  connectionStatus: ConnectionStatus;
  score: number;
  role: string | null;
  isHost: boolean;
  joinedAt: number;
  lastSeenAt: number;
}

export interface GameState {
  roomCode: string;
  roundNumber: number;
  selectedLocation: Location;
  assignments: Record<string, Assignment>;
  spyPlayerId: string;
  currentTurn: number;
  timerStartedAt: number;
  timerEndsAt: number;
  messages: Message[];
  votes: Vote[];
  spyGuess: string | null;
}

export interface Assignment {
  playerId: string;
  role: string;
  location: string | null;
}

export interface Location {
  id: string;
  nameTh: string;
  difficulty: Difficulty;
  roles: string[];
  imageUrl: string;
}

export interface Message {
  id: string;
  roomCode: string;
  roundNumber: number;
  playerId: string;
  playerName: string;
  content: string;
  isTurnIndicator: boolean;
  timestamp: number;
}

export interface Vote {
  id: string;
  roomCode: string;
  roundNumber: number;
  voterId: string;
  suspectId: string | 'skip';
  timestamp: number;
}

// WebSocket message types
export type WebSocketMessageType =
  | 'JOIN'
  | 'START_GAME'
  | 'CHAT'
  | 'VOTE'
  | 'SPY_GUESS'
  | 'LEAVE'
  | 'PONG'
  | 'ROOM_STATE'
  | 'PLAYER_JOINED'
  | 'PLAYER_DISCONNECTED'
  | 'PLAYER_LEFT'
  | 'GAME_STARTED'
  | 'ROLE_ASSIGNMENT'
  | 'MESSAGE'
  | 'PHASE_CHANGE'
  | 'VOTE_CAST'
  | 'VOTING_RESULTS'
  | 'SPY_GUESS_RESULT'
  | 'TIMER_TICK'
  | 'PLAYER_RECONNECTED'
  | 'HOST_CHANGED'
  | 'ERROR'
  | 'PING';

export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType;
  payload: T;
  timestamp: number;
  playerId?: string;
}

// Client→Server payloads
export interface JoinPayload {
  playerId: string;
  playerName: string;
  roomCode: string;
}

export interface StartGamePayload {
  difficulty: Difficulty[];
  timerDuration: number;
}

export interface ChatPayload {
  content: string;
  isTurnIndicator: boolean;
}

export interface VotePayload {
  suspectId: string;
}

export interface SpyGuessPayload {
  locationId: string;
}

// Server→Client payloads
export interface RoomStatePayload {
  players: Player[];
  hostId: string;
  phase: GamePhase;
}

export interface PlayerJoinedPayload {
  player: Player;
}

export interface GameStartedPayload {
  gameState: Partial<GameState>;
  roundNumber: number;
}

export interface RoleAssignmentPayload {
  role: string;
  location: string | null;
  locationRoles?: string[];
}

export interface MessagePayload {
  message: Message;
}

export interface PhaseChangePayload {
  phase: GamePhase;
  reason?: string;
}

export interface VoteCastPayload {
  voterId: string;
  voteCount: number;
}

export interface VotingResultsPayload {
  eliminatedPlayerId: string | null;
  wasSpy: boolean;
  scores: Record<string, number>;
}

export interface SpyGuessResultPayload {
  guess: string;
  actualLocation: string;
  wasCorrect: boolean;
  scores: Record<string, number>;
}

export interface TimerTickPayload {
  remainingSeconds: number;
}

export interface ErrorPayload {
  code: string;
  message: string;
}

// HTTP API types
export interface CreateRoomRequest {
  hostPlayerId: string;
  hostPlayerName: string;
  gameType: GameType;
}

export interface CreateRoomResponse {
  roomCode: string;
  hostPlayerId: string;
  gameType: GameType;
  createdAt: string;
  websocketUrl: string;
}

export interface GetRoomInfoResponse {
  roomCode: string;
  gameType: GameType;
  playerCount: number;
  maxPlayers: number;
  phase: GamePhase;
  isJoinable: boolean;
}

export interface GetLocationsResponse {
  locations: Location[];
}

// localStorage session
export interface SpyfallSession {
  playerId: string;
  playerName: string;
  lastRoomCode: string;
}
