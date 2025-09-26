import { Express, Router } from "express";
import { Sequelize } from "sequelize";

export const router = Router();

export function setup(_app: Express, _db: Sequelize) {}

router.put("/user-experience", async (_req, res) => {
  res.status(200).json({ success: true });
});
