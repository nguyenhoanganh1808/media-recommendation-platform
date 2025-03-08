import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createRedisClient } from '../../config/cache';
import logger from '../../config/logger';

const setupRateLimitStore = async () => {
  try {
    const redisClient = await createRedisClient();

    return new RedisStore({
      // @ts-expect-error - Types mismatch between ioredis and redis clients
      sendCommand: (...args: string[]) => redisClient.call(...args),
    });
  } catch (error) {
    logger.error('Failed to create Redis store for rate limiting:', error);
    return undefined; // Fallback to memory store
  }
};

// Standard API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'error',
    message: 'Too many requests, please try again later',
  },
});

// Authentication rate limiter (more strict)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 authentication attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later',
  },
});

// Initialize Redis store for rate limiting
(async () => {
  const store = await setupRateLimitStore();
  if (store) {
    (apiLimiter as any).store = store;
    (authLimiter as any).store = store;
    logger.info('Rate limiting using Redis store initialized');
  } else {
    logger.warn('Rate limiting using memory store (Redis not available)');
  }
})();
