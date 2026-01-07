import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import gameRoutes from './routes/game.js';
import tournamentRoutes from './routes/tournament.js';
const fastify = Fastify({ logger: true });
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const start = async () => {
    try {
        // register plugins
        await fastify.register(cors, {
            origin: true,
            credentials: true,
        });
        await fastify.register(jwt, {
            secret: process.env.JWT_SECRET || 'supersecret'
        });
        await fastify.register(websocket);
        // register routes
        fastify.register(async (instance) => {
            gameRoutes(instance, {});
            tournamentRoutes(instance);
        });
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`🎮 Game service listening on ${PORT}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
