import type { Express } from "express";
import type { Server } from "http";
import type { Test } from "supertest";
import type { Sequelize } from "sequelize";

import { setUpAssociations } from "../src/associations";
import { initializeModels } from "../src/models";
import { createApp } from "../src/server";
import { Student } from "../src/models";
import { APIKey } from "../src/models/api_key";
import { config } from "dotenv";
import { getDatabaseConnection } from "../src/database";
import { createConnection, Connection } from "mysql2/promise";

export function authorize(request: Test): Test {
  return request.set({ Authorization: process.env.CDS_API_KEY });
}

export async function createTestMySQLConnection(): Promise<Connection> {
  return createConnection({
    host: process.env.DB_TEST_HOSTNAME as string,
    user: process.env.DB_TEST_USERNAME as string,
    password: process.env.DB_TEST_PASSWORD as string,
  });
}

export async function setupTestDatabase(): Promise<Sequelize> {
  config();
  const username = process.env.DB_TEST_USERNAME as string;
  const password = process.env.DB_TEST_PASSWORD as string;
  const host = process.env.DB_TEST_HOSTNAME as string;
  const connection = await createTestMySQLConnection();
  await connection.query("CREATE DATABASE IF NOT EXISTS test;");
  const db = getDatabaseConnection({
    dbName: "test",
    username,
    password,
    host,
  });
  await db.query("USE test;");
  initializeModels(db);
  setUpAssociations();

  // We need to close when the connection terminates!
  // See https://github.com/sequelize/sequelize/issues/7953
  // and https://stackoverflow.com/a/45114507
  // db.sync({ force: true, match: /test/ }).finally(() => db.close());
  await syncTables();
  await addTestData();

  return db;
}

export async function teardownTestDatabase(): Promise<void> {
  const connection = await createTestMySQLConnection();
  await connection.query("DROP DATABASE test;");
}

export async function syncTables(): Promise<void> {
  await APIKey.sync({ force: true });
  await Student.sync({ force: true });
}

export async function addAPIKey(): Promise<APIKey | void> {
  // Set up some basic data that we're going to want
  return APIKey.create({
    hashed_key: process.env.HASHED_API_KEY as string,
    client: "Tests",
  });
}

export async function addTestData() {
  await addAPIKey();
}

export function createTestApp(db: Sequelize): Express {
  return createApp(db);
}

export function runApp(app: Express, port = 8080, callback?: () => void): Server {
  return app.listen(port, callback);
}
