import { SpyfallSession } from './types';

const SESSION_KEY = 'spyfall_session';

export const storage = {
  getSession(): SpyfallSession | null {
    if (typeof window === 'undefined') return null;

    try {
      const data = localStorage.getItem(SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to read session from localStorage:', error);
      return null;
    }
  },

  saveSession(session: SpyfallSession): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to save session to localStorage:', error);
    }
  },

  getPlayerId(): string | null {
    const session = this.getSession();
    return session?.playerId || null;
  },

  getPlayerName(): string | null {
    const session = this.getSession();
    return session?.playerName || null;
  },

  getLastRoomCode(): string | null {
    const session = this.getSession();
    return session?.lastRoomCode || null;
  },

  updatePlayerName(playerName: string): void {
    const session = this.getSession() || {
      playerId: crypto.randomUUID(),
      playerName: '',
      lastRoomCode: '',
    };

    session.playerName = playerName;
    this.saveSession(session);
  },

  updateRoomCode(roomCode: string): void {
    const session = this.getSession();
    if (session) {
      session.lastRoomCode = roomCode;
      this.saveSession(session);
    }
  },

  clearSession(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error('Failed to clear session from localStorage:', error);
    }
  },

  initializeSession(): SpyfallSession {
    let session = this.getSession();

    if (!session) {
      session = {
        playerId: crypto.randomUUID(),
        playerName: '',
        lastRoomCode: '',
      };
      this.saveSession(session);
    }

    return session;
  },
};
