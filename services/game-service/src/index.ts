import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import gameRoutes from './routes/game.js';
import tournamentRoutes from './routes/tournament.js';

const fastify = Fastify({ logger: true });

// register websocket plugin
fastify.register(websocket as any);

// register routes (the route module exports a default function)
fastify.register(async (instance) => {
  gameRoutes(instance, {} as any);
  tournamentRoutes(instance);
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Game service listening on ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
