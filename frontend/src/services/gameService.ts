/**
 * Game WebSocket Service
 * Handles real-time game communication via WebSocket
 */

import { wsService } from "./wsService";
import { notificationService } from "./notificationService";
import type {
  GameInvite,
  GameState,
  GameInvitePayload,
  GameStartPayload,
  GameStateUpdatePayload,
  GameEndPayload,
  PaddleMovePayload,
} from "../types/game";

type GameInviteListener = (invite: GameInvitePayload) => void;
type GameStartListener = (data: GameStartPayload) => void;
type GameStateListener = (data: GameStateUpdatePayload) => void;
type GameEndListener = (data: GameEndPayload) => void;
type GameTimeoutListener = (inviteId: string) => void;

class GameService {
  private inviteListeners: Set<GameInviteListener> = new Set();
  private startListeners: Set<GameStartListener> = new Set();
  private stateListeners: Set<GameStateListener> = new Set();
  private endListeners: Set<GameEndListener> = new Set();
  private timeoutListeners: Set<GameTimeoutListener> = new Set();

  private activeGameId: string | null = null;
  private pendingInvites: Map<string, GameInvite> = new Map();

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    console.log("[GameService] Setting up game event listeners");

    // Listen for game invitations
    wsService.on("game:invite:received", (payload: GameInvitePayload) => {
      console.log("[GameService] ✅ Invitation received:", payload);

      // Store pending invite
      const invite: GameInvite = {
        inviteId: payload.inviteId,
        inviterId: payload.inviterId,
        inviterName: payload.inviterName,
        inviterAvatar: payload.inviterAvatar,
        invitedId: payload.invitedId,
        invitedName: payload.invitedName,
        timestamp: Date.now(),
        expiresAt: payload.expiresAt,
        status: 'pending',
      };

      this.pendingInvites.set(invite.inviteId, invite);

      console.log("[GameService] Notifying", this.inviteListeners.size, "invite listeners");

      // Notify all listeners
      this.inviteListeners.forEach(listener => {
        try {
          listener(payload);
        } catch (e) {
          console.error("[GameService] Error calling invite listener:", e);
        }
      });

      // Show notification
      notificationService.info(
        `${payload.inviterName} invited you to play Ping-Pong!`,
        60000 // 60 seconds
      );
    });

    // Listen for game start
    wsService.on("game:start", (payload: GameStartPayload) => {
      console.log("[GameService] ✅ Game starting:", payload);
      this.activeGameId = payload.gameId;
      this.startListeners.forEach(listener => listener(payload));
    });

    // Listen for game state updates
    wsService.on("game:state:update", (payload: GameStateUpdatePayload) => {
      this.stateListeners.forEach(listener => listener(payload));
    });

    // Listen for game end
    wsService.on("game:end", (payload: GameEndPayload) => {
      console.log("[GameService] ✅ Game ended:", payload);
      this.activeGameId = null;
      this.endListeners.forEach(listener => listener(payload));
    });

    // Listen for invitation timeout
    wsService.on("game:timeout", (payload: { inviteId: string }) => {
      console.log("[GameService] ⏱️ Invitation timeout:", payload.inviteId);
      const invite = this.pendingInvites.get(payload.inviteId);
      if (invite) {
        invite.status = 'expired';
      }
      this.timeoutListeners.forEach(listener => listener(payload.inviteId));
    });

