export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['<rootDir>/packages/*/tests/**/*.test.js'],
  collectCoverage: true,
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: ['packages/*/src/**/*.js'],
};
