
import { PrismaClient } from './src/generated/prisma/index.js';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

async function main() {
    const email = `test_2fa_${uuid()}@example.com`;
    console.log(`Creating user with email: ${email}`);

    // 1. Create User
    const user = await prisma.user.create({
        data: {
            name: 'TestLocal',
            email: email,
            password: 'hash', // fake hash
        },
    });

    console.log(`User created. Secret: ${JSON.stringify(user.secret)}`);

    // 2. Check logic from TOTPService.status
    const PENDING_PREFIX = "PENDING_";
    const userFromDb = await prisma.user.findUnique({ where: { id: user.id } });

    if (!userFromDb) throw new Error("User not found");

    const status = userFromDb.secret !== null && !userFromDb.secret.startsWith(PENDING_PREFIX);
    console.log(`2FA Status (initial): ${status} (Secret: ${JSON.stringify(userFromDb.secret)})`);

    // 3. Force Secret to Empty String
    console.log("Updating secret to empty string ''...");
    await prisma.user.update({
        where: { id: user.id },
        data: { secret: "" },
    });

    const userEmpty = await prisma.user.findUnique({ where: { id: user.id } });
    const statusEmpty = userEmpty!.secret !== null && !userEmpty!.secret!.startsWith(PENDING_PREFIX);
    console.log(`2FA Status (empty string): ${statusEmpty} (Secret: ${JSON.stringify(userEmpty!.secret)})`);
    const statusEmptyFixed = userEmpty!.secret !== null && userEmpty!.secret !== "" && !userEmpty!.secret!.startsWith(PENDING_PREFIX);
    console.log(`2FA Status (empty string with fix): ${statusEmptyFixed} (Secret: ${JSON.stringify(userEmpty!.secret)})`);

    // Cleanup
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.$disconnect();
}

main().catch(console.error);
