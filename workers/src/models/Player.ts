import { Player as PlayerType, ConnectionStatus } from '../../../lib/types';

export class Player implements PlayerType {
  id: string;
  name: string;
  roomCode: string;
  connectionStatus: ConnectionStatus;
  score: number;
  role: string | null;
  isHost: boolean;
  joinedAt: number;
  lastSeenAt: number;

  constructor(id: string, name: string, roomCode: string, isHost: boolean = false) {
    this.id = id;
    this.name = name;
    this.roomCode = roomCode;
    this.connectionStatus = 'connected';
    this.score = 0;
    this.role = null;
    this.isHost = isHost;
    this.joinedAt = Date.now();
    this.lastSeenAt = Date.now();
  }

  updateConnectionStatus(status: ConnectionStatus): void {
    this.connectionStatus = status;
    this.lastSeenAt = Date.now();
  }

  assignRole(role: string): void {
    this.role = role;
  }

  addScore(points: number): void {
    this.score += points;
  }

  resetRole(): void {
    this.role = null;
  }

  updateActivity(): void {
    this.lastSeenAt = Date.now();
  }

  isConnected(): boolean {
    return this.connectionStatus === 'connected';
  }

  toJSON(): PlayerType {
    return {
      id: this.id,
      name: this.name,
      roomCode: this.roomCode,
      connectionStatus: this.connectionStatus,
      score: this.score,
      role: this.role,
      isHost: this.isHost,
      joinedAt: this.joinedAt,
      lastSeenAt: this.lastSeenAt,
    };
  }
}
