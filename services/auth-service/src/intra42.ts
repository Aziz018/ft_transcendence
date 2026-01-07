import type { FastifyReply, FastifyRequest } from "fastify";
import { authHelper } from "../utils/auth.js";

/**
 * 42 Intra OAuth callback controller.
 *
 * Handles the OAuth callback from 42 Intra after user authorization.
 * Exchanges the authorization code for access token and retrieves user profile.
 * Creates or updates user in database and generates JWT tokens.
 *
 * @param {FastifyRequest} req - Fastify request object containing OAuth code
 * @param {FastifyReply} res - Fastify response object
 * @returns {Promise<void>} Redirects to frontend with access token
 */
export const intra42OAuthCallbackController = async (
  req: FastifyRequest,
  res: FastifyReply
): Promise<void> => {
  const token = await authHelper(req, res, "intra42");

  if (!token) {
    return res.status(401).send({ error: "Authentication failed" });
  }

  // Send token to frontend via popup message
  const html = `
    <!DOCTYPE html>
    <html>
    <head><title>42 Intra Login</title></head>
    <body>
        <script>
            if (window.opener) {
                window.opener.postMessage({ access_token: "${token}" }, "${process.env.FRONTEND_ORIGIN}");
                window.close();
            } else {
                window.location.href = "${process.env.FRONTEND_ORIGIN}";
            }
        </script>
        <p>Authentication successful. You can close this window.</p>
    </body>
    </html>
    `;

  res.type("text/html").send(html);
};
