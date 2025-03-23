export const testEnvironment = 'node';
export const setupFilesAfterEnv = ['<rootDir>/test/setup.ts'];
export const testMatch = ['**/test/**/*.test.ts'];
export const transform = {
  '^.+\\.ts$': 'ts-jest',
};
export const moduleNameMapper = {
  '^@/(.*)$': '<rootDir>/src/$1',
};
