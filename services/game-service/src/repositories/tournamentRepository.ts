import DataBaseWrapper from '../utils/database.js';
import type { Tournament, TournamentStatus, TournamentParticipant, Match, MatchStatus } from '../generated/prisma/index.js';

/**
 * Repository for managing tournaments in the database.
 * Handles tournament creation, participant management, and bracket generation.
 */
export class TournamentRepository extends DataBaseWrapper {
  constructor() {
    super('tournament.repository');
  }

  /**
   * Creates a new tournament.
   */
  async createTournament(data: {
    name: string;
    description?: string;
    maxPlayers: number;
    ownerId: string;
    isPrivate?: boolean;
    password?: string;
  }): Promise<Tournament> {
    return this.prisma.tournament.create({
      data: {
        name: data.name,
        description: data.description,
        maxPlayers: data.maxPlayers,
        ownerId: data.ownerId,
        isPrivate: data.isPrivate || false,
        password: data.password,
      },
      include: {
        owner: true,
        participants: true,
      }
    });
  }

  /**
   * Finds a tournament by ID.
   */
  async findById(id: string): Promise<Tournament | null> {
    return this.prisma.tournament.findUnique({
      where: { id },
      include: {
        owner: true,
        participants: {
          include: {
            user: true,
          }
        },
        matches: {
          include: {
            player1: true,
            player2: true,
            winner: true,
          },
          orderBy: [
            { round: 'asc' },
            { matchNumber: 'asc' },
          ]
        }
      }
    });
  }

  /**
   * Gets all available tournaments (not finished).
   */
  async getAvailableTournaments(): Promise<Tournament[]> {
    return this.prisma.tournament.findMany({
      where: {
        status: {
          in: ['CREATED', 'WAITING', 'IN_PROGRESS']
        },
        isPrivate: false,
      },
      include: {
        owner: true,
        participants: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
  }

  /**
   * Adds a participant to a tournament.
   */
  async addParticipant(tournamentId: string, userId: string): Promise<TournamentParticipant> {
    return this.prisma.tournamentParticipant.create({
      data: {
        tournamentId,
        userId,
      },
      include: {
        user: true,
        tournament: true,
      }
    });
  }

  /**
   * Removes a participant from a tournament.
   */
  async removeParticipant(tournamentId: string, userId: string): Promise<void> {
    await this.prisma.tournamentParticipant.deleteMany({
      where: {
        tournamentId,
        userId,
      }
    });
  }

  /**
   * Updates tournament status.
   */
  async updateStatus(id: string, status: TournamentStatus): Promise<Tournament> {
    const updates: any = { status };

    if (status === 'IN_PROGRESS') {
      updates.startedAt = new Date();
    } else if (status === 'FINISHED') {
      updates.finishedAt = new Date();
    }

    return this.prisma.tournament.update({
      where: { id },
      data: updates,
    });
  }

  /**
   * Generates tournament bracket matches.
   */
  async generateBracket(tournamentId: string, playerIds: string[]): Promise<Match[]> {
    const matches: Match[] = [];
    const numPlayers = playerIds.length;
    const numMatches = Math.floor(numPlayers / 2);

    // Create first round matches
    for (let i = 0; i < numMatches; i++) {
      const match = await this.prisma.match.create({
        data: {
          tournamentId,
          round: 1,
          matchNumber: i,
          player1Id: playerIds[i * 2],
          player2Id: playerIds[i * 2 + 1],
        },
        include: {
          player1: true,
          player2: true,
        }
      });
      matches.push(match);
    }

    // Create placeholder matches for subsequent rounds
    let round = 2;
    let matchesInRound = Math.floor(numMatches / 2);

    while (matchesInRound > 0) {
      for (let i = 0; i < matchesInRound; i++) {
        const match = await this.prisma.match.create({
          data: {
            tournamentId,
            round,
            matchNumber: i,
            // Players will be filled as previous round completes
          }
        });
        matches.push(match);
      }
      round++;
      matchesInRound = Math.floor(matchesInRound / 2);
    }

    return matches;
  }

  /**
   * Updates match result and advances winner.
   */
  async recordMatchResult(data: {
    matchId: string;
    winnerId: string;
    player1Score: number;
    player2Score: number;
  }): Promise<Match> {
    const match = await this.prisma.match.update({
      where: { id: data.matchId },
      data: {
        winnerId: data.winnerId,
        player1Score: data.player1Score,
        player2Score: data.player2Score,
        status: 'FINISHED',
        finishedAt: new Date(),
      },
      include: {
        tournament: true,
        player1: true,
        player2: true,
        winner: true,
      }
    });

    // Advance winner to next round
    const nextMatch = await this.prisma.match.findFirst({
      where: {
        tournamentId: match.tournamentId,
        round: match.round + 1,
        matchNumber: Math.floor(match.matchNumber / 2),
      }
    });

    if (nextMatch) {
      // Assign winner to next match
      const isPlayer1Slot = match.matchNumber % 2 === 0;
      await this.prisma.match.update({
        where: { id: nextMatch.id },
        data: isPlayer1Slot
          ? { player1Id: data.winnerId }
          : { player2Id: data.winnerId }
      });
    } else {
      // This was the final match, update tournament winner
      await this.prisma.tournament.update({
        where: { id: match.tournamentId },
        data: {
          winnerId: data.winnerId,
          status: 'FINISHED',
          finishedAt: new Date(),
        }
      });

      // Update winner's stats
      await this.prisma.playerStats.update({
        where: { userId: data.winnerId },
        data: {
          tournamentsWon: { increment: 1 },
        }
      });
    }

    return match;
  }

  /**
   * Gets current active match for a tournament.
   */
  async getCurrentMatches(tournamentId: string, round: number): Promise<Match[]> {
    return this.prisma.match.findMany({
      where: {
        tournamentId,
        round,
        status: {
          in: ['PENDING', 'IN_PROGRESS']
        }
      },
      include: {
        player1: true,
        player2: true,
      }
    });
  }

  /**
   * Updates participant elimination status.
   */
  async eliminateParticipant(tournamentId: string, userId: string, placement: number): Promise<void> {
    await this.prisma.tournamentParticipant.update({
      where: {
        tournamentId_userId: {
          tournamentId,
          userId,
        }
      },
      data: {
        isEliminated: true,
        placement,
      }
    });
  }
}

export default new TournamentRepository();
