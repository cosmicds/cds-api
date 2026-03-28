import * as S from "@effect/schema/Schema";
import * as Either from "effect/Either";

import { Galaxy } from "./models/galaxy";

import {
  GenericRequest,
  GenericResponse
} from "../../server";

import { OptionalInt, OptionalString } from "../../utils";

import {
  getGalaxyByName,
  getAllGalaxies,
  markGalaxyBad,
  markGalaxySpectrumBad,
  markGalaxyTileloadBad,
  getHubbleMeasurement,
  submitHubbleMeasurement,
  submitSampleHubbleMeasurement,
  getStudentHubbleMeasurements,
  getSampleHubbleMeasurement,
  getSampleHubbleMeasurements,
  removeHubbleMeasurement,
  setGalaxySpectrumStatus,
  getUncheckedSpectraGalaxies,
  getClassMeasurements,
  getClassMeasurementsForStudent,
  getAllHubbleMeasurements,
  getAllHubbleStudentData,
  getAllHubbleClassData,
  getGalaxiesForDataGeneration,
  getNewGalaxies,
  getGalaxiesForTypes,
  getAllSampleHubbleMeasurements,
  getSampleGalaxy,
  getGalaxyById,
  removeSampleHubbleMeasurement,
  getAllNthSampleHubbleMeasurements,
  getClassMeasurementCountForStudent,
  getStudentsWithCompleteMeasurementsCount,
  getMergedIDsForClass,
  setWaitingRoomOverride,
  removeWaitingRoomOverride,
  getWaitingRoomOverride,
  resetATWaitingRoomTest,
  mergeNStudentsIntoClass,
  getHubbleMeasurementsForStudents,
  Measurement,
  MeasurementType,
  SampleMeasurement,
  SampleMeasurementType,
} from "./database";

import { 
  RemoveHubbleMeasurementResult,
  SubmitHubbleMeasurementResult
} from "./request_results";

import { Express, Router } from "express";
import { Sequelize, ForeignKeyConstraintError, UniqueConstraintError } from "sequelize";
import { classForStudentStory, findClassById, findStudentById } from "../../database";
import { HubbleClassStudentMerge, HubbleMeasurement, initializeModels } from "./models";
import { setUpHubbleAssociations } from "./associations";
import { Story } from "../../models";
import { Schema } from "@effect/schema";

import swaggerJSDoc, { OAS3Options } from "swagger-jsdoc";
import swaggerUi, { SwaggerUiOptions } from "swagger-ui-express";
import { SwaggerTheme, SwaggerThemeNameEnum } from "swagger-themes";
import { COSMICDS_HOST, COSMICDS_OPENAPI_APIKEY_SCHEME, COSMICDS_OPENAPI_TAGS, COSMICDS_OPENAPI_VERSION } from "../../openapi/options";

export const BASE_PATH = "/hubbles_law";

export const router = Router();

