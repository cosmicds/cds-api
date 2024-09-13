import { Express } from "express";
import request from "supertest";
import { Sequelize } from "sequelize";

import { setUpAssociations } from "../associations";
import { initializeModels } from "../models";
import { createApp } from "../server";

export function authorizedRequest(app: Express) {
  return request(app)
    .set("Authorization", process.env.CDS_API_KEY);
}

// Just a pass-through for now
// Maybe we'll add more in the future
export function unauthorizedRequest(app: Express) {
  return request(app);
}

function createTestDatabase(): Sequelize {
  const db = new Sequelize({ dialect: "mysql" });
  db.query("CREATE DATABASE IF NOT EXISTS test");
  return db;
}

const testDB = createTestDatabase();
setUpAssociations();
initializeModels(testDB);

const app = createApp(testDB);

export default app;
