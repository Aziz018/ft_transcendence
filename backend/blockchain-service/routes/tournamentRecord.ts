import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { ethers, JsonRpcProvider, Wallet, Contract, Network } from "ethers";
import * as dotenv from "dotenv";
import fs from "fs";
import { env } from "process";
import { randomUUID, UUID } from "crypto";

async function TournamentRecordPlugin(fastify: FastifyInstance, options: any) {
  interface TournamentRecord {
    tournamentId: UUID;
    player1: UUID;
    player2: UUID;
    timestamp?: number;
    winner: UUID;
  }

  function uuidToBytes16(uuid: UUID): string {
    const hexString = uuid.replace(/-/g, "");
    if (hexString.length !== 32) {
      throw new Error("Invalid UUID format");
    }
    return "0x" + hexString;
  }

  function bytes16ToUuid(bytes16: string): UUID {
    const hexString = bytes16.startsWith("0x") ? bytes16.slice(2) : bytes16;
    if (hexString.length !== 32) {
      throw new Error("Invalid bytes16 format");
    }
    return `${hexString.slice(0, 8)}-${hexString.slice(
      8,
      12
    )}-${hexString.slice(12, 16)}-${hexString.slice(16, 20)}-${hexString.slice(
      20
    )}` as UUID;
  }

  dotenv.config({ path: ".env", quiet: true });
  const TournamentRecorderAbi = JSON.parse(
    fs.readFileSync("./contract-abis/TournamentRecorder.json", "utf8")
  );

  let provider: JsonRpcProvider;
  let signer: Wallet;
  let contract: Contract;

  try {
    provider = new ethers.JsonRpcProvider(env.AVALANCHE_TESTNET_RPC);
    signer = new ethers.Wallet(env.PRIVATE_KEY as string, provider);
    const contractAddress = env.CONTRACT_ADDRESS as string;
    contract = new ethers.Contract(
      contractAddress,
      TournamentRecorderAbi,
      signer
    );
  } catch (error) {
    console.log(error);
  }

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
      reply.status(404).send({
        error: "Error fetching match record",
        message: error.reason || error.message,
      });
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
      reply.status(404).send({
        error: "Error creating match record",
        message: error.reason || error.message,
      });
    }
  });
}
export default fastifyPlugin(TournamentRecordPlugin);
