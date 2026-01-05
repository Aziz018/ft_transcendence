import type { FastifyRequest, FastifyReply } from 'fastify';
import { gameService } from '../services/game.js';

// Temporary: user id extracted from `x-user-id` header for local development
function getUserId(req: FastifyRequest) {
	return (req.headers['x-user-id'] as string) || `user-${Date.now()}`;
}

export async function createTournamentHandler(req: FastifyRequest, reply: FastifyReply) {
	const userId = getUserId(req);
	const body = req.body as any;
	try {
		const result = await gameService.handleTournamentAction(userId, {
			action: 'create',
			tournamentData: body
		});
		return reply.send(result);
	} catch (err: any) {
		return reply.status(400).send({ success: false, message: err.message });
	}
}

export async function getUserTournamentsHandler(req: FastifyRequest, reply: FastifyReply) {
	const userId = getUserId(req);
	try {
		const result = gameService.getUserTournaments(userId);
		return reply.send(result);
	} catch (err: any) {
		return reply.status(400).send({ success: false, message: err.message });
	}
}

export async function getAvailableTournamentsHandler(req: FastifyRequest, reply: FastifyReply) {
	try {
		const result = gameService.getAvailableTournaments();
		return reply.send(result);
	} catch (err: any) {
		return reply.status(400).send({ success: false, message: err.message });
	}
}

export async function joinTournamentHandler(req: FastifyRequest, reply: FastifyReply) {
	const userId = getUserId(req);
	const { tournamentId } = req.params as any;
	const body = req.body as any;
	try {
		const result = await gameService.handleTournamentAction(userId, {
			action: 'join',
			tournamentId,
			tournamentData: body
		});
		return reply.send(result);
	} catch (err: any) {
		return reply.status(400).send({ success: false, message: err.message });
	}
}

export async function leaveTournamentHandler(req: FastifyRequest, reply: FastifyReply) {
	const userId = getUserId(req);
	const { tournamentId } = req.params as any;
	try {
		const result = await gameService.handleTournamentAction(userId, {
			action: 'leave',
			tournamentId
		});
		return reply.send(result);
	} catch (err: any) {
		return reply.status(400).send({ success: false, message: err.message });
	}
}

export async function startTournamentHandler(req: FastifyRequest, reply: FastifyReply) {
	const userId = getUserId(req);
	const { tournamentId } = req.params as any;
	try {
		const result = await gameService.handleTournamentAction(userId, {
			action: 'start',
			tournamentId
		});
		return reply.send(result);
	} catch (err: any) {
		return reply.status(400).send({ success: false, message: err.message });
	}
}

export async function getTournamentInfoHandler(req: FastifyRequest, reply: FastifyReply) {
	const { tournamentId } = req.params as any;
	try {
		const result = await gameService.handleTournamentAction('system', {
			action: 'get_info',
			tournamentId
		});
		return reply.send(result);
	} catch (err: any) {
		return reply.status(400).send({ success: false, message: err.message });
	}
}

export async function reportMatchResultHandler(req: FastifyRequest, reply: FastifyReply) {
	const { tournamentId, matchId } = req.params as any;
	const body = req.body as any;
	try {
		const winnerId = body.winnerId as string;
		const result = await gameService.reportMatchResultById(tournamentId, matchId, winnerId);
		return reply.send(result);
	} catch (err: any) {
		return reply.status(400).send({ success: false, message: err.message });
	}
}
