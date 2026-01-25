
import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../utils/prisma.js";

export const listTournamentsController = async (
    req: FastifyRequest,
    res: FastifyReply
) => {
    const tournaments = await prisma.tournament.findMany({
        orderBy: { createdAt: "desc" },
    });
    return res.send(tournaments);
};

export const createTournamentController = async (
    req: FastifyRequest<{
        Body: { name: string; maxPlayers: number; prize: string };
    }>,
    res: FastifyReply
) => {
    const { name, maxPlayers, prize } = req.body;
    const userId = req.user.uid;

    const tournament = await prisma.tournament.create({
        data: {
            name,
            maxPlayers: parseInt(String(maxPlayers)),
            prize,
            creatorId: userId,
        },
    });

    return res.code(201).send(tournament);
};

export const joinTournamentController = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    res: FastifyReply
) => {
    const { id } = req.params;
    const userId = req.user.uid;

    // Check if tournament exists and is not full
    const tournament = await prisma.tournament.findUnique({
        where: { id },
        include: { participants: true },
    });

    if (!tournament) {
        return res.code(404).send({ message: "Tournament not found" });
    }

    if (tournament.currentPlayers >= tournament.maxPlayers) {
        return res.code(400).send({ message: "Tournament is full" });
    }

    // Check if already joined
    const existingParticipant = await prisma.tournamentParticipant.findUnique({
        where: {
            tournamentId_userId: {
                tournamentId: id,
                userId,
            },
        },
    });

    if (existingParticipant) {
        return res.code(400).send({ message: "Already joined" });
    }

    // Add participant
    await prisma.$transaction([
        prisma.tournamentParticipant.create({
            data: {
                tournamentId: id,
                userId,
            },
        }),
        prisma.tournament.update({
            where: { id },
            data: {
                currentPlayers: { increment: 1 },
            },
        }),
    ]);

    return res.send({ message: "Joined successfully" });
};
