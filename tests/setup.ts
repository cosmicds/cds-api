import type { Express } from "express";
import type { Sequelize } from "sequelize";
import { createTestApp, setupTestDatabase } from "./utils";
import { setupApp } from "../src/app";

export let testDB: Sequelize;
export let testApp: Express;
export default async () => {
  console.log("SETUP");
  testDB = await setupTestDatabase();
  testApp = createTestApp(testDB);
  setupApp(testApp, testDB);
  await new Promise(r => setTimeout(r, 5_000));
};
