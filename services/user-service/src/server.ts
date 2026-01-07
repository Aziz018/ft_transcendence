import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { PrismaClient } from './generated/prisma/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

await fastify.register(cors, {
  origin: (origin, cb) => {
    // Allow all origins for internal service-to-service communication
    // API Gateway will handle external CORS
    cb(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Authorization', 'Content-Type'],
  preflight: true,
  optionsSuccessStatus: 204,
});

await fastify.register(jwt, { secret: process.env.JWT_SECRET || 'supersecret' });
await fastify.register(cookie, { secret: process.env.CKE_SECRET || 'supersecret' });
await fastify.register(multipart, { limits: { fileSize: 10485760 } });

// Add hook to ensure JSON responses have correct Content-Type
fastify.addHook('onSend', async (request, reply, payload) => {
  if (typeof payload === 'object' && payload !== null && !reply.hasHeader('Content-Type')) {
    reply.header('Content-Type', 'application/json; charset=utf-8');
  }
  return payload;
});

// Serve static files for avatars
const publicDir = path.join(__dirname, '..', 'public');
await fastify.register(fastifyStatic, {
  root: publicDir,
  prefix: '/',
});

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
  
  // const isBlackListed = await prisma.blacklistedToken.findUnique({ where: { token } });
  // if (isBlackListed) {
  //   return rep.code(401).send({
  //     statusCode: 401,
  //     error: 'Unauthorized!',
  //     message: 'Token blacklisted',
  //   });
  // }
  
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

// Register Prisma
fastify.decorate('prisma', prisma);

// Register routes
import userRoutes from './routes/user.js';

await fastify.register(userRoutes, { prefix: '' });

// Health check
fastify.get('/health', async () => ({ status: 'ok', service: 'user', timestamp: new Date().toISOString() }));

// Connect to database
await prisma.$connect();
fastify.log.info('Database connected');

// Start server
try {
  await fastify.listen({ host: '0.0.0.0', port: parseInt(process.env.PORT || '3002') });
  console.log('👤 User Service running on port 3002');
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
