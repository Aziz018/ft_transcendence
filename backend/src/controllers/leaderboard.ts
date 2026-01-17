import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../utils/prisma.js";

export const getTop10Controller = async (
    req: FastifyRequest,
    res: FastifyReply
): Promise<void> => {
    try {
        const topUsers = await prisma.user.findMany({
            orderBy: {
                xp: "desc",
            },
            take: 10,
            select: {
                id: true,
                name: true,
                avatar: true,
                xp: true,
                // We can add wins/losses later if we have game history, for now XP is the metric
            },
        });

        res.code(200).send(topUsers);
    } catch (error) {
        req.log.error(error, "Failed to fetch top 10 leaderboard");
        res.code(500).send({ message: "Internal Server Error" });
    }
};
