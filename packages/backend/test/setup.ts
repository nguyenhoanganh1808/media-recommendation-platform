// test/setup.ts
import { connectDB, disconnectDB } from '../src/config/database';

beforeAll(async () => {
  // Set up any global configurations (e.g., database connection)
  await connectDB();
});
