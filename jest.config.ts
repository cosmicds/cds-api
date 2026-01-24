import type { Config } from "jest";

const config: Config = {
  verbose: true,
  silent: false,
  preset: "ts-jest",
  testEnvironment: "node",
  testRegex: "/.*\\/?tests\\/.*\\.test\\.ts",
  coveragePathIgnorePatterns: [
    "./node_modules/",
    "./dist/",
  ],
  testPathIgnorePatterns: [
    "./node_modules/",
    "./dist/",
  ],
  globalSetup: "./tests/setup.ts",
  globalTeardown: "./tests/teardown.ts",
  testTimeout: 10_000,
};

export default config;
