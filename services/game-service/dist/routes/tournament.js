import { createTournamentHandler, getUserTournamentsHandler, getAvailableTournamentsHandler, joinTournamentHandler, leaveTournamentHandler, startTournamentHandler, getTournamentInfoHandler, reportMatchResultHandler } from '../controllers/tournament.js';
export default function tournamentRoutes(fastify) {
    fastify.post('/v1/tournament', createTournamentHandler);
    fastify.get('/v1/tournament', getUserTournamentsHandler);
    fastify.get('/v1/tournament/available', getAvailableTournamentsHandler);
    fastify.post('/v1/tournament/:tournamentId/join', joinTournamentHandler);
    fastify.post('/v1/tournament/:tournamentId/leave', leaveTournamentHandler);
    fastify.post('/v1/tournament/:tournamentId/start', startTournamentHandler);
    fastify.get('/v1/tournament/:tournamentId', getTournamentInfoHandler);
    fastify.post('/v1/tournament/:tournamentId/match/:matchId/result', reportMatchResultHandler);
}
