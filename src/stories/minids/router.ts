import {
  isArrayThatSatisfies,
  isNumberArray,
  isStringArray
} from "../../utils";

import { Router } from "express";
import { getEclipseMiniResponses, submitEclipseMiniResponse } from "./database";

const router = Router();

router.post("/annular-eclipse-2023/response", async (req, res) => {
  const data = req.body; 
  const valid = (
    typeof data.user_uuid === "string" &&
    typeof data.response === "string" &&
    isStringArray(data.preset_locations) &&
    isArrayThatSatisfies(data.user_selected_locations, (arr) => {
      return arr.every(x => isNumberArray(x) && x.length === 2);
    })
  );

  if (!valid) {
    res.status(400);
    res.json({ error: "Malformed response submission" });
    return;
  }

  const response = await submitEclipseMiniResponse(data);
  if (!response) {
    res.status(400);
    res.json({ error: "Error creating eclipse mini response" });
    return;
  }

  res.json({ response });

});

router.get("/annular-eclipse-2023/responses/:userUUID", async (req, res) => {
  const uuid = req.params.userUUID as string;
  const responses = await getEclipseMiniResponses(uuid);
  res.json({ responses });
});

export default router;
