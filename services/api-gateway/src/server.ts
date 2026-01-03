import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import websocket from '@fastify/websocket';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import oauth2 from '@fastify/oauth2';
import axios from 'axios';
import multipart from '@fastify/multipart';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocket } from 'ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fastify = Fastify({ logger: true });

// Service URLs
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://user-service:3002';
const FRIEND_SERVICE = process.env.FRIEND_SERVICE_URL || 'http://friend-service:3003';
const CHAT_SERVICE = process.env.CHAT_SERVICE_URL || 'http://chat-service:3004';

// CORS
await fastify.register(cors, {
  origin: (origin, cb) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:8080',
      'http://localhost',
      process.env.FRONTEND_ORIGIN,
    ].filter(Boolean);
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
});

// Plugins
await fastify.register(jwt, { secret: process.env.JWT_SECRET || 'supersecret' });
await fastify.register(cookie, { secret: process.env.CKE_SECRET || 'supersecret' });
await fastify.register(multipart, { limits: { fileSize: 10485760 } });
await fastify.register(rateLimit, {
  global: true,
  max: 100,
  timeWindow: 10 * 1000,
});

await fastify.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/',
});

await fastify.register(swagger, {
  openapi: {
    info: {
      title: 'ft_transcendence API',
      version: '1.0.0',
    },
  },
});

await fastify.register(swaggerUi, {
  routePrefix: '/docs',
});

await fastify.register(websocket);

// OAuth2 Clients
await fastify.register(oauth2, {
  name: 'googleOAuth2',
  scope: ['profile', 'email'],
  credentials: {
    client: {
      id: process.env.GOOGLE_CLIENT_ID || '',
      secret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    auth: oauth2.GOOGLE_CONFIGURATION,
  },
  startRedirectPath: '/v1/auth/google',
  callbackUri: 'http://localhost:3000/v1/auth/google/callback',
});

await fastify.register(oauth2, {
  name: 'facebookOAuth2',
  scope: ['email', 'public_profile'],
  credentials: {
    client: {
      id: process.env.FACEBOOK_CLIENT_ID || '',
      secret: process.env.FACEBOOK_CLIENT_SECRET || '',
    },
    auth: oauth2.FACEBOOK_CONFIGURATION,
  },
  startRedirectPath: '/v1/auth/facebook',
  callbackUri: 'http://localhost:3000/v1/auth/facebook/callback',
});

await fastify.register(oauth2, {
  name: 'intra42OAuth2',
  scope: ['public'],
  credentials: {
    client: {
      id: process.env.INTRA42_CLIENT_ID || '',
      secret: process.env.INTRA42_CLIENT_SECRET || '',
    },
    auth: {
      authorizeHost: 'https://api.intra.42.fr',
      authorizePath: '/oauth/authorize',
      tokenHost: 'https://api.intra.42.fr',
      tokenPath: '/oauth/token',
    },
  },
  startRedirectPath: '/v1/auth/intra42',
  callbackUri: 'http://localhost:3000/v1/auth/intra42/callback',
});

// Forward requests to services
async function forwardRequest(serviceUrl: string, req: any, reply: any) {
  try {
    const headers: any = { ...req.headers };
    delete headers.host;
    delete headers.connection;
    delete headers['content-length'];

    const response = await axios({
      method: req.method,
      url: `${serviceUrl}${req.url.replace(/^\/v1\/[^/]+/, '')}`,
      data: req.body,
      headers: headers,
      params: req.query,
      validateStatus: () => true,
      maxRedirects: 0,
    });

    Object.keys(response.headers).forEach(key => {
      reply.header(key, response.headers[key]);
    });

    reply.code(response.status).send(response.data);
  } catch (error: any) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Service unavailable' });
  }
}

// Route to services
fastify.all('/v1/auth/*', async (req, reply) => forwardRequest(AUTH_SERVICE, req, reply));
fastify.all('/v1/totp/*', async (req, reply) => forwardRequest(AUTH_SERVICE, req, reply));
fastify.all('/v1/user/*', async (req, reply) => forwardRequest(USER_SERVICE, req, reply));
fastify.all('/v1/friend/*', async (req, reply) => forwardRequest(FRIEND_SERVICE, req, reply));
fastify.all('/v1/chat/*', { websocket: false }, async (req, reply) => forwardRequest(CHAT_SERVICE, req, reply));
fastify.all('/v1/message/*', { websocket: false }, async (req, reply) => forwardRequest(CHAT_SERVICE, req, reply));

// WebSocket proxy for chat
fastify.get('/v1/chat/ws', { websocket: true }, (connection, req) => {
  const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
  const wsUrl = `ws://chat-service:3004/ws${token ? `?token=${token}` : ''}`;
  const ws = new WebSocket(wsUrl);
  
  connection.socket.on('message', (message) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
  
  ws.on('message', (message) => {
    connection.socket.send(message);
  });
  
  connection.socket.on('close', () => ws.close());
  ws.on('close', () => connection.socket.close());
  ws.on('error', (err) => {
    fastify.log.error(err);
    connection.socket.close();
  });
});

// Health check
fastify.get('/health', async () => ({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() }));

// Start server
try {
  await fastify.listen({ host: '0.0.0.0', port: parseInt(process.env.PORT || '3000') });
  console.log('🚀 API Gateway running on port 3000');
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
