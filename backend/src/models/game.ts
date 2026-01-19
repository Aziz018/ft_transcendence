/**
 * Game-related type definitions and interfaces
 */

export interface PlayerMoveInput {
  direction?: 'up' | 'down' | 'left' | 'right';
  position?: number;
  gameId: string;
  timestamp: number;
}

export interface GameJoinInput {
  gameId?: string;
  gameType: 'classic' | 'tournament';
}

export interface MatchmakingInput {
  action: 'join' | 'leave';
  gameType: 'classic' | 'tournament';
}

export interface GameReadyInput {
  gameId: string;
}

export interface GameResultInput {
  gameId: string;
  winnerId: string;
  score?: {
    player1: number;
    player2: number;
  };
}

export interface ScoreUpdateInput {
  gameId: string;
  playerId: string;
  currentExp: number;
  timestamp: number;
}

export interface MatchEndInput {
  gameId: string;
  player1Id: string;
  player1Exp: number;
  player2Id: string;
  player2Exp: number;
  matchDurationMs: number;
  timestamp: number;
}

export interface GameSession {
  id: string;
  players: string[];
  gameType: string;
  status: 'starting' | 'active' | 'completed';
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  isBotGame: boolean;
  expScores: Record<string, number>;
  finalScores?: Record<string, number>;
  matchStartTime: number | null;
  matchTimer: any | null;
  matchDurationMs?: number;
  MATCH_DURATION_MS: number;
  readyPlayers?: Set<string>;
  botInterval?: any;
}

export interface GameStats {
  activeConnections: number;
  gameSessions: number;
  matchmakingQueue: number;
}

// Tournament interfaces
export interface TournamentPlayer {
  id: string;
  name: string;
  joinedAt: Date;
  isEliminated: boolean;
}

export interface TournamentMatch {
  id: string;
  round: number;
  player1: TournamentPlayer | null;
  player2: TournamentPlayer | null;
  winner: TournamentPlayer | null;
  gameId: string | null;
  status: 'waiting' | 'in_progress' | 'completed';
}

export interface Tournament {
  id: string;
  name: string;
  creatorId: string;
  description?: string;
  maxPlayers: number;
  isPrivate: boolean;
  password?: string;
  status: 'waiting_for_players' | 'in_progress' | 'completed';
  players: TournamentPlayer[];
  bracket: TournamentMatch[];
  currentRound: number;
  winnerId: string | null;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface TournamentCreateInput {
  name: string;
  description?: string;
  maxPlayers: number;
  isPrivate: boolean;
  password?: string;
}

export interface TournamentJoinInput {
  password?: string;
}

export interface TournamentActionInput {
  action: 'create' | 'join' | 'leave' | 'start' | 'get_info';
  tournamentId?: string;
  tournamentData?: TournamentCreateInput | TournamentJoinInput;
}
