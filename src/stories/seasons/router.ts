import * as S from "@effect/schema/Schema";
import * as Either from "effect/Either";
import { Express, Router } from "express";
import { Sequelize } from "sequelize";

import { initializeModels } from "./models";
import { SeasonsEntry, SeasonsUpdate, getSeasonsData, submitSeasonsData, updateSeasonsData } from "./database";

export const router = Router();

export function setup(_app: Express, db: Sequelize) {
  initializeModels(db);
}

router.put("/data", async (req, res) => {
  const data = req.body;
  const maybe = S.decodeUnknownEither(SeasonsEntry)(data);

  if (Either.isLeft(maybe)) {
    res.status(400);
    res.json({ error: "Malformed data submission" });
    return;
  }
  
  const response = await submitSeasonsData(maybe.right);
  if (response === null) {
    res.status(400);
    res.json({ error: "Error creating Seasons entry" });
    return;
  }

  res.json({ response });
});

router.get("/data/:uuid", async (req, res) => {
  const uuid = req.params.uuid as string;
  const response = await getSeasonsData(uuid);
  if (response === null) {
    res.status(404).json({ error: "Specified user data does not exist" });
    return;
  }

  res.json({ response });
});

router.patch("/data/:uuid", async (req, res) => {
  const data = req.body;

  const maybe = S.decodeUnknownEither(SeasonsUpdate)(data);
  if (Either.isLeft(maybe)) {
    res.status(400).json({ error: "Malformed update submission" });
    return;
  }

  const uuid = req.params.uuid as string;
  const current = await getSeasonsData(uuid);
  if (current === null) {
    res.status(404).json({ error: "Specified user data does not exist" });
    return;
  }

  const response = await updateSeasonsData(uuid, maybe.right);
  if (response === null) {
    res.status(500).json({ error: "Error updating user data" });
    return;
  }
  res.json({ response });
});
