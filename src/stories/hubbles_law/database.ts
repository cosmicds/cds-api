import { Attributes, FindOptions, Op, QueryTypes, Sequelize, WhereAttributeHash, WhereOptions, col, fn, literal } from "sequelize";
import { AsyncMergedHubbleStudentClasses, Galaxy, HubbleMeasurement, SampleHubbleMeasurement, initializeModels, SyncMergedHubbleClasses } from "./models";
import { classSize, cosmicdsDB, findClassById, findStudentById } from "../../database";
import { RemoveHubbleMeasurementResult, SubmitHubbleMeasurementResult } from "./request_results";
import { setUpHubbleAssociations } from "./associations";
import { Class, StoryState, Student, StudentsClasses } from "../../models";
import { HubbleStudentData } from "./models/hubble_student_data";
import { HubbleClassData } from "./models/hubble_class_data";
import { IgnoreStudent } from "../../models/ignore_student";
import { logger } from "../../logger";

initializeModels(cosmicdsDB);
setUpHubbleAssociations();

const galaxyAttributes = ["id", "ra", "decl", "z", "type", "name", "element"];

export async function submitHubbleMeasurement(data: {
  student_id: number,
  galaxy_id: number,
  rest_wave_value: number | null,
  rest_wave_unit: string | null,
  obs_wave_value: number | null,
  obs_wave_unit: string | null,
  velocity_value: number | null,
  velocity_unit: string | null,
  ang_size_value: number | null,
  ang_size_unit: string | null,
  est_dist_value: number | null,
  est_dist_unit: string | null,
  brightness?: number
}): Promise<SubmitHubbleMeasurementResult> {

  logger.verbose(`Attempting to submit measurement for student ${data.student_id}, galaxy ${data.galaxy_id}`);

  const student = await findStudentById(data.student_id);
  if (student === null) {
    logger.verbose("No such student!");
    return SubmitHubbleMeasurementResult.NoSuchStudent;
  }

  const measurement = await HubbleMeasurement.findOne({
    where: {
      [Op.and]: [
        { student_id: data.student_id },
        { galaxy_id: data.galaxy_id }
      ]
    }
  })
  .catch((_error) => {
    logger.verbose("Measurement not found");
  });

  logger.verbose(`Measurement data is ${JSON.stringify(data)}`);

  if (measurement) {
    measurement.update(data, {
      where: {
        [Op.and]: [
          { student_id: measurement.student_id },
          { galaxy_id: measurement.galaxy_id }
        ]
      }
    })
    .catch((error) => {
      logger.error("Error updating measurement!");
      logger.error(error);
    });
    logger.verbose("Updated measurement");
    return SubmitHubbleMeasurementResult.MeasurementUpdated;
  } else {
    logger.verbose("Creating new measurement");
    HubbleMeasurement.create(data).catch(console.log);
    return SubmitHubbleMeasurementResult.MeasurementCreated;
  }
}

export async function submitSampleHubbleMeasurement(data: {
  student_id: number,
  galaxy_id: number,
  measurement_number: string,
  rest_wave_value: number | null,
  rest_wave_unit: string | null,
  obs_wave_value: number | null,
  obs_wave_unit: string | null,
  velocity_value: number | null,
  velocity_unit: string | null,
  ang_size_value: number | null,
  ang_size_unit: string | null,
  est_dist_value: number | null,
  est_dist_unit: string | null,
  brightness?: number,
}): Promise<SubmitHubbleMeasurementResult> {

  const student = await findStudentById(data.student_id);
  if (student === null) {
    return SubmitHubbleMeasurementResult.NoSuchStudent;
  }

  const measurement = await SampleHubbleMeasurement.findOne({
    where: {
      [Op.and]: [
        { student_id: data.student_id },
        { galaxy_id: data.galaxy_id },
        { measurement_number: data.measurement_number }
      ]
    }
  })
  .catch(console.log);

  if (measurement) {
    measurement.update(data, {
      where: {
        [Op.and]: [
          { student_id: measurement.student_id },
          { galaxy_id: measurement.galaxy_id },
          { measurement_number: data.measurement_number }
        ]
      }
    })
    .catch(console.log);
    return SubmitHubbleMeasurementResult.MeasurementUpdated;
  } else {
    SampleHubbleMeasurement.create(data).catch(console.log);
    return SubmitHubbleMeasurementResult.MeasurementCreated;
  }
}

