import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';

export default async (fastify: FastifyInstance, opts: FastifyPluginOptions): Promise<void> => {
  // Get 2FA status
  fastify.get('/status', {
    preHandler: [(fastify as any).authentication_jwt],
    handler: async (req: any, reply: any) => {
      try {
        const user = await (fastify as any).prisma.user.findUnique({
          where: { id: req.user.id },
          select: { totpSecret: true, totpEnabled: true },
        });

        if (!user) {
          return reply.code(404).send({ message: 'User not found' });
        }

        return reply.code(200).send({
          enabled: user.totpEnabled || false,
          hasSecret: !!user.totpSecret,
        });
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({ message: error });
      }
    },
  });

  // Enable 2FA
  fastify.put('/enable', {
    preHandler: [(fastify as any).authentication_jwt],
    handler: async (req: any, reply: any) => {
      try {
        const user = await (fastify as any).prisma.user.findUnique({
          where: { id: req.user.id },
        });

        if (!user) {
          return reply.code(404).send({ message: 'User not found' });
        }

        if (!user.totpSecret) {
          return reply.code(400).send({ message: 'TOTP secret not generated' });
        }

        await (fastify as any).prisma.user.update({
          where: { id: req.user.id },
          data: { totpEnabled: true },
        });

        return reply.code(200).send({ message: '2FA enabled successfully' });
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({ message: error });
      }
    },
  });

  // Disable 2FA
  fastify.put('/disable', {
    preHandler: [(fastify as any).authentication_jwt],
    handler: async (req: any, reply: any) => {
      try {
        await (fastify as any).prisma.user.update({
          where: { id: req.user.id },
          data: { totpEnabled: false },
        });

        return reply.code(200).send({ message: '2FA disabled successfully' });
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({ message: error });
      }
    },
  });

  // Get QR code for 2FA setup
  fastify.get('/qr-code', {
    preHandler: [(fastify as any).authentication_jwt],
    handler: async (req: any, reply: any) => {
      try {
        const user = await (fastify as any).prisma.user.findUnique({
          where: { id: req.user.id },
        });

        if (!user) {
          return reply.code(404).send({ message: 'User not found' });
        }

        let secret = user.totpSecret;

        if (!secret) {
          secret = authenticator.generateSecret();
          await (fastify as any).prisma.user.update({
            where: { id: req.user.id },
            data: { totpSecret: secret },
          });
        }

        const otpauthUrl = authenticator.keyuri(
          user.email,
          'ft_transcendence',
          secret
        );

        const qrCodeDataURL = await qrcode.toDataURL(otpauthUrl);

        return reply.code(200).send({
          qrCode: qrCodeDataURL,
          secret: secret,
        });
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({ message: error });
      }
    },
  });

  // Verify TOTP code
  fastify.post('/verify', {
    preHandler: [(fastify as any).authentication_jwt],
    handler: async (req: any, reply: any) => {
      try {
        const { code } = req.body;

        if (!code) {
          return reply.code(400).send({ message: 'Code is required' });
        }

        const user = await (fastify as any).prisma.user.findUnique({
          where: { id: req.user.id },
        });

        if (!user || !user.totpSecret) {
          return reply.code(400).send({ message: 'TOTP not configured' });
        }

        const isValid = authenticator.verify({
          token: code,
          secret: user.totpSecret,
        });

        if (!isValid) {
          return reply.code(401).send({ message: 'Invalid code' });
        }

        // Generate new token without mfa_required flag
        const newToken = fastify.jwt.sign({
          id: user.id,
          email: user.email,
          name: user.name,
          mfa_required: false,
        });

        reply.setCookie('access_token', newToken, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
        });

        return reply.code(200).send({
          message: 'Verification successful',
          access_token: newToken,
        });
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({ message: error });
      }
    },
  });
};
