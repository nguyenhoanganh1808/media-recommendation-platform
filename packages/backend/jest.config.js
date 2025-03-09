export const testEnvironment = 'node';
export const setupFilesAfterEnv = ['<rootDir>/test/setup.ts'];
export const testMatch = ['**/test/**/*.test.ts'];
export const transform = {
  '^.+\\.ts$': 'ts-jest', // Transform TypeScript files
};
export const moduleNameMapper = {
  '^@/(.*)$': '<rootDir>/src/$1', // Optional: Map aliases (if you use path aliases)
};
