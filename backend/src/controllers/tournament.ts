import type { FastifyRequest, FastifyReply } from "fastify";

/**
 * Create a new tournament
 */
export const createTournamentController = async (
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
): Promise<void> => {
  try {
    const userId = (request.user as any)?.id || (request.user as any)?.uid;
    const gameService = request.server.service.game;

    const result = await gameService.handleTournamentAction(userId, {
      action: 'create',
      tournamentData: request.body
    });

    reply.send(result);
  } catch (error) {
    request.log.error({ error }, 'Failed to create tournament');
    reply.code(400).send({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create tournament'
    });
  }
};

/**
 * Get tournaments where the user is owner or participant
 */
export const getUserTournamentsController = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const userId = (request.user as any)?.id || (request.user as any)?.uid;
    const gameService = request.server.service.game;

    const result = gameService.getUserTournaments(userId);
    reply.send(result);
  } catch (error) {
    request.log.error({ error }, 'Failed to get user tournaments');
    reply.code(400).send({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get tournaments'
    });
  }
};

/**
 * Get all available public tournaments
 */
export const getAvailableTournamentsController = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const gameService = request.server.service.game;
    const result = gameService.getAvailableTournaments();
    reply.send(result);
  } catch (error) {
    request.log.error({ error }, 'Failed to get available tournaments');
    reply.code(400).send({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get tournaments'
    });
  }
};

/**
 * Join a tournament
 */
export const joinTournamentController = async (
  request: FastifyRequest<{ Params: { tournamentId: string }; Body: any }>,
  reply: FastifyReply
): Promise<void> => {
  try {
    const userId = (request.user as any)?.id || (request.user as any)?.uid;
    const { tournamentId } = request.params;
    const gameService = request.server.service.game;

    const result = await gameService.handleTournamentAction(userId, {
      action: 'join',
      tournamentId,
      tournamentData: request.body
    });

    reply.send(result);
  } catch (error) {
    request.log.error({ error }, 'Failed to join tournament');
    reply.code(400).send({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to join tournament'
    });
  }
};

/**
 * Leave a tournament
 */
export const leaveTournamentController = async (
  request: FastifyRequest<{ Params: { tournamentId: string } }>,
  reply: FastifyReply
): Promise<void> => {
  try {
    const userId = (request.user as any)?.id || (request.user as any)?.uid;
    const { tournamentId } = request.params;
    const gameService = request.server.service.game;

    const result = await gameService.handleTournamentAction(userId, {
      action: 'leave',
      tournamentId
    });

    reply.send(result);
  } catch (error) {
    request.log.error({ error }, 'Failed to leave tournament');
    reply.code(400).send({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to leave tournament'
    });
  }
};

/**
 * Start a tournament (creator only)
 */
export const startTournamentController = async (
  request: FastifyRequest<{ Params: { tournamentId: string } }>,
  reply: FastifyReply
): Promise<void> => {
  try {
    const userId = (request.user as any)?.id || (request.user as any)?.uid;
    const { tournamentId } = request.params;
    const gameService = request.server.service.game;

    const result = await gameService.handleTournamentAction(userId, {
      action: 'start',
      tournamentId
    });

    reply.send(result);
  } catch (error) {
    request.log.error({ error }, 'Failed to start tournament');
    reply.code(400).send({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to start tournament'
    });
  }
};

/**
 * Get tournament information
 */
export const getTournamentInfoController = async (
  request: FastifyRequest<{ Params: { tournamentId: string } }>,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { tournamentId } = request.params;
    const gameService = request.server.service.game;

    const result = await gameService.handleTournamentAction('system', {
      action: 'get_info',
      tournamentId
    });

    reply.send(result);
  } catch (error) {
    request.log.error({ error }, 'Failed to get tournament info');
    reply.code(400).send({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get tournament info'
    });
  }
};

/**
 * Report tournament match result
 */
export const reportMatchResultController = async (
  request: FastifyRequest<{ Params: { tournamentId: string; matchId: string }; Body: { winnerId: string } }>,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { tournamentId, matchId } = request.params;
    const { winnerId } = request.body;
    const gameService = request.server.service.game;

    const result = await gameService.reportMatchResultById(tournamentId, matchId, winnerId);
    reply.send(result);
  } catch (error) {
    request.log.error({ error }, 'Failed to report match result');
    reply.code(400).send({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to report match result'
    });
  }
};