export async function getHubbleMeasurement(studentID: number, galaxyID: number): Promise<HubbleMeasurement | null> {
  return HubbleMeasurement.findOne({
    where: {
      [Op.and]: [
        { student_id: studentID },
        { galaxy_id: galaxyID }
      ],
    },
    include: [{
      model: Galaxy,
      attributes: galaxyAttributes,
      as: "galaxy",
      required: true
    }]
  }).catch(error => {
    console.log(error);
    return null;
  });
}

export async function getSampleHubbleMeasurements(studentID: number): Promise<SampleHubbleMeasurement[]> {
  return SampleHubbleMeasurement.findAll({
    where: { student_id: studentID },
    include: [{
      model: Galaxy,
      attributes: galaxyAttributes,
      as: "galaxy",
      required: true
    }]
  }).catch(error => {
    console.log(error);
    return [];
  });
}

export async function getSampleHubbleMeasurement(studentID: number, measurementNumber: string): Promise<SampleHubbleMeasurement | null> {
  return SampleHubbleMeasurement.findOne({
    where: { student_id: studentID, measurement_number: measurementNumber },
    include: [{
      model: Galaxy,
      attributes: galaxyAttributes,
      as: "galaxy",
      required: true
    }]
  }).catch(error => {
    console.log(error);
    return null;
  });
}

const EXCLUDE_MEASUREMENTS_WITH_NULL_CONDITION: WhereAttributeHash<HubbleMeasurement | SampleHubbleMeasurement> = {
  obs_wave_value: { [Op.not]: null },
  velocity_value: { [Op.not]: null },
  ang_size_value: { [Op.not]: null },
  est_dist_value: { [Op.not]: null }
};

export async function getAllSampleHubbleMeasurements(excludeWithNull = true): Promise<SampleHubbleMeasurement[]> {
  const query = excludeWithNull ? { where: EXCLUDE_MEASUREMENTS_WITH_NULL_CONDITION } : {};
  return SampleHubbleMeasurement.findAll(query).catch(_error => []);
}

export async function getAllNthSampleHubbleMeasurements(measurementNumber: "first" | "second"): Promise<SampleHubbleMeasurement[]> {
  return SampleHubbleMeasurement.findAll({
    where: { measurement_number: measurementNumber }
  }).catch(_error => []);
}

export async function getStudentHubbleMeasurements(studentID: number): Promise<HubbleMeasurement[] | null> {
  return HubbleMeasurement.findAll({
    where: {
      student_id: studentID
    },
    include: [{
      model: Galaxy,
      attributes: galaxyAttributes,
      as: "galaxy",
      required: true
    }]
  })
  .catch(error => {
    console.log(error);
    return null;
  });
}

async function getHubbleMeasurementsForStudentClasses(studentID: number, classIDs: number[], excludeWithNull: boolean = false): Promise<HubbleMeasurement[]> {

  const studentWhereConditions: WhereOptions = [];
  const classDataStudentIDs = await getClassDataIDsForStudent(studentID);
  if (classDataStudentIDs.length > 0) {
    classDataStudentIDs.push(studentID);
    studentWhereConditions.push({
      id: {
        [Op.in]: classDataStudentIDs
      }
    });
  }

  const measurementWhereConditions: WhereOptions<HubbleMeasurement> = [];
  if (excludeWithNull) {
    measurementWhereConditions.push(EXCLUDE_MEASUREMENTS_WITH_NULL_CONDITION);
  }

  return HubbleMeasurement.findAll({
    where: measurementWhereConditions,
    include: [{
      model: Student,
      attributes: ["id"],
      as: "student",
      required: true,
      where: studentWhereConditions,
      include: [{
        model: Class,
        attributes: ["id"],
        where: {
          id: {
            [Op.in]: classIDs
          }
        }
      },
      {
        model: IgnoreStudent,
        required: false,
        attributes: [],
        where: {
          story_name: "hubbles_law"
        }
      }],
    },
    {
      model: Galaxy,
      attributes: galaxyAttributes,
      as: "galaxy",
      required: true
    }]
  });
}

async function getHubbleStudentDataForClasses(classIDs: number[]): Promise<HubbleStudentData[]> {
  return HubbleStudentData.findAll({
    include: [{
      model: Student,
      attributes: ["id"],
      as: "student",
      required: true,
      include: [{
        model: Class,
        attributes: ["id"],
        where: {
          id: {
            [Op.in]: classIDs
          }
        }
      },
      {
        model: IgnoreStudent,
        required: false,
        attributes: ["student_id", "story_name"],
        where: {
          student_id: null
        }
      }]
    }]
  });
}

