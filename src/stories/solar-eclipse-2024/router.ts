import { Router } from "express";
import { getAllSolarEclipse2024Responses, getSolarEclipse2024Response, isValidSolarEclipseData, submitSolarEclipse2024Response } from "./database";

const router = Router();

router.put("/response", async (req, res) => {
  const data = req.body;
  const valid = isValidSolarEclipseData(data);

  if (!valid) {
    res.status(400);
    res.json({ error: "Malformed response submission" });
    return;
  }

  const response = await submitSolarEclipse2024Response(data);
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

router.get("/response/:userUUID", async (req, res) => {
  const uuid = req.params.userUUID as string;
  const response = await getSolarEclipse2024Response(uuid);
  res.json({ response });
});

export default router;
