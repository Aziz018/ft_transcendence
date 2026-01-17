import { getToken } from "../lib/auth";
import { notificationService } from "./notificationService";
import API_CONFIG from "../config/api";

interface WebSocketMessage {
  type: string;
  payload?: any;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;
  private messageListeners: Map<string, (payload: any) => void> = new Map();

  constructor() {
    this.url = API_CONFIG.WS_URL;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const token = getToken();
        if (!token) {
          reject(new Error("No auth token available"));
          return;
        }

        const wsUrl = `${this.url}?token=${encodeURIComponent(token)}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log("[WebSocket] Connected");
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };

        this.ws.onerror = (error) => {
          console.error("[WebSocket] Error:", error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log("[WebSocket] Disconnected");
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage) {
    console.log("[WebSocket] Received:", message.type, message.payload);

    switch (message.type) {
      case "friend_request_received":
        this.handleFriendRequestNotification(message.payload);
        break;
      case "friend_request_accepted":
        this.handleFriendRequestAccepted(message.payload);

        const acceptedListener = this.messageListeners.get(
          "friend_request_accepted"
        );
        if (acceptedListener) {
          acceptedListener(message.payload);
        }
        break;
      case "friend_request_declined":
        this.handleFriendRequestDeclined(message.payload);

        const declinedListener = this.messageListeners.get(
          "friend_request_declined"
        );
        if (declinedListener) {
          declinedListener(message.payload);
        }
        break;
      case "game_state":
        const gameStateListener = this.messageListeners.get("game_state");
        if (gameStateListener) gameStateListener(message.payload);
        break;
      case "game_start":
        const gameStartListener = this.messageListeners.get("game_start");
        if (gameStartListener) gameStartListener(message.payload);
        break;
      case "game_over":
        const gameOverListener = this.messageListeners.get("game_over");
        if (gameOverListener) gameOverListener(message.payload);
        break;
      case "player_joined":
        const playerJoinedListener = this.messageListeners.get("player_joined");
        if (playerJoinedListener) playerJoinedListener(message.payload);
        break;
      case "notification":
        this.handleNotification(message.payload);
        break;
      default:

        const listener = this.messageListeners.get(message.type);
        if (listener) {
          listener(message.payload);
        }
    }
  }

  private handleFriendRequestNotification(payload: any) {
    console.log("[WebSocket] Friend request received:", payload);
    notificationService.friendRequest({
      requestId: payload.requestId,
      requesterName: payload.senderName,
      requesterId: payload.senderId,
      requesterAvatar: payload.senderAvatar || "",
      requesterEmail: payload.senderEmail || "",
    });
  }

  private handleFriendRequestAccepted(payload: any) {
    console.log("[WebSocket] Friend request accepted:", payload);
    notificationService.success(
      `${payload.friendName} accepted your friend request!`,
      4000
    );
  }

  private handleFriendRequestDeclined(payload: any) {
    console.log("[WebSocket] Friend request declined:", payload);
    notificationService.info(`Your friend request was declined`, 4000);
  }

  private handleNotification(payload: any) {
    console.log("[WebSocket] Notification received:", payload);
    // Use notificationService to display
    switch (payload.type) {
      case 'success': notificationService.success(payload.message, payload.duration); break;
      case 'error': notificationService.error(payload.message, payload.duration); break;
      case 'warning': notificationService.warning(payload.message, payload.duration); break;
      case 'info': default: notificationService.info(payload.message, payload.duration); break;
    }
  }

  private attemptReconnect() {

    const token = getToken();
    if (!token) {
      console.log("[WebSocket] No token available, skipping reconnection");
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `[WebSocket] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );
      setTimeout(() => {
        this.connect().catch((error) => {
          console.error("[WebSocket] Reconnection failed:", error);
        });
      }, this.reconnectDelay);
    } else {
      console.error("[WebSocket] Max reconnection attempts reached");
    }
  }

  send(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("[WebSocket] Not connected, cannot send message");
    }
  }

  on(messageType: string, listener: (payload: any) => void) {
    this.messageListeners.set(messageType, listener);

    return () => {
      this.messageListeners.delete(messageType);
    };
  }

  off(messageType: string, listener?: (payload: any) => void) {
    if (listener) {

      this.messageListeners.delete(messageType);
    } else {
      this.messageListeners.delete(messageType);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.reconnectAttempts = this.maxReconnectAttempts;
    console.log("[WebSocket] Disconnected and reconnection disabled");
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  joinGame(payload: { mode: string; tournamentId?: string }) {
    this.send({ type: "join_queue", payload });
  }

  leaveGame() {
    this.send({ type: "leave_queue" });
  }

  movePaddle(position: number) {
    this.send({ type: "move_paddle", payload: { position } });
  }

  sendGameAction(action: string, payload?: any) {
    this.send({ type: action, payload });
  }
}

export const wsService = new WebSocketService();
