import type { WebSocketMessage, WebSocketMessageType } from './types';

type MessageHandler = (message: WebSocketMessage) => void;

interface WebSocketClientOptions {
  url: string;
  playerId: string;
  playerName: string;
  roomCode: string;
  onMessage: MessageHandler;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private options: WebSocketClientOptions;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageQueue: WebSocketMessage[] = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(options: WebSocketClientOptions) {
    this.options = options;
  }

  connect() {
    try {
      this.ws = new WebSocket(this.options.url);

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;

        // Send JOIN message
        this.send('JOIN', {
          playerId: this.options.playerId,
          playerName: this.options.playerName,
          roomCode: this.options.roomCode,
        });

        // Flush queued messages
        while (this.messageQueue.length > 0) {
          const message = this.messageQueue.shift();
          if (message) {
            this.ws?.send(JSON.stringify(message));
          }
        }

        // Start heartbeat
        this.startHeartbeat();

        this.options.onOpen?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          console.log('[WebSocket] Received:', message.type, message.payload);
          this.options.onMessage(message);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
        this.stopHeartbeat();
        this.options.onClose?.();
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        this.options.onError?.(error);
      };
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error);
      this.attemptReconnect();
    }
  }

  send<T>(type: WebSocketMessageType, payload: T) {
    const message: WebSocketMessage<T> = {
      type,
      payload,
      timestamp: Date.now(),
      playerId: this.options.playerId,
    };

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      console.log('[WebSocket] Sent:', type, payload);
    } else {
      // Queue message for when connection is restored
      console.log('[WebSocket] Queued:', type);
      this.messageQueue.push(message);
    }
  }

  disconnect() {
    this.stopHeartbeat();

    if (this.ws) {
      this.send('LEAVE', {});
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      console.log('[WebSocket] Attempting to reconnect...');
      this.connect();
    }, delay);
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send('PING', {});
      }
    }, 5000); // 5 seconds for active heartbeat
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

export function createWebSocketClient(options: WebSocketClientOptions): WebSocketClient {
  return new WebSocketClient(options);
}
