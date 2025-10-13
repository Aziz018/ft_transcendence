import Fastify from "fastify";
import fastifyOauth2 from "@fastify/oauth2";

import { googleOAuthOpts, intra42OAuthOpts } from "./auth.clients.js";

const app = Fastify({ logger: true });

await app.register(fastifyOauth2, googleOAuthOpts);
await app.register(fastifyOauth2, intra42OAuthOpts);

app.listen({ port: 3001, host: '0.0.0.0' });
