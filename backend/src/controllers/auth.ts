/**
 * @note The provider is currently hardcoded at this point [line:14 & line:25].
 * @note A generic callbackController could be implemented to handle multiple providers dynamically,
 *       which would reduce repetition and make adding new providers easier.
 * @note This generic controller would typically use the OAuth "state" parameter to identify
 *       which provider initiated the request, allowing one route to handle all provider callbacks.
 * @note While more elegant in theory, this approach may introduce additional complexity
 *       that could make onboarding new contributors (e.g., @Aziz018) less straightforward.
 * @note Given that, keeping separate, simple callback controllers per provider
 *       is a conscious choice for clarity, maintainability, and team collaboration.
 */

import type { FastifyReply, FastifyRequest } from "fastify";
import { authHelper } from "../utils/auth.js";

export const googleOAuthCallbackController = async (
  req: FastifyRequest,
  res: FastifyReply
): Promise<void> => {
  const token = await authHelper(req, res, "google");

  // Return HTML that sends token to parent window via postMessage
  const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Login Success</title>
        </head>
        <body>
            <script>
                if (window.opener) {
                    window.opener.postMessage(
                        { access_token: '${token}' },
                        '${process.env.FRONTEND_ORIGIN || "http://localhost:5173"
    }'
                    );
                    window.close();
                } else {
                    document.body.innerHTML = '<h2>Authentication successful! You can close this window.</h2>';
                }
            </script>
            <h2>Redirecting...</h2>
        </body>
        </html>
    `;

  res.type("text/html").code(200).send(html);
};

export const facebookOAuthCallbackController = async (
  req: FastifyRequest,
  res: FastifyReply
): Promise<void> => {
  const token = await authHelper(req, res, "facebook");

  // Return HTML that sends token to parent window via postMessage
  const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Login Success</title>
        </head>
        <body>
            <script>
                if (window.opener) {
                    window.opener.postMessage(
                        { access_token: '${token}' },
                        '${process.env.FRONTEND_ORIGIN || "http://localhost:5173"
    }'
                    );
                    window.close();
                } else {
                    document.body.innerHTML = '<h2>Authentication successful! You can close this window.</h2>';
                }
            </script>
            <h2>Redirecting...</h2>
        </body>
        </html>
    `;

  res.type("text/html").code(200).send(html);
};

import { prisma } from "../utils/prisma.js";

export const logoutController = async (
  req: FastifyRequest,
  res: FastifyReply
): Promise<void> => {
  try {
    let token = req.cookies.access_token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      try {
        const decoded = req.jwt.decode<{ exp?: number }>(token);
        if (decoded?.exp) {
          const isBlacklisted = await prisma.blacklistedToken.findUnique({
            where: { token },
          });

          if (!isBlacklisted) {
            await prisma.blacklistedToken.create({
              data: {
                token,
                expiresAt: new Date(decoded.exp * 1000),
              },
            });
          }
        }
      } catch (e) {
        req.log.warn("Failed to blacklist token during logout (might be invalid)");
      }
    }
  } catch (error) {
    req.log.error(error, "Logout processing error");
  }

  // Clear the cookie by setting it to expire in the past
  res.setCookie("access_token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0), // Past date
  });

  res.code(200).send({ message: "Logged out successfully" });
};
