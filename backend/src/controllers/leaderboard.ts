import { prisma } from "../utils/prisma.js";
import type { FastifyReply, FastifyRequest } from "fastify";

/**
 * Global Leaderboard Controller
 * 
 * Retrieves the top 10 users ranked by experience points (XP) in descending order.
 * Returns rank, userId, username, and XP for each user.
 * 
 * @param request - Fastify request object
 * @param reply - Fastify reply object
 */
export const getGlobalLeaderboardController = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    // Query database for top 10 users sorted by XP descending
    // Using orderBy with desc and take(10) for efficient database-level sorting and limiting
    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        xp: true,
      },
      orderBy: {
        xp: "desc",
      },
      take: 10,
    });

    // Check if the top user has any XP
    if (topUsers.length === 0 || topUsers[0].xp === 0) {
      return reply.code(200).send({
        leaderboard: [],
        message: "No user match the top 1 yet",
      });
    }

    // Map results to include rank (1-10)
    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      username: user.name,
      exp: user.xp,
    }));

    reply.code(200).send({
      leaderboard,
    });
  } catch (error) {
    request.log.error("Failed to fetch global leaderboard:", error);
    reply.code(500).send({
      error: "Internal Server Error",
      message: "Failed to retrieve leaderboard",
    });
  }
};
