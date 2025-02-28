/* eslint-disable @typescript-eslint/no-floating-promises */

import { beforeAll, afterAll, describe, it, expect } from "@jest/globals";
import request from "supertest";
import type { InferAttributes, Sequelize } from "sequelize";
import type { Express } from "express";

import { authorize, getTestDatabaseConnection, setupStudentInClasses } from "./utils";
import { setupApp } from "../src/app";
import { Educator, Student } from "../src/models";
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

        const resEducator = educators[0];
        const resStudent = students[0];
        const educatorJSON: Partial<InferAttributes<Educator>> = educator.toJSON();
        expect(resEducator).toMatchObject(educatorJSON);
        const studentJSON: Partial<InferAttributes<Student>> = student.toJSON();
        expect(resStudent).toMatchObject(studentJSON);

      });
  });

});
