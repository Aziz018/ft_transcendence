import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import { PrismaClient } from './generated/prisma/index.js';

export const wsValidators: Record<string, Ajv.ValidateFunction> = {};

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

await fastify.register(cors, {
  origin: true,
  credentials: true,
});

await fastify.register(jwt, { secret: process.env.JWT_SECRET || 'supersecret' });
await fastify.register(cookie, { secret: process.env.CKE_SECRET || 'supersecret' });

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
import friendRoutes from './routes/friend.js';

await fastify.register(friendRoutes, { prefix: '/friend' });

// Health check
fastify.get('/health', async () => ({ status: 'ok', service: 'friend', timestamp: new Date().toISOString() }));

// Connect to database
await prisma.$connect();
fastify.log.info('Database connected');

// Start server
try {
  await fastify.listen({ host: '0.0.0.0', port: parseInt(process.env.PORT || '3003') });
  console.log('👥 Friend Service running on port 3003');
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
