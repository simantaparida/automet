const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/tests/**/*.test.ts', '<rootDir>/tests/**/*.test.tsx'],
  collectCoverageFrom: [
    'src/lib/roiCalculator.ts',
    'src/lib/auth-middleware.ts',
    'pages/api/contact.ts',
    'pages/api/admin/contact-messages.ts',
    'pages/api/inventory/index.ts',
    'pages/api/jobs/index.ts',
    'pages/api/sites/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 59,
      functions: 65,
      lines: 65,
      statements: 65,
    },
  },
  testTimeout: 10000,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
