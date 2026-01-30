import type { FastifyInstance } from 'fastify';
import { getMatchHistory, saveMatch } from '../controllers/game.js';

export default async function (fastify: FastifyInstance) {
    fastify.get('/history/:uid', getMatchHistory);
    fastify.post('/save', {
        preHandler: [fastify.authentication_jwt],
        handler: saveMatch
    });
}

