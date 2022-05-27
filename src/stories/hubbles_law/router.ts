import { Galaxy } from "./models/galaxy";

import {
  GenericRequest,
  GenericResponse
} from "../../server";

import {
  SubmitHubbleMeasurementResult,
  getGalaxyByName,
  getAllGalaxies,
  markGalaxyBad,
  markGalaxySpectrumBad,
  getHubbleMeasurement,
  submitHubbleMeasurement,
  getStudentHubbleMeasurements,
} from "./database";

import { Router } from "express";

const router = Router();

router.put("/submit-measurement", async (req, res) => {
  const data = req.body;
  const valid = (
    typeof data.student_id === "number" &&
    ((typeof data.galaxy_id === "number") || (typeof data.galaxy_name === "string")) &&
    (!data.rest_wave_value || typeof data.rest_wave_value === "number") &&
    (!data.rest_wave_unit || typeof data.rest_wave_unit === "string") &&
    (!data.obs_wave_value || typeof data.obs_wave_value === "number") &&
    (!data.obs_wave_unit || typeof data.obs_wave_unit === "string") &&
    (!data.velocity_value || typeof data.velocity_value === "number") &&
    (!data.velocity_unit || typeof data.velocity_unit === "string") &&
    (!data.ang_size_value || typeof data.ang_size_value === "number") &&
    (!data.ang_size_unit || typeof data.ang_size_unit === "string") &&
    (!data.est_dist_value || typeof data.est_dist_value === "number") &&
    (!data.est_dist_unit || typeof data.est_dist_unit === "string")
  );

  if (typeof data.galaxy_id !== "number") {
    let galaxyName = data.galaxy_name;
    if (!galaxyName.endsWith(".fits")) {
      galaxyName += ".fits";
    }
    const galaxy = await getGalaxyByName(galaxyName);
    data.galaxy_id = galaxy?.id || 0;
    delete data.galaxy_name;
  }

  let result: SubmitHubbleMeasurementResult;
  if (valid) {
    result = await submitHubbleMeasurement(data);
  } else {
    result = SubmitHubbleMeasurementResult.BadRequest;
  }
  res.json({
    measurement: data,
    status: result,
    success: SubmitHubbleMeasurementResult.success(result)
  });
});

router.get("/measurements/:studentID", async (req, res) => {
  const params = req.params;
  const studentID = parseInt(params.studentID);
  const measurements = await getStudentHubbleMeasurements(studentID);
  res.json({
    student_id: studentID,
    measurements: measurements
  });
});

router.get("/measurements/:studentID/:galaxyID", async (req, res) => {
  const params = req.params;
  const studentID = parseInt(params.studentID);
  const galaxyID = parseInt(params.galaxyID);
  const measurement = await getHubbleMeasurement(studentID, galaxyID);
  res.json({
    student_id: studentID,
    galaxy_id: galaxyID,
    measurement: measurement
  });
});

router.get("/galaxies", async (_req, res) => {
  const response = await getAllGalaxies();
  res.json(response);
});

async function markBad(req: GenericRequest, res: GenericResponse, marker: (galaxy: Galaxy) => Promise<void>, markedStatus: string) {
  const galaxyID = req.body.galaxy_id;
  const galaxyName = req.body.galaxy_name;
  if (!(galaxyID || galaxyName)) { 
    res.status(400).json({
      status: "missing_id_or_name"
    });
    return;
   }

  let galaxy: Galaxy | null;
  if (galaxyID) {
    galaxy = await Galaxy.findOne({ where: { id : galaxyID }});
  } else {
    galaxy = await getGalaxyByName(galaxyName);
  }

  if (galaxy === null) {
    res.status(404).json({
      status: "no_such_galaxy"
    });
    return;
  }

  marker(galaxy);
  res.status(200).json({
    status: markedStatus
  });
}

/** Really should be POST */
router.put("/mark-galaxy-bad", async (req, res) => {
  markBad(req, res, markGalaxyBad, "galaxy_marked_bad");
});

router.post("/mark-spectrum-bad", async (req, res) => {
  markBad(req, res, markGalaxySpectrumBad, "galaxy_spectrum_marked_bad");
});

export default router;
