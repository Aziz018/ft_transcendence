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
import { MessageRoutes } from "./routes/message.js";

import JWTAuthenticationPlugin from "./plugins/jwt.js";
import {
  facebookOAuthOpts,
  googleOAuthOpts,
  intra42OAuthOpts,
} from "./auth/clients.js";
import ServiceManagerPlugin from "./plugins/service.js";

const rateLimitingOpts = {
  global: true,
  max: 100, // Increased from 4 to 100 requests
  timeWindow: 10 * 1000, // Per 10 seconds
  allowList: [],
  addHeaders: true,
};

const routes = [
  {
    pcb: TOTPRoutes,
    opt: { prefix: "/v1/totp" },
  },
  {
    pcb: UserRoutes,
    opt: { prefix: "/v1/user" },
  },
  {
    pcb: FriendRoutes,
    opt: { prefix: "/v1/friend" },
  },
  {
    pcb: AuthRoutes,
    opt: { prefix: "/v1/auth" },
  },
  {
    pcb: ChatRoutes,
    opt: { prefix: "/v1/chat" },
  },
  {
    pcb: MessageRoutes,
    opt: {},
  },
];

const hooks = {
  onClose: CloseHandler,
  onSend: SendHandler,
  preHandler: PreHandler,
};

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
await app.run();

// Graceful shutdown handlers
const shutdownTimeout = parseInt(process.env.SHUTDOWN_TIMEOUT || "10000");

const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  try {
    // Close the Fastify server
    await Promise.race([
      app.fastify.close(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Shutdown timeout")), shutdownTimeout)
      ),
    ]);
    
    console.log("✓ Server closed successfully");
    process.exit(0);
  } catch (err) {
    console.error("✗ Error during graceful shutdown:", err);
    process.exit(1);
  }
};

// Listen for termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("✗ Uncaught Exception:", err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("✗ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
