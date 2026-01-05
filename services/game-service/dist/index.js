import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import gameRoutes from './routes/game.js';
const fastify = Fastify({ logger: true });
// register websocket plugin
fastify.register(websocket);
// register routes (the route module exports a default function)
fastify.register(async (instance) => {
    gameRoutes(instance, {});
});
const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        console.log('Game service listening on 3000');
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
