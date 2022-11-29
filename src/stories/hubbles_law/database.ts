import { Op, Sequelize } from "sequelize";
import { AsyncMergedHubbleStudentClasses, Galaxy, HubbleMeasurement, SampleHubbleMeasurement, initializeModels, SyncMergedHubbleClasses } from "./models";
import { cosmicdsDB, findClassById, findStudentById } from "../../database";
import { RemoveHubbleMeasurementResult, SubmitHubbleMeasurementResult } from "./request_results";
import { setUpHubbleAssociations } from "./associations";
import { Class, Student, StudentsClasses } from "../../models";
import { HubbleStudentData } from "./models/hubble_student_data";
import { HubbleClassData } from "./models/hubble_class_data";

initializeModels(cosmicdsDB);
setUpHubbleAssociations();

const galaxyAttributes = ["ra", "decl", "z", "type", "name", "element"];

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
  est_dist_unit: string | null
}): Promise<SubmitHubbleMeasurementResult> {

  const student = await findStudentById(data.student_id);
  if (student === null) {
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
  .catch(console.log);

  if (measurement) {
    measurement.update(data, {
      where: {
        [Op.and]: [
          { student_id: measurement.student_id },
          { galaxy_id: measurement.galaxy_id }
        ]
      }
    })
    .catch(console.log);
    return SubmitHubbleMeasurementResult.MeasurementUpdated;
  } else {
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
  est_dist_unit: string | null
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

export async function getAllSampleHubbleMeasurements(): Promise<SampleHubbleMeasurement[]> {
  return SampleHubbleMeasurement.findAll().catch(_error => []);
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

async function getHubbleMeasurementsForClasses(classIDs: number[]): Promise<HubbleMeasurement[]> {

  return HubbleMeasurement.findAll({
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
      }]
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

async function getHubbleMeasurementsForSyncClass(classID: number): Promise<HubbleMeasurement[] | null> {
  const classIDs = await getClassIDsForSyncClass(classID);
  return getHubbleMeasurementsForClasses(classIDs);
}

async function getHubbleMeasurementsForAsyncStudent(studentID: number, classID: number | null): Promise<HubbleMeasurement[] | null> {
  const classIDs = await getClassIDsForAsyncStudent(studentID, classID);
  return getHubbleMeasurementsForClasses(classIDs);
}

export async function getStageThreeMeasurements(studentID: number, classID: number | null): Promise<HubbleMeasurement[]> {
  const cls = classID !== null ? await findClassById(classID) : null;
  const asyncClass = cls?.asynchronous ?? true;
  let data: HubbleMeasurement[] | null;
  if (classID === null || asyncClass) {
    data = await getHubbleMeasurementsForAsyncStudent(studentID, classID);
  } else {
    data = await getHubbleMeasurementsForSyncClass(classID);
  }
  return data ?? [];
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

export async function getAllHubbleMeasurements(): Promise<HubbleMeasurement[]> {
  return HubbleMeasurement.findAll({
    attributes: {
      // The "student" here comes from the alias below
      // We do this so that we get access to the included field as just "class_id"
      include: [[Sequelize.col("student.Classes.id"), "class_id"]]
    },
    include: [{
      model: Galaxy,
      as: "galaxy",
      attributes: ["id", "type"]
    }, {
      model: Student,
      as: "student",
      attributes: ["seed", "dummy"],
      where: {
        [Op.or]: [
          { seed: 1 }, { dummy: 0 }
        ]
      },
      include: [{
        model: Class,
        attributes: [],
        through: { attributes: [] }
      }]
    }]
  });
}

export async function getAllHubbleStudentData(): Promise<HubbleStudentData[]> {
  const data = await HubbleStudentData.findAll({
    raw: true, // We want a flattened object
    attributes: {
      // The "student" here comes from the alias below
      // We do this so that we get access to the included field as just "class_id"
      include: [[Sequelize.col("student.Classes.id"), "class_id"]]
    },
    include: [{
      model: Student,
      as: "student",
      attributes: ["seed", "dummy"],
      where: {
        [Op.or]: [
          { seed: 1 }, { dummy: 0 }
        ]
      },
      include: [{
        model: Class,
        attributes: [],
        through: { attributes: [] }
      }]
    }],
  });

  return data;
}

export async function getAllHubbleClassData(): Promise<HubbleClassData[]> {
  return HubbleClassData.findAll({
    include: [{
      model: StudentsClasses,
      as: "class_data",
      attributes: []
    }],
    group: ["HubbleClassData.class_id"],
    having: Sequelize.where(Sequelize.fn("count", Sequelize.col("HubbleClassData.class_id")), { [Op.gte]: 15 })
  });
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

export async function getGalaxiesForTypes(types: string[]): Promise<Galaxy[]> {
  return Galaxy.findAll({
    where: {
      is_bad: 0,
      spec_is_bad: 0,
      is_sample: 0,
      type: { [Op.in]: types }
    }
  });
}

export async function getAllGalaxies(): Promise<Galaxy[]> {
  return Galaxy.findAll({
    where: {
      is_bad: 0,
      spec_is_bad: 0,
      is_sample: 0
    }
  });
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
