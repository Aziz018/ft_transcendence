import type {
    FastifyReply,
    FastifyRequest
} from "fastify";

import type UserModel from "../models/user.js";
import { prisma } from "../utils/prisma.js";



export const getStatusController= async (
    req: FastifyRequest,
    rep: FastifyReply
): Promise<void> => {
    await req.server.service.auth.validateAccess(
      req.cookies.access_token!,
      req.url
    );
    const status = await req.server.service.totp.status(req.user.uid);
    rep.code(200).send({ status });
}

export const OTPConfirmController = async (
  req: FastifyRequest<{ Body: { mfa_code: string } }>,
  rep: FastifyReply
): Promise<void> => {
  await req.server.service.auth.validateAccess(
    req.cookies.access_token!,
    req.url
  );
  const status = await req.server.service.totp.status(req.user.uid);
  if (!status) {
      return rep.code(400).send({ message: '2fa not setup yet' });
  }
  const secret = await req.server.service.totp.getUserSecret(req.user.uid);
  const ok = req.server.service.totp.verify(secret, req.body.mfa_code);

  let user = await prisma.user.findUnique({
    where: { id: req.user.uid }
  })
  if (user?.totpConfirmed) {
    return rep.code(409).send({ message: 'already confirmed' });
  }

  if (!ok) {
    return rep.code(401).send({ message: 'invalid 2fa code' });
  }

  await prisma.user.update({
    where: { id: req.user.uid },
    data: { totpConfirmed: true }
  });

  rep.code(200).send();
};

export const disable2FAController = async (
  req: FastifyRequest,
  rep: FastifyReply
): Promise<void> => {
  await req.server.service.auth.validateAccess(
    req.cookies.access_token!,
    req.url
  );
  const user = await prisma.user.findUnique({
    where: { id: req.user.uid }
  });

  if (!user?.totpConfirmed) {
    return rep.code(403).send({ message: 'confirm 2fa first' });
  }

  await req.server.service.totp.disable(req.user.uid);

  await prisma.user.update({
    where: { id: req.user.uid },
    data: { totpConfirmed: false }
  });

  rep.code(204).send();
};

export const getOTPAuthUrlController = async (
  req: FastifyRequest,
  rep: FastifyReply
): Promise<void> => {
  await req.server.service.auth.validateAccess(
    req.cookies.access_token!,
    req.url
  );
  if (await req.server.service.totp.status(req.user.uid)) {
    return rep.code(409).send({ message: '2fa already enabled' });
  }

  const user = await req.server.service.user.fetchBy({ id: req.user.uid });
  if (!user) {
    return rep.code(404).send({ message: 'user not found' });
  }

  let secret = user.secret;

  if (!secret) {
    secret = req.server.service.totp.generateSecret();
    await prisma.user.update({
      where: { id: req.user.uid },
      data: { secret }
    });
  }

  rep.code(200).send({
    url: req.server.service.totp.getOTPAuthUrl(
      secret,
      user.email,
      'PongRush'
    )
  });
};

export const OTPVerificationController = async (req: FastifyRequest<{ Body: { mfa_code: string } }>, rep: FastifyReply) => {
    const user: UserModel | null = await req.server
        .service
        .user
        .fetchBy({ 'id': req.user.uid });
    const userSecret = await req.server
        .service
        .totp
        .getUserSecret(req.user.uid);
    const userToken = req.body.mfa_code;
    const result = req.server.service.totp.verify(userSecret, userToken);
    if (!result) {
        rep.code(401).send({
            statusCode: 401,
            error: 'Unauthorized!',
            message: 'invalid 2fa code 😡💢'
        });
    } else {
        const ujwt = req.cookies['access_token'];
        const decoded = req.jwt.verify<{ exp?: number }>(ujwt!);
        await prisma.blacklistedToken.create({
            data: {
                token: ujwt!,
                expiresAt: new Date(decoded!.exp! * 1000)
            }
        })
        const token = req.jwt.sign({
            uid: user!.id,
            createdAt: user!.createdAt,
            mfa_required: false
        }, {
            expiresIn: "1h"
        });

        rep.setCookie('access_token', token, {
            path: '/',
            httpOnly: true,
            secure: true
        });

        rep.code(200).send({
            access_token: token
        });
    }
}
