
import { v4 as uuid } from 'uuid';
import { Buffer } from 'node:buffer';

async function main() {
    const email = `test_login_${uuid().substring(0, 8)}@example.com`;
    const password = "password123";
    const name = "TestLogin";
    const baseUrl = "http://localhost:3000"; // Assuming default port

    console.log(`Testing Login Flow against ${baseUrl}`);
    console.log(`1. Registering user: ${email}`);

    const regRes = await fetch(`${baseUrl}/v1/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });

    if (!regRes.ok) {
        console.error("Registration failed:", await regRes.text());
        return;
    }
    console.log("Registration success.");

    console.log("2. Logging in...");
    const loginRes = await fetch(`${baseUrl}/v1/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    if (!loginRes.ok) {
        console.error("Login failed:", await loginRes.text());
        return;
    }

    const loginData = await loginRes.json();
    console.log("Login success. Data:", loginData);

    const token = loginData.access_token;
    if (!token) {
        console.error("No access token returned!");
        return;
    }

    // Decode JWT (simple base64 decode of payload)
    const payloadPart = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(payloadPart, 'base64').toString());

    console.log("Token Payload:", payload);

    if (payload.mfa_required === true) {
        console.error(">>> FAILURE: mfa_required is TRUE for a new user! <<<");
    } else {
        console.log(">>> SUCCESS: mfa_required is false. <<<");
    }
}

main().catch(console.error);
