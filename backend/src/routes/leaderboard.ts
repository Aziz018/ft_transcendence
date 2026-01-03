import { getGlobalLeaderboardController } from "../controllers/leaderboard.js";
import type { FastifyInstance, FastifyPluginOptions } from "fastify";

/**
 * Fastify plugin for leaderboard-related routes.
 *
 * This module registers all routes related to leaderboard operations.
 *
 * @param {FastifyInstance} fastify - The Fastify server instance.
 * @param {FastifyPluginOptions} options - Plugin options passed when registering this route.
 * @returns {Promise<void>} Registers routes asynchronously.
 */
export default async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions
): Promise<void> => {
  /**
   * GET /leaderboard/global
   * 
   * Returns the top 10 users ranked by experience points.
   * 
   * Response:
   * {
   *   "leaderboard": [
   *     { "rank": 1, "userId": "uuid", "username": "player1", "exp": 9850 },
   *     { "rank": 2, "userId": "uuid", "username": "player2", "exp": 9400 },
   *     ...
   *   ]
   * }
   */
  fastify.get("/global", {
    schema: {
      tags: ["leaderboard"],
      description: "Get top 10 users by experience points",
      response: {
        200: {
          type: "object",
          properties: {
            leaderboard: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  rank: { type: "number" },
                  userId: { type: "string" },
                  username: { type: "string" },
                  exp: { type: "number" },
                },
              },
            },
          },
        },
      },
    },
    handler: getGlobalLeaderboardController,
  });
};
