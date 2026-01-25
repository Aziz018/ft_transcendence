
import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            secret: true,
        }
    });

    console.log("User Secrets Dump:");
    console.table(users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
