import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import websocket from '@fastify/websocket';
import { PrismaClient } from './generated/prisma/index.js';

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

await fastify.register(cors, {
  origin: true,
  credentials: true,
});

await fastify.register(jwt, { secret: process.env.JWT_SECRET || 'supersecret' });
await fastify.register(cookie, { secret: process.env.CKE_SECRET || 'supersecret' });
await fastify.register(websocket);

// Decorate with JWT authentication middleware
fastify.decorate('authentication_jwt', async (req: any, rep: any) => {
  let token = req.cookies.access_token;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  if (!token) {
    return rep.status(401).send({ message: 'Authentication required' });
  }
  
  const isBlackListed = await prisma.blacklistedToken.findUnique({ where: { token } });
  if (isBlackListed) {
    return rep.code(401).send({
      statusCode: 401,
      error: 'Unauthorized!',
      message: 'Token blacklisted',
    });
  }
  
  try {
    const decoded = req.jwt.verify(token);
    if (decoded.mfa_required) {
      return rep.code(401).send({
        statusCode: 401,
        error: 'Unauthorized!',
        message: 'MFA verification required',
      });
    }
    req.user = decoded;
  } catch (err) {
    return rep.status(401).send({ message: 'Invalid token' });
  }
});

// Register routes
import chatRoutes from './routes/chat.js';
import messageRoutes from './routes/message.js';
import metricsPlugin from "fastify-metrics";

await fastify.register(metricsPlugin, {
    endpoint: "/metrics",
    routeMetrics: {
        enabled: true,
        routeBlacklist: ["/metrics"],
    },
});
await fastify.register(chatRoutes, { prefix: '/chat' });
await fastify.register(messageRoutes, { prefix: '/message' });

// Health check
fastify.get('/health', async () => ({ status: 'ok', service: 'chat', timestamp: new Date().toISOString() }));

// Connect to database
await prisma.$connect();
fastify.log.info('Database connected');

// Start server
try {
  await fastify.listen({ host: '0.0.0.0', port: parseInt(process.env.PORT || '3004') });
  console.log('💬 Chat Service running on port 3004');
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
