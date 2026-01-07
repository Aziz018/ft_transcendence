import { prisma } from "../utils/prisma.js";
import type { FastifyReply, FastifyRequest } from "fastify";

interface CreateTournamentBody {
  name: string;
  maxPlayers: number;
}

interface InviteFriendsBody {
  friendIds: string[];
}

interface AcceptInviteParams {
  tournamentId: string;
}

interface TournamentParams {
  tournamentId: string;
}

/**
 * Create a new tournament
 * User becomes the owner
 * MaxPlayers must be 4, 8, or 16
 */
export const createTournamentController = async (
  request: FastifyRequest<{ Body: CreateTournamentBody }>,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { name, maxPlayers } = request.body;
    const userId = (request.user as any)?.uid;

    if (!userId) {
      request.log.error("User ID not found in request");
      return reply.code(401).send({ error: "Unauthorized" });
    }

    // Validate maxPlayers
    if (![4, 8, 16].includes(maxPlayers)) {
      return reply.code(400).send({
        error: "Invalid max players",
        message: "Max players must be 4, 8, or 16",
      });
    }

    // Validate name
    if (!name || name.trim().length === 0) {
      return reply.code(400).send({
        error: "Invalid tournament name",
      });
    }

    request.log.info(`Creating tournament: ${name} with ${maxPlayers} players for user ${userId}`);

    // Create tournament
    const tournament = await prisma.tournament.create({
      data: {
        name: name.trim(),
        maxPlayers,
        ownerId: userId,
        status: "CREATED",
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    request.log.info(`Tournament created with ID: ${tournament.id}`);

    // Auto-add creator as first participant
    await prisma.tournamentParticipant.create({
      data: {
        tournamentId: tournament.id,
        userId,
      },
    });

    request.log.info(`Added creator as participant`);

    reply.code(201).send({
      message: "Tournament created successfully",
      tournament: {
        ...tournament,
        participantCount: 1,
      },
    });
  } catch (error) {
    request.log.error({ error }, "Failed to create tournament");
    reply.code(500).send({
      error: "Internal Server Error",
      message: "Failed to create tournament",
    });
  }
};

/**
 * Invite friends to tournament
 * Only tournament owner can invite
 */
export const inviteFriendsController = async (
  request: FastifyRequest<{ Params: TournamentParams; Body: InviteFriendsBody }>,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { tournamentId } = request.params;
    const { friendIds } = request.body;
    const userId = (request.user as any)?.uid;

    if (!userId) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    // Get tournament
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        participants: true,
        invites: true,
      },
    });

    if (!tournament) {
      return reply.code(404).send({ error: "Tournament not found" });
    }

    // Check if user is owner
    if (tournament.ownerId !== userId) {
      return reply.code(403).send({ error: "Only tournament owner can invite players" });
    }

    // Check tournament status
    if (tournament.status !== "CREATED" && tournament.status !== "WAITING") {
      return reply.code(400).send({ error: "Cannot invite to started or finished tournament" });
    }

    // Check if tournament is full
    const currentParticipants = tournament.participants.length;
    if (currentParticipants >= tournament.maxPlayers) {
      return reply.code(400).send({ error: "Tournament is full" });
    }

    // Validate friendIds
    if (!friendIds || !Array.isArray(friendIds) || friendIds.length === 0) {
      return reply.code(400).send({ error: "No friends selected" });
    }

    // Get user's accepted friends
    const acceptedFriends = await prisma.friendRequest.findMany({
      where: {
        status: "ACCEPTED",
        OR: [
          { requesterId: userId },
          { requestedId: userId },
        ],
      },
    });

    const friendUserIds = acceptedFriends.map(fr =>
      fr.requesterId === userId ? fr.requestedId : fr.requesterId
    );

    // Filter only valid friends
    const validFriendIds = friendIds.filter(id => friendUserIds.includes(id));

    if (validFriendIds.length === 0) {
      return reply.code(400).send({ error: "No valid friends to invite" });
    }

    // Check if space available
    const spotsLeft = tournament.maxPlayers - currentParticipants;
    const invitesToSend = validFriendIds.slice(0, spotsLeft);

    // Create invites (skip already invited/participating)
    const existingInvites = tournament.invites.map(inv => inv.userId);
    const existingParticipants = tournament.participants.map(p => p.userId);
    const existingUsers = new Set([...existingInvites, ...existingParticipants]);

    const newInvites = invitesToSend.filter(id => !existingUsers.has(id));

    const createdInvites = await Promise.all(
      newInvites.map(friendId =>
        prisma.tournamentInvite.create({
          data: {
            tournamentId,
            userId: friendId,
            status: "PENDING",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            tournament: {
              select: {
                id: true,
                name: true,
                maxPlayers: true,
              },
            },
          },
        })
      )
    );

    reply.code(200).send({
      message: `${createdInvites.length} invitations sent`,
      invites: createdInvites,
    });
  } catch (error) {
    request.log.error({ error }, "Failed to invite friends");
    reply.code(500).send({
      error: "Internal Server Error",
      message: "Failed to send invitations",
    });
  }
};