async function getClassIDsForAsyncStudent(studentID: number, classID: number | null): Promise<number[]> {
  const classIDs: (number | null)[] = [classID];
  const mergedClassID = (await AsyncMergedHubbleStudentClasses.findOne({
    where: {
      class_id: classID,
      student_id: studentID
    }
  }))?.merged_class_id ?? null;
  if (mergedClassID !== null) {
    classIDs.push(mergedClassID);
  }
  const nonNullIDs: number[] = classIDs.filter((x): x is number => x !== null);
  return nonNullIDs;
}

async function getClassIDsForSyncClass(classID: number): Promise<number[]> {
  const classIDs: number[] = [classID];
  const mergedClass = (await SyncMergedHubbleClasses.findOne({
    where: {
      class_id: classID
    }
  }));
  const mergedClassID = mergedClass?.class_id ?? null;
  if (mergedClassID !== null) {
    classIDs.push(mergedClassID);
  }
  return classIDs;
}

export async function getClassDataIDsForStudent(studentID: number): Promise<number[]> {
  const state = (await StoryState.findOne({
    where: { student_id: studentID },
    attributes: [
      [fn("JSON_EXTRACT", col("story_state"), literal("'$.class_data_students'")), "class_data_students"]
    ]
  }));
  // TODO: Remove the need for ts-ignore here
  // @ts-ignore: Not sure how to add AS-ed in fields to type of the output
  return state?.getDataValue("class_data_students") ?? [];
}

async function getHubbleMeasurementsForSyncStudent(studentID: number, classID: number, excludeWithNull: boolean = false): Promise<HubbleMeasurement[] | null> {
  const classIDs = await getClassIDsForSyncClass(classID);
  return getHubbleMeasurementsForStudentClasses(studentID, classIDs, excludeWithNull);
}

async function getHubbleMeasurementsForAsyncStudent(studentID: number, classID: number | null, excludeWithNull: boolean = false): Promise<HubbleMeasurement[] | null> {
  const classIDs = await getClassIDsForAsyncStudent(studentID, classID);
  return getHubbleMeasurementsForStudentClasses(studentID, classIDs, excludeWithNull);
}

export async function getClassMeasurements(studentID: number,
                                           classID: number | null,
                                           lastChecked: number | null = null,
                                           excludeWithNull: boolean = false,
): Promise<HubbleMeasurement[]> {
  const cls = classID !== null ? await findClassById(classID) : null;
  const asyncClass = cls?.asynchronous ?? true;
  let data: HubbleMeasurement[] | null;
  if (classID === null || asyncClass) {
    data = await getHubbleMeasurementsForAsyncStudent(studentID, classID, excludeWithNull);
  } else {
    data = await getHubbleMeasurementsForSyncStudent(studentID, classID, excludeWithNull);
  }
  if (data != null && lastChecked != null) {
    const lastModified = Math.max(...data.map(meas => meas.last_modified.getTime()));
    if (lastModified <= lastChecked) {
      data = null;
    }
  }
  return data ?? [];
}

// The advantage of this over the function above is that it saves bandwidth,
// since we aren't sending the data itself.
// This is intended to be used with cases where we need to frequently check the number of measurements
export async function getClassMeasurementCount(studentID: number,
                                               classID: number | null,
                                               excludeWithNull: boolean = false,
): Promise<number> {
  const cls = classID !== null ? await findClassById(classID) : null;
  const asyncClass = cls?.asynchronous ?? true;
  let data: HubbleMeasurement[] | null;
  if (classID === null || asyncClass) {
    data = await getHubbleMeasurementsForAsyncStudent(studentID, classID, excludeWithNull);
  } else {
    data = await getHubbleMeasurementsForSyncStudent(studentID, classID, excludeWithNull);
  }
  return data?.length ?? 0;
}

// Similar to the function above, this is intended for cases where we need to frequently check
// how many students have completed their measurements, such as the beginning of Stage 4 in the Hubble story
export async function getStudentsWithCompleteMeasurementsCount(studentID: number,
                                                               classID: number | null,
): Promise<number> {
  const cls = classID !== null ? await findClassById(classID) : null;
  const asyncClass = cls?.asynchronous ?? true;
  let data: HubbleMeasurement[] | null;
  if (classID === null || asyncClass) {
    data = await getHubbleMeasurementsForAsyncStudent(studentID, classID, true);
  } else {
    data = await getHubbleMeasurementsForSyncStudent(studentID, classID, true);
  }
  const counts: Record<number, number> = {};
  data?.forEach(measurement => {
    if (measurement.student_id in counts) {
      counts[measurement.student_id] += 1;
    } else {
      counts[measurement.student_id] = 1;
    }
  });
  let num = 0;
  for (const id in counts) {
    if (counts[id] >= 5) {
      num += 1;
    }
  }
  return num;
}

