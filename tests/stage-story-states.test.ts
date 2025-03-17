/* eslint-disable @typescript-eslint/no-floating-promises */

import { beforeAll, afterAll, describe, it, expect } from "@jest/globals";
import request from "supertest";
import type { Sequelize } from "sequelize";
import type { Express } from "express";

import { authorize, createTestApp, expectToMatchModel, getTestDatabaseConnection, randomClassForEducator, randomEducator, randomStory, randomStudent } from "./utils";
import { Student, StageState, StoryState, StudentsClasses, Class } from "../src/models";

async function setupStoryAndStudentStates() {
  const story = await randomStory();
  const student1 = await randomStudent();
  const student2 = await randomStudent();
  const educator = await randomEducator();
  const cls = await randomClassForEducator(educator.id);
  const studentClass1 = await StudentsClasses.create({
    student_id: student1.id,
    class_id: cls.id,
  });
  const studentClass2 = await StudentsClasses.create({
    student_id: student2.id,
    class_id: cls.id,
  });
  const storyState1 = await StoryState.create({
    student_id: student1.id,
    story_name: story.name,
    story_state: {
      a: 1,
      b: "x",
      flag: true,
    } as unknown as JSON,
  });
  const storyState2 = await StoryState.create({
    student_id: student2.id,
    story_name: story.name,
    story_state: {
      a: 5,
      b: "y",
      flag: false,
    } as unknown as JSON,
  });

  const stageState1A = await StageState.create({
    student_id: student1.id,
    story_name: story.name,
    stage_name: "A",
    state: {
      x: 1,
      y: 2,
      z: "s",
      w: {
        wFlag: false,
      },
    } as unknown as JSON,
  });
  const stageState2A = await StageState.create({
    student_id: student2.id,
    story_name: story.name,
    stage_name: "A",
    state: {
      x: 0,
      y: 5,
      z: "y",
      w: {
        wFlag: true,
      },
    } as unknown as JSON,
  });

  const stageState1B = await StageState.create({
    student_id: student1.id,
    story_name: story.name,
    stage_name: "B",
    state: {
      xx: 1,
      yy: -4.1,
      zz: "abcde",
      ww: {
        wwFlag: true,
        wwVar: 11
      }
    } as unknown as JSON,
  });
  const stageState2B = await StageState.create({
    student_id: student2.id,
    story_name: story.name,
    stage_name: "B",
    state: {
      xx: 4,
      yy: 2.6,
      zz: "vwxyz",
      ww: {
        wwFlag: false,
        wwVar: 3,
      }
    } as unknown as JSON,
  });


  const cleanup = async () => {
    await storyState1?.destroy();
    await storyState2?.destroy();
    await stageState1A?.destroy();
    await stageState1B?.destroy();
    await stageState2A?.destroy();
    await stageState2B?.destroy();
    await story?.destroy();
    await studentClass1?.destroy();
    await studentClass2?.destroy();
    await cls?.destroy();
    await educator?.destroy();
    await student1?.destroy();
    await student2?.destroy();
  };

  return {
    story,
    cls,
    educator,
    student1,
    student2,
    studentClass1,
    studentClass2,
    storyState1,
    storyState2,
    stageState1A,
    stageState1B,
    stageState2A,
    stageState2B,
    cleanup,
  };
}

