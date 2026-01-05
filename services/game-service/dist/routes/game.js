import { handleGameWebSocket } from "../controllers/game.js";
export default (fastify, options) => {
    // fastify.register(websocket);
    fastify.get('/ws/game', { websocket: true }, async (connection, request) => {
        await handleGameWebSocket(connection, request);
    });
};