async function getHubbleStudentDataForAsyncStudent(studentID: number, classID: number | null): Promise<HubbleStudentData[] | null> {
  const classIDs = await getClassIDsForAsyncStudent(studentID, classID);
  return getHubbleStudentDataForClasses(classIDs);
}

async function getHubbleStudentDataForSyncClass(classID: number): Promise<HubbleStudentData[]> {
  const classIDs = await getClassIDsForSyncClass(classID);
  return getHubbleStudentDataForClasses(classIDs);
}

export async function _getStageThreeStudentData(studentID: number, classID: number | null): Promise<HubbleStudentData[]> {
  const cls = classID !== null ? await findClassById(classID) : null;
  const asyncClass = cls?.asynchronous ?? true;
  let data: HubbleStudentData[] | null;
  if (classID === null || asyncClass) {
    data = await getHubbleStudentDataForAsyncStudent(studentID, classID);
  } else {
    data = await getHubbleStudentDataForSyncClass(classID);
  }
  return data ?? [];
}

const MINIMAL_MEASUREMENT_FIELDS = ["student_id", "galaxy_id", "velocity_value", "est_dist_value", "class_id"];
const MINIMAL_EXCLUDE_MEASUREMENT_FIELDS = Object.keys(HubbleMeasurement.getAttributes()).filter(key => !MINIMAL_MEASUREMENT_FIELDS.includes(key));

export async function getAllHubbleMeasurements(before: Date | null = null, minimal=false): Promise<HubbleMeasurement[]> {
  const whereConditions: WhereOptions = [
     { "$student.IgnoreStudents.student_id$": null }
  ];
  if (before !== null) {
    whereConditions.push({ last_modified: { [Op.lt]: before } });
  }
  return HubbleMeasurement.findAll({
    raw: true,
    attributes: {
      // The "student" here comes from the alias below
      // We do this so that we get access to the included field as just "class_id"
      include: [[Sequelize.col("student.Classes.id"), "class_id"]],
      exclude: minimal ? MINIMAL_EXCLUDE_MEASUREMENT_FIELDS : [],
    },
    where: {
      [Op.and]: whereConditions
    },
    include: [{
      model: Galaxy,
      as: "galaxy",
      attributes: []
    }, {
      model: Student,
      as: "student",
      attributes: [],
      where: {
        [Op.or]: [
          { seed: 1 }, { dummy: 0 }
        ]
      },
      include: [{
        model: Class,
        attributes: [],
        through: { attributes: [] }
      },
      {
        model: IgnoreStudent,
        required: false,
        attributes: [],
        where: {
          story_name: "hubbles_law"
        }
      }]
    }]
  });
}

const MINIMAL_STUDENT_DATA_FIELDS = ["student_id", "age_value"];
const MINIMAL_EXCLUDE_STUDENT_DATA_FIELDS = Object.keys(HubbleStudentData.getAttributes()).filter(key => !MINIMAL_STUDENT_DATA_FIELDS.includes(key));
export async function getAllHubbleStudentData(before: Date | null = null, minimal=false): Promise<HubbleStudentData[]> {
  const whereConditions: WhereOptions = [
    { "$student.IgnoreStudents.student_id$": null }
  ];
  if (before !== null) {
    whereConditions.push({ last_data_update: { [Op.lt]: before } });
  }
  const data = await HubbleStudentData.findAll({
    raw: true, // We want a flattened object
    attributes: {
      // The "student" here comes from the alias below
      // We do this so that we get access to the included field as just "class_id"
      include: [[Sequelize.col("student.Classes.id"), "class_id"]],
      exclude: minimal ? MINIMAL_EXCLUDE_STUDENT_DATA_FIELDS : [],
    },
    where: {
      [Op.and]: whereConditions
    },
    include: [{
      model: Student,
      as: "student",
      attributes: minimal ? [] : ["seed", "dummy"],
      include: [{
        model: IgnoreStudent,
        required: false,
        attributes: [],
        where: {
          story_name: "hubbles_law"
        }
      },
      {
        model: Class,
        attributes: [],
        through: { attributes: [] }
      }],
      where: {
         [Op.or]: [
          { seed: 1 }, { dummy: 0 }
        ]
      }
    }],
  });

  return data;
}

