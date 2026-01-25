import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../utils/prisma.js";

export const getTop10Controller = async (
    req: FastifyRequest,
    res: FastifyReply
): Promise<void> => {
    try {
        const topUsers = await prisma.user.findMany({
            where: {
                xp: {
                    gt: 0,
                },
            },
            orderBy: {
                xp: "desc",
            },
            take: 10,
            select: {
                id: true,
                name: true,
                avatar: true,
                xp: true,
            },
        });

        res.code(200).send(topUsers);
    } catch (error) {
        req.log.error(error, "Failed to fetch top 10 leaderboard");
        res.code(500).send({ message: "Internal Server Error" });
    }
};

export const getMyRankController = async (
    req: FastifyRequest,
    res: FastifyReply
): Promise<void> => {
    try {
        const userId = req.user.uid;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { xp: true },
        });

        if (!user) {
            res.code(404).send({ message: "User not found" });
            return;
        }

        if (user.xp <= 0) {
            res.code(200).send({ rank: 0, xp: 0 });
            return;
        }

        const betterPlayersCount = await prisma.user.count({
            where: {
                xp: {
                    gt: user.xp,
                },
            },
        });

        res.code(200).send({ rank: betterPlayersCount + 1, xp: user.xp });
    } catch (error) {
        req.log.error(error, "Failed to fetch user rank");
        res.code(500).send({ message: "Internal Server Error" });
    }
};
