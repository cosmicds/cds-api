import type { Config } from "jest";

const config: Config = {
  verbose: true,
  silent: false,
  preset: "ts-jest",
  testEnvironment: "node",
  coveragePathIgnorePatterns: [
    "./node_modules/",
    "./dist/",
  ],
  testPathIgnorePatterns: [
    "./node_modules/",
    "./dist/",
  ],
  globalSetup: "./tests/setup.ts",
  globalTeardown: "./tests/teardown.ts"
};

export default config;
