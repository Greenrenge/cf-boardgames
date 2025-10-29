import { Room as RoomType, GamePhase, GameType, Difficulty } from '../../../lib/types';

export class Room implements RoomType {
  code: string;
  hostPlayerId: string;
  gameType: GameType;
  difficulty: Difficulty[];
  timerDuration: number;
  phase: GamePhase;
  players: string[];
  createdAt: number;
  lastActivityAt: number;
  maxPlayers: number; // NEW: 3-20, default 10
  spyCount: number; // NEW: 1-3, default 1

  constructor(
    code: string,
    hostPlayerId: string,
    gameType: GameType = 'spyfall',
    options?: { maxPlayers?: number; spyCount?: number }
  ) {
    this.code = code;
    this.hostPlayerId = hostPlayerId;
    this.gameType = gameType;
    this.difficulty = ['easy'];
    this.timerDuration = 10;
    this.phase = 'lobby';
    this.players = [hostPlayerId];
    this.createdAt = Date.now();
    this.lastActivityAt = Date.now();
    this.maxPlayers = options?.maxPlayers ?? 10; // Default backward compatible
    this.spyCount = options?.spyCount ?? 1; // Default backward compatible
  }

  addPlayer(playerId: string): void {
    if (!this.players.includes(playerId)) {
      this.players.push(playerId);
      this.lastActivityAt = Date.now();
    }
  }

  removePlayer(playerId: string): void {
    this.players = this.players.filter((id) => id !== playerId);
    this.lastActivityAt = Date.now();

    // Transfer host if current host leaves
    if (this.hostPlayerId === playerId && this.players.length > 0) {
      this.hostPlayerId = this.players[0];
    }
  }

  isFull(): boolean {
    return this.players.length >= this.maxPlayers;
  }

  canJoin(currentPlayerCount: number): boolean {
    return currentPlayerCount < this.maxPlayers;
  }

  canStart(): boolean {
    const playerCount = this.players.length;
    return (
      this.phase === 'lobby' &&
      playerCount >= 3 &&
      playerCount <= this.maxPlayers &&
      playerCount >= this.spyCount * 3 // Minimum 3:1 ratio
    );
  }

  updatePhase(newPhase: GamePhase): void {
    this.phase = newPhase;
    this.lastActivityAt = Date.now();
  }

  updateActivity(): void {
    this.lastActivityAt = Date.now();
  }

  toJSON(): RoomType {
    return {
      code: this.code,
      hostPlayerId: this.hostPlayerId,
      gameType: this.gameType,
      difficulty: this.difficulty,
      timerDuration: this.timerDuration,
      phase: this.phase,
      players: this.players,
      createdAt: this.createdAt,
      lastActivityAt: this.lastActivityAt,
      maxPlayers: this.maxPlayers, // NEW
      spyCount: this.spyCount, // NEW
    };
  }
}
