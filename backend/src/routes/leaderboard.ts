import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { getTop10Controller, getMyRankController } from "../controllers/leaderboard.js";

export default async (
    fastify: FastifyInstance,
    options: FastifyPluginOptions
): Promise<void> => {
    fastify.get("/top10", {
        schema: {
            tags: ["leaderboard"],
            response: {
                200: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            avatar: { type: "string" },
                            xp: { type: "integer" },
                        },
                    },
                },
            },
        },
        handler: getTop10Controller,
        // preHandler: [fastify.authentication_jwt], // Optional: make public or protected? Requirement didn't specify, but usually public. Let's keep it open for now or check if user specified auth.
        // User requirement: "Auth: JWT". implying expected system auth.
        // Let's protect it to be safe and consistent with other modules.
        preHandler: [fastify.authentication_jwt],
    });

    fastify.get("/my-rank", {
        schema: {
            tags: ["leaderboard"],
            response: {
                200: {
                    type: "object",
                    properties: {
                        rank: { type: "integer" },
                        xp: { type: "integer" },
                    },
                },
            },
        },
        handler: getMyRankController,
        preHandler: [fastify.authentication_jwt],
    });
};