export function setup(_app: Express, db: Sequelize) {
  initializeModels(db);
  setUpHubbleAssociations();

  Story.upsert({
    name: "hubbles_law",
    display_name: "Hubble's Law",
  }).catch(error => console.error(error));

  const swaggerOptions: OAS3Options = {
    apis: [
      "dist/src/stories/hubbles_law/main.js",
    ],
    definition: {
      openapi: COSMICDS_OPENAPI_VERSION,
      info: {
        title: "CosmicDS API - Hubble's Law",
        version: "0.1.0",
        description: "The endpoints on the CosmicDS API server relating to the Hubble's Law story",
      },
      tags: [
        ...COSMICDS_OPENAPI_TAGS,
        {
          name: "measurements",
          description: "Operations relating to students' Hubble measurements",
        }
      ],
      host: COSMICDS_HOST,
      basePath: BASE_PATH,
      components: {
        securitySchemes: {
          apiKey: COSMICDS_OPENAPI_APIKEY_SCHEME, 
        },
        schemas: schemas(),
      },
      security: [
        { apiKey: [] },
      ],
    },
  };

  const swaggerSpec = swaggerJSDoc(swaggerOptions);

  router.get("/docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  const theme = new SwaggerTheme();
  const swaggerUIOptions: SwaggerUiOptions = {
    explorer: false,
    customSiteTitle: "CosmicDS Database API - Hubble's Law",
    customCss: theme.getBuffer(SwaggerThemeNameEnum.GRUVBOX),
  };

  router.use("/docs", swaggerUi.serve);
  router.use("/docs", swaggerUi.setup(swaggerSpec, swaggerUIOptions));
}

/**
 *  @openapi
 *  /submit-measurement:
 *    put:
 *      tags:
 *        - students
 *        - measurements
 *      description: Submit a Hubble measurement for a student
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              description: At least one of galaxy_id or galaxy_name must be given. If both are given, only galaxy_id is used
 *              schema:
 *                $ref: "#/components/schemas/HubbleMeasurementInput"
 *      responses:
 *        200:
 *          description: The measurement was submitted successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                $schema:
 *                  type: object
 *                  properties:
 *                    measurement:
 *                      schema:
 *                        $ref: "#/components/schemas/HubbleMeasurement"
 *        400:
 *          description: The request body did not have the required form
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/components/schemas/Error"
 *        422:
 *          description: Either the student ID or galaxy ID did not correspond to a valid item
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/components/schemas/Error"
 */
router.put("/submit-measurement", async (req, res) => {

  const schema = S.extend(Measurement, S.struct({
    galaxy_id: OptionalInt,
    galaxy_name: OptionalString,
  })).pipe(
    Schema.filter(obj => "galaxy_id" in obj || "galaxy_name" in obj,
    { message: () => "At least one of galaxy_id or galaxy_name must be specified" },
  ));

  const maybe = S.decodeUnknownEither(schema)(req.body); 

  if (Either.isLeft(maybe)) {
    res.status(400).json({
      error: "The request body was malformed",
    });
    return;
  }

  let data: MeasurementType;

  const maybeGalaxyID = maybe.right.galaxy_id;
  if (typeof maybeGalaxyID === "number") {
    data = { ...maybe.right, galaxy_id: maybeGalaxyID };
  } else {
    const dataToEdit = { ...maybe.right };
    let galaxyName = dataToEdit.galaxy_name as string;
    if (!galaxyName.endsWith(".fits")) {
      galaxyName += ".fits";
    }
    const galaxy = await getGalaxyByName(galaxyName);
    delete dataToEdit.galaxy_name;
    data = { ...dataToEdit, galaxy_id: galaxy?.id || 0 };
  }

  const result = await submitHubbleMeasurement(data);
  const status = SubmitHubbleMeasurementResult.statusCode(result);

  res.statusCode = status;
  if (status >= 400) {
    res.json({
      error: status,
    });
  } else {
    res.json({
      measurement: data,
    });
  }
});

/**
 *  @openapi
 *  /sample-measurement:
 *    put:
 *      description: Submit a sample Hubble measurement for a student
 *      tags:
 *        - students
 *        - measurements
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              description: At least one of galaxy_id or galaxy_name must be given. If both are given, only galaxy_id is used. The identifier must correspond to the sample galaxy
 *              schema:
 *                $ref: "#/components/schemas/HubbleSampleMeasurementInput"
 *      responses:
 *        200:
 *          description: The sample measurement was submitted successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                $schema:
 *                  type: object
 *                  properties:
 *                    measurement:
 *                      schema:
 *                        $ref: "#/components/schemas/HubbleSampleMeasurement"
 *        400:
 *          description: The request body did not have the required form
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/components/schemas/Error"
 *        422:
 *          description: Either the student ID or galaxy ID did not correspond to a valid item
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/components/schemas/Error"
 */
router.put("/sample-measurement", async (req, res) => {

  const schema = S.extend(SampleMeasurement, S.struct({
    galaxy_id: OptionalInt,
    galaxy_name: OptionalString,
  })).pipe(
    Schema.filter(obj => "galaxy_id" in obj || "galaxy_name" in obj,
    { message: () => "At least one of galaxy_id or galaxy_name must be specified" },
  ));

  const maybe = S.decodeUnknownEither(schema)(req.body);

  if (Either.isLeft(maybe)) {
    res.status(400).json({
      error: "The request body was malformed",
    });
    return;
  }

  let data: SampleMeasurementType;

  const maybeGalaxyID = maybe.right.galaxy_id;

  let galaxy: Galaxy | null;
  if (typeof maybeGalaxyID === "number") {
    galaxy = await getGalaxyById(maybeGalaxyID);
    data = { ...maybe.right, galaxy_id: maybeGalaxyID, measurement_number: maybe.right.measurement_number ?? "first" };
  } else {
    const dataToEdit = { ...maybe.right };
    let galaxyName = dataToEdit.galaxy_name as string;
    if (!galaxyName.endsWith(".fits")) {
      galaxyName += ".fits";
    }
    galaxy = await getGalaxyByName(galaxyName);
    delete dataToEdit.galaxy_name;

    data = { ...dataToEdit, galaxy_id: galaxy?.id || 0, measurement_number: maybe.right.measurement_number ?? "first" };
  }

  let result: SubmitHubbleMeasurementResult;
  if (galaxy?.is_sample === 0) {
    result = await submitSampleHubbleMeasurement(data);
  } else {
    result = SubmitHubbleMeasurementResult.BadRequest;
    res.status(400).json({
      error: `The given galaxy ID ${galaxy?.id} is not that of the sample galaxy`,
    });
    return;
  }

  const status = SubmitHubbleMeasurementResult.statusCode(result);
  res.statusCode = status;
  if (status >= 400) {
    res.json({
      error: status,
    });
  } else {
    res.json({
      measurement: data,
    });
  }
});

/**
 *  @openapi
 *  /measurement/{studentID}/{galaxyIdentifier}:
 *    delete:
 *      tags:
 *        - students
 *        - measurements
 *      description: Delete a student's measurement for a particular galaxy
 *      parameters:
 *        - name: studentID
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *        - name: galaxyIdentifier
 *          in: path
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: The measurement was successfully deleted
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  student_id:
 *                    type: integer
 *                  galaxy_id:
 *                    type: integer
 *        404:
 *          description: A measurement for the given student and galaxy was not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/components/schemas/Error"
 */
router.delete("/measurement/:studentID/:galaxyIdentifier", async (req, res) => {
  const data = req.params;
  const studentID = parseInt(data.studentID) || 0;

  let galaxyID = parseInt(data.galaxyIdentifier) || 0;
  if (galaxyID === 0) {
    const galaxy = await getGalaxyByName(data.galaxyIdentifier);
    galaxyID = galaxy?.id || 0;
  }

  const result = await removeHubbleMeasurement(studentID, galaxyID);
  res.statusCode = RemoveHubbleMeasurementResult.statusCode(result);

  if (res.statusCode >= 400) {
    res.json({
      error: result,
    });
  } else {
    res.json({
      student_id: studentID,
      galaxy_id: galaxyID,
    });
  }
});

/**
  * @openapi
  * /sample-measurement/{studentID}/{measurementNumber}:
  *   delete:
  *     tags:
  *       - students
  *       - measurements
  *     description: Delete a student's sample measurement
  *     parameters:
  *       - name: studentID
  *         in: path
  *         required: true
  *         schema:
  *           type: integer
  *       - name: measurementNumber
  *         in: path
  *         required: true
  *         schema:
  *           type: string
  *           enum:
  *             - first
  *             - second
  *     responses:
  *       200:
  *         description: The sample measurement was successfully deleted
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 student_id:
  *                   type: integer
  *                 measurement_number:
  *                   type: string
  *                   enum:
  *                     - first
  *                     - second
  *       404:
  *         description: A sample measurement for the given student and galaxy was not found
  *         content:
  *           application/json:
  *             schema:
  *               $ref: "#/components/schemas/Error"
 */
router.delete("/sample-measurement/:studentID/:measurementNumber", async (req, res) => {
  const data = req.params;
  const studentID = parseInt(data.studentID) || 0;
  const measurementNumber = data.measurementNumber;

  const result = await removeSampleHubbleMeasurement(studentID, measurementNumber);
  res.statusCode = RemoveHubbleMeasurementResult.statusCode(result);

  if (res.statusCode >= 400) {
    res.json({
      error: result,
    });
  } else {
    res.json({
      student_id: studentID,
      measurement_number: measurementNumber,
    });
  }
});

router.get("/measurements/classes/:classID", async (req, res) => {
  const classID = parseInt(req.params.classID);
  const isValidClass = (await findClassById(classID)) !== null;
  if (!isValidClass) {
    res.status(404).json({
      message: `No class with ID ${classID}`,
    });
    return;
  }

  const completeOnly = (req.query.complete_only as string)?.toLowerCase() === "true";
  const excludeMergedStudents = (req.query.exclude_merge as string)?.toLowerCase() === "true";
  const measurements = await getClassMeasurements(classID, !excludeMergedStudents, completeOnly);
  res.status(200).json({
    class_id: classID,
    measurements,
  });
});

router.get("/measurements/:studentID", async (req, res) => {
  const params = req.params;
  const studentID = parseInt(params.studentID);
  if (isNaN(studentID)) {
    res.status(400).json({
      message: "Invalid student ID!",
    });
    return;
  }
  const student = await findStudentById(studentID);
  const measurements = student !== null ?
    await getStudentHubbleMeasurements(studentID) :
    null;
  const status = measurements === null ? 404 : 200;
  res.status(status).json({
    student_id: studentID,
    measurements: measurements
  });
});

router.get("/measurements/:studentID/:galaxyID", async (req, res) => {
  const params = req.params;
  const studentID = parseInt(params.studentID);
  const galaxyID = parseInt(params.galaxyID);
  const measurement = await getHubbleMeasurement(studentID, galaxyID);
  const status = measurement === null ? 404 : 200;
  res.status(status).json({
    student_id: studentID,
    galaxy_id: galaxyID,
    measurement: measurement
  });
});

router.get("/sample-measurements/:studentID", async (req, res) => {
  const params = req.params;
  const studentID = parseInt(params.studentID);
  const measurements = await getSampleHubbleMeasurements(studentID);
  const status = measurements === null ? 404 : 200;
  res.status(status).json({
    student_id: studentID,
    measurements: measurements
  });
});

router.get("/sample-measurements/:studentID/:measurementNumber", async (req, res) => {
  const params = req.params;
  const studentID = parseInt(params.studentID);
  const measurement = await getSampleHubbleMeasurement(studentID, params.measurementNumber);
  const status = measurement === null ? 404 : 200;
  res.status(status).json({
    student_id: studentID,
    measurement: measurement
  });
});

router.get("/sample-measurements", async (req, res) => {
  const filterNullString = ((req.query.filter_null as string) ?? "true").toLowerCase();
  const filterNull = filterNullString !== "false";
  const measurements = await getAllSampleHubbleMeasurements(filterNull);
  res.json(measurements);
});

router.get("/sample-measurements/:measurementNumber", async (req, res) => {
  const params = req.params;
  const measurementNumber = params.measurementNumber;
  if (measurementNumber !== "first" && measurementNumber !== "second") {
    res.status(400).json(null);
  } else {
    const measurements = await getAllNthSampleHubbleMeasurements(measurementNumber);
    res.json(measurements);
  }
});

router.get("/sample-galaxy", async (_req, res) => {
  const galaxy = await getSampleGalaxy();
  res.json(galaxy);
});

router.get("/class-measurements/size/:studentID/:classID", async (req, res) => {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");  // HTTP 1.1
  res.header("Pragma", "no-cache");  // HTTP 1.0
  res.header("Expires", "0");  // Proxies
  const studentID = parseInt(req.params.studentID);
  const isValidStudent = (await findStudentById(studentID)) !== null;
  if (!isValidStudent) {
    res.status(404).json({
      message: "Invalid student ID",
    });
    return;
  }

  const classID = parseInt(req.params.classID);
  const isValidClass = (await findClassById(classID)) !== null;
  if (!isValidClass) {
    res.status(404).json({
      message: "Invalid class ID",
    });
    return;
  }

  const completeOnly = (req.query.complete_only as string)?.toLowerCase() === "true";
  const count = await getClassMeasurementCountForStudent(studentID, classID, completeOnly);
  res.status(200).json({
    student_id: studentID,
    class_id: classID,
    measurement_count: count,
  });
});

router.get("/class-measurements/students-completed/:studentID/:classID", async (req, res) => {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");  // HTTP 1.1
  res.header("Pragma", "no-cache");  // HTTP 1.0
  res.header("Expires", "0");  // Proxies
  const studentID = parseInt(req.params.studentID);
  const isValidStudent = (await findStudentById(studentID)) !== null;
  if (!isValidStudent) {
    res.status(404).json({
      message: "Invalid student ID",
    });
    return;
  }

  const classID = parseInt(req.params.classID);
  const isValidClass = (await findClassById(classID)) !== null;
  if (!isValidClass) {
    res.status(404).json({
      message: "Invalid class ID",
    });
    return;
  }

  const count = await getStudentsWithCompleteMeasurementsCount(studentID, classID);
  res.status(200).json({
    student_id: studentID,
    class_id: classID,
    students_completed_measurements: count,
  });
});

router.get(["/class-measurements/:studentID/:classID", "/stage-3-data/:studentID/:classID"], async (req, res) => {
  const lastCheckedStr = req.query.last_checked as string;
  let lastChecked: number | null = parseInt(lastCheckedStr);
  if (isNaN(lastChecked)) {
    lastChecked = null;
  }
  const completeOnly = (req.query.complete_only as string)?.toLowerCase() === "true";
  const excludeStudent = (req.query.exclude_student as string)?.toLowerCase() === "true";
  const params = req.params;
  let studentID = parseInt(params.studentID);
  let classID = parseInt(params.classID);
  if (studentID === 0) {
    studentID = 2487;
  }
  if (classID === 0) {
    classID = 159;
  }

  const student = await findStudentById(studentID);
  const invalidStudent = student === null;
  const cls = await findClassById(classID);
  const invalidClass = cls === null;
  if (invalidStudent || invalidClass) {
    const invalidItems = [];
    if (invalidStudent) { invalidItems.push("student"); }
    if (invalidClass) { invalidItems.push("class"); }
    const message = `Invalid ${invalidItems.join(" and ")} ID${invalidItems.length == 2 ? "s": ""}`;
    res.status(404).json({
      message
    });
    return;
  }

  let measurements: HubbleMeasurement[];
  if ("student_ids" in req.query) {
    const idsString = req.query.student_ids as string;
    const studentIDs = idsString.split(",").map(t => Number(t));
    const valid = !studentIDs.some(x => isNaN(x));

    if (!valid) {
      res.status(400).json({
        message: "At least one of your specified student IDs is invalid. Student IDs should be integers.",
      });
      return;
    }
    measurements = await getHubbleMeasurementsForStudents(studentIDs, completeOnly);
  } else {
    measurements = await getClassMeasurementsForStudent(student.id, cls.id, lastChecked, completeOnly, excludeStudent);
  }

  res.status(200).json({
    student_id: studentID,
    class_id: classID,
    measurements,
  });
});

router.get(["/class-measurements/:studentID", "stage-3-measurements/:studentID"], async (req, res) => {
  const params = req.params;
  const studentID = parseInt(params.studentID);
  const isValidStudent = (await findStudentById(studentID)) !== null;
  if (!isValidStudent) {
    res.status(404).json({
      message: "Invalid student ID",
    });
    return;
  }

  const cls = await classForStudentStory(studentID, "hubbles_law");
  if (cls === null) {
    res.status(404).json({
      message: `Student ${studentID} is not in a class signed up for the Hubble's Law story`,
    });
    return;
  }

  let measurements: HubbleMeasurement[];
  if ("student_ids" in req.query) {
    const idsString = req.query.student_ids as string;
    const studentIDs = idsString.split(",").map(t => Number(t));
    const valid = !studentIDs.some(x => isNaN(x));

    if (!valid) {
      res.status(400).json({
        message: "At least one of your specified student IDs is invalid. Student IDs should be integers.",
      });
      return;
    }
    measurements = await getHubbleMeasurementsForStudents(studentIDs);
  } else {
    const excludeStudent = (req.query.exclude_student as string)?.toLowerCase() === "true";
    measurements = await getClassMeasurementsForStudent(studentID, cls.id, null, excludeStudent);
  }

  res.status(200).json({
    student_id: studentID,
    class_id: null,
    measurements,
  });
});

router.put("/merge-students", async (req, res) => {
  const body = req.body;
  const schema = S.struct({
    class_id: S.number.pipe(S.int()),
    desired_merge_count: S.number.pipe(S.int()),
  });
  const maybe = S.decodeUnknownEither(schema)(body);

  if (Either.isLeft(maybe)) {
    res.status(400).json({
      error: "Invalid format. Request body should have the form { class_id: <integer>, desired_merge_count: <integer> }",
    });
    return;
  }

  const data = maybe.right;
  const cls = await findClassById(data.class_id);
  if (cls == null) {
    res.status(404).json({
      error: `No class found with class ID ${data.class_id}`,
    });
    return;
  }

  const currentMergeCount = await HubbleClassStudentMerge.count({ where: { class_id: data.class_id } });
  if (currentMergeCount >= data.desired_merge_count) {
    res.status(200).json({
      message: `No merge was performed as there are already at least ${data.desired_merge_count} students merged into class ${data.class_id}`,
    });
    return;
  }

  const difference = data.desired_merge_count - currentMergeCount;
  const merges = await mergeNStudentsIntoClass(data.class_id, difference)
                     .catch(error => {
                       console.error(error);
                       return null;
                     });
  if (merges == null) {
    res.status(500).json({
      error: `There was an error merging students into class ${data.class_id}`,
    });
  } else {
    res.status(200).json({
      message: `Merged ${difference} new students into class ${data.class_id}, bringing the total merge count to ${data.desired_merge_count}`,
    });
  }

});

router.get("/merged-classes/:classID", async (req, res) => {
  const classID = Number(req.params.classID);
  const ignoreMergeOrder = (req.query?.ignore_merge_order as string)?.toLowerCase() === "true";
  const cls = await findClassById(classID);
  if (cls === null) {
    res.status(404).json({
      message: `No class found with ID ${classID}`,
    });
    return;
  }
  const classIDs = await getMergedIDsForClass(classID, ignoreMergeOrder);
  res.json({
    merged_class_ids: classIDs,
  });
});

router.get("/all-data", async (req, res) => {
  const minimal = (req.query?.minimal as string)?.toLowerCase() === "true";
  let classID: number | null = parseInt(req.query.class_id as string);
  if (isNaN(classID)) {
    classID = null;
  }
  const beforeMs: number = parseInt(req.query.before as string);
  const before = isNaN(beforeMs) ? null : new Date(beforeMs);
  const classData = await getAllHubbleClassData(before, minimal, classID);
  const classIDs = new Set(classData.map(data => data.class_id));

  const [measurements, studentData] =
    await Promise.all([
      getAllHubbleMeasurements(before, minimal, classID),
      getAllHubbleStudentData([...classIDs], minimal),
    ]);
  res.json({
    measurements,
    studentData,
    classData
  });
});

router.get("/galaxies", async (req, res) => {
  const types = req.query?.types ?? undefined;
  const flags = (/true/i).test((req.query?.flags as string) ?? undefined);
  let galaxies: Galaxy[];
  if (types === undefined) {
    galaxies = await getAllGalaxies(flags);
  } else {
    let galaxyTypes: string[];
    if (Array.isArray(types)) {
      galaxyTypes = types as string[];
    } else {
      galaxyTypes = (types as string).split(",");
    }
    galaxies = await getGalaxiesForTypes(galaxyTypes, flags);
  }
  res.json(galaxies);
});

async function markBad(req: GenericRequest, res: GenericResponse, marker: (galaxy: Galaxy) => Promise<boolean>) {
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
    res.status(400).json({
      status: "no_such_galaxy"
    });
    return;
  }

  return marker(galaxy);
}

