import { gameService } from '../services/game.js';
import { playerMoveSchema, gameJoinSchema, matchmakingSchema, gameReadySchema, tournamentActionSchema, gameResultSchema, scoreUpdateSchema, matchEndSchema } from '../schemas/game.js';
export async function handleGameWebSocket(connection, request) {
    // Extract and verify JWT token
    const token = extractTokenFromRequest(request);
    if (!token) {
        console.log('❌ No token provided');
        connection.send(JSON.stringify({ type: 'error', message: 'Authentication required' }));
        connection.close();
        return;
    }
    try {
        const decoded = request.server.jwt.verify(token);
        if (decoded.mfa_required) {
            console.log('❌ MFA required for user');
            connection.send(JSON.stringify({ type: 'error', message: 'MFA verification required' }));
            connection.close();
            return;
        }
        connection.authenticatedUser = {
            uid: decoded.uid || decoded.id,
            id: decoded.id,
            name: decoded.name || decoded.email || 'Player'
        };
    }
    catch (error) {
        console.log('❌ Invalid token:', error);
        connection.send(JSON.stringify({ type: 'error', message: 'Invalid or expired token' }));
        connection.close();
        return;
    }
    const userId = connection.authenticatedUser.uid;
    console.log(`🔗 User ${userId} (${connection.authenticatedUser.name}) connected`);
    gameService.addConnection(userId, connection);
    console.log(`🔗 User ${userId} connected. ${gameService.getStats().activeConnections} total connections`);
    connection.on('message', async (message) => {
        try {
            const parsedMessage = JSON.parse(message.toString());
            console.log(`📨 Received from ${userId}:`, parsedMessage);
            if (parsedMessage.type === 'ping') {
                connection.send(JSON.stringify({ type: 'pong', userId }));
                return;
            }
            switch (parsedMessage.type) {
                case 'player_move':
                    const moveData = playerMoveSchema.parse(parsedMessage.payload);
                    await gameService.handlePlayerMove(userId, moveData);
                    break;
                case 'game_join':
                    const joinData = gameJoinSchema.parse(parsedMessage.payload);
                    const joinResult = await gameService.handleGameJoin(userId, joinData);
                    connection.send(JSON.stringify({
                        type: 'game_join_result',
                        payload: joinResult
                    }));
                    break;
                case 'matchmaking':
                    const matchmakingData = matchmakingSchema.parse(parsedMessage.payload);
                    const matchmakingResult = await gameService.handleMatchmaking(userId, matchmakingData);
                    connection.send(JSON.stringify({
                        type: 'matchmaking_result',
                        payload: matchmakingResult
                    }));
                    break;
                case 'game_ready':
                    console.log('🔍 Validating game_ready with schema:', gameReadySchema);
                    const readyData = gameReadySchema.parse(parsedMessage.payload);
                    await gameService.handleGameReady(userId, readyData);
                    break;
                case 'tournament_action':
                    const tournamentData = tournamentActionSchema.parse(parsedMessage.payload);
                    const tournamentResult = await gameService.handleTournamentAction(userId, tournamentData);
                    connection.send(JSON.stringify({
                        type: 'tournament_action_result',
                        payload: tournamentResult
                    }));
                    break;
                case 'game_result':
                    const resultData = gameResultSchema.parse(parsedMessage.payload);
                    const gameResultResponse = await gameService.handleGameResult(userId, resultData);
                    connection.send(JSON.stringify({
                        type: 'game_result_processed',
                        payload: gameResultResponse
                    }));
                    break;
                case 'get_tournaments':
                    const availableTournaments = gameService.getAvailableTournaments();
                    connection.send(JSON.stringify({
                        type: 'tournaments_list',
                        payload: availableTournaments
                    }));
                    break;
                case 'score_update':
                    const scoreData = scoreUpdateSchema.parse(parsedMessage.payload);
                    const scoreUpdateResult = await gameService.handleScoreUpdate(userId, scoreData);
                    connection.send(JSON.stringify({
                        type: 'score_update_ack',
                        payload: scoreUpdateResult
                    }));
                    break;
                case 'match_end':
                    const matchEndData = matchEndSchema.parse(parsedMessage.payload);
                    const matchEndResult = await gameService.handleMatchEnd(userId, matchEndData);
                    connection.send(JSON.stringify({
                        type: 'match_end_ack',
                        payload: matchEndResult
                    }));
                    break;
                default:
                    console.log(`❌ Unknown message type: ${parsedMessage.type}`);
                    connection.send(JSON.stringify({
                        type: 'error',
                        message: `Unknown message type: ${parsedMessage.type}`
                    }));
            }
        }
        catch (error) {
            console.log('❌ Error processing message:', error);
            connection.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format or validation failed'
            }));
        }
    });
    connection.on('close', () => {
        console.log(`🔌 User ${userId} disconnected`);
        gameService.removeConnection(userId);
        console.log(`📊 Stats:`, gameService.getStats());
    });
    connection.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to game server',
        userId: userId,
        stats: gameService.getStats()
    }));
}
function extractTokenFromRequest(request) {
    // Check Authorization header first
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    // Check query parameter (for WebSocket connections)
    const query = request.query;
    if (query.token) {
        return query.token;
    }
    return null;
}
export function getActiveConnectionsCount() {
    return gameService.getStats().activeConnections;
}
