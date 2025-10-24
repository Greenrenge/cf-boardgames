import { Room } from '../models/Room';
import { Player } from '../models/Player';
import type { WebSocketMessage } from '../../../lib/types';

export class GameRoom {
  private state: DurableObjectState;
  private env: any;
  private room: Room | null = null;
  private players: Map<string, Player> = new Map();
  private connections: Map<string, WebSocket> = new Map();
  private disconnectTimers: Map<string, number> = new Map();
  private heartbeatChecker: number | null = null;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
    this.startHeartbeatChecker();
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Initialize room
    if (url.pathname === '/init' && request.method === 'POST') {
      const body = await request.json();
      const { hostPlayerId, hostPlayerName, gameType } = body as any;

      this.room = new Room(url.hostname, hostPlayerId, gameType);
      const hostPlayer = new Player(hostPlayerId, hostPlayerName, url.hostname, true);
      this.players.set(hostPlayerId, hostPlayer);

      await this.state.storage.put('room', this.room.toJSON());
      await this.state.storage.put('players', Array.from(this.players.entries()));

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
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
          isJoinable: !this.room.isFull() && this.room.phase === 'lobby',
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
    if (this.room) return;

    const roomData = await this.state.storage.get('room');
    const playersData = await this.state.storage.get('players');

    if (roomData) {
      const data = roomData as any;
      this.room = Object.assign(new Room(data.code, data.hostPlayerId, data.gameType), data);
    }

    if (playersData) {
      const entries = playersData as any[];
      for (const [id, playerData] of entries) {
        const player = Object.assign(
          new Player(playerData.id, playerData.name, playerData.roomCode, playerData.isHost),
          playerData
        );
        this.players.set(id, player);
      }
    }
  }

