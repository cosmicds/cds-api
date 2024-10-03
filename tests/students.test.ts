/* eslint-disable @typescript-eslint/no-floating-promises */

import { beforeAll, afterAll, describe, it, expect } from "@jest/globals";
import request from "supertest";
import type { InferAttributes, Sequelize } from "sequelize";
import type { Express } from "express";

import { authorize, getTestDatabaseConnection } from "./utils";
import { setupApp } from "../src/app";
import { Class, Educator, Student, StudentsClasses } from "../src/models";
import { createApp } from "../src/server";
import { v4 } from "uuid";

// This is only used inside this test file,
// so we can just let TS infer the return type
async function setupStudentInClasses() {
  const educator = await Educator.create({
    first_name: v4(),
    last_name: v4(),
    password: v4(),
    email: v4(),
    verified: 1,
    verification_code: v4(),
    username: v4(),
  });
  const class1 = await Class.create({
    name: v4(),
    educator_id: educator.id,
    code: v4(),
  });
  const class2 = await Class.create({
    name: v4(),
    educator_id: educator.id,
    code: v4(),
  });
  const student = await Student.create({
    email: v4(),
    username: v4(),
    password: v4(),
    verification_code: class1.code,
    verified: 0,
  });

  const sc1 = await StudentsClasses.create({
    student_id: student.id,
    class_id: class1.id,
  });
  const sc2 = await StudentsClasses.create({
    student_id: student.id,
    class_id: class2.id,
  });

  const cleanup = async () => {
    // Sometimes we want to remove the class-student associations during the test
    // In which case we can check whether it exists first
    (await StudentsClasses.findOne({ where: { student_id: student.id, class_id: class1.id } }))?.destroy();
    (await StudentsClasses.findOne({ where: { student_id: student.id, class_id: class2.id } }))?.destroy();
    await class1.destroy();
    await class2.destroy();
    await educator.destroy();
    await student.destroy();
  };

  return { student, educator, class1, class2, sc1, sc2, cleanup };
}

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
      email: v4(),
      username: v4(),
      password: v4(),
      verification_code: v4(),
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

    const student = await Student.findOne({ where: { username: data.username } });
    expect(student).not.toBeNull();

    await student?.destroy();

  });

  it("Should return the correct student by ID", async () => {
    const student = await Student.create({
      email: v4(),
      username: v4(),
      password: v4(),
      verification_code: v4(),
      verified: 0,
    });

    const json: Partial<InferAttributes<Student>> = student.toJSON();
    // The Sequelize object will return the `CURRENT_TIMESTAMP` literals,
    // not the actual date values
    delete json.profile_created;
    delete json.last_visit;
    await authorize(request(testApp).get(`/students/${student.id}`))
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        const resStudent = res.body.student;
        expect(resStudent).toMatchObject(json);

        // Check that the timestamp fields are present
        expect(resStudent).toHaveProperty("profile_created");
        expect(typeof resStudent.profile_created).toBe("string");
        expect(resStudent).toHaveProperty("last_visit");
        expect(typeof resStudent.last_visit).toBe("string");
      });

    await student.destroy();
  });

  it("Should return the correct student by username", async () => {
    const student = await Student.create({
      email: v4(),
      username: v4(),
      password: v4(),
      verification_code: v4(),
      verified: 0,
    });

    const json: Partial<InferAttributes<Student>> = student.toJSON();
    // The Sequelize object will return the `CURRENT_TIMESTAMP` literals,
    // not the actual date values
    delete json.profile_created;
    delete json.last_visit;
    await authorize(request(testApp).get(`/students/${student.username}`))
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        const resStudent = res.body.student;
        expect(resStudent).toMatchObject(json);

        // Check that the timestamp fields are present
        expect(resStudent).toHaveProperty("profile_created");
        expect(typeof resStudent.profile_created).toBe("string");
        expect(resStudent).toHaveProperty("last_visit");
        expect(typeof resStudent.last_visit).toBe("string");
      });

    await student.destroy();
  });

  it("Should return the correct classes", async () => {

    const { student, educator, class1, class2, cleanup } = await setupStudentInClasses();

    await authorize(request(testApp).get(`/students/${student.id}/classes`))
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.body.student_id).toBe(student.id);
        const classes = res.body.classes;
        expect(classes.length).toBe(2);

        expect(classes.map((cls: Class) => cls.id)).toEqual([class1.id, class2.id]);
        expect(classes.map((cls: Class) => cls.name)).toEqual([class1.name, class2.name]);
        expect(classes.every((cls: Class) => cls.educator_id === educator.id));
      });

    await cleanup();
  });

  it("Should properly delete student-class associations", async () => {
    const { student, class1, class2, cleanup } = await setupStudentInClasses();

    await authorize(request(testApp).delete(`/students/${student.id}/classes/${class1.id}`))
      .expect(204);
    
    expect(await StudentsClasses.findOne({ where: { student_id: student.id, class_id: class1.id } })).toBeNull();

    await authorize(request(testApp).delete(`/students/${student.id}/classes/${class2.id}`))
      .expect(204);

    expect(await StudentsClasses.findOne({ where: { student_id: student.id, class_id: class2.id } })).toBeNull();

    await authorize(request(testApp).delete(`/students/${student.id}/classes/-1`))
      .expect(404);

    await cleanup();

  });

});