/**
 * Really should be POST
 * This was previously idempotent, but no longer is
 */
router.put("/mark-galaxy-bad", async (req, res) => {
  const success = await markBad(req, res, markGalaxyBad);

  if (success) {
    res.status(204).end();
  } else {
    res.status(500).json({
      error: "Error marking galaxy as bad",
    });
  }

});

router.post("/mark-spectrum-bad", async (req, res) => {
  const success = await markBad(req, res, markGalaxySpectrumBad);

  if (success) {
    res.status(204).end();
  } else {
    res.status(500).json({
      error: "Error marking spectrum as bad",
    });
  }

});

router.get("/spectra/:type/:name", async (req, res) => {
  res.redirect(`https://cosmicds.s3.us-east-1.amazonaws.com/spectra/${req.params.type}/${req.params.name}`);
});


const WaitingRoomOverrideSchema = S.struct({
  class_id: S.number.pipe(S.int()),
});

router.get("/waiting-room-override/:classID", async (req, res) => {
  const classID = Number(req.params.classID);
  const cls = await findClassById(classID);
  if (cls === null) {
    res.status(404).json({
      error: `No class found with ID ${classID}`,
    });
    return;
  }

  getWaitingRoomOverride(classID)
    .then(override => {
      res.json({
        class_id: classID,
        override_status: override !== null,
      });
    })
    .catch(_error => {
      res.status(500).json({
        error: `Error determining waiting room override status for class with ID ${classID}`,
      });
    });

});

