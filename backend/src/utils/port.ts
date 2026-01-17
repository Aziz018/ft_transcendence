import { createServer } from "net";

/**
 * Get an available port
 * Tries the preferred port first, then falls back to finding a random available port
 */
export async function getAvailablePort(preferredPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();

    server.once("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        // Port is in use, find a random available port
        console.warn(
          `⚠️  Port ${preferredPort} is in use, finding available port...`
        );
        findRandomAvailablePort()
          .then(resolve)
          .catch(reject);
      } else {
        reject(err);
      }
    });

    server.once("listening", () => {
      server.close();
      console.log(`✅ Port ${preferredPort} is available`);
      resolve(preferredPort);
    });

    server.listen(preferredPort, "0.0.0.0");
  });
}

/**
 * Find a random available port
 */
function findRandomAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();

    server.once("error", reject);
    server.once("listening", () => {
      const address = server.address();
      if (address && typeof address === "object") {
        const port = address.port;
        server.close();
        console.log(`✅ Using available port: ${port}`);
        resolve(port);
      } else {
        reject(new Error("Failed to get port address"));
      }
    });

    // Port 0 tells OS to assign an available port
    server.listen(0, "0.0.0.0");
  });
}
