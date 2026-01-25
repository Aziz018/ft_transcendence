
import { fastify } from "fastify";
import TOTPService from "./src/services/totp.js";
import { prisma } from "./src/utils/prisma.js";

async function main() {
    // Mock Fastify instance with logger
    const mockFastify = {
        log: {
            debug: console.log,
            info: console.log,
            warn: console.warn,
            error: console.error
        },
        service: {
            totp: null // will be set
        }
    } as any;

    const totpService = new TOTPService(mockFastify);
    mockFastify.service.totp = totpService;

    // Get all users
    const users = await prisma.user.findMany();
    console.log(`Checking status for ${users.length} users...`);

    for (const user of users) {
        // Manually check logic
        const PENDING_PREFIX = "PENDING_";
        const manualCheck = user.secret !== null && user.secret !== "" && !user.secret.startsWith(PENDING_PREFIX);

        // Service check
        // Note: we need to handle potential errors from service if user not found (unlikely here)
        let serviceCheck = false;
        try {
            serviceCheck = await totpService.status(user.id);
        } catch (e) {
            console.error(`Error checking user ${user.id}:`, e);
        }

        console.log(`User: ${user.email} (ID: ${user.id})`);
        console.log(`  - Secret: ${JSON.stringify(user.secret)}`);
        console.log(`  - Manual Check Result: ${manualCheck}`);
        console.log(`  - Service Check Result: ${serviceCheck}`);

        if (manualCheck !== serviceCheck) {
            console.error("  >>> DISCREPANCY DETECTED! <<<");
        }
        if (serviceCheck === true) {
            console.warn("  >>> RETURNS TRUE (ENABLED) <<<");
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
