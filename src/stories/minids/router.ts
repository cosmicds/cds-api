import {
  GenericRequest,
  GenericResponse
} from "../../server";

import { Router } from "express";

const router = Router();

router.put("/submit-eclipse-response", async (req, res) => {
  const data = req.body; 
});