    console.log("[GameService] ✅ All game listeners registered");
  }

  /**
   * Send game invitation to a friend
   */
  sendInvite(friendId: string, friendName: string): string {
    console.log("[GameService] 📤 Sending game invite to:", friendName, "(" + friendId + ")");

    // Check WebSocket connection
    if (!wsService.isConnected()) {
      console.error("[GameService] ❌ WebSocket not connected! Cannot send invite.");
      notificationService.error("Connection lost. Please refresh and try again.", 4000);
      throw new Error("WebSocket not connected");
    }

    const inviteId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const invitePayload = {
      inviteId,
      invitedId: friendId,
      invitedName: friendName,
      expiresAt: Date.now() + 60000, // 1 minute timeout
    };

    console.log("[GameService] Sending invite payload:", invitePayload);

    wsService.send({
      type: "game:invite",
      payload: invitePayload
    });

    console.log("[GameService] ✅ Invitation sent:", inviteId);
    return inviteId;
  }

  /**
   * Join public matchmaking queue
   */
  joinQueue() {
    if (wsService.isConnected()) {
      console.log("[GameService] Joining queue");
      wsService.send({
        type: "join_queue",
        payload: {}
      });
    } else {
      console.log("[GameService] WebSocket not ready, attempting connect and retrying in 500ms...");
      wsService.connect().catch(err => console.error("[GameService] Connect attempt failed:", err));
      setTimeout(() => this.joinQueue(), 500);
    }
  }

  /**
   * Leave matching queue
   */
  leaveQueue() {
    console.log("[GameService] Leaving queue");
    wsService.send({
      type: "leave_queue",
      payload: {}
    });
  }

  /**
   * Accept game invitation
   */
  acceptInvite(inviteId: string) {
    const invite = this.pendingInvites.get(inviteId);
    if (invite) {
      invite.status = 'accepted';
      wsService.send({
        type: "game:accept",
        payload: { inviteId }
      });
      console.log("[Game] Accepted invitation:", inviteId);
    }
  }

  /**
   * Reject game invitation
   */
  rejectInvite(inviteId: string) {
    const invite = this.pendingInvites.get(inviteId);
    if (invite) {
      invite.status = 'rejected';
      wsService.send({
        type: "game:reject",
        payload: { inviteId }
      });
      this.pendingInvites.delete(inviteId);
      console.log("[Game] Rejected invitation:", inviteId);
    }
  }

  /**
   * Send paddle movement
   */
  /**
   * Send paddle movement
   */
  movePaddle(paddleY: number) {
    wsService.send({
      type: "move_paddle",
      payload: {
        position: paddleY,
      }
    });
  }

  /**
   * Pause game
   */
  pauseGame(gameId: string) {
    wsService.send({
      type: "game:pause",
      payload: { gameId }
    });
  }

  /**
   * Resume game
   */
  resumeGame(gameId: string) {
    wsService.send({
      type: "game:resume",
      payload: { gameId }
    });
  }

  /**
   * Exit game (forfeit)
   */
  exitGame(gameId: string) {
    wsService.send({
      type: "game:exit",
      payload: { gameId }
    });
    this.activeGameId = null;
  }

  /**
   * Listen for game invitations
   */
  onInvite(listener: GameInviteListener) {
    this.inviteListeners.add(listener);
    return () => this.inviteListeners.delete(listener);
  }

  /**
   * Listen for game start
   */
  onGameStart(listener: GameStartListener) {
    this.startListeners.add(listener);
    return () => this.startListeners.delete(listener);
  }

  /**
   * Listen for game state updates
   */
  onGameState(listener: GameStateListener) {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  /**
   * Listen for game end
   */
  onGameEnd(listener: GameEndListener) {
    this.endListeners.add(listener);
    return () => this.endListeners.delete(listener);
  }

  /**
   * Listen for invitation timeout
   */
  onTimeout(listener: GameTimeoutListener) {
    this.timeoutListeners.add(listener);
    return () => this.timeoutListeners.delete(listener);
  }

  /**
   * Get active game ID
   */
  getActiveGameId(): string | null {
    return this.activeGameId;
  }

  /**
   * Get pending invites
   */
  getPendingInvites(): GameInvite[] {
    return Array.from(this.pendingInvites.values());
  }

  /**
   * Clear expired invites
   */
  clearExpiredInvites() {
    const now = Date.now();
    for (const [id, invite] of this.pendingInvites.entries()) {
      if (invite.expiresAt < now) {
        this.pendingInvites.delete(id);
      }
    }
  }
}

export const gameService = new GameService();
