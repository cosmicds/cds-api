/* eslint-disable @typescript-eslint/no-floating-promises */

import { beforeAll, afterAll, describe, it, expect } from "@jest/globals";
import request from "supertest";
import type { Sequelize } from "sequelize";
import type { Express } from "express";

import { authorize, createTestApp, getTestDatabaseConnection, randomClassForEducator, randomEducator, randomStory, randomStudent } from "./utils";
import { Student, StageState, StoryState, StudentsClasses } from "../src/models";

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

  const cleanup = async () => {
    await storyState1?.destroy();
    await storyState2?.destroy();
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
    cleanup,
  };
}

describe("Test story state routes", () => {
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

}); 
