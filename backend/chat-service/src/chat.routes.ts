import type { FastifyInstance, FastifyPluginOptions, FastifyRequest } from "fastify";
import { createRoomSchema } from "./room.schema.js"
import { createRoomHandler } from "./room.controller.js"
import { createMessageSchema, getMessageSchema } from "./chat.schema.js"
import { websocketHandler, createMessageHandler, getMessageHandler } from "./chat.controller.js"

export default (fastify: FastifyInstance, options: FastifyPluginOptions) => {
    fastify.post('/rooms', {
        schema: createRoomSchema,
        handler: createRoomHandler
    });

    fastify.post('/messages', {
        schema: createMessageSchema,
        handler: createMessageHandler
    });

    fastify.get('/messages', {
        schema: getMessageSchema,
        handler: getMessageHandler
    });

    fastify.get('/chat-ws', { websocket: true }, websocketHandler);
}
