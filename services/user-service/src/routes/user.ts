import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import bcrypt from 'bcrypt';

export default async (fastify: FastifyInstance, opts: FastifyPluginOptions): Promise<void> => {
  // Register new user
  fastify.post('/register', async (req: any, reply: any) => {
    try {
      const { email, name, password } = req.body;

      if (!email || !name || !password) {
        return reply.code(400).send({ message: 'Email, name, and password are required' });
      }

      // Check if user already exists
      const existingUser = await (fastify as any).prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return reply.code(409).send({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await (fastify as any).prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
      });

      // Generate JWT token
      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        name: user.name,
      });

      // Set cookie
      reply.setCookie('access_token', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
      });

      return reply.code(201).send({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        access_token: token,
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ message: 'Internal server error' });
    }
  });

  // Login user
  fastify.post('/login', async (req: any, reply: any) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return reply.code(400).send({ message: 'Email and password are required' });
      }

      // Find user
      const user = await (fastify as any).prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.password) {
        return reply.code(401).send({ message: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return reply.code(401).send({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        name: user.name,
      });

      // Set cookie
      reply.setCookie('access_token', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
      });

      return reply.code(200).send({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        access_token: token,
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ message: 'Internal server error' });
    }
  });

  // Get user profile
  fastify.get('/profile', { preHandler: (fastify as any).authentication_jwt }, async (req: any, reply: any) => {
    try {
      const user = await (fastify as any).prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          uid: true,
          email: true,
          name: true,
          avatar: true,
          createdAt: true,
        },
      });

      if (!user) {
        return reply.code(404).send({ message: 'User not found' });
      }

      return reply.code(200).send(user);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ message: 'Internal server error' });
    }
  });
};
