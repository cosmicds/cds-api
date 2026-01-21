import { Galaxy, HubbleMeasurement, HubbleStudentData } from "../models";
import { randomBetween } from "../../../../tests/utils";
import hubblesLaw = require("../main");

import { v4 } from "uuid";

export function globalRoutePath(route: string): string {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error `path` is defined on the export from main
  const prefix = hubblesLaw.path as string;
  return `${prefix}${route}`;
}

export async function createRandomGalaxy() {
  return Galaxy.create({
    type: "spiral",
    name: v4(),
    ra: randomBetween(0, 360),
    decl: randomBetween(-90, 90),
    z: randomBetween(0.01, 0.05),
    element: "Mg-I",
    marked_bad: 0,
    is_bad: 0,
    spec_checked: 0,
    spec_is_bad: 0,
    spec_marked_bad: 0,
    spec_is_good: 0,
    tileload_marked_bad: 0,
    is_sample: 0,
  });
}

export async function createRandomGalaxies(count: number): Promise<Galaxy[]> {
  const galaxies: Galaxy[] = [];
  for (let i = 0; i < Math.round(count); i++) {
    const galaxy = await createRandomGalaxy();
    galaxies.push(galaxy);
  }
  return galaxies;
}

export async function createRandomHubbleMeasurementForStudent(studentID: number, galaxyID: number) {
  const restWave = randomBetween(5000, 7000);
  const obsWave = randomBetween(restWave + 100, restWave + 300);
  const velocity = ((obsWave - restWave) / restWave) * 300_000;
  const angSize = randomBetween(30, 100);
  const dist = 6300 / angSize;
  return HubbleMeasurement.create({
    student_id: studentID,
    galaxy_id: galaxyID,
    rest_wave_value: restWave,
    rest_wave_unit: "angstrom",
    obs_wave_value: obsWave,
    obs_wave_unit: "angstrom",
    velocity_value: velocity,
    velocity_unit: "km / s",
    ang_size_value: angSize,
    ang_size_unit: "arcsecond",
    est_dist_value: dist,
    est_dist_unit: "Mpc",
  });
}

export async function createRandomHubbleDataForStudent(studentID: number): Promise<HubbleStudentData | null> {
  return HubbleStudentData.create({
    student_id: studentID,
    hubble_fit_value: 70 + (Math.random() - 0.5) * 20,
    hubble_fit_unit: "km / s",
    age_value: 13 + (Math.random() - 0.5) * 5,
    age_unit: "Gyr",
    last_data_update: new Date(),
  });
}
