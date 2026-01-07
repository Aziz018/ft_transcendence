import "@fastify/jwt";

declare module "@fastify/jwt" {
    interface FastifyJWT {
        user: {
            uid: string;
            id: string;
            name?: string;
            email?: string;
            mfa_required?: boolean;
        };
    }
}
