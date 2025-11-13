import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { randomUUID, UUID} from "crypto";
import TournamentRecord from "../interfaces/tournamentRecordInterfaces.js";
import { uuidToBytes16, bytes16ToUuid } from "../utils/tournementRecordUtils.js";
import { contract } from "../utils/contract.js"

async function TournamentRecordPlugin(fastify: FastifyInstance, options: any) {
  fastify.get("/", async (request, reply) => {
    reply.redirect("/tournamentRecord");
  });

  fastify.get("/tournamentRecord", async (request, reply) => {
    return { welcome: "to the tournamentRecord API", version: "1.0.0" };
  });

  fastify.get("/tournamentRecord/:tournamentId", async (request, reply) => {
    try {
      const { tournamentId } = request.params as { tournamentId: UUID };

      // call contract to get match record
      let record = await contract.getTournamentRecord(uuidToBytes16(tournamentId));

      const tournamentRecord: TournamentRecord = {
        tournamentId: bytes16ToUuid(record.tournamentId),
        player1: bytes16ToUuid(record.player1),
        player2: bytes16ToUuid(record.player2),
        timestamp: Number(record.timestamp),
        winner: bytes16ToUuid(record.winner),
      };

      reply.send({ tournamentRecord });
    } catch (error: any) {
      if (error.reason) {
        reply.code(404).send({
          error: "Error fetching match record",
          message: error.reason,
        });
      } else {        
        reply.code(500).send({
          error: "Error fetching match record",
          message: error.message,
        });
      }
    }
  });

  fastify.post("/tournamentRecord", async (request, reply) => {
    const tournamentRecord = request.body as TournamentRecord;

    if (typeof tournamentRecord.tournamentId !== "string")
      tournamentRecord.tournamentId = randomUUID();

    try {
      // call contract to create match record
      await contract.createTournamentRecord(
        uuidToBytes16(tournamentRecord.tournamentId),
        uuidToBytes16(tournamentRecord.player1),
        uuidToBytes16(tournamentRecord.player2),
        uuidToBytes16(tournamentRecord.winner)
      );

      reply.send({
        tournamentRecord: tournamentRecord.tournamentId,
        message: "Match record created successfully.",
      });
    } catch (error: any) {
      if (error.reason) {
        reply.code(400).send({
          error: "Error creating match record",
          message: error.reason || error.message,
        });
      } else {        
        reply.code(500).send({
          error: "Error creating match record",
          message: error.message,
        });
      }
    }
  });
}
export default fastifyPlugin(TournamentRecordPlugin);
