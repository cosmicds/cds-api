/* eslint-disable @typescript-eslint/no-floating-promises */

import { beforeAll, afterAll, describe, it, expect } from "@jest/globals";
import request from "supertest";
import type { Sequelize } from "sequelize";
import type { Express } from "express";

import { authorize, getTestDatabaseConnection } from "./utils";
import { setupApp } from "../src/app";
import { Student } from "../src/models";
import { createApp } from "../src/server";

let testDB: Sequelize;
let testApp: Express;
beforeAll(async () => {
  testDB = await getTestDatabaseConnection();
  testApp = createApp(testDB);
  setupApp(testApp, testDB);
});

afterAll(() => {
  testDB.close();
});

describe("Test student routes", () => {

  it("Should sign up a student", async () => {
    const data = {
      email: "e@mail.com",
      username: "abcde",
      password: "fghij",
      verification_code: "verification",
    };

    await authorize(request(testApp).post("/students/create"))
      .send(data)
      .expect(201)
      .expect("Content-Type", /json/)
      .expect({
        success: true,
        status: "ok",
        student_info: data,
      });

    const student = await Student.findOne({ where: { username: "abcde" } });
    expect(student).not.toBeNull();

  });
});
