
import type { FastifyInstance } from "fastify";
import {
    listTournamentsController,
    createTournamentController,
    joinTournamentController,
} from "../controllers/tournament.js";

export default async function tournamentRoutes(fastify: FastifyInstance) {
    fastify.get("/", { preHandler: [fastify.authentication_jwt] }, listTournamentsController);
    fastify.post("/", { preHandler: [fastify.authentication_jwt] }, createTournamentController);
    fastify.post("/:id/join", { preHandler: [fastify.authentication_jwt] }, joinTournamentController);
}
