/* eslint-disable @typescript-eslint/no-floating-promises */

import { describe, expect, it } from "@jest/globals";
import request from "supertest";

import { testApp } from "./setup";
import { authorize } from "./utils";
import { Student } from "../src/models";

describe("Test educator routes", () => {

  it("Should initially have no students", async () => {
    const students = await Student.findAll();
    expect(students.length).toBe(0);

    authorize(request(testApp).get("/students"))
      .expect(200)
      .expect("Content-Type", /json/)
      .expect([]);
  });

  it("Should sign up a student", async () => {
  });
});
