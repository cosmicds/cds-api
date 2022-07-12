import { Galaxy } from "./models/galaxy";

import {
  GenericRequest,
  GenericResponse
} from "../../server";

import {
  getGalaxyByName,
  getAllGalaxies,
  markGalaxyBad,
  markGalaxySpectrumBad,
  markGalaxyTileloadBad,
  getHubbleMeasurement,
  submitHubbleMeasurement,
  getStudentHubbleMeasurements,
  removeHubbleMeasurement,
  setGalaxySpectrumStatus,
  getUncheckedSpectraGalaxies,
  getStageThreeMeasurements,
  getAllHubbleMeasurements,
  getAllHubbleStudentData,
  getAllHubbleClassData,
  getStageThreeStudentData
} from "./database";

import { 
  RemoveHubbleMeasurementResult,
  SubmitHubbleMeasurementResult
} from "./request_results";

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

router.delete("/measurement/:studentID/:galaxyIdentifier", async (req, res) => {
  const data = req.params;
  const studentID = parseInt(data.studentID) || 0;

  let galaxyID = parseInt(data.galaxyIdentifier) || 0;
  if (galaxyID === 0) {
    const galaxy = await getGalaxyByName(data.galaxyIdentifier);
    galaxyID = galaxy?.id || 0;
  }
  const valid = (studentID !== 0) && (galaxyID !== 0);

  let result: RemoveHubbleMeasurementResult;
  if (valid) {
    result = await removeHubbleMeasurement(studentID, galaxyID);
  } else {
    result = RemoveHubbleMeasurementResult.BadRequest;
  }
  res.status(RemoveHubbleMeasurementResult.statusCode(result))
    .json({
      student_id: studentID,
      galaxy_id: galaxyID,
      status: result,
      success: RemoveHubbleMeasurementResult.success(result)
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


router.get("/stage-3-data/:studentID/:classID", async (req, res) => {
  const params = req.params;
  const studentID = parseInt(params.studentID);
  const classID = parseInt(params.classID);
  const measurements = await getStageThreeMeasurements(studentID, classID);
  res.json(measurements);
});

router.get("/stage-3-data/:studentID", async (req, res) => {
  const params = req.params;
  const studentID = parseInt(params.studentID);
  const measurements = await getStageThreeMeasurements(studentID, null);
  res.json(measurements);
});

router.get("/all-data", async (_req, res) => {
  const [measurements, studentData, classData] =
    await Promise.all([
      getAllHubbleMeasurements(),
      getAllHubbleStudentData(),
      getAllHubbleClassData()
    ]);
  res.json({
    measurements,
    studentData,
    classData
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

/**
 * Really should be POST
 * This was previously idempotent, but no longer is
 */
router.put("/mark-galaxy-bad", async (req, res) => {
  markBad(req, res, markGalaxyBad, "galaxy_marked_bad");
});

router.post("/mark-spectrum-bad", async (req, res) => {
  markBad(req, res, markGalaxySpectrumBad, "galaxy_spectrum_marked_bad");
});


/** These endpoints are specifically for the spectrum-checking branch */

router.get("/unchecked-galaxies", async (_req, res) => {
  const response = await getUncheckedSpectraGalaxies();
  res.json(response);
});

router.post("/mark-tileload-bad", async (req, res) => {
  markBad(req, res, markGalaxyTileloadBad, "galaxy_tileload_marked_bad");
});

router.post("/set-spectrum-status", async (req, res) => {
  const data = req.body;
  const good = data.good;
  let name = data.galaxy_name;
  if (!name.endsWith(".fits")) {
    name += ".fits";
  }

  const galaxy = await getGalaxyByName(name);
  if (galaxy === null) {
    res.json({
      status: "no_such_galaxy",
      galaxy: name
    });
    return;
  }
  if (typeof good !== "boolean") { 
    res.json({
      status: "invalid_status",
      galaxy: name
    });
    return;
  }

  setGalaxySpectrumStatus(galaxy, good);
  res.json({
    status: "status_updated",
    marked_good: good,
    marked_bad: !good,
    galaxy: name
  });
});

export default router;
