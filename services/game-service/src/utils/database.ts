import { PrismaClient } from '../generated/prisma/index.js';

/**
 * Singleton Prisma Client instance for database operations.
 * Follows the same pattern as other services in the ft_transcendence project.
 */
class DatabaseClient {
  private static instance: PrismaClient | null = null;

  /**
   * Gets the singleton Prisma client instance.
   * Creates a new instance if one doesn't exist.
   */
  static getInstance(): PrismaClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
      });

      // Handle cleanup on process termination
      process.on('beforeExit', async () => {
        await DatabaseClient.disconnect();
      });
    }
    return DatabaseClient.instance;
  }

  /**
   * Disconnects from the database and cleans up resources.
   */
  static async disconnect(): Promise<void> {
    if (DatabaseClient.instance) {
      await DatabaseClient.instance.$disconnect();
      DatabaseClient.instance = null;
    }
  }

  /**
   * Checks if the database connection is healthy.
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const client = DatabaseClient.getInstance();
      await client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

/**
 * Database wrapper for game service.
 * Provides a consistent interface similar to other services.
 */
export class DataBaseWrapper {
  protected prisma: PrismaClient;
  protected serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
    this.prisma = DatabaseClient.getInstance();
    console.log(`✅ ${serviceName} initialized with database connection`);
  }

  /**
   * Gets the Prisma client instance.
   */
  getPrisma(): PrismaClient {
    return this.prisma;
  }

  /**
   * Performs a health check on the database connection.
   */
  async healthCheck(): Promise<boolean> {
    return DatabaseClient.healthCheck();
  }
}

// Export the singleton instance getter
export const getPrismaClient = () => DatabaseClient.getInstance();

export default DataBaseWrapper;