/**
 * Accept tournament invite
 */
export const acceptInviteController = async (
  request: FastifyRequest<{ Params: AcceptInviteParams }>,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { tournamentId } = request.params;
    const userId = (request.user as any)?.uid;

    if (!userId) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    // Find invite
    const invite = await prisma.tournamentInvite.findUnique({
      where: {
        tournamentId_userId: {
          tournamentId,
          userId,
        },
      },
      include: {
        tournament: {
          include: {
            participants: true,
          },
        },
      },
    });

    if (!invite) {
      return reply.code(404).send({ error: "Invite not found" });
    }

    if (invite.status !== "PENDING") {
      return reply.code(400).send({ error: "Invite already responded to" });
    }

    if (invite.tournament.status !== "CREATED" && invite.tournament.status !== "WAITING") {
      return reply.code(400).send({ error: "Tournament already started or finished" });
    }

    // Check if tournament is full
    if (invite.tournament.participants.length >= invite.tournament.maxPlayers) {
      return reply.code(400).send({ error: "Tournament is full" });
    }

    // Accept invite and add participant
    await prisma.$transaction([
      prisma.tournamentInvite.update({
        where: {
          tournamentId_userId: {
            tournamentId,
            userId,
          },
        },
        data: {
          status: "ACCEPTED",
          respondedAt: new Date(),
        },
      }),
      prisma.tournamentParticipant.create({
        data: {
          tournamentId,
          userId,
        },
      }),
    ]);

    // Update tournament status to WAITING if not already
    if (invite.tournament.status === "CREATED") {
      await prisma.tournament.update({
        where: { id: tournamentId },
        data: { status: "WAITING" },
      });
    }

    // Get updated tournament
    const updatedTournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        owner: {
          select: { id: true, name: true, avatar: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
    });

    reply.code(200).send({
      message: "Invite accepted successfully",
      tournament: updatedTournament,
    });
  } catch (error) {
    request.log.error({ error }, "Failed to accept invite");
    reply.code(500).send({
      error: "Internal Server Error",
      message: "Failed to accept invite",
    });
  }
};

/**
 * Decline tournament invite
 */
export const declineInviteController = async (
  request: FastifyRequest<{ Params: AcceptInviteParams }>,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { tournamentId } = request.params;
    const userId = (request.user as any)?.uid;

    if (!userId) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    // Update invite status
    const invite = await prisma.tournamentInvite.updateMany({
      where: {
        tournamentId,
        userId,
        status: "PENDING",
      },
      data: {
        status: "DECLINED",
        respondedAt: new Date(),
      },
    });

    if (invite.count === 0) {
      return reply.code(404).send({ error: "Pending invite not found" });
    }

    reply.code(200).send({
      message: "Invite declined",
    });
  } catch (error) {
    request.log.error({ error }, "Failed to decline invite");
    reply.code(500).send({
      error: "Internal Server Error",
      message: "Failed to decline invite",
    });
  }
};

/**
 * Generate bracket matches for single-elimination tournament
 */
