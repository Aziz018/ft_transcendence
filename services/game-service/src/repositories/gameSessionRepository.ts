import DataBaseWrapper from '../utils/database.js';
import type { GameSession, GameType, GameStatus, User } from '../generated/prisma/index.js';

/**
 * Repository for managing game sessions in the database.
 * Handles CRUD operations for individual game sessions.
 */
export class GameSessionRepository extends DataBaseWrapper {
  constructor() {
    super('game-session.repository');
  }

  /**
   * Creates a new game session.
   */
  async createGameSession(data: {
    gameType: GameType;
    player1Id?: string;
    player2Id?: string;
    tournamentId?: string;
    matchId?: string;
  }): Promise<GameSession> {
    return this.prisma.gameSession.create({
      data: {
        gameType: data.gameType,
        player1Id: data.player1Id,
        player2Id: data.player2Id,
        tournamentId: data.tournamentId,
        matchId: data.matchId,
      },
      include: {
        player1: true,
        player2: true,
      }
    });
  }

  /**
   * Finds a game session by ID.
   */
  async findById(id: string): Promise<GameSession | null> {
    return this.prisma.gameSession.findUnique({
      where: { id },
      include: {
        player1: true,
        player2: true,
        winner: true,
        tournament: true,
      }
    });
  }

  /**
   * Updates a game session's status.
   */
  async updateStatus(id: string, status: GameStatus): Promise<GameSession> {
    const updates: any = { status };

    if (status === 'IN_PROGRESS') {
      updates.startedAt = new Date();
    } else if (status === 'COMPLETED') {
      updates.completedAt = new Date();
    }

    return this.prisma.gameSession.update({
      where: { id },
      data: updates,
    });
  }

  /**
   * Records the final result of a game session.
   */
  async recordResult(data: {
    gameId: string;
    winnerId: string | null;
    player1Score: number;
    player2Score: number;
    player1Exp?: number;
    player2Exp?: number;
    durationMs: number;
  }): Promise<GameSession> {
    const gameSession = await this.prisma.gameSession.update({
      where: { id: data.gameId },
      data: {
        status: 'COMPLETED',
        winnerId: data.winnerId,
        player1Score: data.player1Score,
        player2Score: data.player2Score,
        player1Exp: data.player1Exp,
        player2Exp: data.player2Exp,
        durationMs: data.durationMs,
        completedAt: new Date(),
      },
      include: {
        player1: true,
        player2: true,
        winner: true,
      }
    });

    // Create game history record
    if (gameSession.player1 && gameSession.player2) {
      await this.prisma.gameHistory.create({
        data: {
          gameSessionId: data.gameId,
          gameType: gameSession.gameType,
          player1Id: gameSession.player1Id!,
          player2Id: gameSession.player2Id!,
          player1Name: gameSession.player1.name,
          player2Name: gameSession.player2.name,
          winnerId: data.winnerId,
          player1Score: data.player1Score,
          player2Score: data.player2Score,
          durationMs: data.durationMs,
        }
      });

      // Update player stats
      await this.updatePlayerStats(gameSession.player1Id!, data.winnerId === gameSession.player1Id, data.durationMs);
      await this.updatePlayerStats(gameSession.player2Id!, data.winnerId === gameSession.player2Id, data.durationMs);
    }

    return gameSession;
  }

  /**
   * Updates player statistics after a game.
   */
  private async updatePlayerStats(userId: string, isWin: boolean, durationMs: number): Promise<void> {
    const stats = await this.prisma.playerStats.findUnique({
      where: { userId }
    });

    if (!stats) {
      // Create new stats record
      await this.prisma.playerStats.create({
        data: {
          userId,
          totalGames: 1,
          totalWins: isWin ? 1 : 0,
          totalLosses: isWin ? 0 : 1,
          winStreak: isWin ? 1 : 0,
          bestWinStreak: isWin ? 1 : 0,
          averageGameDuration: durationMs,
        }
      });
    } else {
      // Update existing stats
      const newWinStreak = isWin ? stats.winStreak + 1 : 0;
      await this.prisma.playerStats.update({
        where: { userId },
        data: {
          totalGames: { increment: 1 },
          totalWins: isWin ? { increment: 1 } : undefined,
          totalLosses: !isWin ? { increment: 1 } : undefined,
          winStreak: newWinStreak,
          bestWinStreak: Math.max(stats.bestWinStreak, newWinStreak),
          averageGameDuration: Math.floor(
            (stats.averageGameDuration * stats.totalGames + durationMs) / (stats.totalGames + 1)
          ),
        }
      });
    }
  }

  /**
   * Gets recent games for a player.
   */
  async getPlayerRecentGames(userId: string, limit: number = 10): Promise<any[]> {
    return this.prisma.gameHistory.findMany({
      where: {
        OR: [
          { player1Id: userId },
          { player2Id: userId },
        ]
      },
      orderBy: { playedAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Gets player statistics.
   */
  async getPlayerStats(userId: string): Promise<any> {
    let stats = await this.prisma.playerStats.findUnique({
      where: { userId }
    });

    if (!stats) {
      // Create default stats if not exists
      stats = await this.prisma.playerStats.create({
        data: { userId }
      });
    }

    return stats;
  }

  /**
   * Gets the leaderboard sorted by wins.
   */
  async getLeaderboard(limit: number = 50): Promise<any[]> {
    return this.prisma.playerStats.findMany({
      orderBy: [
        { totalWins: 'desc' },
        { totalGames: 'desc' },
      ],
      take: limit,
    });
  }
}

export default new GameSessionRepository();
