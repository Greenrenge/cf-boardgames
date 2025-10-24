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

  constructor(code: string, hostPlayerId: string, gameType: GameType = 'spyfall') {
    this.code = code;
    this.hostPlayerId = hostPlayerId;
    this.gameType = gameType;
    this.difficulty = ['easy'];
    this.timerDuration = 10;
    this.phase = 'lobby';
    this.players = [hostPlayerId];
    this.createdAt = Date.now();
    this.lastActivityAt = Date.now();
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
    return this.players.length >= 10;
  }

  canStart(): boolean {
    return this.phase === 'lobby' && this.players.length >= 4 && this.players.length <= 10;
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
    };
  }
}
