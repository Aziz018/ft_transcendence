/**
 * Game Types and Interfaces
 * Defines all game-related types for Ping-Pong game system
 */

export type GameStatus = 
  | 'waiting'     // Waiting in lobby for opponent
  | 'starting'    // Game is about to start (countdown)
  | 'playing'     // Active game
  | 'paused'      // Game paused by player
  | 'finished'    // Game ended
  | 'cancelled';  // Game cancelled/rejected

export type PlayerType = 'player' | 'bot';

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  type: PlayerType;
  ready: boolean;
}

export interface Ball {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  speed: number;
}

export interface Paddle {
  y: number;
  height: number;
  velocity: number;
}

export interface GameState {
  id: string;
  status: GameStatus;
  player1: Player;
  player2: Player;
  ball: Ball;
  paddle1: Paddle;
  paddle2: Paddle;
  maxScore: number;
  startTime?: number;
  endTime?: number;
  winner?: string;
}

export interface GameInvite {
  inviteId: string;
  inviterId: string;
  inviterName: string;
  inviterAvatar?: string;
  invitedId: string;
  invitedName: string;
  timestamp: number;
  expiresAt: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export interface GameResult {
  gameId: string;
  winnerId: string;
  winnerName: string;
  winnerScore: number;
  loserId: string;
  loserName: string;
  loserScore: number;
  xpGained: number;
  playedAt: number;
}

// WebSocket Game Messages
export interface GameMessage {
  type: GameMessageType;
  payload: any;
}

export type GameMessageType =
  | 'game:invite'           // Send game invitation
  | 'game:invite:received'  // Receive game invitation
  | 'game:accept'           // Accept invitation
  | 'game:reject'           // Reject invitation
  | 'game:start'            // Game starts
  | 'game:state:update'     // Game state update
  | 'game:paddle:move'      // Player moves paddle
  | 'game:pause'            // Pause game
  | 'game:resume'           // Resume game
  | 'game:exit'             // Exit game (forfeit)
  | 'game:end'              // Game ended
  | 'game:timeout';         // Invitation timeout

export interface GameInvitePayload {
  inviteId: string;
  inviterId: string;
  inviterName: string;
  inviterAvatar?: string;
  invitedId: string;
  invitedName: string;
  expiresAt: number;
}

export interface GameStartPayload {
  gameId: string;
  player1: Player;
  player2: Player;
}

export interface GameStateUpdatePayload {
  gameId: string;
  state: GameState;
}

export interface PaddleMovePayload {
  gameId: string;
  playerId: string;
  paddleY: number;
}

export interface GameEndPayload {
  gameId: string;
  winnerId: string;
  winnerScore: number;
  loserId: string;
  loserScore: number;
  scoreDifference: number;
  xpGained: number;
}
