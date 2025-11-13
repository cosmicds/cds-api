import * as S from "@effect/schema/Schema";
import * as Either from "effect/Either";
import { Express, Router } from "express";
import { Sequelize } from "sequelize";

import { initializeModels } from "./models";
import { SeasonsEntry } from "./database";

export const router = Router();

export function setup(_app: Express,, db: Sequelize) {
  initializeModels(db);
}

router.put("/data", async (req, res) => {
  const data = req.body;
});
