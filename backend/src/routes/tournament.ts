import type { FastifyInstance } from "fastify";
import {
  createTournamentController,
  getTournamentController,
  getUserTournamentsController,
  inviteFriendsController,
  acceptInviteController,
  declineInviteController,
  startTournamentController,
  getPendingInvitesController,
  reportMatchResultController,
} from "../controllers/tournament.js";

/**
 * Tournament Routes
 * Handles tournament lifecycle, invites, and match progression
 */
export const TournamentRoutes = async (app: FastifyInstance) => {
  // Create new tournament
  app.post(
    "/",
    {
      preHandler: [app.authentication_jwt],
      schema: {
        description: "Create a new tournament",
        tags: ["tournament"],
        body: {
          type: "object",
          required: ["name", "maxPlayers"],
          properties: {
            name: { type: "string", minLength: 1, maxLength: 100 },
            maxPlayers: { type: "number", enum: [4, 8, 16] },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              message: { type: "string" },
              tournament: { type: "object" },
            },
          },
        },
      },
    },
    createTournamentController
  );

  // Get user's tournaments
  app.get(
    "/",
    {
      preHandler: [app.authentication_jwt],
      schema: {
        description: "Get user's tournaments (owned or participating)",
        tags: ["tournament"],
        response: {
          200: {
            type: "object",
            properties: {
              tournaments: { type: "array" },
            },
          },
        },
      },
    },
    getUserTournamentsController
  );

  // Get pending invites
  app.get(
    "/invites",
    {
      preHandler: [app.authentication_jwt],
      schema: {
        description: "Get user's pending tournament invites",
        tags: ["tournament"],
        response: {
          200: {
            type: "object",
            properties: {
              invites: { type: "array" },
            },
          },
        },
      },
    },
    getPendingInvitesController
  );

  // Get specific tournament details
  app.get(
    "/:tournamentId",
    {
      preHandler: [app.authentication_jwt],
      schema: {
        description: "Get tournament details including bracket",
        tags: ["tournament"],
        params: {
          type: "object",
          required: ["tournamentId"],
          properties: {
            tournamentId: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              tournament: { type: "object" },
            },
          },
        },
      },
    },
    getTournamentController
  );

  // Invite friends to tournament
  app.post(
    "/:tournamentId/invite",
    {
      preHandler: [app.authentication_jwt],
      schema: {
        description: "Invite friends to tournament (owner only)",
        tags: ["tournament"],
        params: {
          type: "object",
          required: ["tournamentId"],
          properties: {
            tournamentId: { type: "string" },
          },
        },
        body: {
          type: "object",
          required: ["friendIds"],
          properties: {
            friendIds: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
              invites: { type: "array" },
            },
          },
        },
      },
    },
    inviteFriendsController
  );

  // Accept tournament invite
  app.post(
    "/:tournamentId/accept",
    {
      preHandler: [app.authentication_jwt],
      schema: {
        description: "Accept tournament invitation",
        tags: ["tournament"],
        params: {
          type: "object",
          required: ["tournamentId"],
          properties: {
            tournamentId: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
              tournament: { type: "object" },
            },
          },
        },
      },
    },
    acceptInviteController
  );

  // Decline tournament invite
  app.post(
    "/:tournamentId/decline",
    {
      preHandler: [app.authentication_jwt],
      schema: {
        description: "Decline tournament invitation",
        tags: ["tournament"],
        params: {
          type: "object",
          required: ["tournamentId"],
          properties: {
            tournamentId: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    declineInviteController
  );

  // Start tournament
  app.post(
    "/:tournamentId/start",
    {
      preHandler: [app.authentication_jwt],
      schema: {
        description: "Start tournament and generate bracket (owner only)",
        tags: ["tournament"],
        params: {
          type: "object",
          required: ["tournamentId"],
          properties: {
            tournamentId: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
              tournament: { type: "object" },
            },
          },
        },
      },
    },
    startTournamentController
  );

  // Report match result
  app.post(
    "/:tournamentId/match/:matchId/result",
    {
      preHandler: [app.authentication_jwt],
      schema: {
        description: "Report match result and advance winner",
        tags: ["tournament"],
        params: {
          type: "object",
          required: ["tournamentId", "matchId"],
          properties: {
            tournamentId: { type: "string" },
            matchId: { type: "string" },
          },
        },
        body: {
          type: "object",
          required: ["winnerId"],
          properties: {
            winnerId: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
              match: { type: "object" },
              tournament: { type: "object" },
            },
          },
        },
      },
    },
    reportMatchResultController
  );
};
