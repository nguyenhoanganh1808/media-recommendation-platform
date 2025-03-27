import app from "./app";
import { logger } from "./config/logger";
import { config } from "./config/env";
import { connectDB } from "./config/database";
import { connectRedis } from "./config/redis";
import { initializeJobs } from "./jobs";

const PORT = config.PORT || 3000;

initializeJobs();

const server = app.listen(PORT, async () => {
  await connectDB();
  await connectRedis();
  logger.info(`🚀 Server started on port ${PORT} in ${config.NODE_ENV} mode`);
  logger.info(
    `🔗 API Documentation available at http://localhost:${PORT}/api-docs`
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  logger.error("UNHANDLED REJECTION! 💥 Shutting down...");
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  logger.error(err.name, err.message);
  process.exit(1);
});

// Handle SIGTERM signal
process.on("SIGTERM", () => {
  logger.info("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    logger.info("💥 Process terminated!");
  });
});

export default server;
