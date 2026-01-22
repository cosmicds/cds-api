/* eslint-disable @typescript-eslint/no-floating-promises */

import { beforeAll, afterAll, beforeEach, describe, it, expect, jest } from "@jest/globals";
import request from "supertest";
import type { Express } from "express";
import type { Sequelize } from "sequelize";

import { authorize, createTestApp, getTestDatabaseConnection, createRandomClassWithStudents, randomStudent, setIntersection, randomBetween } from "../../../../tests/utils";
import { HubbleClassStudentMerge } from "../models/hubble_class_student_merges";
import { globalRoutePath, createRandomHubbleDataForStudent, createRandomHubbleMeasurementForStudent, createRandomGalaxies } from "./utils";
import { Student } from "../../../models";
import { HubbleMeasurement, HubbleStudentData } from "../models";

jest.setTimeout(100_000);

async function mergeStudentIntoClass(studentID: number, classID: number): Promise<HubbleClassStudentMerge> {
  return HubbleClassStudentMerge.create({
    student_id: studentID,
    class_id: classID
  });
}

describe("Test student/class merge functionality", () => {
  let testDB: Sequelize;
  let testApp: Express;
  beforeAll(async () => {
    testDB = await getTestDatabaseConnection();
    testApp = createTestApp(testDB);
  });
  
  afterAll(() => {
    testDB.close();
  });

  const nGalaxies = 30;
  const studentCount = 20;
  const mergedCount = 5;
  const nonMergedCount = 3;
  let students: Student[];
  let mergedStudents: Student[];
  let nonMergedStudents: Student[];

  beforeEach(async () => {
    const { educator, students: createdStudents, class: cls } = await createRandomClassWithStudents(studentCount);
    students = createdStudents;

    mergedStudents = [];
    nonMergedStudents = [];
    for (let i = 0; i < mergedCount + nonMergedCount; i++) {
      const student = await randomStudent();
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
        await createRandomHubbleDataForStudent(student.id);
      }
    }
  });

  it("Add description", async () => {
    const route = globalRoutePath("/all-data");
    await authorize(request(testApp).get(route))
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        const body = res.body;
        const measurements = body.measurements as HubbleMeasurement[];
        expect(measurements.length).toEqual(5 * (studentCount + mergedCount));

        const includedStudents = students.concat(mergedStudents);
        const includedIDs = new Set(includedStudents.map(s => s.id));
        const notIncludedIDs = new Set(nonMergedStudents.map(s => s.id));

        const measurementIDs = new Set(measurements.map(meas => meas.student_id));
        expect(measurementIDs).toEqual(includedIDs);

        expect(setIntersection(measurementIDs, notIncludedIDs).size).toEqual(0);

        const studentData = body.studentData as HubbleStudentData[];
        expect(studentData.length).toEqual(studentCount + mergedCount + nonMergedCount);
      });
  });
});
