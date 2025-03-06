import app from './app';
import { PrismaClient } from '@prisma/client';
import logger from './config/logger';
import { createRedisClient } from './config/cache';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Connect to the database
    await prisma.$connect();
    logger.info('Connected to the database successfully');

    // Initialize Redis connection
    await createRedisClient();
    logger.info('Connected to Redis successfully');

    // Start the server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle termination signals
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

export { prisma };
