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
  maxPlayers?: number; // 3-20, default: 10 for backward compatibility
  spyCount?: number; // 1-3, default: 1 for backward compatibility
}

export interface RoomConfig {
  maxPlayers: number; // 3-20, default: 10
  spyCount: number; // 1-3, default: 1
  minPlayers: number; // Always 3 (constant)
  createdAt: number;
  updatedAt: number;
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
  phase: 'playing' | 'voting';
  selectedLocation: Location;
  assignments: Record<string, Assignment>;
  spyPlayerIds: string[]; // Changed from single spyPlayerId to array for multi-spy support
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
  isSpy?: boolean; // true if this player is a spy
  totalSpies?: number; // total number of spies in game (for spy players)
  isDuplicateRole?: boolean; // true if location had fewer roles than players
}

// Location API Types (Feature: 005-location-api-customization)
export type LocaleCode = 'en' | 'th' | 'zh' | 'hi' | 'es' | 'fr' | 'ar';

export type LocalizedNames = Record<LocaleCode, string>;

export interface Role {
  id: string;
  names: LocalizedNames;
  locationId?: string; // Added at runtime for reference
  isSelected: boolean; // Runtime property
}

export interface Location {
  id: string;
  names: LocalizedNames; // Replaces nameTh
  roles: Role[]; // Now Role objects instead of strings
  imageUrl?: string;
  isSelected: boolean; // Runtime property

  // Legacy fields for backward compatibility - will be removed later
  nameTh?: string;
  difficulty?: Difficulty;
}

export interface APIResponse {
  version: string;
  timestamp: string;
  locations: Location[];
}

export interface LocationSelection {
  locationId: string;
  isSelected: boolean;
  selectedRoles?: string[]; // Role IDs, undefined = all selected
  timestamp?: string; // When selection was made
}

export interface LocalStorageConfig {
  selections: LocationSelection[];
  lastUpdated: string;
  version: string;
}

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: string;
  expiresAt: string;
  version: string;
}

export interface ExportConfig {
  version: string;
  timestamp: string;
  appIdentifier: string;
  selections: LocationSelection[];
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
  | 'SKIP_TIMER'
  | 'RESET_GAME'
  | 'CHAT'
  | 'VOTE'
  | 'SPY_GUESS'
  | 'LEAVE'
  | 'KICK'
  | 'KICKED'
  | 'PING'
  | 'PONG'
  | 'ROOM_STATE'
  | 'ROOM_CONFIG_UPDATE' // NEW: host updates room configuration
  | 'PLAYER_JOINED'
  | 'PLAYER_DISCONNECTED'
  | 'PLAYER_LEFT'
  | 'GAME_STARTED'
  | 'ROLE_ASSIGNMENT'
  | 'MESSAGE'
  | 'PHASE_CHANGE'
  | 'VOTE_CAST'
  | 'VOTE_COUNT'
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

// NEW: Room configuration update
export interface RoomConfigUpdatePayload {
  maxPlayers?: number; // 4-20, optional
  spyCount?: number; // 1-3, optional
}

// Server→Client payloads
export interface RoomStatePayload {
  players: Player[];
  hostId: string;
  phase: GamePhase;
  maxPlayers?: number; // NEW: room capacity
  currentPlayerCount?: number; // NEW: current number of players
  spyCount?: number; // NEW: number of spies
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
  isDuplicateRole?: boolean; // NEW: indicates if this role is duplicated in large groups
  totalSpies?: number; // NEW: total number of spies (for spy players)
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
