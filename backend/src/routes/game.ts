import type { FastifyInstance } from "fastify";
import {
  gameWebSocketHandler,
  getPlayerStatsController,
  getRecentGamesController,
  getGameStatsController
} from "../controllers/game.js";

export default function gameRoutes(fastify: FastifyInstance) {
  fastify.get('/ws', { websocket: true }, gameWebSocketHandler);
  fastify.get('/stats/:userId', getPlayerStatsController);
  fastify.get('/history/:userId', getRecentGamesController);
  fastify.get('/service-stats', getGameStatsController);
}
