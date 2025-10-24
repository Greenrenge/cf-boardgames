import { Room } from '../models/Room';
import { Player } from '../models/Player';
import type { WebSocketMessage } from '../../../lib/types';

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

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
  }
  private async checkAndRemovePlayers() {
    const now = Date.now();
    for (const [playerId, player] of Array.from(this.players.entries())) {
      if (player.lastSeenAt + 20_000 >= now) {
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
        payload: {
          players: Array.from(this.players.values()).map((p) => p.toJSON()),
          hostId: this.room?.hostPlayerId,
          phase: this.room?.phase,
        },
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
          maxPlayers: 10,
          phase: this.room.phase,
          isJoinable: this.players.size < 10 && this.room.phase === 'lobby',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
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
        ws.send(
          JSON.stringify({
            type: 'ROOM_STATE',
            payload: {
              players: Array.from(this.players.values()).map((p) => p.toJSON()),
              hostId: this.room.hostPlayerId,
              phase: this.room.phase,
            },
            timestamp: Date.now(),
          })
        );
        console.log(`[GameRoom] Sent ROOM_STATE to ${joiningPlayerId}`);
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
            payload: {
              players: Array.from(this.players.values()).map((p) => p.toJSON()),
              hostId: this.room.hostPlayerId,
              phase: this.room.phase,
            },
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
}
