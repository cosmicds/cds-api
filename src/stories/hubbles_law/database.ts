import { Op } from "sequelize";
import { HubbleMeasurement, initializeHubbleMeasurementModel } from "./models/hubble_measurement";
import { cosmicdsDB, findStudentById } from "../../database";
import { Galaxy, initializeGalaxyModel } from "./models/galaxy";
import { RemoveHubbleMeasurementResult, SubmitHubbleMeasurementResult } from "./request_results";

initializeGalaxyModel(cosmicdsDB);
initializeHubbleMeasurementModel(cosmicdsDB);

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
      ]
    }
  }).catch(error => {
    console.log(error);
    return null;
  });
}

export async function getStudentHubbleMeasurements(studentID: number): Promise<HubbleMeasurement[] | null> {
  const result = await HubbleMeasurement.findAll({
  where: {
      student_id: studentID
    }
  })
  .catch(error => {
    console.log(error);
    return null;
  });
  return result;
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
