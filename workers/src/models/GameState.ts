import {
  GameState as GameStateType,
  Location,
  Assignment,
  Message,
  Vote,
} from '../../../lib/types';

export class GameState implements GameStateType {
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

  constructor(
    roomCode: string,
    roundNumber: number,
    selectedLocation: Location,
    assignments: Record<string, Assignment>,
    spyPlayerIds: string[], // Now accepts array
    timerDurationMinutes: number
  ) {
    this.roomCode = roomCode;
    this.roundNumber = roundNumber;
    this.phase = 'playing';
    this.selectedLocation = selectedLocation;
    this.assignments = assignments;
    this.spyPlayerIds = spyPlayerIds; // Store array
    this.currentTurn = 0;
    this.timerStartedAt = Date.now();
    this.timerEndsAt = Date.now() + timerDurationMinutes * 60 * 1000;
    this.messages = [];
    this.votes = [];
    this.spyGuess = null;
  }

  addMessage(message: Message): void {
    this.messages.push(message);
  }

  addVote(vote: Vote): void {
    this.votes.push(vote);
  }

  setSpyGuess(locationName: string): void {
    this.spyGuess = locationName;
  }

  getRemainingTime(): number {
    const remaining = this.timerEndsAt - Date.now();
    return Math.max(0, Math.floor(remaining / 1000));
  }

  isTimerExpired(): boolean {
    return Date.now() >= this.timerEndsAt;
  }

  getVoteCount(): number {
    return this.votes.length;
  }

  tallyVotes(): Record<string, number> {
    const tally: Record<string, number> = {};

    for (const vote of this.votes) {
      if (vote.suspectId !== 'skip') {
        tally[vote.suspectId] = (tally[vote.suspectId] || 0) + 1;
      }
    }

    return tally;
  }

  getEliminatedPlayer(): string | null {
    const tally = this.tallyVotes();
    const entries = Object.entries(tally);

    if (entries.length === 0) return null;

    // Find player with most votes
    let maxVotes = 0;
    let eliminatedPlayer: string | null = null;
    let isTie = false;

    for (const [playerId, votes] of entries) {
      if (votes > maxVotes) {
        maxVotes = votes;
        eliminatedPlayer = playerId;
        isTie = false;
      } else if (votes === maxVotes) {
        isTie = true;
      }
    }

    // No elimination on tie
    return isTie ? null : eliminatedPlayer;
  }

  toJSON() {
    return {
      roomCode: this.roomCode,
      roundNumber: this.roundNumber,
      phase: this.phase,
      selectedLocation: this.selectedLocation,
      assignments: this.assignments,
      spyPlayerIds: this.spyPlayerIds, // Updated to array
      currentTurn: this.currentTurn,
      timerStartedAt: this.timerStartedAt,
      timerEndsAt: this.timerEndsAt,
      messages: this.messages,
      votes: this.votes,
      spyGuess: this.spyGuess,
    };
  }

  // Static method for role assignment with multi-spy support
  static assignRoles(
    playerIds: string[],
    location: Location,
    spyCount: number
  ): { assignments: Record<string, Assignment>; spyPlayerIds: string[] } {
    // Fisher-Yates shuffle for fairness
    const shuffled = [...playerIds].sort(() => Math.random() - 0.5);

    // Select spies
    const spyIds = shuffled.slice(0, spyCount);
    const nonSpyIds = shuffled.slice(spyCount);

    const assignments: Record<string, Assignment> = {};

    // Assign spies (no location or role)
    spyIds.forEach((id) => {
      assignments[id] = {
        playerId: id,
        role: 'Spy',
        location: null,
        isSpy: true,
        totalSpies: spyCount,
      };
    });

    // Assign roles to non-spies with modulo distribution for large groups
    nonSpyIds.forEach((id, index) => {
      const roleIndex = index % location.roles.length;
      assignments[id] = {
        playerId: id,
        role: location.roles[roleIndex],
        location: location.nameTh,
        isSpy: false,
        isDuplicateRole: index >= location.roles.length,
      };
    });

    return { assignments, spyPlayerIds: spyIds };
  }
}
