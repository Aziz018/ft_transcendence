import type { FastifyReply, FastifyRequest } from "fastify";

import type UserModel from "../models/user.js";
import { prisma } from "../utils/prisma.js";

export const getStatusController = async (
  req: FastifyRequest,
  rep: FastifyReply
): Promise<void> => {
  const status = await req.server.service.totp.status(req.user.uid);
  rep.code(200).send({ status });
};

export const enable2FAController = async (
  req: FastifyRequest,
  rep: FastifyReply
): Promise<void> => {
  await req.server.service.totp.enable(req.user.uid);
  rep.code(204);
};

export const disable2FAController = async (
  req: FastifyRequest,
  rep: FastifyReply
): Promise<void> => {
  await req.server.service.totp.disable(req.user.uid);
  rep.code(204);
};

export const getOTPAuthUrlController = async (
  req: FastifyRequest,
  rep: FastifyReply
): Promise<void> => {
  const user: UserModel | null = await req.server.service.user.fetchBy({
    id: req.user.uid,
  });

  let userSecret: string;
  try {
    userSecret = await req.server.service.totp.getUserSecret(req.user.uid);
  } catch (e: any) {
    if (e.message && e.message.includes("2fa is disabled")) {
      await req.server.service.totp.enable(req.user.uid);
      userSecret = await req.server.service.totp.getUserSecret(req.user.uid);
    } else {
      throw e;
    }
  }

  if (!user) {
    rep.status(404).send({
      message: "user not found",
    });
  } else {
    rep.status(200).send({
      url: req.server.service.totp.getOTPAuthUrl(
        userSecret,
        user.email,
        "PongRush"
      ),
    });
  }
};

export const OTPVerificationController = async (
  req: FastifyRequest<{ Body: { mfa_code: string } }>,
  rep: FastifyReply
) => {
  const user: UserModel | null = await req.server.service.user.fetchBy({
    id: req.user.uid,
  });
  const userSecret = await req.server.service.totp.getUserSecret(req.user.uid);
  const userToken = req.body.mfa_code;
  const result = req.server.service.totp.verify(userSecret, userToken);
  if (!result) {
    rep.code(401).send({
      statusCode: 401,
      error: "Unauthorized!",
      message: "invalid 2fa code 😡💢",
    });
  } else {
    // Activate 2FA (remove pending prefix)
    await req.server.service.totp.activate(req.user.uid);

    // Try to get token from cookies first, then Authorization header
    let ujwt = req.cookies["access_token"];

    if (!ujwt && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        ujwt = parts[1];
      }
    }

    if (ujwt) {
      try {
        const decoded = req.jwt.decode<{ exp?: number }>(ujwt);
        if (decoded && decoded.exp) {
          await prisma.blacklistedToken.create({
            data: {
              token: ujwt,
              expiresAt: new Date(decoded.exp * 1000),
            },
          });
        }
      } catch (e) {
        // Ignore token decoding/blacklisting errors if token is invalid
        req.log.warn("Failed to blacklist old token during 2FA verification");
      }
    }

    const token = req.jwt.sign(
      {
        uid: user!.id,
        name: user!.name,
        email: user!.email,
        createdAt: user!.createdAt,
        mfa_required: false,
      },
      {
        expiresIn: "1h",
      }
    );

    rep.setCookie("access_token", token, {
      path: "/",
      httpOnly: true,
      secure: true,
    });

    rep.code(200).send({
      access_token: token,
    });
  }
};
