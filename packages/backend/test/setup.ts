// test/setup.ts
import { connectDB, disconnectDB } from '../src/config/database';
import { connectRedis, disconnectRedis } from '../src/config/redis';

beforeAll(async () => {
  // Set up any global configurations (e.g., database connection)
  await connectDB();
  // await connectRedis();
});

afterAll(async () => {
  // Clean up any global configurations (e.g., database connection)
  await disconnectDB();
  // await disconnectRedis();
});
