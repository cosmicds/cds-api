import { Op } from "sequelize";
import { AsyncMergedHubbleStudentClasses, Galaxy, HubbleMeasurement, initializeModels, SyncMergedHubbleClasses } from "./models";
import { cosmicdsDB, findClassById, findStudentById } from "../../database";
import { RemoveHubbleMeasurementResult, SubmitHubbleMeasurementResult } from "./request_results";
import { setUpHubbleAssociations } from "./associations";
import { Class, Student } from "../../models";

initializeModels(cosmicdsDB);
setUpHubbleAssociations();

const galaxyAttributes = ["ra", "decl", "z", "type", "name"];

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

async function getHubbleMeasurementsForClasses(classIDs: number[]): Promise<HubbleMeasurement[] | null> {

  return HubbleMeasurement.findAll({
    include: [{
      model: Student,
      attributes: ["id"],
      as: "student",
      required: true,
      include: [{
        model: Class,
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

async function getHubbleMeasurementsForSyncClass(classID: number): Promise<HubbleMeasurement[] | null> {
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

  return getHubbleMeasurementsForClasses(classIDs);
}

async function getHubbleMeasurementsForAsyncStudent(studentID: number, classID: number | null): Promise<HubbleMeasurement[] | null> {
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

  return getHubbleMeasurementsForClasses(nonNullIDs);
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

export async function removeHubbleMeasurement(studentID: number, galaxyID: number): Promise<RemoveHubbleMeasurementResult> {
  const count = await HubbleMeasurement.destroy({
    where: {
      student_id: studentID,
      galaxy_id: galaxyID
    }
  });
  return count > 0 ? RemoveHubbleMeasurementResult.MeasurementDeleted : RemoveHubbleMeasurementResult.NoSuchMeasurement;
}

export async function getAllGalaxies(): Promise<Galaxy[]> {
  return Galaxy.findAll({
    where: { is_bad: 0 }
  });
}

export async function getGalaxyByName(name: string): Promise<Galaxy | null> {
  return Galaxy.findOne({
    where: { name: name }
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
