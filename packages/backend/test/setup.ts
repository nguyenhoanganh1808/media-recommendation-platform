// test/setup.ts
import { connectDB, disconnectDB } from "../src/config/database";
import { connectRedis, disconnectRedis } from "../src/config/redis";

// Mock the Redis client
jest.mock("../src/config/redis", () => {
  const mockRedisClient = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn().mockResolvedValue([]),
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
  };

  return {
    getRedisClient: jest.fn().mockReturnValue(mockRedisClient),
    redisClient: mockRedisClient,
  };
});

// Mock the cache middleware
jest.mock("../src/middlewares/cache.middleware", () => {
  return {
    cacheMiddleware: jest.fn().mockImplementation(() => {
      return (req: any, res: any, next: any) => next();
    }),
    clearCacheByPattern: jest.fn().mockResolvedValue(undefined),
  };
});

// Set test environment
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_EXPIRES_IN = "1h";

beforeAll(async () => {
  // Set up any global configurations (e.g., database connection)
  await connectDB();
  await connectRedis();
});

afterAll(async () => {
  // Clean up any global configurations (e.g., database connection)
  await disconnectDB();
  await disconnectRedis();
});
