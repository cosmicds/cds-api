/* eslint-disable @typescript-eslint/no-floating-promises */

import { beforeAll, afterAll, describe, it, expect } from "@jest/globals";
import request from "supertest";
import type { Sequelize } from "sequelize";
import type { Express } from "express";

import { authorize, expectToMatchModel, getTestDatabaseConnection, randomClassForEducator, randomEducator, randomStudent, setupStudentInClasses } from "./utils";
import { setupApp } from "../src/app";
import { createApp } from "../src/server";
import { Student, StageState, Story, StoryState } from "../src/models";

async function setupStoryAndStudentStates() {
  const story = await Story.create({
    name: "test_story",
    display_name: "Test Story",
    description: "This is a story for testing purposes",
  });
  const student1 = await randomStudent();
  const student2 = await randomStudent();
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
    await story?.destroy();
    await student1?.destroy();
    await student2?.destroy();
    await storyState1?.destroy();
    await storyState2?.destroy();
    await stageState1A?.destroy();
    await stageState1B?.destroy();
    await stageState2A?.destroy();
    await stageState2B?.destroy();
  };

  return {
    story,
    student1,
    student2,
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
    testApp = createApp(testDB);
    setupApp(testApp, testDB);
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
        })
        .then(res => {
          expectToMatchModel(res.body.state, state);
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
