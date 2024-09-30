/* eslint-disable @typescript-eslint/no-floating-promises */

import { describe, it } from "@jest/globals";
import request from "supertest";

import { testApp } from "./setup";
import { authorize } from "./utils";

console.log(testApp);

describe("Test root route", () => {

  it("Should show a welcome message + warning", async () => {
    authorize(request(testApp).get("/"))
      .expect(200)
      .expect("Content-Type", /json/)
      .expect({ message: "Welcome to the CosmicDS server! You'll need to include a valid API key with your requests in order to access other endpoints." });
  });

  it("Should show a welcome message", async () => {
    authorize(request(testApp).get("/"))
      .expect(200)
      .expect("Content-Type", /json/)
      .expect({ message: "Welcome to the CosmicDS server!" });
  }, 10_000);
});
