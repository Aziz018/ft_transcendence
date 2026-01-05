import { gameService } from '../services/game.js';
// Temporary: user id extracted from `x-user-id` header for local development
function getUserId(req) {
    return req.headers['x-user-id'] || `user-${Date.now()}`;
}
export async function createTournamentHandler(req, reply) {
    const userId = getUserId(req);
    const body = req.body;
    try {
        const result = await gameService.handleTournamentAction(userId, {
            action: 'create',
            tournamentData: body
        });
        return reply.send(result);
    }
    catch (err) {
        return reply.status(400).send({ success: false, message: err.message });
    }
}
export async function getUserTournamentsHandler(req, reply) {
    const userId = getUserId(req);
    try {
        const result = gameService.getUserTournaments(userId);
        return reply.send(result);
    }
    catch (err) {
        return reply.status(400).send({ success: false, message: err.message });
    }
}
export async function getAvailableTournamentsHandler(req, reply) {
    try {
        const result = gameService.getAvailableTournaments();
        return reply.send(result);
    }
    catch (err) {
        return reply.status(400).send({ success: false, message: err.message });
    }
}
export async function joinTournamentHandler(req, reply) {
    const userId = getUserId(req);
    const { tournamentId } = req.params;
    const body = req.body;
    try {
        const result = await gameService.handleTournamentAction(userId, {
            action: 'join',
            tournamentId,
            tournamentData: body
        });
        return reply.send(result);
    }
    catch (err) {
        return reply.status(400).send({ success: false, message: err.message });
    }
}
export async function leaveTournamentHandler(req, reply) {
    const userId = getUserId(req);
    const { tournamentId } = req.params;
    try {
        const result = await gameService.handleTournamentAction(userId, {
            action: 'leave',
            tournamentId
        });
        return reply.send(result);
    }
    catch (err) {
        return reply.status(400).send({ success: false, message: err.message });
    }
}
export async function startTournamentHandler(req, reply) {
    const userId = getUserId(req);
    const { tournamentId } = req.params;
    try {
        const result = await gameService.handleTournamentAction(userId, {
            action: 'start',
            tournamentId
        });
        return reply.send(result);
    }
    catch (err) {
        return reply.status(400).send({ success: false, message: err.message });
    }
}
export async function getTournamentInfoHandler(req, reply) {
    const { tournamentId } = req.params;
    try {
        const result = await gameService.handleTournamentAction('system', {
            action: 'get_info',
            tournamentId
        });
        return reply.send(result);
    }
    catch (err) {
        return reply.status(400).send({ success: false, message: err.message });
    }
}
export async function reportMatchResultHandler(req, reply) {
    const { tournamentId, matchId } = req.params;
    const body = req.body;
    try {
        const winnerId = body.winnerId;
        const result = await gameService.reportMatchResultById(tournamentId, matchId, winnerId);
        return reply.send(result);
    }
    catch (err) {
        return reply.status(400).send({ success: false, message: err.message });
    }
}