  private handleWebSocket(ws: WebSocket) {
    ws.accept();

    let playerId: string | null = null;

    ws.addEventListener('message', async (event) => {
      try {
        const message = JSON.parse(event.data as string) as WebSocketMessage;

        if (message.type === 'JOIN') {
          playerId = message.payload.playerId;
          const playerName = message.payload.playerName;

          console.log(`[GameRoom] Player joining: ${playerId} (${playerName})`);

          // Handle duplicate names
          let uniqueName = playerName;
          let counter = 2;
          while (
            Array.from(this.players.values()).some(
              (p) => p.name === uniqueName && p.id !== playerId
            )
          ) {
            uniqueName = `${playerName} (${counter})`;
            counter++;
          }

          // Add or update player
          const isReconnecting = this.players.has(playerId);

          if (!isReconnecting) {
            const newPlayer = new Player(playerId, uniqueName, this.room!.code, false);
            this.players.set(playerId, newPlayer);
            this.room!.addPlayer(playerId);
          }

          // Store connection
          this.connections.set(playerId, ws);

          // Clear disconnect timer if exists (reconnection case)
          const timer = this.disconnectTimers.get(playerId);
          if (timer) {
            clearTimeout(timer);
            this.disconnectTimers.delete(playerId);
          }

          // Update player connection status
          const player = this.players.get(playerId)!;
          player.updateConnectionStatus('connected');

          // Save state
          await this.saveState();

          // Schedule heartbeat check if this is the first player
          if (this.connections.size === 1) {
            await this.scheduleNextHeartbeatCheck();
          }

          // Send current room state to the joining player
          ws.send(
            JSON.stringify({
              type: 'ROOM_STATE',
              payload: {
                players: Array.from(this.players.values()).map((p) => p.toJSON()),
                hostId: this.room!.hostPlayerId,
                phase: this.room!.phase,
              },
              timestamp: Date.now(),
            })
          );

          // Broadcast to OTHER players
          if (playerId) {
            if (isReconnecting) {
              // Notify others this player reconnected
              this.broadcastToOthers(playerId, {
                type: 'PLAYER_RECONNECTED',
                payload: { playerId },
                timestamp: Date.now(),
              });
            } else {
              // Notify others this is a new player
              this.broadcastToOthers(playerId, {
                type: 'PLAYER_JOINED',
                payload: { player: player.toJSON() },
                timestamp: Date.now(),
              });
            }
          }
        }

        if (message.type === 'LEAVE') {
          if (playerId) {
            this.handleDisconnect(playerId);
          }
        }

        if (message.type === 'PING') {
          if (playerId) {
            const player = this.players.get(playerId);
            if (player) {
              console.log(`[GameRoom] Received PING from ${playerId} (${player.name})`);
              player.updateActivity();
              player.updateConnectionStatus('connected');

              // Broadcast player is active to all others
              this.broadcastToOthers(playerId, {
                type: 'PLAYER_RECONNECTED',
                payload: { playerId },
                timestamp: Date.now(),
              });
            }
          }
        }

        if (message.type === 'KICK') {
          if (playerId) {
            const kicker = this.players.get(playerId);
            const targetPlayerId = (message.payload as any).targetPlayerId;

            // Only host can kick
            if (kicker?.isHost && targetPlayerId && targetPlayerId !== playerId) {
              const targetWs = this.connections.get(targetPlayerId);

              if (targetWs) {
                // Send KICKED message to target player
                targetWs.send(
                  JSON.stringify({
                    type: 'KICKED',
                    payload: { reason: 'Kicked by host' },
                    timestamp: Date.now(),
                  })
                );

                // Force disconnect
                this.handleDisconnect(targetPlayerId);

                // Immediately remove (no 2-min grace period for kicked players)
                this.players.delete(targetPlayerId);
                this.room?.removePlayer(targetPlayerId);

                // Broadcast removal
                this.broadcast({
                  type: 'PLAYER_LEFT',
                  payload: { playerId: targetPlayerId },
                  timestamp: Date.now(),
                });

                await this.saveState();
              }
            }
          }
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        ws.send(
          JSON.stringify({
            type: 'ERROR',
            payload: { code: 'INTERNAL_ERROR', message: 'Failed to process message' },
            timestamp: Date.now(),
          })
        );
      }
    });

    ws.addEventListener('close', () => {
      if (playerId) {
        this.handleDisconnect(playerId);
      }
    });

    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      if (playerId) {
        this.handleDisconnect(playerId);
      }
    });
  }

  private handleDisconnect(playerId: string) {
    const player = this.players.get(playerId);
    if (!player) return;

    console.log(`[GameRoom] Player ${playerId} (${player.name}) disconnecting`);

    player.updateConnectionStatus('disconnected');

    // IMPORTANT: Broadcast BEFORE deleting connection
    // so other players receive the message
    this.broadcast({
      type: 'PLAYER_DISCONNECTED',
      payload: { playerId },
      timestamp: Date.now(),
    });

    // Now remove the connection
    this.connections.delete(playerId);

    this.saveState();

    // Set timer to remove player after 2 minutes
    const timer = setTimeout(
      () => {
        console.log(`[GameRoom] Removing player ${playerId} after timeout`);
        this.players.delete(playerId);
        this.room?.removePlayer(playerId);
        this.disconnectTimers.delete(playerId);

        // Now send PLAYER_LEFT after timeout
        this.broadcast({
          type: 'PLAYER_LEFT',
          payload: { playerId },
          timestamp: Date.now(),
        });

        this.saveState();
      },
      2 * 60 * 1000
    );

    this.disconnectTimers.set(playerId, timer as any);
  }

  private broadcast(message: WebSocketMessage) {
    const messageStr = JSON.stringify(message);
    for (const [playerId, ws] of this.connections) {
      try {
        ws.send(messageStr);
      } catch (error) {
        console.error(`Failed to send message to player ${playerId}:`, error);
      }
    }
  }

  private broadcastToOthers(excludePlayerId: string, message: WebSocketMessage) {
    const messageStr = JSON.stringify(message);
    for (const [playerId, ws] of this.connections) {
      if (playerId !== excludePlayerId) {
        try {
          ws.send(messageStr);
        } catch (error) {
          console.error(`Failed to send message to player ${playerId}:`, error);
        }
      }
    }
  }

  private async saveState() {
    if (this.room) {
      await this.state.storage.put('room', this.room.toJSON());
    }
    await this.state.storage.put('players', Array.from(this.players.entries()));
  }

  private startHeartbeatChecker() {
    // Use Durable Object alarm for reliable periodic checks
    this.scheduleNextHeartbeatCheck();
  }

  private async scheduleNextHeartbeatCheck() {
    // Schedule alarm for 10 seconds from now
    const now = Date.now();
    await this.state.storage.setAlarm(now + 10000);
  }

  async alarm() {
    // This is called when the alarm fires
    console.log('[GameRoom] Heartbeat check running');

    const now = Date.now();
    const inactivityTimeout = 60 * 1000; // 1 minute

    const playersToDisconnect: string[] = [];

    for (const [playerId, player] of this.players.entries()) {
      const timeSinceLastActivity = now - player.lastSeenAt;

      // If player hasn't sent PING in 1 minute, disconnect them
      if (timeSinceLastActivity > inactivityTimeout && this.connections.has(playerId)) {
        console.log(
          `[Heartbeat] Player ${playerId} (${player.name}) inactive for ${timeSinceLastActivity}ms, disconnecting`
        );
        playersToDisconnect.push(playerId);
      }
    }

    // Disconnect inactive players
    for (const playerId of playersToDisconnect) {
      this.handleDisconnect(playerId);
    }

    // Schedule next check if there are still connected players
    if (this.connections.size > 0) {
      await this.scheduleNextHeartbeatCheck();
    }
  }
}
