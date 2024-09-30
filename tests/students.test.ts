/* eslint-disable @typescript-eslint/no-floating-promises */

import { beforeAll, afterAll, describe, it } from "@jest/globals";
import request from "supertest";
import type { Sequelize } from "sequelize";
import type { Express } from "express";

import { authorize, getTestDatabaseConnection } from "./utils";
import { setupApp } from "../src/app";
import { createApp } from "../src/server";

let testDB: Sequelize;
let testApp: Express;
beforeAll(() => {
  testDB = getTestDatabaseConnection();
  testApp = createApp(testDB);
  setupApp(testApp, testDB);
});

afterAll(() => {
  testDB.close();
});

describe("Test educator routes", () => {

  it("Should sign up a student", async () => {
    const data = { username: "abcde", password: "fghij" };
    authorize(request(testApp).post("/students/create"))
      .send(data)
      .expect(200)
      .expect("Content-Type", /json/)
      .expect({
        success: true,
        status: "ok",
        student_info: data,
      });
  });
});
