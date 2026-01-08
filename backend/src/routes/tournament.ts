import type { FastifyInstance } from "fastify";
import {
  createTournamentController,
  getUserTournamentsController,
  getAvailableTournamentsController,
  joinTournamentController,
  leaveTournamentController,
  startTournamentController,
  getTournamentInfoController,
  reportMatchResultController
} from "../controllers/tournament.js";

export const TournamentRoutes = (fastify: FastifyInstance) => {
  fastify.post('/', createTournamentController);
  fastify.get('/', getUserTournamentsController);
  fastify.get('/available', getAvailableTournamentsController);
  fastify.post('/:tournamentId/join', joinTournamentController);
  fastify.post('/:tournamentId/leave', leaveTournamentController);
  fastify.post('/:tournamentId/start', startTournamentController);
  fastify.get('/:tournamentId', getTournamentInfoController);
  fastify.post('/:tournamentId/match/:matchId/result', reportMatchResultController);
};
