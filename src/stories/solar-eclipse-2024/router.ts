import * as S from "@effect/schema/Schema";
import * as Either from "effect/Either";
import { Router } from "express";
import {
  getAllSolarEclipse2024Responses,
  getSolarEclipse2024Response,
  submitSolarEclipse2024Response,
  SolarEclipse2024Data,
  SolarEclipse2024Update,
} from "./database";

const router = Router();

router.put("/responses", async (req, res) => {
  const data = req.body;
  const maybe = S.decodeUnknownEither(SolarEclipse2024Data)(data);

  if (Either.isLeft(maybe)) {
    res.status(400);
    res.json({ error: "Malformed response submission" });
    return;
  }

  const response = await submitSolarEclipse2024Response(maybe.right);
  if (response === null) {
    res.status(400);
    res.json({ error: "Error creating solar eclipse 2024 response" });
    return;
  }

  res.json({ response });
});

router.get("/responses", async (_req, res) => {
  const responses = await getAllSolarEclipse2024Responses();
  res.json({ responses });
});

router.get("/responses/:uuid", async (req, res) => {
  const uuid = req.params.uuid as string;
  const response = await getSolarEclipse2024Response(uuid);
  res.json({ response });
});

router.patch("/responses/:uuid", async (req, res) => {
  const uuid = req.params.uuid as string;
  const data = req.body;

  const maybe = S.decodeUnknownEither(SolarEclipse2024Update)(data);
  if (Either.isLeft(maybe)) {
    res.status(400).json({ error: "Malformed update submission" }); 
    return;
  }

  const response = await getSolarEclipse2024Response(uuid);
  if (response === null) {
    res.status(404).json({ error: "Specified user response does not exist" });
    return;
  }

  


});

export default router;
