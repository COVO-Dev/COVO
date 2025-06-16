/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  verbose: true,
  preset: "ts-jest",
  transform: {
    "^.+\\.tsx?$": "ts-jest",	
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testMatch: ['**/tests/**/*.test.ts', '**/__tests__/**/*.ts'],
};

module.exports = config;