router.put("/waiting-room-override", async (req, res) => {
  const body = req.body;
  const maybe = S.decodeUnknownEither(WaitingRoomOverrideSchema)(body);
  if (Either.isLeft(maybe)) {
    res.status(400).json({
      error: "Invalid format. Request body should have the form { class_id: <integer> }",
    });
    return;
  }

  const right = maybe.right;
  const result = await setWaitingRoomOverride(right.class_id);
  const success = !(result instanceof Error); 
  const responseData = {
    success,
    class_id: right.class_id,
  };
  if (!success) {
    if (result instanceof ForeignKeyConstraintError) {
      res.status(404).json({
        ...responseData,
        error: `No class found with ID ${right.class_id}`,
      });

    // It's fine if the override already exists
    } else if (result instanceof UniqueConstraintError) {
      res.status(200).json({
        class_id: right.class_id,
        success: true,
        message: `The waiting room override for class ${right.class_id} was already set`,
      });
    } else {
      res.status(500).json({
        ...responseData,
        error: `An error occurred while setting the waiting room override for class ${right.class_id}`,
      });
    }
    return;
  }
  
  if (result) {
    res.status(201).json({
      ...responseData,
      message: `Successfully set waiting room override for class ${right.class_id}`,
    });
  } else {
    res.status(200).json({
      message: `The waiting room override for class ${right.class_id} was already set`,
    });
  }
});