export async function getAllHubbleClassData(before: Date | null = null, minimal=false): Promise<HubbleClassData[]> {
  const whereConditions = before !== null ? [{ last_data_update: { [Op.lt]: before } }] : [];
  const query: FindOptions<HubbleClassData> = {
    include: [{
      model: StudentsClasses,
      as: "class_data",
      attributes: []
    }],
    where: {
      [Op.and]: whereConditions
    },
    group: ["HubbleClassData.class_id"],
    having: Sequelize.where(Sequelize.fn("count", Sequelize.col("HubbleClassData.class_id")), { [Op.gte]: 13 })
  };
  if (minimal) {
    query.attributes = ["class_id", "age_value"];
  }
  return HubbleClassData.findAll(query);
}

export async function removeHubbleMeasurement(studentID: number, galaxyID: number): Promise<RemoveHubbleMeasurementResult> {
  const count = await HubbleMeasurement.destroy({
    where: {
      student_id: studentID,
      galaxy_id: galaxyID
    }
  });
  return count > 0 ? RemoveHubbleMeasurementResult.MeasurementDeleted : RemoveHubbleMeasurementResult.NoSuchMeasurement;
}

export async function removeSampleHubbleMeasurement(studentID: number, measurementNumber: string): Promise<RemoveHubbleMeasurementResult> {
  const count = await SampleHubbleMeasurement.destroy({
    where: {
      student_id: studentID,
      measurement_number: measurementNumber
    }
  });
  return count > 0 ? RemoveHubbleMeasurementResult.MeasurementDeleted : RemoveHubbleMeasurementResult.NoSuchMeasurement;
}

export async function getGalaxiesForTypes(types: string[], flags=false): Promise<Galaxy[]> {
  const query: FindOptions<Attributes<Galaxy>> = {
    where: {
      is_bad: 0,
      spec_is_bad: 0,
      is_sample: 0,
      type: { [Op.in]: types }
    }
  };

  if (!flags) {
    query.attributes = galaxyAttributes;
  }

  return Galaxy.findAll(query);
}

export async function getAllGalaxies(flags=false): Promise<Galaxy[]> {
  const query: FindOptions<Attributes<Galaxy>> = {
    where: {
      is_bad: 0,
      spec_is_bad: 0,
      is_sample: 0
    }
  };

  if (!flags) {
    query.attributes = galaxyAttributes;
  }

  return Galaxy.findAll(query);
}

export async function getGalaxyByName(name: string): Promise<Galaxy | null> {
  return Galaxy.findOne({
    where: { name: name }
  });
}

export async function getGalaxyById(id: number): Promise<Galaxy | null> {
  return Galaxy.findOne({
    where: { id: id }
  });
}

export async function getSampleGalaxy(): Promise<Galaxy | null> {
  return Galaxy.findOne({
    where: { is_sample: 1 }
  });
}

export async function markGalaxyBad(galaxy: Galaxy): Promise<void> {
  galaxy.update({ marked_bad: galaxy.marked_bad + 1 });
}

export async function markGalaxySpectrumBad(galaxy: Galaxy): Promise<void> {
  galaxy.update({ spec_marked_bad: galaxy.spec_marked_bad + 1 });
}

export async function markGalaxyTileloadBad(galaxy: Galaxy): Promise<void> {
  galaxy.update({ tileload_marked_bad: galaxy.tileload_marked_bad + 1 });
}

export async function getAsyncMergedClassIDForStudent(studentID: number): Promise<number | null> {
  const merged = await AsyncMergedHubbleStudentClasses.findOne({
    where: {
      student_id: studentID
    }
  });
  return merged?.class_id ?? null;
}

export async function getSyncMergedClassID(classID: number): Promise<number | null> {
  const merged = await SyncMergedHubbleClasses.findOne({
    where: {
      class_id: classID
    }
  });
  return merged?.class_id ?? null;
}

/** These functions are specifically for the spectrum-checking branch */

export async function setGalaxySpectrumStatus(galaxy: Galaxy, good: boolean): Promise<void> {
  const goodInt = good ? 1 : 0;
  const update = {
    spec_is_good: goodInt,
    spec_is_bad: 1 - goodInt,
    spec_checked: galaxy.spec_checked + 1
  };
  await galaxy.update(update);
}

export async function getUncheckedSpectraGalaxies(): Promise<Galaxy[]> {
  return Galaxy.findAll({
    where: { spec_checked: 0 }
  });
}

