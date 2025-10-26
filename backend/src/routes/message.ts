import type { FastifyInstance } from "fastify";
import {
  sendDirectMessageController,
  getDirectMessagesController,
  deleteMessageController,
} from "../controllers/message.js";

export async function MessageRoutes(fastify: FastifyInstance) {
  fastify.post("/v1/message/send", {
    preHandler: [fastify.authentication_jwt],
    handler: sendDirectMessageController,
  });

  fastify.get("/v1/message/direct", {
    preHandler: [fastify.authentication_jwt],
    handler: getDirectMessagesController,
  });

  fastify.delete("/v1/message", {
    preHandler: [fastify.authentication_jwt],
    handler: deleteMessageController,
  });
}