describe("Test stage state routes", () => {
  let testDB: Sequelize;
  let testApp: Express;
  beforeAll(async () => {
    testDB = await getTestDatabaseConnection();
    testApp = createTestApp(testDB);
  });
  
  afterAll(async () => {
    testDB.close();
  });

  it("Should return the stage states for a given student & story", async () => {
    const { story, student1, student2, storyState1, storyState2, cleanup } = await setupStoryAndStudentStates();

    const studentsAndStories: [Student, StoryState][] = [[student1, storyState1], [student2, storyState2]];

    for (const [student, state] of studentsAndStories) {

      authorize(request(testApp).get(`/story-state/${student.id}/${story.name}`))
        .expect(200)
        .expect("Content-Type", /json/)
        .expect({
          student_id: student.id,
          story_name: story.name,
          state,
        });

    }

    await cleanup();
  });

  it("Should not find a story state for a nonexistent student", async () => {
    const badID = -1;
    const { story, cleanup } = await setupStoryAndStudentStates();
    await authorize(request(testApp).get(`/story-state/${badID}/${story.name}`))
      .expect(404)
      .expect("Content-Type", /json/)
      .expect({
        student_id: badID,
        story_name: story.name,
        state: null,
      });

    await cleanup();
  });

  it("Should not find a story state for a nonexistent story", async () => {
    const badID = -1;
    const badStory = "bogus_story";
    await authorize(request(testApp).get(`/story-state/${badID}/${badStory}`))
      .expect(404)
      .expect("Content-Type", /json/)
      .expect({
        student_id: badID,
        story_name: badStory,
        state: null,
      });

  });

  it("Should correctly update the story state", async () => {
    const { story, student1, storyState2, cleanup } = await setupStoryAndStudentStates();

    const newStoryState = storyState2.story_state;

    await authorize(request(testApp).put(`/story-state/${student1.id}/${story.name}`))
      .send(newStoryState)
      .expect(200)
      .expect("Content-Type", /json/)
      .expect({
        student_id: student1.id,
        story_name: story.name,
        state: newStoryState,
      });

    await cleanup();
  });

  // TODO: I'm not actually sure how to create something malformed here

  // it("Should not update to a malformed story state", async () => {
  //   const { story, student1, cleanup } = await setupStoryAndStudentStates();

  //   const badStoryState = "{'first' 1 'second': 2}";
  //   await authorize(request(testApp).put(`/story-state/${student1.id}/${story.name}`))
  //     .type("json")
  //     .send(badStoryState)
  //     .expect(404)
  //     .expect("Content-Type", /json/)
  //     .expect({
  //       student_id: student1.id,
  //       story_name: story.name,
  //       state: null,
  //     });

  //   await cleanup();
  // });

  it("Should return all the stage states for a given student + story", async () => {
    const { story, student1, student2, stageState1A, stageState1B, stageState2A, stageState2B, cleanup } = await setupStoryAndStudentStates();

    const studentStates = {
      [String(student1.id)]: {
        "A": stageState1A,
        "B": stageState1B,
      },
      [String(student2.id)]: {
        "A": stageState2A,
        "B": stageState2B,
      }
    };

    for (const studentID of Object.keys(studentStates)) {
      await authorize(request(testApp).get(`/stage-states/${story.name}?student_id=${studentID}`))
        .expect(200)
        .expect("Content-Type", /json/)
        .then(res => {
          const resStates = res.body;
          
          for (const stage of ["A", "B"] as const) {
            const expectedStates = studentStates[String(studentID)];
            const resStageStates = resStates[stage];
            expect(Array.isArray(resStageStates)).toBe(true);
            expect(resStageStates.length).toBe(1);
            for (const state of resStageStates) {
              expect(state).toMatchObject({...expectedStates[stage].state});
            }
          }
        });
    }

    await cleanup();
  });

  it("Should return all the stage states for a given class + story", async () => {
    const { story, cls, stageState1A, stageState1B, stageState2A, stageState2B, cleanup } = await setupStoryAndStudentStates();

    const states = {
      "A": [stageState1A, stageState2A],
      "B": [stageState1B, stageState2B],
    };

    await authorize(request(testApp).get(`/stage-states/${story.name}?class_id=${cls.id}`))
      .expect(200)
      .expect("Content-Type", /json/)
      .then(res => {
        const resStates = res.body;

        for (const stage of ["A", "B"] as const) {
          const expectedStates = states[stage];
          const resStageStates = resStates[stage];
          expect(Array.isArray(resStageStates)).toBe(true);
          expect(resStageStates.length).toBe(2);

          for (const [index, state] of resStageStates.entries()) {
            expect(state).toMatchObject({...expectedStates[index].state});
          }

        }
      });

    await cleanup();
  });

  it("Should return the correct stage states for a given student + story + stage", async () => {
    const { story, student1, student2, stageState1A, stageState1B, stageState2A, stageState2B, cleanup } = await setupStoryAndStudentStates();

    const studentStageStates: [Student, string, StageState][] = [
      [student1, "A", stageState1A],
      [student1, "B", stageState1B],
      [student2, "A", stageState2A],
      [student2, "B", stageState2B],
    ];

    for (const [student, stage, state] of studentStageStates) {

      await authorize(request(testApp).get(`/stage-states/${story.name}?student_id=${student.id}&stage_name=${stage}`))
        .expect(200)
        .expect("Content-Type", /json/)
        .then(res => {
          const resStates = res.body;
          expect(Array.isArray(resStates)).toBe(true);
          expect(resStates.length).toBe(1);

          const resState = resStates[0];
          expect(resState).toMatchObject({...state.state});
        });
    }

    await cleanup();
  });

  it("Should return the correct stage states for a given class + story + stage", async () => {
    const { story, cls, stageState1A, stageState1B, stageState2A, stageState2B, cleanup } = await setupStoryAndStudentStates();

    const classStagesStates: [Class, string, StageState[]][] = [
      [cls, "A", [stageState1A, stageState2A]],
      [cls, "B", [stageState1B, stageState2B]],
    ];

    for (const [student, stage, states] of classStagesStates) {

      await authorize(request(testApp).get(`/stage-states/${story.name}?class_id=${student.id}&stage_name=${stage}`))
        .expect(200)
        .expect("Content-Type", /json/)
        .then(res => {
          const resStates = res.body;
          expect(Array.isArray(resStates)).toBe(true);
          expect(resStates.length).toBe(2);

          for (const [index, state] of resStates.entries()) {
            expect(state).toMatchObject({...states[index].state});
          }
        });
    }

    await cleanup();
  });
});
