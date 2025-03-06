import Redis from 'ioredis';
import logger from './logger';
import ENV from './env';

let redisClient: Redis | null = null;

export async function createRedisClient(): Promise<Redis> {
  if (!redisClient) {
    try {
      redisClient = new Redis(ENV.REDIS_URL || 'redis://localhost:6379');

      redisClient.on('error', (error) => {
        logger.error('Redis error:', error);
      });

      redisClient.on('connect', () => {
        logger.info('Redis client connected');
      });
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  return redisClient;
}

export async function getCache<T>(key: string): Promise<T | null> {
  if (!redisClient) {
    await createRedisClient();
  }

  try {
    const data = await redisClient!.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Error getting cache for key ${key}:`, error);
    return null;
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  expiresInSeconds = 3600
): Promise<void> {
  if (!redisClient) {
    await createRedisClient();
  }

  try {
    await redisClient!.set(key, JSON.stringify(value), 'EX', expiresInSeconds);
  } catch (error) {
    logger.error(`Error setting cache for key ${key}:`, error);
  }
}

export async function invalidateCache(key: string): Promise<void> {
  if (!redisClient) {
    await createRedisClient();
  }

  try {
    await redisClient!.del(key);
  } catch (error) {
    logger.error(`Error invalidating cache for key ${key}:`, error);
  }
}

export function getCacheKey(...parts: string[]): string {
  return parts.join(':');
}

export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

export default {
  getCache,
  setCache,
  invalidateCache,
  getCacheKey,
  closeRedisConnection,
};
