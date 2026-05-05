/* eslint-disable @typescript-eslint/no-floating-promises */

import { beforeAll, afterAll, describe, it } from "@jest/globals";
import request from "supertest";
import type { Sequelize } from "sequelize";
import type { Express } from "express";

import { authorize, createTestApp, expectToMatchModel, getTestDatabaseConnection, randomClassForEducator, randomEducator, randomStory } from "./utils";
import { setupApp } from "../src/app";
import { ClassStories } from "../src/models";

async function setupClassesWithStories() {
  const educator = await randomEducator();
  const cls = await randomClassForEducator(educator.id, { expected_size: 4 });

  const story1 = await randomStory();
  const story2 = await randomStory();
  const story3 = await randomStory();
  const stories = [story1, story2, story3];

  const cs1 = await ClassStories.create({ class_id: cls.id, story_name: story1.name, active: true });
  const cs2 = await ClassStories.create({ class_id: cls.id, story_name: story2.name, active: true });
  const cs3 = await ClassStories.create({ class_id: cls.id, story_name: story3.name, active: false });
  const classStories = [cs1, cs2, cs3];

  const cleanup = async () => {
    await cs1?.destroy();
    await cs2?.destroy();
    await cs3?.destroy();
    await cls?.destroy();
    await educator?.destroy();
  };

  return { educator, class: cls, stories, classStories, cleanup };
}

describe("Test class-story routes", () => {

  let testDB: Sequelize;
  let testApp: Express;
  beforeAll(async () => {
    testDB = await getTestDatabaseConnection();
    testApp = await createTestApp(testDB);
    setupApp(testApp, testDB);
  });
  
  afterAll(async () => {
    testDB.close();
  });

  it("Should return the correct story information for the given class", async () => {
    const { class: cls, classStories, cleanup } = await setupClassesWithStories();
    const identifiers = [cls.id, cls.code];

    for (const idf of identifiers) {
      await authorize(request(testApp).get(`/classes/${idf}/stories`))
        .expect(200)
        .expect("Content-Type", /json/)
        .then(res => {
          const resStories = res.body.stories as Record<string, unknown>[];
          resStories.forEach((story, index) => expectToMatchModel(story, classStories[index]));
        });
    }

    await cleanup();
  });

  it("Should return a 404 for a missing class", async () => {
    const badID = -1;
    await authorize(request(testApp).get(`/classes/${badID}/stories`))
      .expect(404)
      .expect("Content-Type", /json/);
  });

});