function generateBracket(participantIds: string[], tournamentId: string): any[] {
  const numPlayers = participantIds.length;
  const numRounds = Math.ceil(Math.log2(numPlayers));
  const matches: any[] = [];

  // Round 1 - pair up all players
  const currentRoundPlayers = [...participantIds];
  
  // Shuffle for fairness (optional - can implement seeding later)
  for (let i = currentRoundPlayers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = currentRoundPlayers[i]!;
    currentRoundPlayers[i] = currentRoundPlayers[j]!;
    currentRoundPlayers[j] = temp;
  }

  let round = 1;
  let matchNumber = 0;

  // Generate first round matches
  for (let i = 0; i < currentRoundPlayers.length; i += 2) {
    const player1 = currentRoundPlayers[i];
    const player2 = currentRoundPlayers[i + 1] || null; // Handle odd number (gets bye)

    matches.push({
      tournamentId,
      round,
      matchNumber,
      player1Id: player1,
      player2Id: player2,
      status: player2 ? "PENDING" : "FINISHED", // If no player2, player1 gets automatic bye
      winnerId: player2 ? null : player1,
    });

    matchNumber++;
  }

  // Generate placeholder matches for subsequent rounds
  while (round < numRounds) {
    round++;
    const numMatchesInRound = Math.ceil(matchNumber / 2);
    matchNumber = 0;

    for (let i = 0; i < numMatchesInRound; i++) {
      matches.push({
        tournamentId,
        round,
        matchNumber,
        player1Id: null,
        player2Id: null,
        status: "PENDING",
        winnerId: null,
      });
      matchNumber++;
    }
  }

  return matches;
}

/**
 * Start tournament
 * Only owner can start when tournament is full
 */
export const startTournamentController = async (
  request: FastifyRequest<{ Params: TournamentParams }>,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { tournamentId } = request.params;
    const userId = (request.user as any)?.uid;

    if (!userId) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    // Get tournament with participants
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        participants: true,
        matches: true,
      },
    });

    if (!tournament) {
      return reply.code(404).send({ error: "Tournament not found" });
    }

    // Check if user is owner
    if (tournament.ownerId !== userId) {
      return reply.code(403).send({ error: "Only tournament owner can start" });
    }

    // Check status
    if (tournament.status !== "WAITING" && tournament.status !== "CREATED") {
      return reply.code(400).send({ error: "Tournament already started or finished" });
    }

    // Check if enough players
    if (tournament.participants.length < 2) {
      return reply.code(400).send({ error: "Not enough players to start tournament" });
    }

    // Check if tournament is full (optional strict requirement)
    // if (tournament.participants.length !== tournament.maxPlayers) {
    //   return reply.code(400).send({ error: "Tournament must be full to start" });
    // }

    // Generate bracket
    const participantIds = tournament.participants.map(p => p.userId);
    const bracketMatches = generateBracket(participantIds, tournamentId);

    // Start transaction to create matches and update tournament
    await prisma.$transaction([
      // Create all matches
      prisma.match.createMany({
        data: bracketMatches,
      }),
      // Update tournament status
      prisma.tournament.update({
        where: { id: tournamentId },
        data: {
          status: "IN_PROGRESS",
          currentRound: 1,
          startedAt: new Date(),
        },
      }),
    ]);

    // Get updated tournament with matches
    const updatedTournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        owner: {
          select: { id: true, name: true, avatar: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        matches: {
          include: {
            player1: {
              select: { id: true, name: true, avatar: true },
            },
            player2: {
              select: { id: true, name: true, avatar: true },
            },
            winner: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: [
            { round: "asc" },
            { matchNumber: "asc" },
          ],
        },
      },
    });

    // Broadcast tournament start via WebSocket

    reply.code(200).send({
      message: "Tournament started successfully",
      tournament: updatedTournament,
    });
  } catch (error) {
    request.log.error({ error }, "Failed to start tournament");
    reply.code(500).send({
      error: "Internal Server Error",
      message: "Failed to start tournament",
    });
  }
};

/**
 * Get tournament details
 */
export const getTournamentController = async (
  request: FastifyRequest<{ Params: TournamentParams }>,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { tournamentId } = request.params;

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        owner: {
          select: { id: true, name: true, avatar: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        invites: {
          where: { status: "PENDING" },
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        matches: {
          include: {
            player1: {
              select: { id: true, name: true, avatar: true },
            },
            player2: {
              select: { id: true, name: true, avatar: true },
            },
            winner: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: [
            { round: "asc" },
            { matchNumber: "asc" },
          ],
        },
      },
    });

    if (!tournament) {
      return reply.code(404).send({ error: "Tournament not found" });
    }

    reply.code(200).send({ tournament });
  } catch (error) {
    request.log.error({ error }, "Failed to get tournament");
    reply.code(500).send({
      error: "Internal Server Error",
      message: "Failed to retrieve tournament",
    });
  }
};

