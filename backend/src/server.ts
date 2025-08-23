import Fastify from "fastify";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

const app: FastifyInstance = Fastify({ logger: true });
const PORT = 3000;

interface User {
    id: string;
    name: string;
    email: string;
}

const users: User[] = [];

// Routes
function routes( app: FastifyInstance ) {

    // Health check
    app.get('/healthcheck', async (_, reply: FastifyReply) => {
        return reply.send({ status: 'ok', code: 200 });
    });

    // Get all users
    app.get('/api/users', async (_, reply: FastifyReply) => {
        return reply.send(users);
    });

    // Get user by id
    app.get('/api/users/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
        const { id } = request.params;
        const user = users.find( u => u.id === id );
        if (user) {
            return reply.send(user);
        } else {
            return reply.status(404).send({ message: "User not found" });
        }
    });

    // Add user
    app.post('/api/users', async (request: FastifyRequest<{ Body: User }>, reply: FastifyReply) => {
        const user = request.body;
        users.push(user);
        return reply.status(201).send({ message: "User added", user });
    });

    app.put('/api/users/:id', async (request: FastifyRequest<{ Params: { id: string }, Body: Partial<User> }>, reply: FastifyReply) => {
        const { id } = request.params;
        const userIndex = users.findIndex(u => u.id === id);

        if (userIndex === -1) {
            return reply.status(404).send({ message: "User not found" });
        } else {
            users[userIndex] = { ...users[userIndex], ...request.body };
            return reply.send({ message: "User updated", user: users[userIndex] });
        }
    });

    app.delete('', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        const { id } = request.params;
        const userIndex = users.findIndex(u => u.id === id);

        if (userIndex === -1) {
            return reply.status(404).send({ message: "User not found" });
        } else {
            const deleted = users.splice(userIndex, 1);
            return reply.send({ message: "User deleted", user: deleted[0] });
        }
    })
}

app.register(routes);

const start = async () => {
    try {
        await app.listen( {port: PORT} );
        console.log(`Server is listening at http://localhost:${PORT}`);
    }
    catch(e) {
        app.log.error(e);
        process.exit(1);
    }
}

start();
