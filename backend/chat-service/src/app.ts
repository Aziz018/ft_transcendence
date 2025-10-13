import Fastify from "fastify";
import chatRoutes from "./chat.routes.js";

const app = Fastify({ logger: true });
app.register(chatRoutes, { prefix: "/" });

app.listen({ port: 3002, host: '0.0.0.0' });
