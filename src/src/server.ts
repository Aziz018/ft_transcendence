import {FastifyInstance, FastifyRequest, FastifyReply} from 'fastify';

const fastify = require('fastify')({
    logger: true
});

const PORT = 3000;

interface User {
    id: string,
    name: string,
    email: string
};
const users: User[] = [];

function routes(fastify: FastifyInstance) {
    fastify.get('/healthcheck', async (request: FastifyRequest, reply: FastifyReply) => {
        // console.log(request, reply);
        return { OK: 200 };
    });

    fastify.get('/api/users', async (request: FastifyRequest, reply: FastifyReply) => {
        return reply.send(users);
    });

    fastify.post('/api/users', async (request: FastifyRequest<{ Body: User }>, reply: FastifyReply) => {
        const user = request.body;
        console.log(user);
        users.push(user);
        return reply.status(201).send({ message: "User added", user });
    });

    fastify.get('/api/users/:id', async (request: FastifyRequest<{ Body: User }>, reply: FastifyReply) => {
        const { id } = request.params;
        const user = users.find( u => u.id === id);
        if (user) {
            return user;
        } else {
            return reply.status(404).send({ message: "user not found" });
        }
    });

}

fastify.register(routes);

const start = async () => {
    try {
        await fastify.listen({ port: PORT });
        console.log(`server listening on ${PORT} `);
    }
    catch(e) {
        fastify.log.console.error(e);
        process.exit(1);
    }
}

start();