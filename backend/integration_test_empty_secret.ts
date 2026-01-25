
import { PrismaClient } from './src/generated/prisma/index.js';
import { v4 as uuid } from 'uuid';
import { Buffer } from 'node:buffer';

const prisma = new PrismaClient();

async function main() {
    const email = `test_empty_${uuid().substring(0, 8)}@example.com`;
    const password = "password123";
    const name = "TestEmpty";
    const baseUrl = "http://localhost:3000";

    console.log(`1. Registering user: ${email}`);
    const regRes = await fetch(`${baseUrl}/v1/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });

    if (!regRes.ok) {
        throw new Error(`Registration failed: ${await regRes.text()}`);
    }
    const regData = await regRes.json();
    const userId = regData.user.id;
    console.log(`   User ID: ${userId}`);

    console.log(`2. Injecting empty secret "" into DB for this user...`);
    await prisma.user.update({
        where: { id: userId },
        data: { secret: "" }
    });

    console.log(`3. Logging in...`);
    const loginRes = await fetch(`${baseUrl}/v1/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    if (!loginRes.ok) throw new Error(`Login failed: ${await loginRes.text()}`);

    const loginData = await loginRes.json();
    const token = loginData.access_token;

    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    console.log("Token Payload:", payload);

    if (payload.mfa_required === true) {
        console.error(">>> FAILURE: Server returned mfa_required=TRUE for empty secret! (Fix not active) <<<");
    } else {
        console.log(">>> SUCCESS: Server returned mfa_required=FALSE. Fix is active. <<<");
    }

    // Cleanup
    await prisma.user.delete({ where: { id: userId } });
}

main().catch(console.error).finally(() => prisma.$disconnect());
