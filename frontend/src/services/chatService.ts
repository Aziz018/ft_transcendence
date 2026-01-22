/**
 * Chat Service - Clean Real-Time Chat Implementation
 * Handles all chat-related API calls and WebSocket messages
 */

import API_CONFIG from "../config/api";

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId?: string;
  roomId?: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface Friend {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status?: string;
}

interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

type MessageListener = (message: Message) => void;
type OnlineStatusListener = (userId: string, isOnline: boolean) => void;

class ChatService {
  private baseUrl: string;
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private messageListeners: Set<MessageListener> = new Set();
  private onlineStatusListeners: Set<OnlineStatusListener> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.wsUrl = API_CONFIG.WS_URL;
  }

  /**
   * Connect to WebSocket for real-time messages
   */
  connectWebSocket(token: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log("[ChatService] WebSocket already connected");
      return;
    }

    try {
      this.ws = new WebSocket(`${this.wsUrl}?token=${token}`);

      this.ws.onopen = () => {
        console.log("[ChatService] WebSocket connected");
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error(
            "[ChatService] Failed to parse WebSocket message:",
            error
          );
        }
      };

      this.ws.onerror = (error) => {
        console.error("[ChatService] WebSocket error:", error);
      };

      this.ws.onclose = () => {
        console.log("[ChatService] WebSocket disconnected");
        this.attemptReconnect(token);
      };
    } catch (error) {
      console.error("[ChatService] Failed to connect WebSocket:", error);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(data: any): void {
    console.log("[ChatService] Received message:", data);

    switch (data.type) {
      case "receive_message":
      case "direct_message":
      case "message":
        // Ensure the payload matches the Message interface
        const message = data.payload;
        // If sender info is missing but senderId is present, we might need to fetch it or rely on frontend to handle it
        // The backend now sends senderName and senderAvatar in payload, so we can construct sender object if needed
        if (!message.sender && message.senderName) {
          message.sender = {
            id: message.senderId,
            name: message.senderName,
            avatar: message.senderAvatar
          };
        }
        this.notifyMessageListeners(message);
        break;

      case "user_status_changed":
        this.notifyOnlineStatusListeners(
          data.payload.userId,
          data.payload.isOnline
        );
        break;

      default:
        console.log("[ChatService] Unhandled message type:", data.type);
    }
  }

  /**
   * Attempt to reconnect WebSocket
   */
  private attemptReconnect(token: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("[ChatService] Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `[ChatService] Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.connectWebSocket(token);
    }, this.reconnectDelay);
  }

  /**
   * Disconnect WebSocket
   */
  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageListeners.clear();
    this.onlineStatusListeners.clear();
  }

  /**
   * Subscribe to new messages
   */
  onMessage(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  /**
   * Subscribe to online status changes
   */
  onOnlineStatus(listener: OnlineStatusListener): () => void {
    this.onlineStatusListeners.add(listener);
    return () => this.onlineStatusListeners.delete(listener);
  }

  /**
   * Notify all message listeners
   */
  private notifyMessageListeners(message: Message): void {
    this.messageListeners.forEach((listener) => {
      try {
        listener(message);
      } catch (error) {
        console.error("[ChatService] Error in message listener:", error);
      }
    });
  }

  /**
   * Notify all online status listeners
   */
  private notifyOnlineStatusListeners(userId: string, isOnline: boolean): void {
    this.onlineStatusListeners.forEach((listener) => {
      try {
        listener(userId, isOnline);
      } catch (error) {
        console.error("[ChatService] Error in online status listener:", error);
      }
    });
  }

  /**
   * Fetch messages between two users
   */
  async getMessages(
    friendId: string,
    token: string,
    limit = 50,
    offset = 0
  ): Promise<Message[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/v1/message/direct?friend_uid=${friendId}&limit=${limit}&offset=${offset}`,
        {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error("[ChatService] Failed to fetch messages:", error);
      throw error;
    }
  }

  /**
   * Send a message to a friend
   */
  async sendMessage(
    receiverId: string,
    content: string,
    token: string
  ): Promise<Message> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/message/send`, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiver_uid: receiverId,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error("[ChatService] Failed to send message:", error);
      throw error;
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/message`, {
        method: "DELETE",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message_id: messageId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete message: ${response.statusText}`);
      }
    } catch (error) {
      console.error("[ChatService] Failed to delete message:", error);
      throw error;
    }
  }

  /**
   * Get friend list
   */
  async getFriends(token: string): Promise<Friend[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/friend/friends`, {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch friends: ${response.statusText}`);
      }

      const friendIds: string[] = await response.json();
      console.log("[ChatService] Friend IDs from backend:", friendIds);

      if (!Array.isArray(friendIds) || friendIds.length === 0) {
        return [];
      }

      const friendPromises = friendIds.map(async (friendId) => {
        try {
          const userResponse = await fetch(
            `${this.baseUrl}/v1/user/${friendId}`,
            {
              headers: {
                "ngrok-skip-browser-warning": "true",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!userResponse.ok) {
            console.error(
              `[ChatService] Failed to fetch user ${friendId}:`,
              userResponse.statusText
            );
            return null;
          }

          const userData = await userResponse.json();
          return {
            id: userData.id || friendId,
            name: userData.name || "Unknown User",
            email: userData.email || "",
            avatar: userData.avatar,
            status: userData.status || "OFFLINE", // Include status from backend
          } as Friend;
        } catch (error) {
          console.error(
            `[ChatService] Error fetching user ${friendId}:`,
            error
          );
          return null;
        }
      });

      const friends = await Promise.all(friendPromises);
      const validFriends = friends.filter(
        (friend): friend is Friend => friend !== null
      );

      console.log("[ChatService] Fetched friends:", validFriends);
      return validFriends;
    } catch (error) {
      console.error("[ChatService] Failed to fetch friends:", error);
      return [];
    }
  }

  /**
   * Get pending friend requests
   */
  async getFriendRequests(token: string): Promise<FriendRequest[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/friend/incoming`, {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch friend requests: ${response.statusText}`);
      }

      const requests = await response.json();
      return requests || [];
    } catch (error) {
      console.error("[ChatService] Failed to fetch friend requests:", error);
      return [];
    }
  }

  /**
   * Block a user
   */
  async blockUser(userId: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/friend/block`, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blocked_user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to block user: ${response.statusText}`);
      }
    } catch (error) {
      console.error("[ChatService] Failed to block user:", error);
      throw error;
    }
  }

  /**
   * Unfriend a user
   */
  async unfriend(userId: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/friend/unfriend`, {
        method: "DELETE",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          friend_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to unfriend user: ${response.statusText}`);
      }
    } catch (error) {
      console.error("[ChatService] Failed to unfriend user:", error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
export type { Message, Friend, FriendRequest };
