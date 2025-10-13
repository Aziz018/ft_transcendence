

import fastifyHttpProxy from "@fastify/http-proxy";
import Fastify from "fastify";

const app = Fastify({ logger: true });

app.register(fastifyHttpProxy, {
    // upstream: 'http://user-service:3001',
    upstream: 'http://localhost:3001',
    prefix: '/auth'
});

app.register(fastifyHttpProxy, {
    // upstream: 'http://chat-service:3002',
    upstream: 'http://localhost:3002',
    prefix: '/chat'
});

app.listen({ port: 3000, host: '0.0.0.0' });