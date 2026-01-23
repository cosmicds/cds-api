/* eslint-disable @typescript-eslint/no-floating-promises */

import { beforeAll, afterAll, beforeEach, describe, it, expect, jest } from "@jest/globals";
import request from "supertest";
import type { Express } from "express";
import type { Sequelize } from "sequelize";

import { authorize, createTestApp, getTestDatabaseConnection, createRandomClassWithStudents, randomStudent, setIntersection, randomBetween, randomClassForEducator } from "../../../../tests/utils";
import { HubbleClassStudentMerge } from "../models/hubble_class_student_merges";
import { globalRoutePath, createRandomHubbleDataForStudent, createRandomHubbleMeasurementForStudent, createRandomGalaxies } from "./utils";
import { Student } from "../../../models";
import { HubbleMeasurement, HubbleStudentData } from "../models";
import { addStudentToClass } from "../../../database";


async function mergeStudentIntoClass(studentID: number, classID: number): Promise<HubbleClassStudentMerge> {
  return HubbleClassStudentMerge.create({
    student_id: studentID,
    class_id: classID
  });
}


describe("Test student/class merge functionality", () => {
  let testDB: Sequelize;
  let testApp: Express;
  const nGalaxies = 30;
  const classSize = 20;
  const mergedCount = 5;
  const nonMergedCount = 3;
  const totalStudentCount = classSize + mergedCount + nonMergedCount;
  let students: Student[];
  let mergedStudents: Student[];
  let nonMergedStudents: Student[];

  beforeAll(async () => {
    testDB = await getTestDatabaseConnection();
    testApp = await createTestApp(testDB);
    for (const model of Object.values(testDB.models)) {
      await model.sync();
    }
  });
  
  afterAll(async () => {
    await testDB.close();
  });


  beforeEach(async () => {
    console.log("beforeEach");
    const { educator, students: createdStudents, class: cls } = await createRandomClassWithStudents(classSize);
    students = createdStudents;

    if (educator == null) {
      throw new Error("Educator should not be null");
    }

    const otherClass = await randomClassForEducator(educator.id);

    mergedStudents = [];
    nonMergedStudents = [];
    for (let i = 0; i < mergedCount + nonMergedCount; i++) {
      const student = await randomStudent();
      await addStudentToClass(student.id, otherClass.id);
      const merge = i < mergedCount;
      const arr = merge ? mergedStudents : nonMergedStudents;
      arr.push(student);
      if (merge) {
        await mergeStudentIntoClass(student.id, cls.id);
      }
    }
    console.log((await HubbleClassStudentMerge.findAll()).length);

    const galaxies = await createRandomGalaxies(nGalaxies);

    for (const arr of [students, mergedStudents, nonMergedStudents]) {
      for (const student of arr) {
        const measuredIDs = new Set<number>();
        for (let i = 0; i < 5; i++) {
          let idx = -1;
          do {
            idx = Math.floor(randomBetween(0, nGalaxies));
          } while (measuredIDs.has(idx));
          measuredIDs.add(idx);
          await createRandomHubbleMeasurementForStudent(student.id, galaxies[idx].id);
        }
        console.log(`Going to create random data for ${student.id}`);
        await createRandomHubbleDataForStudent(student.id).catch(err => console.error(err));
      }
    }
    console.log("DONE");
  });

  it("Add description", async () => {
    console.log("In first test");
    const route = globalRoutePath("/all-data");
    console.log("MADE ROUTE");
    await authorize(request(testApp).get(route))
      .expect(200)
      .expect("Content-Type", /json/)
      .then(async (res) => {
        const body = res.body;
        const measurements = body.measurements as HubbleMeasurement[];
        expect(measurements.length).toEqual(5 * totalStudentCount);

        const allStudents = students.concat(mergedStudents).concat(nonMergedStudents);

        const measurementIDs = new Set(measurements.map(meas => meas.student_id));
        expect(measurementIDs).toEqual(new Set(allStudents.map(student => student.id)));

        const studentData = body.studentData as HubbleStudentData[];
        const merges = await HubbleClassStudentMerge.findAll();
        for (const data of merges) {
          console.log(data);
        }
        // We need to include the merged students twice each
        expect(studentData.length).toEqual(totalStudentCount + mergedCount);

        console.log("Passed tests");
      });
  });
});