router.delete("/waiting-room-override", async (req, res) => {
  const body = req.body;
  const maybe = S.decodeUnknownEither(WaitingRoomOverrideSchema)(body);
  if (Either.isLeft(maybe)) {
    res.status(400).json({
      error: "Invalid format. Request body should have the form { class_id: <integer> }",
    });
    return;
  }

  const right = maybe.right;
  const countRemoved = await removeWaitingRoomOverride(right.class_id);
  const success = !isNaN(countRemoved);
  const responseData = {
    success,
    removed: success && countRemoved > 0,
    class_id: right.class_id,
  };
  if (isNaN(countRemoved)) {
    res.status(500).json({
      ...responseData,
      error: `An error occurred while removing the waiting room override for class ${right.class_id}`,
    });
    return;
  }

  const message = countRemoved > 0 ?
    `The waiting room override for class ${right.class_id} was removed` :
    `No waiting room override for class ${right.class_id} existed`;

  res.json({
    ...responseData,
    message,
  });
});


/** These endpoints are specifically for the spectrum-checking branch */

router.get("/unchecked-galaxies", async (_req, res) => {
  const response = await getUncheckedSpectraGalaxies();
  res.json(response);
});

router.post("/mark-tileload-bad", async (req, res) => {
  const success = await markBad(req, res, markGalaxyTileloadBad);

  if (success) {
    res.status(204).end();
  } else {
    res.status(500).json({
      error: "Error marking spectrum as bad",
    });
  }

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
    res.status(400).json({
      status: "no_such_galaxy",
      galaxy: name
    });
    return;
  }
  if (typeof good !== "boolean") { 
    res.status(400).json({
      status: "invalid_status",
      galaxy: name
    });
    return;
  }

  const success = await setGalaxySpectrumStatus(galaxy, good)
    .then(() => true)
    .catch(error => {
      console.log(error);
      return false;
    });

  if (!success) {
    res.status(500).json({
      error: `Error setting galaxy spectrum status for ${name} to ${good ? "" : " not "}good`,
    });
    return;
  }

  res.json({
    status: "status_updated",
    marked_good: good,
    marked_bad: !good,
    galaxy: name
  });
});

router.get("/new-galaxies", async (_req, res) => {
  const galaxies = await getNewGalaxies();
  res.json(galaxies);
});

/** These endpoints are specifically for the data generation branch */
router.get("/data-generation-galaxies", async (_req, res) => {
  const galaxies = await getGalaxiesForDataGeneration().catch(console.log);
  res.json(galaxies);
});


/** TEMPORARY - for the test waiting room class used by AT */
router.delete("/at-waiting-room-test", async (_req, res) => {
  await resetATWaitingRoomTest()
    .then(() => {
      res.status(200).json({
        message: "Successfully cleared the waiting room test students.",
      });
    })
    .catch(_err => {
      res.status(500).json({
        error: "There was an error clearing the waiting room test students.",
      });
    });
});
