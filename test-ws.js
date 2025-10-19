#!/usr/bin/env node

const WebSocket = require("ws");

// Use the token from the browser console error
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI4MjFjNGRjMC1iOTdmLTQ1NWItOGYxOC04YmRiZTczZGIzZjQiLCJuYW1lIjoia29rbyIsImVtYWlsIjoia29rb0BnbWFpbC5jb20iLCJjcmVhdGVkQXQiOiIyMDI1LTEwLTEwVDA5OjMxOjAyLjE4N1oiLCJtZmFfcmVxdWlyZWQiOmZhbHNlLCJpYXQiOjE3NjAzMDA0ODR9.y_KJS9KAO0nzCStV461QQOO00V3Dc2SEl7X3lnhswoY";

const wsUrl = `ws://localhost:3000/v1/chat/ws?token=${encodeURIComponent(
  token
)}`;

console.log("🔌 Connecting to:", wsUrl);

const ws = new WebSocket(wsUrl);

ws.on("open", () => {
  console.log("✅ WebSocket connected successfully!");

  // Send a test message
  const testMessage = {
    type: "get_messages",
    payload: {
      roomId: "test-room-123",
    },
  };

  console.log("📤 Sending test message:", JSON.stringify(testMessage));
  ws.send(JSON.stringify(testMessage));
});

ws.on("message", (data) => {
  console.log("📨 Received:", data.toString());
});

ws.on("error", (error) => {
  console.error("❌ WebSocket error:", error.message);
});

ws.on("close", (code, reason) => {
  console.log(
    `🔌 WebSocket closed. Code: ${code}, Reason: ${
      reason || "No reason provided"
    }`
  );
  process.exit(code === 1000 ? 0 : 1);
});

// Close after 5 seconds
setTimeout(() => {
  console.log("⏱️ Closing connection...");
  ws.close();
}, 5000);
