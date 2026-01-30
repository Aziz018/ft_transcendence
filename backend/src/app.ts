import { configDotenv } from "dotenv";
configDotenv();

import Server from "./server.js";

import PreHandler from "./hooks/pre.js";
import SendHandler from "./hooks/send.js";
import CloseHandler from "./hooks/close.js";

import UserRoutes from "./routes/user.js";
import FriendRoutes from "./routes/friend.js";
import AuthRoutes from "./routes/auth.js";
import TOTPRoutes from "./routes/totp.js";
import ChatRoutes from "./routes/chat.js";
import LeaderboardRoutes from "./routes/leaderboard.js";
import { MessageRoutes } from "./routes/message.js";
import GameRoutes from "./routes/game.js";

import JWTAuthenticationPlugin from "./plugins/jwt.js";
import {
  facebookOAuthOpts,
  googleOAuthOpts,
  intra42OAuthOpts,
} from "./auth/clients.js";
import ServiceManagerPlugin from "./plugins/service.js";

const rateLimitingOpts = {
  global: true,
  max: 100,
  timeWindow: 10 * 1000,
  allowList: [],
  addHeaders: true,
};

const routes = [
  { pcb: TOTPRoutes, opt: { prefix: "/v1/totp" } },
  { pcb: UserRoutes, opt: { prefix: "/v1/user" } },
  { pcb: FriendRoutes, opt: { prefix: "/v1/friend" } },
  { pcb: AuthRoutes, opt: { prefix: "/v1/auth" } },
  { pcb: ChatRoutes, opt: { prefix: "/v1/chat" } },
  { pcb: LeaderboardRoutes, opt: { prefix: "/v1/leaderboard" } },
  { pcb: MessageRoutes, opt: {} },
  { pcb: GameRoutes, opt: { prefix: "/v1/game" } },
];

const hooks = { onClose: CloseHandler, onSend: SendHandler, preHandler: PreHandler };

const secrets = {
  jwt: process.env.JWT_SECRET || "supersecret",
  cookie: process.env.CKE_SECRET || "supersecret",
};

const app: Server = new Server(
  process.env.HOST || "0.0.0.0",
  parseInt(process.env.PORT || "3000"),
  [googleOAuthOpts, facebookOAuthOpts, intra42OAuthOpts],
  rateLimitingOpts,
  routes,
  hooks,
  secrets,
  [ServiceManagerPlugin, JWTAuthenticationPlugin]
);

// Start the server
// Check if we are running as a gateway or a specific service
const serviceName = process.env.SERVICE_NAME || "monolith";

if (serviceName === "gateway") {
  console.log("🚀 Starting in GATEWAY mode");

  // Register Proxy for Friend Service
  const friendServiceUrl = process.env.FRIEND_SERVICE_URL || "http://friend-service:3001";
  console.log(`↔️  Proxying /v1/friend to ${friendServiceUrl}`);

  await app.fastify.register(import("@fastify/http-proxy"), {
    upstream: friendServiceUrl,
    prefix: "/v1/friend",
    rewritePrefix: "/v1/friend", // Keep the prefix when forwarding
    http2: false,
  });

  // In gateway mode, we might still want other routes if they are monolithic
  // But strictly for this fix, we are decoupling Friend Service.
  // Ideally, other services would also be proxied, but per instructions, we focus on Friend Service.
} else if (serviceName === "friend-service") {
  console.log("🚀 Starting in FRIEND SERVICE mode");
  // We are the friend service, so we keep the routes registered in the constructor
  // Note: The constructor currently registers ALL routes. 
  // In a real microservice split, we would strictly only register FriendRoutes.
  // For now, we allow all (monolithic code base running on different ports) but logically treating it as friend service.
} else {
  console.log("🚀 Starting in MONOLITH mode");
}

await app.run();

// Graceful shutdown handlers
const shutdownTimeout = parseInt(process.env.SHUTDOWN_TIMEOUT || "10000");

const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  try {
    await Promise.race([
      app.fastify.close(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Shutdown timeout")), shutdownTimeout)),
    ]);
    console.log("✓ Server closed successfully");
    process.exit(0);
  } catch (err) {
    console.error("✗ Error during graceful shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("uncaughtException", (err) => {
  console.error("✗ Uncaught Exception:", err);
  process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("✗ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