/**
 * Get user's tournaments
 */
export const getUserTournamentsController = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const userId = (request.user as any)?.uid;

    if (!userId) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const tournaments = await prisma.tournament.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { participants: { some: { userId } } },
        ],
      },
      include: {
        owner: {
          select: { id: true, name: true, avatar: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        _count: {
          select: { matches: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    reply.code(200).send({ tournaments });
  } catch (error) {
    request.log.error({ error }, "Failed to get tournaments");
    reply.code(500).send({
      error: "Internal Server Error",
      message: "Failed to retrieve tournaments",
    });
  }
};

/**
 * Get user's pending invites
 */
export const getPendingInvitesController = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const userId = (request.user as any)?.uid;

    if (!userId) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const invites = await prisma.tournamentInvite.findMany({
      where: {
        userId,
        status: "PENDING",
      },
      include: {
        tournament: {
          include: {
            owner: {
              select: { id: true, name: true, avatar: true },
            },
            participants: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    reply.code(200).send({ invites });
  } catch (error) {
    request.log.error({ error }, "Failed to get invites");
    reply.code(500).send({
      error: "Internal Server Error",
      message: "Failed to retrieve invites",
    });
  }
};

/**
 * Report match result
 * This would integrate with your game system
 */
export const reportMatchResultController = async (
  request: FastifyRequest<{ Params: { matchId: string }; Body: { winnerId: string } }>,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { matchId } = request.params;
    const { winnerId } = request.body;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: {
          include: {
            matches: {
              orderBy: [
                { round: "asc" },
                { matchNumber: "asc" },
              ],
            },
          },
        },
      },
    });

    if (!match) {
      return reply.code(404).send({ error: "Match not found" });
    }

    // Validate winner is one of the players
    if (winnerId !== match.player1Id && winnerId !== match.player2Id) {
      return reply.code(400).send({ error: "Invalid winner" });
    }

    // Update match
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        winnerId,
        status: "FINISHED",
        finishedAt: new Date(),
      },
    });

    // Advance winner to next round
    const currentRound = match.round;
    const currentMatchNumber = match.matchNumber;
    const nextRound = currentRound + 1;
    const nextMatchNumber = Math.floor(currentMatchNumber / 2);

    // Find next match
    const nextMatch = await prisma.match.findUnique({
      where: {
        tournamentId_round_matchNumber: {
          tournamentId: match.tournamentId,
          round: nextRound,
          matchNumber: nextMatchNumber,
        },
      },
    });

    if (nextMatch) {
      // Determine if winner goes to player1 or player2 slot
      const isFirstMatchOfPair = currentMatchNumber % 2 === 0;
      
      await prisma.match.update({
        where: { id: nextMatch.id },
        data: isFirstMatchOfPair
          ? { player1Id: winnerId }
          : { player2Id: winnerId },
      });
    } else {
      // This was the final match - tournament complete
      await prisma.tournament.update({
        where: { id: match.tournamentId },
        data: {
          status: "FINISHED",
          winnerId,
          finishedAt: new Date(),
        },
      });
    }

    // Get updated tournament
    const updatedTournament = await prisma.tournament.findUnique({
      where: { id: match.tournamentId },
      include: {
        matches: {
          include: {
            player1: { select: { id: true, name: true, avatar: true } },
            player2: { select: { id: true, name: true, avatar: true } },
            winner: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: [
            { round: "asc" },
            { matchNumber: "asc" },
          ],
        },
      },
    });

    reply.code(200).send({
      message: "Match result recorded",
      match: updatedMatch,
      tournament: updatedTournament,
    });
  } catch (error) {
    request.log.error({ error }, "Failed to report match result");
    reply.code(500).send({
      error: "Internal Server Error",
      message: "Failed to record match result",
    });
  }
};
