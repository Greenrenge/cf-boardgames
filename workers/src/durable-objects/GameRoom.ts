import { Room } from '../models/Room';
import { Player } from '../models/Player';
import { GameState } from '../models/GameState';
import type { WebSocketMessage, Location, Assignment, Difficulty } from '../../../lib/types';
import locationsApiData from '../locations/data';

export class GameRoom {
  private state: DurableObjectState;
  private env: any;
  private room: Room | null = null;
  private players: Map<string, Player> = new Map();
  private connections: Map<string, WebSocket> = new Map();
  private disconnectTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private kickedPlayers: Set<string> = new Set();
  private isLoadingState: boolean = false;
  private messageQueue: Map<string, Promise<void>> = new Map();
  private gameState: GameState | null = null;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private resultsTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
  }
  private async checkAndRemovePlayers() {
    const now = Date.now();
    for (const [playerId, player] of Array.from(this.players.entries())) {
      if (player.lastSeenAt + 20_000 >= now || this.room?.phase !== 'lobby') {
        // 20 seconds timeout
        continue;
      }

      const wasHost = playerId === this.room?.hostPlayerId;

      this.players.delete(playerId);
      this.room?.removePlayer(playerId);

      // Transfer host if the disconnected player was host
      if (wasHost && this.players.size > 0) {
        const newHost = Array.from(this.players.values())[0];
        console.log(`[GameRoom] Transferring host to ${newHost.id} (${newHost.name})`);
        newHost.isHost = true;
        if (this.room) {
          this.room.hostPlayerId = newHost.id;
        }

        this.broadcast({
          type: 'HOST_CHANGED',
          payload: { newHostId: newHost.id },
          timestamp: Date.now(),
        });
      }

      // Now send PLAYER_LEFT after timeout
      this.broadcast({
        type: 'PLAYER_LEFT',
        payload: { playerId },
        timestamp: Date.now(),
      });
      await this.saveState();

      this.broadcast({
        type: 'ROOM_STATE',
        payload: this.getRoomStatePayload(),
        timestamp: Date.now(),
      });

      // Note: Room will be cleaned up after 1 day of inactivity via alarm
      if (this.players.size === 0) {
        console.log('[GameRoom] Last player left after timeout, but room will persist for 1 day');
      }
    }
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Initialize room
    if (url.pathname === '/init' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { hostPlayerId, hostPlayerName, gameType } = body as any;

        // Only initialize if room doesn't exist yet
        if (!this.room) {
          this.room = new Room(url.hostname, hostPlayerId, gameType);
          await this.saveState();
          console.log(`[GameRoom] Room initialized: ${url.hostname}, host: ${hostPlayerId}`);
        } else {
          console.log(`[GameRoom] Room already exists: ${url.hostname}`);
        }

        return new Response(JSON.stringify({ success: true, roomCode: url.hostname }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('[GameRoom] Init error:', error);
        return new Response(
          JSON.stringify({
            error: { code: 'INIT_FAILED', message: 'Failed to initialize room' },
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Get room info
    if (url.pathname === '/info' && request.method === 'GET') {
      await this.loadState();

      if (!this.room) {
        return new Response(
          JSON.stringify({
            error: { code: 'ROOM_NOT_FOUND', message: 'Room does not exist' },
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          roomCode: this.room.code,
          gameType: this.room.gameType,
          playerCount: this.players.size,
          maxPlayers: this.room.maxPlayers ?? 10,
          phase: this.room.phase,
          isJoinable: this.room.canJoin(this.players.size) && this.room.phase === 'lobby',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Update room configuration
    if (url.pathname === '/config' && request.method === 'PATCH') {
      await this.loadState();

      if (!this.room) {
        return new Response(
          JSON.stringify({
            error: { code: 'ROOM_NOT_FOUND', message: 'Room does not exist' },
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      try {
        const body = (await request.json()) as any;
        const { maxPlayers, spyCount } = body;

        // Update maxPlayers if provided
        if (maxPlayers !== undefined) {
          // Cannot decrease below current player count
          if (maxPlayers < this.players.size) {
            return new Response(
              JSON.stringify({
                error: {
                  code: 'INVALID_REQUEST',
                  message: `Cannot set maxPlayers to ${maxPlayers} when ${this.players.size} players are already in the room`,
                },
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          }
          this.room.maxPlayers = maxPlayers;
        }

        // Update spyCount if provided
        if (spyCount !== undefined) {
          this.room.spyCount = spyCount;
        }

        await this.saveState();

        // Broadcast config update to all connected players
        this.broadcast({
          type: 'ROOM_CONFIG_UPDATE',
          payload: {
            maxPlayers: this.room.maxPlayers,
            spyCount: this.room.spyCount,
          },
          timestamp: Date.now(),
        });

        // Also send updated ROOM_STATE
        this.broadcast({
          type: 'ROOM_STATE',
          payload: this.getRoomStatePayload(),
          timestamp: Date.now(),
        });

        return new Response(
          JSON.stringify({
            success: true,
            maxPlayers: this.room.maxPlayers,
            spyCount: this.room.spyCount,
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
      } catch (error) {
        console.error('[GameRoom] Config update error:', error);
        return new Response(
          JSON.stringify({
            error: { code: 'INTERNAL_ERROR', message: 'Failed to update configuration' },
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // WebSocket upgrade
    if (request.headers.get('Upgrade') === 'websocket') {
      await this.loadState();

      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      this.handleWebSocket(server);

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    return new Response('Not Found', { status: 404 });
  }

  private async loadState() {
    // Prevent concurrent loading
    if (this.room || this.isLoadingState) {
      console.log('[GameRoom] Skipping loadState - already loaded or loading');
      return;
    }

    this.isLoadingState = true;

    try {
      console.log('[GameRoom] Loading state from storage...');
      const roomData = await this.state.storage.get('room');
      const playersData = await this.state.storage.get('players');
      const kickedData = await this.state.storage.get('kickedPlayers');

      if (roomData) {
        const data = roomData as any;
        this.room = Object.assign(new Room(data.code, data.hostPlayerId, data.gameType), data);
        console.log(`[GameRoom] Loaded room: ${this.room.code}, host: ${this.room.hostPlayerId}`);
      } else {
        console.log('[GameRoom] No room data found in storage');
      }

      if (playersData) {
        const entries = playersData as any[];
        console.log(`[GameRoom] Loading ${entries.length} players from storage`);
        for (const [id, playerData] of entries) {
          const player = Object.assign(
            new Player(playerData.id, playerData.name, playerData.roomCode, playerData.isHost),
            playerData
          );
          this.players.set(id, player);
        }
      }

      if (kickedData) {
        this.kickedPlayers = new Set(kickedData as string[]);
        console.log(`[GameRoom] Loaded ${this.kickedPlayers.size} kicked players`);
      }
    } catch (error) {
      console.error('[GameRoom] Error loading state:', error);
    } finally {
      this.isLoadingState = false;
    }
  }

  private handleWebSocket(ws: WebSocket) {
    ws.accept();

    let playerId: string | null = null;

    ws.addEventListener('message', async (event) => {
      try {
        const message = JSON.parse(event.data as string) as WebSocketMessage;

        // Queue messages per player to prevent race conditions
        if (message.type === 'JOIN' || message.type === 'PING') {
          const pid = message.type === 'JOIN' ? message.payload.playerId : playerId;
          if (pid) {
            const existingQueue = this.messageQueue.get(pid);
            const processingPromise = existingQueue
              ? existingQueue.then(() =>
                  this.processMessage(
                    message,
                    ws,
                    () => playerId,
                    (id) => {
                      playerId = id;
                    }
                  )
                )
              : this.processMessage(
                  message,
                  ws,
                  () => playerId,
                  (id) => {
                    playerId = id;
                  }
                );
            this.messageQueue.set(pid, processingPromise);
            await processingPromise;
            if (this.messageQueue.get(pid) === processingPromise) {
              this.messageQueue.delete(pid);
            }
            return;
          }
        }

        await this.processMessage(
          message,
          ws,
          () => playerId,
          (id) => {
            playerId = id;
          }
        );
      } catch (error) {
        console.error('[GameRoom] Error handling WebSocket message:', error);
        try {
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              payload: { code: 'INTERNAL_ERROR', message: 'Failed to process message' },
              timestamp: Date.now(),
            })
          );
        } catch (sendError) {
          console.error('[GameRoom] Failed to send error message:', sendError);
        }
      }
    });

    ws.addEventListener('close', () => {
      console.log(`[GameRoom] WebSocket closed for player: ${playerId}`);
      if (playerId) {
        this.handleDisconnect(playerId);
      }
    });

    ws.addEventListener('error', (error) => {
      console.error(`[GameRoom] WebSocket error for player ${playerId}:`, error);
      if (playerId) {
        this.handleDisconnect(playerId);
      }
    });
  }

  private async processMessage(
    message: WebSocketMessage,
    ws: WebSocket,
    getPlayerId: () => string | null,
    setPlayerId: (id: string) => void
  ) {
    const currentPlayerId = getPlayerId();

    if (message.type === 'JOIN') {
      const joiningPlayerId = message.payload.playerId;
      const playerName = message.payload.playerName;

      console.log(`[GameRoom] Player joining: ${joiningPlayerId} (${playerName})`);

      // Check if room still exists (might have been cleaned up)
      if (!this.room) {
        console.log(`[GameRoom] Room no longer exists, rejecting: ${joiningPlayerId}`);
        try {
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              payload: { code: 'ROOM_NOT_FOUND', message: 'Room no longer exists' },
              timestamp: Date.now(),
            })
          );
          ws.close(1008, 'Room not found');
        } catch (error) {
          console.error('[GameRoom] Failed to send room not found error:', error);
        }
        return;
      }

      // Check if player was kicked
      if (this.kickedPlayers.has(joiningPlayerId)) {
        console.log(`[GameRoom] Rejected kicked player: ${joiningPlayerId}`);
        try {
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              payload: { code: 'PLAYER_KICKED', message: 'You have been kicked from this room' },
              timestamp: Date.now(),
            })
          );
          ws.close(1008, 'Player was kicked');
        } catch (error) {
          console.error('[GameRoom] Failed to send kick rejection:', error);
        }
        return;
      }

      // Check max players
      if (!this.players.has(joiningPlayerId) && this.players.size >= 10) {
        console.log(`[GameRoom] Room full, rejecting: ${joiningPlayerId}`);
        try {
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              payload: { code: 'ROOM_FULL', message: 'Room is full' },
              timestamp: Date.now(),
            })
          );
          ws.close(1008, 'Room full');
        } catch (error) {
          console.error('[GameRoom] Failed to send room full error:', error);
        }
        return;
      }

      // Check if room is in lobby phase
      if (this.room && this.room.phase !== 'lobby' && !this.players.has(joiningPlayerId)) {
        console.log(`[GameRoom] Game in progress, rejecting new player: ${joiningPlayerId}`);
        try {
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              payload: { code: 'GAME_IN_PROGRESS', message: 'Game is already in progress' },
              timestamp: Date.now(),
            })
          );
          ws.close(1008, 'Game in progress');
        } catch (error) {
          console.error('[GameRoom] Failed to send game in progress error:', error);
        }
        return;
      }

      // Handle duplicate names
      let uniqueName = playerName;
      let counter = 2;
      while (
        Array.from(this.players.values()).some(
          (p) => p.name === uniqueName && p.id !== joiningPlayerId
        )
      ) {
        uniqueName = `${playerName} (${counter})`;
        counter++;
      }

      // Add or update player
      const isReconnecting = this.players.has(joiningPlayerId);

      // Check if this is the host's first join
      const isHostFirstJoin = !isReconnecting && joiningPlayerId === this.room.hostPlayerId;

      if (!isReconnecting) {
        // For host's first join, mark them as host
        const isHost = joiningPlayerId === this.room.hostPlayerId;
        const newPlayer = new Player(joiningPlayerId, uniqueName, this.room.code, isHost);
        this.players.set(joiningPlayerId, newPlayer);
        this.room.addPlayer(joiningPlayerId);
        console.log(`[GameRoom] Added new player: ${joiningPlayerId} (host: ${isHost})`);
      } else {
        // Update existing player's name if it changed
        const existingPlayer = this.players.get(joiningPlayerId)!;
        if (existingPlayer.name !== uniqueName) {
          console.log(`[GameRoom] Updating player name: ${existingPlayer.name} -> ${uniqueName}`);
          existingPlayer.name = uniqueName;
        }
      }

      // Store connection
      const oldConn = this.connections.get(joiningPlayerId);
      if (oldConn) {
        oldConn.close(1000, 'Reconnecting');
      }
      this.connections.set(joiningPlayerId, ws);
      setPlayerId(joiningPlayerId);

      // Update player connection status
      const player = this.players.get(joiningPlayerId)!;
      player.updateConnectionStatus('connected');
      player.updateActivity();

      // Save state
      await this.saveState();

      // Start heartbeat checker if this is the first player
      if (this.connections.size === 1) {
        await this.scheduleNextHeartbeatCheck();
      }

      // Send current room state to the joining player
      try {
        // If room is in results phase and player is reconnecting, reset them to lobby
        let phaseToSend = this.room.phase;
        if (this.room.phase === 'results') {
          console.log(
            `[GameRoom] Player ${joiningPlayerId} reconnecting during results, sending lobby state`
          );
          phaseToSend = 'lobby';
        }

        ws.send(
          JSON.stringify({
            type: 'ROOM_STATE',
            payload: this.getRoomStatePayload(),
            timestamp: Date.now(),
          })
        );
        console.log(`[GameRoom] Sent ROOM_STATE to ${joiningPlayerId}`);

        // If game is active, restore game state for this player
        if (
          this.gameState &&
          (this.gameState.phase === 'playing' || this.gameState.phase === 'voting')
        ) {
          const assignment = this.gameState.assignments[joiningPlayerId];
          if (assignment) {
            console.log(
              `[GameRoom] Restoring game state for ${joiningPlayerId} (role: ${assignment.role})`
            );

            // Send role assignment
            ws.send(
              JSON.stringify({
                type: 'ROLE_ASSIGNMENT',
                payload: {
                  role: assignment.role,
                  location: assignment.location,
                  locationRoles:
                    assignment.role === 'Spy' ? [] : this.gameState.selectedLocation.roles,
                },
                timestamp: Date.now(),
              })
            );

            // Send current timer state
            const remainingSeconds = this.gameState.getRemainingTime();
            ws.send(
              JSON.stringify({
                type: 'TIMER_TICK',
                payload: { remainingSeconds },
                timestamp: Date.now(),
              })
            );

            // Send chat history
            for (const message of this.gameState.messages) {
              ws.send(
                JSON.stringify({
                  type: 'MESSAGE',
                  payload: message,
                  timestamp: Date.now(),
                })
              );
            }

            // If in voting phase, send phase change and vote count
            if (this.gameState.phase === 'voting') {
              ws.send(
                JSON.stringify({
                  type: 'PHASE_CHANGE',
                  payload: { phase: 'voting' },
                  timestamp: Date.now(),
                })
              );

              // Send current vote count
              const voteCount = this.gameState.votes.length;
              const hasPlayerVoted = this.gameState.votes.some(
                (v) => v.voterId === joiningPlayerId
              );
              ws.send(
                JSON.stringify({
                  type: 'VOTE_COUNT',
                  payload: {
                    totalVotes: voteCount,
                    requiredVotes: this.players.size,
                    hasVoted: hasPlayerVoted,
                  },
                  timestamp: Date.now(),
                })
              );
            }

            console.log(`[GameRoom] Game state restored for ${joiningPlayerId}`);
          }
        }
      } catch (error) {
        console.error('[GameRoom] Failed to send ROOM_STATE:', error);
      }

      // Broadcast to OTHER players
      console.log(
        `[GameRoom] Broadcasting ${isReconnecting ? 'PLAYER_RECONNECTED' : 'PLAYER_JOINED'} for ${joiningPlayerId} to other players`
      );
      console.log(
        `[GameRoom] Current connections: ${Array.from(this.connections.keys()).join(', ')}`
      );

      if (isReconnecting) {
        // Notify others this player reconnected
        this.broadcastToOthers(joiningPlayerId, {
          type: 'PLAYER_RECONNECTED',
          payload: { playerId: joiningPlayerId },
          timestamp: Date.now(),
        });
      } else if (!isHostFirstJoin) {
        // Only broadcast PLAYER_JOINED for non-host players
        // Host doesn't need to be announced to themselves
        this.broadcastToOthers(joiningPlayerId, {
          type: 'PLAYER_JOINED',
          payload: { player: player.toJSON() },
          timestamp: Date.now(),
        });
      } else {
        console.log(`[GameRoom] Skipping broadcast for host's first join`);
      }
    }

    if (message.type === 'LEAVE') {
      if (currentPlayerId) {
        await this.handleDisconnect(currentPlayerId, true);
      }
    }

    if (message.type === 'PING') {
      if (currentPlayerId) {
        const player = this.players.get(currentPlayerId);
        if (player) {
          player.updateActivity();
          player.updateConnectionStatus('connected');

          // Check if room still exists
          if (!this.room) {
            console.log(
              `[GameRoom] Room no longer exists, closing connection for ${currentPlayerId}`
            );
            try {
              ws.send(
                JSON.stringify({
                  type: 'ERROR',
                  payload: { code: 'ROOM_NOT_FOUND', message: 'Room no longer exists' },
                  timestamp: Date.now(),
                })
              );
              ws.close(1008, 'Room not found');
            } catch (error) {
              console.error('[GameRoom] Failed to send room not found error:', error);
            }
            return;
          }

          // Send back full room state to keep client synchronized
          const roomState = {
            type: 'ROOM_STATE',
            payload: this.getRoomStatePayload(),
            timestamp: Date.now(),
          };

          try {
            ws.send(JSON.stringify(roomState));
          } catch (error) {
            console.error(`[GameRoom] Failed to send ROOM_STATE to ${currentPlayerId}:`, error);
            // Connection is dead, handle disconnect
            await this.handleDisconnect(currentPlayerId);
          }
        } else {
          console.error(`[GameRoom] PING from unknown player: ${currentPlayerId}`);
          // Player doesn't exist, close the connection
          try {
            ws.send(
              JSON.stringify({
                type: 'ERROR',
                payload: { code: 'PLAYER_NOT_FOUND', message: 'Player not found in room' },
                timestamp: Date.now(),
              })
            );
            ws.close(1008, 'Player not found');
          } catch (error) {
            console.error('[GameRoom] Failed to close unknown player connection:', error);
          }
        }
      } else {
        console.error(`[GameRoom] PING received but playerId is null`);
      }
    }

    if (message.type === 'SKIP_TIMER') {
      if (!currentPlayerId || currentPlayerId !== this.room?.hostPlayerId) {
        console.log('[GameRoom] Non-host tried to skip timer');
        try {
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              payload: {
                code: 'UNAUTHORIZED',
                message: 'Only the host can skip the timer',
              },
              timestamp: Date.now(),
            })
          );
        } catch (error) {
          console.error('[GameRoom] Failed to send error:', error);
        }
        return;
      }

      if (!this.gameState || this.gameState.phase !== 'playing') {
        console.log('[GameRoom] Cannot skip timer - game not in playing phase');
        return;
      }

      console.log('[GameRoom] Host skipping timer, transitioning to voting');

      // Stop timer
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      // Transition to voting phase
      this.gameState.phase = 'voting';
      this.broadcast({
        type: 'PHASE_CHANGE',
        payload: { phase: 'voting' },
        timestamp: Date.now(),
      });

      return;
    }

    if (message.type === 'RESET_GAME') {
      if (!currentPlayerId || currentPlayerId !== this.room?.hostPlayerId) {
        console.log('[GameRoom] Non-host tried to reset game');
        try {
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              payload: {
                code: 'UNAUTHORIZED',
                message: 'Only the host can reset the game',
              },
              timestamp: Date.now(),
            })
          );
        } catch (error) {
          console.error('[GameRoom] Failed to send error:', error);
        }
        return;
      }

      console.log('[GameRoom] Host resetting game');

      // Stop timer
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      // Clear results timer
      if (this.resultsTimer) {
        clearTimeout(this.resultsTimer);
        this.resultsTimer = null;
      }

      // Clear game state
      this.gameState = null;

      // Reset room phase to lobby
      if (this.room) {
        this.room.phase = 'lobby';
      }

      // Broadcast room state reset
      this.broadcast({
        type: 'ROOM_STATE',
        payload: this.getRoomStatePayload(),
        timestamp: Date.now(),
      });

      await this.saveState();

      return;
    }

    if (message.type === 'START_GAME') {
      if (currentPlayerId) {
        // Only host can start the game
        if (currentPlayerId !== this.room?.hostPlayerId) {
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              payload: { code: 'NOT_HOST', message: 'Only host can start the game' },
              timestamp: Date.now(),
            })
          );
          return;
        }

        // Validate player count (3-8 players)
        const activePlayers = Array.from(this.players.values()).filter(
          (p) => p.connectionStatus === 'connected'
        );
        if (activePlayers.length < 3 || activePlayers.length > 8) {
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              payload: {
                code: 'INVALID_PLAYER_COUNT',
                message: `Need 3-8 players to start. Currently ${activePlayers.length} players.`,
              },
              timestamp: Date.now(),
            })
          );
          return;
        }

        // Change room phase
        if (this.room) {
          this.room.phase = 'playing';
        }

        // Start the game
        await this.startGame(activePlayers, message.payload as any);
      }
    }

    if (message.type === 'CHAT') {
      if (currentPlayerId && this.gameState) {
        const { content, isTurnIndicator } = message.payload as {
          content: string;
          isTurnIndicator?: boolean;
        };

        // Validate message
        if (!content || content.trim().length === 0) {
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              payload: { code: 'INVALID_MESSAGE', message: 'Message cannot be empty' },
              timestamp: Date.now(),
            })
          );
          return;
        }

        if (content.length > 500) {
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              payload: { code: 'MESSAGE_TOO_LONG', message: 'Message too long (max 500 chars)' },
              timestamp: Date.now(),
            })
          );
          return;
        }

        // Store message in game state
        const player = this.players.get(currentPlayerId);
        if (player) {
          const chatMessage = {
            id: `${Date.now()}-${currentPlayerId}`,
            roomCode: this.room!.code,
            roundNumber: this.gameState.roundNumber,
            playerId: currentPlayerId,
            playerName: player.name,
            content: content.trim(),
            isTurnIndicator: isTurnIndicator || false,
            timestamp: Date.now(),
          };

          this.gameState.addMessage(chatMessage);
          await this.state.storage.put('gameState', this.gameState.toJSON());

          // Broadcast MESSAGE to all players
          this.broadcast({
            type: 'MESSAGE',
            payload: chatMessage,
            timestamp: Date.now(),
          });
        }
      }
    }

    if (message.type === 'VOTE') {
      if (currentPlayerId && this.gameState) {
        const { suspectId } = message.payload as { suspectId: string };

        // Check if voting is allowed (game must be playing and timer not expired)
        if (this.room?.phase !== 'playing') {
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              payload: { code: 'NOT_IN_GAME', message: 'Game is not in progress' },
              timestamp: Date.now(),
            })
          );
          return;
        }

        // Validate suspect exists (or is 'skip')
        if (suspectId !== 'skip' && !this.players.has(suspectId)) {
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              payload: { code: 'INVALID_SUSPECT', message: 'Suspect player not found' },
              timestamp: Date.now(),
            })
          );
          return;
        }

        // Check if player already voted
        const existingVote = this.gameState.votes.find((v) => v.voterId === currentPlayerId);
        if (existingVote) {
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              payload: { code: 'ALREADY_VOTED', message: 'You have already voted' },
              timestamp: Date.now(),
            })
          );
          return;
        }

        // Store vote
        const vote = {
          id: `${Date.now()}-${currentPlayerId}`,
          roomCode: this.room!.code,
          roundNumber: this.gameState.roundNumber,
          voterId: currentPlayerId,
          suspectId,
          timestamp: Date.now(),
        };

        this.gameState.addVote(vote);
        await this.state.storage.put('gameState', this.gameState.toJSON());

        // Broadcast VOTE_CAST (without revealing who voted for whom)
        const player = this.players.get(currentPlayerId);
        this.broadcast({
          type: 'VOTE_CAST',
          payload: {
            voterId: currentPlayerId,
            voterName: player?.name || 'Unknown',
            totalVotes: this.gameState.votes.length,
            requiredVotes: this.players.size,
          },
          timestamp: Date.now(),
        });

        // Check if all players have voted
        if (this.gameState.votes.length === this.players.size) {
          await this.endRound();
        }
      }
    }

    if (message.type === 'SPY_GUESS') {
      if (currentPlayerId && this.gameState) {
        const { locationId } = message.payload as { locationId: string };

        // Validate that player is a spy
        if (!this.gameState.spyPlayerIds.includes(currentPlayerId)) {
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              payload: { code: 'NOT_SPY', message: 'Only spy can guess location' },
              timestamp: Date.now(),
            })
          );
          return;
        }

        // Validate phase
        if (this.room?.phase !== 'spy_guess') {
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              payload: { code: 'INVALID_PHASE', message: 'Not in spy guess phase' },
              timestamp: Date.now(),
            })
          );
          return;
        }

        // Validate location ID
        if (!locationId) {
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              payload: { code: 'INVALID_LOCATION', message: 'Location ID is required' },
              timestamp: Date.now(),
            })
          );
          return;
        }

        // Process spy guess
        await this.handleSpyGuess(locationId);
      }
    }

    if (message.type === 'KICK') {
      if (currentPlayerId) {
        const targetPlayerId = (message.payload as any).targetPlayerId;

        // Only host can kick
        if (
          currentPlayerId === this.room?.hostPlayerId &&
          targetPlayerId &&
          targetPlayerId !== currentPlayerId
        ) {
          const targetPlayer = this.players.get(targetPlayerId);
          const targetWs = this.connections.get(targetPlayerId);

          // Safety check: Don't allow kicking the host
          if (targetPlayer && targetPlayerId !== this.room?.hostPlayerId) {
            console.log(
              `[GameRoom] Host ${currentPlayerId} kicking player ${targetPlayerId} (${targetPlayer.name})`
            );

            // Add to kicked list
            this.kickedPlayers.add(targetPlayerId);

            // Send KICKED message to target player
            if (targetWs) {
              try {
                targetWs.send(
                  JSON.stringify({
                    type: 'KICKED',
                    payload: { reason: 'Kicked by host' },
                    timestamp: Date.now(),
                  })
                );
                targetWs.close(1008, 'Kicked by host');
              } catch (error) {
                console.error('[GameRoom] Failed to send KICKED message:', error);
              }
            }

            //     // Clear any disconnect timers for this player
            //     const timer = this.disconnectTimers.get(targetPlayerId);
            //     if (timer) {
            //       clearTimeout(timer);
            //       this.disconnectTimers.delete(targetPlayerId);
            //     }

            // Remove from connections and players
            this.connections.delete(targetPlayerId);
            this.players.delete(targetPlayerId);
            this.room?.removePlayer(targetPlayerId);

            // Broadcast removal to all remaining players
            this.broadcast({
              type: 'PLAYER_LEFT',
              payload: { playerId: targetPlayerId },
              timestamp: Date.now(),
            });

            await this.saveState();
          } else {
            console.log(`[GameRoom] KICK BLOCKED: Cannot kick host or non-existent player`);
          }
        }
      }
    }
  }

  private async handleDisconnect(playerId: string) {
    const player = this.players.get(playerId);
    if (!player) return;

    console.log(`[GameRoom] Player ${playerId} (${player.name}) disconnecting`);

    player.updateConnectionStatus('disconnected');

    this.connections.delete(playerId);

    // Clean up message queue
    this.messageQueue.delete(playerId);

    // Then broadcast to remaining active connections
    console.log(`[GameRoom] Broadcasting PLAYER_DISCONNECTED to ${this.connections.size} players`);
    this.broadcast({
      type: 'PLAYER_DISCONNECTED',
      payload: { playerId },
      timestamp: Date.now(),
    });

    await this.saveState();

    // Don't clean up room if there's only the host left
    //     const remainingPlayerCount = this.players.size;
    //     const isLastPlayer = remainingPlayerCount === 1 && this.players.has(playerId);

    //     // If immediate leave or host leaving (but not last player), remove immediately and transfer host if needed
    //     if (immediate || (playerId === this.room?.hostPlayerId && !isLastPlayer)) {
    //       console.log(`[GameRoom] Removing player ${playerId} immediately`);

    //       const wasHost = playerId === this.room?.hostPlayerId;

    //       this.players.delete(playerId);
    //       this.room?.removePlayer(playerId);

    //       // Transfer host if needed and there are other players
    //       if (wasHost && this.players.size > 0) {
    //         const newHost = Array.from(this.players.values())[0];
    //         console.log(`[GameRoom] Transferring host to ${newHost.id} (${newHost.name})`);
    //         newHost.isHost = true;
    //         if (this.room) {
    //           this.room.hostPlayerId = newHost.id;
    //         }

    //         this.broadcast({
    //           type: 'HOST_CHANGED',
    //           payload: { newHostId: newHost.id },
    //           timestamp: Date.now(),
    //         });
    //       }

    //       this.broadcast({
    //         type: 'PLAYER_LEFT',
    //         payload: { playerId },
    //         timestamp: Date.now(),
    //       });

    //       await this.saveState();

    //       // Note: Room will be cleaned up after 1 day of inactivity via alarm
    //       if (this.players.size === 0) {
    //         console.log('[GameRoom] Last player left, but room will persist for 1 day');
    //       }

    //       return;
    //     }

    //     // Set timer to remove player after 2 minutes
    //     const timer = setTimeout(
    //       async () => {
    //         console.log(`[GameRoom] Removing player ${playerId} after timeout`);

    //         const wasHost = playerId === this.room?.hostPlayerId;

    //         this.players.delete(playerId);
    //         this.room?.removePlayer(playerId);
    //         // this.disconnectTimers.delete(playerId);

    //         // Transfer host if the disconnected player was host
    //         if (wasHost && this.players.size > 0) {
    //           const newHost = Array.from(this.players.values())[0];
    //           console.log(`[GameRoom] Transferring host to ${newHost.id} (${newHost.name})`);
    //           newHost.isHost = true;
    //           if (this.room) {
    //             this.room.hostPlayerId = newHost.id;
    //           }

    //           this.broadcast({
    //             type: 'HOST_CHANGED',
    //             payload: { newHostId: newHost.id },
    //             timestamp: Date.now(),
    //           });
    //         }

    //         // Now send PLAYER_LEFT after timeout
    //         this.broadcast({
    //           type: 'PLAYER_LEFT',
    //           payload: { playerId },
    //           timestamp: Date.now(),
    //         });

    //         await this.saveState();

    //         // Note: Room will be cleaned up after 1 day of inactivity via alarm
    //         if (this.players.size === 0) {
    //           console.log('[GameRoom] Last player left after timeout, but room will persist for 1 day');
    //         }
    //       },
    //       2 * 60 * 1000
    //     );

    //     this.disconnectTimers.set(playerId, timer);
  }

  private broadcast(message: WebSocketMessage) {
    const messageStr = JSON.stringify(message);
    console.log(`[GameRoom] Broadcasting ${message.type} to ${this.connections.size} connections`);

    let successCount = 0;
    let failCount = 0;
    const deadConnections: string[] = [];

    for (const [playerId, ws] of this.connections) {
      try {
        ws.send(messageStr);
        successCount++;
        console.log(`[GameRoom] ✓ Sent ${message.type} to ${playerId}`);
      } catch (error) {
        failCount++;
        console.error(`[GameRoom] ✗ Failed to send ${message.type} to player ${playerId}:`, error);
        deadConnections.push(playerId);
      }
    }

    // Clean up dead connections
    for (const playerId of deadConnections) {
      console.log(`[GameRoom] Removing dead connection for ${playerId}`);
      this.handleDisconnect(playerId);
    }

    console.log(`[GameRoom] Broadcast complete: ${successCount} success, ${failCount} failed`);
  }

  private broadcastToOthers(excludePlayerId: string, message: WebSocketMessage) {
    const messageStr = JSON.stringify(message);
    let sentCount = 0;
    let skippedCount = 0;
    const deadConnections: string[] = [];

    console.log(
      `[GameRoom] broadcastToOthers: Excluding ${excludePlayerId}, total connections: ${this.connections.size}`
    );

    for (const [playerId, ws] of this.connections) {
      if (playerId !== excludePlayerId) {
        try {
          ws.send(messageStr);
          sentCount++;
          console.log(`[GameRoom] ✓ Sent ${message.type} to ${playerId}`);
        } catch (error) {
          console.error(
            `[GameRoom] ✗ Failed to send ${message.type} to player ${playerId}:`,
            error
          );
          deadConnections.push(playerId);
        }
      } else {
        skippedCount++;
        console.log(`[GameRoom] ⊘ Skipped ${playerId} (excluded)`);
      }
    }

    // Clean up dead connections
    for (const playerId of deadConnections) {
      if (playerId !== excludePlayerId) {
        console.log(`[GameRoom] Removing dead connection for ${playerId}`);
        this.handleDisconnect(playerId);
      }
    }

    console.log(
      `[GameRoom] broadcastToOthers complete: ${sentCount} sent, ${skippedCount} skipped`
    );
  }

  private async saveState() {
    try {
      if (this.room) {
        await this.state.storage.put('room', this.room.toJSON());
      }
      await this.state.storage.put('players', Array.from(this.players.entries()));
      await this.state.storage.put('kickedPlayers', Array.from(this.kickedPlayers));
    } catch (error) {
      console.error('[GameRoom] Failed to save state:', error);
      throw error;
    }
  }

  private async scheduleNextHeartbeatCheck() {
    try {
      const now = Date.now();
      await this.state.storage.setAlarm(now + 10_000);
      console.log('[GameRoom] Scheduled next heartbeat check');
    } catch (error) {
      console.error('[GameRoom] Failed to schedule heartbeat check:', error);
    }
  }

  async alarm() {
    try {
      console.log('[GameRoom] Heartbeat check running');

      const now = Date.now();
      const inactivityTimeout = 30 * 1000; // 20 seconds
      const roomCleanupTimeout = 24 * 60 * 60 * 1000; // 1 day

      const playersToDisconnect: string[] = [];

      // Find the most recent activity across all players
      let mostRecentActivity = 0;
      for (const [playerId, player] of this.players.entries()) {
        const timeSinceLastActivity = now - player.lastSeenAt;

        if (player.lastSeenAt > mostRecentActivity) {
          mostRecentActivity = player.lastSeenAt;
        }

        // If player hasn't sent PING in 20 seconds and is connected, disconnect them
        if (timeSinceLastActivity > inactivityTimeout && this.connections.has(playerId)) {
          console.log(
            `[Heartbeat] Player ${playerId} (${player.name}) inactive for ${timeSinceLastActivity}ms, disconnecting`
          );
          playersToDisconnect.push(playerId);
        }
      }

      // Disconnect inactive players
      for (const playerId of playersToDisconnect) {
        await this.handleDisconnect(playerId);
      }
      await this.checkAndRemovePlayers();
      // Check if room should be cleaned up (no activity for 1 day)
      const timeSinceMostRecentActivity = now - mostRecentActivity;
      if (this.players.size > 0 && timeSinceMostRecentActivity > roomCleanupTimeout) {
        console.log(
          `[GameRoom] No activity for ${timeSinceMostRecentActivity}ms (> 1 day), cleaning up room`
        );
        await this.cleanupRoom();
        return; // Don't schedule next check after cleanup
      }

      // Schedule next check if there are still connected players
      if (this.connections.size > 0 || this.players.size > 0) {
        await this.scheduleNextHeartbeatCheck();
      } else {
        console.log('[GameRoom] No active connections or players, stopping heartbeat checks');
      }
    } catch (error) {
      console.error('[GameRoom] Error in alarm:', error);
      // Try to reschedule even if error occurred
      if (this.connections.size > 0 || this.players.size > 0) {
        await this.scheduleNextHeartbeatCheck();
      }
    }
  }

  private async cleanupRoom() {
    try {
      console.log('[GameRoom] Starting room cleanup...');

      // Close all remaining WebSocket connections
      for (const [playerId, ws] of this.connections) {
        try {
          console.log(`[GameRoom] Closing connection for ${playerId}`);
          ws.close(1000, 'Room closed');
        } catch (error) {
          console.error(`[GameRoom] Error closing connection for ${playerId}:`, error);
        }
      }
      this.connections.clear();

      // Clear message queue
      this.messageQueue.clear();

      // Clear in-memory state
      this.players.clear();
      this.kickedPlayers.clear();
      this.room = null;

      // Clear storage
      await this.state.storage.deleteAll();

      console.log('[GameRoom] Room cleaned up successfully');
    } catch (error) {
      console.error('[GameRoom] Error cleaning up room:', error);
    }
  }

  private async startGame(
    activePlayers: Player[],
    settings: {
      difficulty?: Difficulty[];
      timerDuration?: number;
      customLocations?: Array<{ locationId: string; roleIds: string[] }>;
    }
  ) {
    console.log(`[GameRoom] Starting game with ${activePlayers.length} players`);
    console.log(`[GameRoom] Settings:`, settings);

    // Select random location based on custom selection OR difficulty
    let availableLocations: any[];
    let customRolesMap: Map<string, string[]> | null = null;

    if (settings.customLocations && settings.customLocations.length > 0) {
      // Use host's custom location and role selection
      console.log(`[GameRoom] Using custom location selection:`, settings.customLocations);
      const locationIds = settings.customLocations.map((cl) => cl.locationId);
      availableLocations = locationsApiData.locations.filter((loc: any) =>
        locationIds.includes(loc.id)
      );

      // Build custom roles map
      customRolesMap = new Map();
      settings.customLocations.forEach((cl) => {
        if (cl.roleIds && cl.roleIds.length > 0) {
          customRolesMap!.set(cl.locationId, cl.roleIds);
        }
      });
    } else {
      // Fallback to difficulty-based selection
      console.log(`[GameRoom] No custom selection, using difficulty filter`);
      const difficulties = settings.difficulty || ['easy', 'medium', 'hard'];
      availableLocations = locationsApiData.locations.filter((loc: any) =>
        difficulties.includes(loc.difficulty)
      );
    }

    if (availableLocations.length === 0) {
      console.error('[GameRoom] No locations available for selected criteria');
      return;
    }

    const selectedLocationData =
      availableLocations[Math.floor(Math.random() * availableLocations.length)];
    console.log(
      `[GameRoom] Selected location: ${selectedLocationData.names?.th || selectedLocationData.nameTh} (${selectedLocationData.names?.en || selectedLocationData.id})`
    );

    // Convert API format to game format for backward compatibility
    const selectedLocation: Location = {
      id: selectedLocationData.id,
      nameTh:
        selectedLocationData.names?.th || selectedLocationData.nameTh || selectedLocationData.id,
      nameEn:
        selectedLocationData.names?.en || selectedLocationData.nameEn || selectedLocationData.id,
      difficulty: selectedLocationData.difficulty || 'medium',
      roles: selectedLocationData.roles.map((role: any) => ({
        id: role.id,
        nameTh: role.names?.th || role.id,
        nameEn: role.names?.en || role.id,
      })),
      imageUrl: selectedLocationData.imageUrl,
      names: selectedLocationData.names,
      isSelected: false,
    } as any;

    // Get custom roles for this location if available
    const customRoles = customRolesMap?.get(selectedLocation.id);
    console.log(`[GameRoom] Custom roles for ${selectedLocation.id}:`, customRoles);

    // Use GameState.assignRoles to assign roles with multi-spy support
    const playerIds = activePlayers.map((p) => p.id);
    const spyCount = this.room?.spyCount ?? 1; // Get spy count from room config
    const { assignments, spyPlayerIds } = GameState.assignRoles(
      playerIds,
      selectedLocation,
      spyCount,
      customRoles // Pass custom role selection
    );
    console.log(`[GameRoom] Assigned ${spyCount} spies:`, spyPlayerIds);

    // Create game state
    const timerDuration = settings.timerDuration || 8; // Default 8 minutes
    const gameState = new GameState(
      this.room!.code,
      1, // Round 1
      selectedLocation,
      assignments,
      spyPlayerIds, // Now array
      timerDuration
    );

    // Save game state
    this.gameState = gameState;
    await this.state.storage.put('gameState', gameState.toJSON());

    // Start timer interval (broadcast every second)
    this.startTimerInterval();

    // Broadcast GAME_STARTED to all players
    this.broadcast({
      type: 'GAME_STARTED',
      payload: {
        gameState: {
          roundNumber: gameState.roundNumber,
          timerStartedAt: gameState.timerStartedAt,
          timerEndsAt: gameState.timerEndsAt,
        },
        roundNumber: gameState.roundNumber,
      },
      timestamp: Date.now(),
    });

    // Send private ROLE_ASSIGNMENT to each player
    for (const player of activePlayers) {
      const ws = this.connections.get(player.id);
      const assignment = assignments[player.id];

      // Only send the filtered, host-selected roles (as Thai strings)
      let filteredRoleNames: string[] | undefined = undefined;
      if (assignment.location && customRoles && Array.isArray(customRoles)) {
        // Map customRoles (array of role IDs) to Thai names from selectedLocation.roles
        filteredRoleNames = customRoles
          .map((roleId) => {
            const roleObj = selectedLocation.roles.find((r) => r.id === roleId);
            return roleObj ? roleObj.nameTh : undefined;
          })
          .filter((name): name is string => !!name);
      } else if (assignment.location) {
        // Fallback: all Thai names for the location
        filteredRoleNames = selectedLocation.roles.map((r) => r.nameTh);
      }

      if (ws && assignment) {
        ws.send(
          JSON.stringify({
            type: 'ROLE_ASSIGNMENT',
            payload: {
              role: assignment.role,
              location: assignment.location,
              locationRoles: filteredRoleNames,
            },
            timestamp: Date.now(),
          })
        );
      }
    }

    console.log('[GameRoom] Game started successfully');
  }

  private startTimerInterval() {
    // Clear existing interval if any
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Broadcast timer tick every second
    this.timerInterval = setInterval(() => {
      if (!this.gameState) {
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
        }
        return;
      }

      const remainingSeconds = this.gameState.getRemainingTime();

      // Broadcast TIMER_TICK
      this.broadcast({
        type: 'TIMER_TICK',
        payload: { remainingSeconds },
        timestamp: Date.now(),
      });

      // Check if timer expired
      if (remainingSeconds <= 0) {
        console.log('[GameRoom] Timer expired, transitioning to voting phase');
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
        }
        // Transition to voting phase
        if (this.gameState) {
          this.gameState.phase = 'voting';
          this.broadcast({
            type: 'PHASE_CHANGE',
            payload: { phase: 'voting' },
            timestamp: Date.now(),
          });
        }
      }
    }, 1000);
  }

  private async endRound() {
    if (!this.gameState || !this.room) return;

    console.log('[GameRoom] Ending round');

    // Stop timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    // Tally votes
    const voteTally = this.gameState.tallyVotes();
    const eliminatedPlayerId = this.gameState.getEliminatedPlayer();

    console.log('[GameRoom] Vote tally:', voteTally);
    console.log('[GameRoom] Eliminated player:', eliminatedPlayerId);

    // Calculate results - check if eliminated player was a spy
    const wasSpyEliminated =
      eliminatedPlayerId !== null && this.gameState.spyPlayerIds.includes(eliminatedPlayerId);
    const remainingSpyIds = this.gameState.spyPlayerIds.filter((id) => id !== eliminatedPlayerId);
    const spyEscaped = remainingSpyIds.length > 0; // Any spy remaining?

    console.log('[GameRoom] Spy was eliminated:', wasSpyEliminated);
    console.log('[GameRoom] Remaining spies:', remainingSpyIds.length);
    console.log('[GameRoom] Spy escaped:', spyEscaped);

    // If spy escaped, transition to spy_guess phase
    if (spyEscaped) {
      // Broadcast voting results (no scores yet)
      this.broadcast({
        type: 'VOTING_RESULTS',
        payload: {
          voteTally,
          eliminatedPlayerId,
          spyPlayerIds: this.gameState.spyPlayerIds, // Send all spy IDs for results
          spyWasEliminated: wasSpyEliminated,
          scores: {}, // Scores will be calculated after spy guess
          location: null, // Don't reveal location yet
        },
        timestamp: Date.now(),
      });

      // Transition to spy_guess phase
      this.room.phase = 'spy_guess';
      await this.saveState();

      this.broadcast({
        type: 'PHASE_CHANGE',
        payload: { phase: 'spy_guess', reason: 'Spy escaped, awaiting guess' },
        timestamp: Date.now(),
      });

      console.log('[GameRoom] Transitioned to spy_guess phase');
      return;
    }

    // If spy was eliminated, calculate scores and end round
    const scores: Record<string, number> = {};
    const activePlayers = Array.from(this.players.values());

    for (const player of activePlayers) {
      if (this.gameState.spyPlayerIds.includes(player.id)) {
        // Spy caught: 0 points
        scores[player.id] = 0;
      } else {
        // Non-spy caught spy: +1 point
        scores[player.id] = 1;
      }
    }

    // Broadcast results
    this.broadcast({
      type: 'VOTING_RESULTS',
      payload: {
        voteTally,
        eliminatedPlayerId,
        spyPlayerIds: this.gameState.spyPlayerIds, // All spy IDs
        spyWasEliminated: true,
        scores,
        location: this.gameState.selectedLocation.nameTh,
      },
      timestamp: Date.now(),
    });

    // Change room phase to results
    this.room.phase = 'results';
    await this.saveState();

    // Start auto-reset timer (1 minute)
    if (this.resultsTimer) {
      clearTimeout(this.resultsTimer);
    }
    this.resultsTimer = setTimeout(() => {
      this.resetToLobby();
    }, 60000); // 60 seconds

    console.log('[GameRoom] Round ended, results sent, auto-reset timer started');
  }

  private async handleSpyGuess(guessedLocationId: string) {
    if (!this.gameState || !this.room) return;

    console.log('[GameRoom] Processing spy guess:', guessedLocationId);

    // Check if guess is correct
    const actualLocationId = this.gameState.selectedLocation.id;
    const wasCorrect = guessedLocationId === actualLocationId;

    console.log('[GameRoom] Guess correct:', wasCorrect);

    // Note: guessedLocationName will be the ID for now
    // The frontend will resolve it since it has the location data loaded
    const guessedLocationName = guessedLocationId;

    // Store spy guess
    this.gameState.spyGuess = guessedLocationId;
    await this.state.storage.put('gameState', this.gameState.toJSON());

    // Calculate scores based on guess
    const scores: Record<string, number> = {};
    const activePlayers = Array.from(this.players.values());

    for (const player of activePlayers) {
      if (this.gameState.spyPlayerIds.includes(player.id)) {
        // Spy scores: +2 if correct, 0 if incorrect
        scores[player.id] = wasCorrect ? 2 : 0;
      } else {
        // Non-spy scores: 0 if spy guessed correctly, +1 if spy guessed incorrectly
        scores[player.id] = wasCorrect ? 0 : 1;
      }
    }

    // Broadcast spy guess result
    this.broadcast({
      type: 'SPY_GUESS_RESULT',
      payload: {
        guessedLocationId,
        guessedLocationName,
        actualLocationId,
        actualLocationName: this.gameState.selectedLocation.nameTh,
        wasCorrect,
        scores,
      },
      timestamp: Date.now(),
    });

    // Transition to results phase
    this.room.phase = 'results';
    await this.saveState();

    // Start auto-reset timer (1 minute)
    if (this.resultsTimer) {
      clearTimeout(this.resultsTimer);
    }
    this.resultsTimer = setTimeout(() => {
      this.resetToLobby();
    }, 60000); // 60 seconds

    this.broadcast({
      type: 'PHASE_CHANGE',
      payload: { phase: 'results', reason: 'Spy guess complete' },
      timestamp: Date.now(),
    });

    console.log(
      '[GameRoom] Spy guess processed, transitioned to results, auto-reset timer started'
    );
  }

  private async resetToLobby() {
    if (!this.room) return;

    console.log('[GameRoom] Auto-resetting to lobby after results phase');

    // Stop timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    // Clear results timer
    if (this.resultsTimer) {
      clearTimeout(this.resultsTimer);
      this.resultsTimer = null;
    }

    // Clear game state
    this.gameState = null;

    // Reset room phase to lobby
    this.room.phase = 'lobby';

    // Broadcast room state reset
    this.broadcast({
      type: 'ROOM_STATE',
      payload: this.getRoomStatePayload(),
      timestamp: Date.now(),
    });

    await this.saveState();

    console.log('[GameRoom] Auto-reset to lobby complete');
  }

  // Helper method to build consistent ROOM_STATE payload with new fields
  private getRoomStatePayload() {
    return {
      players: Array.from(this.players.values()).map((p) => p.toJSON()),
      hostId: this.room?.hostPlayerId,
      phase: this.room?.phase,
      maxPlayers: this.room?.maxPlayers ?? 10, // NEW: include capacity
      currentPlayerCount: this.players.size, // NEW: current count
      spyCount: this.room?.spyCount ?? 1, // NEW: spy configuration
    };
  }
}
