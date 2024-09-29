/* eslint-disable @typescript-eslint/no-floating-promises */

import { afterAll, beforeAll, describe, it } from "@jest/globals";
import type { Express } from "express";
import type { Sequelize } from "sequelize";
import request from "supertest";

import { authorize, createTestApp, setupTestDatabase, teardownTestDatabase } from "./utils";
import { setupApp } from "../src/app";

let testDB: Sequelize;
let testApp: Express;
beforeAll(async () => {
  testDB = await setupTestDatabase();
  testApp = createTestApp(testDB);
  setupApp(testApp, testDB);
}, 100_000);

afterAll(async () => {
  await teardownTestDatabase();
});

describe("Test root route", () => {

  it("Should show a welcome message + warning", async () => {
    authorize(request(testApp).get("/"))
      .expect(200)
      .expect("Content-Type", /json/)
      .expect({ message: "Welcome to the CosmicDS server! You'll need to include a valid API key with your requests in order to access other endpoints." });
  });

  it("Should show a welcome message", async () => {
    authorize(request(testApp).get("/"))
      .expect(200)
      .expect("Content-Type", /json/)
      .expect({ message: "Welcome to the CosmicDS server!" });
  }, 10_000);
});