export async function getNewGalaxies(): Promise<Galaxy[]> {
  return Galaxy.findAll({
    where: {
      [Op.and]: [
        { is_bad: 0 },
        { spec_is_bad: 0 },
        { id: { [Op.gt]: 1387 } },
        { id: { [Op.lte]: 1788 } },
      ]
    }
  });
}

/** These functions are specifically for the data generation branch */

/** For the data generation branch, we want to preferentially choose galaxies with 
 * fewer measurements. So this function will sort the galaxies by the number of measurements 
 * from seed students. The data generation branch will then feed this data sequentially
 * to the team members using it.
 * 
 * The SQL that we're looking to generate here is
 * SELECT * FROM Galaxies
 * INNER JOIN HubbleMeasurements ON Galaxies.id = HubbleMeasurements.galaxy_id
 * INNER JOIN Students on Students.id = HubbleMeasurements.student_id
 * WHERE (Students.seed = 1 OR Students.dummy = 0)
 * GROUP BY Galaxies.id
 * ORDER BY COUNT(Galaxies.id), Galaxy.id DESC
 */
export async function getGalaxiesForDataGeneration(types=["Sp"]): Promise<Galaxy[]> {
  const measurements = await Galaxy.findAll({
    where: {
      is_bad: 0,
      spec_is_bad: 0,
      is_sample: 0,
      type: { [Op.in]: types }
    },
    include: [
      {
        model: HubbleMeasurement,
        attributes: [],
        required: true,
        include: [{
          model: Student,
          as: "student",
          attributes: [],
          required: true,
          where: {
            [Op.or]: [
              { seed: 1 }, { dummy: 0 }
            ]
          }
        }]
      }
    ],
    group: ["Galaxy.id"],
    order: [Sequelize.fn("count", Sequelize.col("Galaxy.id")), ["id", "DESC"]]
  });
  const measurementIDs = measurements.map(gal => gal.id);
  const noMeasurements = await Galaxy.findAll({
    where: {
      is_bad: 0,
      spec_is_bad: 0,
      is_sample: 0,
      type: { [Op.in]: types },
      id: { [Op.notIn]: measurementIDs }
    },
    order: [["id", "DESC"]]
  });
  return noMeasurements.concat(measurements);
}

export async function getMergeDataForClass(classID: number): Promise<SyncMergedHubbleClasses | null> {
  return SyncMergedHubbleClasses.findOne({ where: { class_id: classID } });
}

export async function eligibleClassesForMerge(classID: number, sizeThreshold=20): Promise<Class[]> {
  const size = await classSize(classID);

  // Running into the limits of the ORM a bit here
  // Maybe there's a clever way to write this?
  // But straight SQL gets the job done
  return cosmicdsDB.query(
    `SELECT * FROM (SELECT
    id,
    test,
    (SELECT
            COUNT(*)
        FROM
            StudentsClasses
        WHERE
            StudentsClasses.class_id = id) AS size
    FROM
        Classes) q
    WHERE
        (size >= ${sizeThreshold - size} AND test = 0)
  `, { type: QueryTypes.SELECT }) as Promise<Class[]>;
}

// Try and merge the class with the given ID with another class such that the total size is above the threshold
// We say "try" because if a client doesn't know that the merge has already occurred, we may get
// multiple such requests from different student clients.
// If a merge has already been created, we don't make another one - we just return the existing one, with a
// message that indicates that this was the case.
export interface MergeAttemptData {
  mergeData: SyncMergedHubbleClasses | null;
  message: string;
}
export async function tryToMergeClass(classID: number): Promise<MergeAttemptData> {
  const cls = await findClassById(classID);
  if (cls === null) {
    return { mergeData: null, message: "Invalid class ID!" };
  }

  let mergeData = await getMergeDataForClass(classID);
  if (mergeData !== null) {
    return { mergeData, message: "Class already merged" };
  }

  const eligibleClasses = await eligibleClassesForMerge(classID);
  if (eligibleClasses.length > 0) {
    const index = Math.floor(Math.random() * eligibleClasses.length);
    console.log(eligibleClasses);
    console.log(index);
    const classToMerge = eligibleClasses[index];
    mergeData = await SyncMergedHubbleClasses.create({ class_id: classID, merged_class_id: classToMerge.id });
    if (mergeData === null) {
      return { mergeData, message: "Error creating merge!" };
    }
    return { mergeData, message: "New merge created" };
  }

  return { mergeData: null, message: "No eligible classes to merge" };

}
