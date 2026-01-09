import type { FastifyReply, FastifyRequest } from "fastify";

import type AuthService from "../services/auth.js";
import type OAuthProvider from "../models/auth.js";
import type { OAuthUserInfo } from "models/user.js";
import { prisma } from "./prisma.js";

/**
 * Handles OAuth authentication flow for a given provider.
 *
 * Retrieves an access token, fetches user info, authenticates the user,
 * generates a signed JWT, and stores it in an HTTP-only cookie.
 *
 * @async
 * @function authHelper
 *
 * @param {FastifyRequest} req - The Fastify request object, containing OAuth state and code.
 * @param {FastifyReply} res - The Fastify reply object, used to set cookies on response.
 * @param {string} provider - The name of the OAuth provider (e.g., `"google"`, `"facebook"`).
 *
 * @returns {Promise<string>} A signed JWT access token for the authenticated user.
 *
 * @throws {AuthServiceError_t | Error} If the provider is invalid, token retrieval fails,
 * user info cannot be fetched, or JWT signing fails.
 *
 * @example
 * fastify.get('/auth/google/callback', async (req, res) => {
 *   const token = await authHelper(req, res, 'google');
 *   res.send({ access_token: token });
 * });
 */
export const authHelper = async (
  req: FastifyRequest,
  res: FastifyReply,
  provider: string
): Promise<string> => {
  let token = "";
  const authService: AuthService = req.server.service.auth;
  const oauthProvider: OAuthProvider | undefined =
    authService.providers[provider];

  if (!oauthProvider) {
    authService.throwErr({
      code: 500,
      message: "chosen provider does not exist",
    });
  }
  const { access_token } = await oauthProvider!.getAccessToken(req);
  const user_info: OAuthUserInfo = await oauthProvider!.getUserInfo(
    access_token
  );

  // Check if user exists for 2FA verification
  // We use the service instead of direct prisma access to avoid potential issues if prisma client isn't fully ready or if we want to use the service layer abstraction
  const user = await req.server.service.user.fetchBy({
    email: user_info.email,
  });

  // Only check 2FA status if user already exists
  if (user) {
    const user2faStatus = await req.server.service.totp.status(user.id!);
    if (user2faStatus) {
      token = req.jwt.sign(
        {
          uid: user.id!,
          name: user.name!,
          email: user.email!,
          createdAt: user.createdAt!,
          mfa_required: true,
        },
        {
          expiresIn: "5m",
        }
      );

      res.setCookie("access_token", token, {
        path: "/",
        httpOnly: true,
        secure: true,
      });

      // We need to return the token here, but the controller expects a string token return from authHelper
      // However, we are sending a response here. This might be tricky.
      // The controller calls authHelper and then sends HTML.
      // If we send response here, the controller will try to send another response.
      // Let's NOT send response here, but return a special token or handle it in controller.
      // Actually, authHelper is designed to return the token string.
      // The controller uses that token to send the HTML with postMessage.
      
      // If 2FA is required, we return this temporary token.
      // The frontend will receive it, save it, and then redirect to dashboard.
      // Dashboard will see mfa_required and redirect to secondary login.
      // So we just need to return this token.
      
      return token;
    }
  }

  // authenticate() will register new users or fetch existing ones
  token = await authService.authenticate(user_info);

  res.setCookie("access_token", token, {
    path: "/",
    httpOnly: true,
    secure: true,
  });

  return token;
};
