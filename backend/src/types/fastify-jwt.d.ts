import "@fastify/jwt";
import type {UserJWTPayload} from "../models/user.ts";



declare module "@fastify/jwt" {
    interface FastifyJWT {
        user: UserJWTPayload;
    }
}
