/* eslint-disable @typescript-eslint/no-floating-promises */

import { beforeAll, afterAll, describe, it, expect } from "@jest/globals";
import request from "supertest";
import type { Sequelize } from "sequelize";
import type { Express } from "express";

import { authorize, expectToMatchModel, getTestDatabaseConnection, setupStudentInClasses } from "./utils";
import { setupApp } from "../src/app";
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

describe("Test user routes", () => {

  it("Should return all of the users (students + educators)", async () => {
    const { student, educator } = await setupStudentInClasses();

    await authorize(request(testApp).get("/users"))
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        const educators = res.body.educators;
        const students = res.body.students;
        expect(educators.length).toBe(1);
        expect(students.length).toBe(1);

        expectToMatchModel(educators[0], educator);
        expectToMatchModel(students[0], student);
      });
  });

});
