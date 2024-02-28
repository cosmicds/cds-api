import { cosmicdsDB } from "../../database";
import { logger } from "../../logger";
import {
  isArrayThatSatisfies,
  isNumberArray,
} from "../../utils";

import { initializeModels, SolarEclipse2024Response, SolarEclipse2024Response, SolarEclipse2024Response, SolarEclipse2024Response } from "./models";

initializeModels(cosmicdsDB);

export interface SolarEclipse2024Data {
  user_uuid: string;
  user_selected_locations: [number, number][],
  timestamp: Date
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isValidSolarEclipseData(data: any): data is SolarEclipse2024Response {
  return typeof data.user_uuid === "string" &&
    isArrayThatSatisfies(data.user_selected_locations, (arr) => {
      return arr.every(x => isNumberArray(x) && x.length === 2);
    });
}

export async function submitSolarEclipse2024Response(data: SolarEclipse2024Response): Promise<SolarEclipse2024Response | null> {

  logger.verbose(`Attempting to submit solar eclipse 2024 measurement for user ${data.user_uuid}`);

  const dataWithCounts = {
    ...data,
    user_selected_locations_count: data.user_selected_locations.length
  };

  return SolarEclipse2024Response.upsert(dataWithCounts).then(([item, _]) => item);
}

export async function getAllSolarEclipse2024Responses(): Promise<SolarEclipse2024Response[]> {
  return SolarEclipse2024Response.findAll();
}

export async function getSolarEclipse2024Response(userUUID: string): Promise<SolarEclipse2024Response | null> {
  return SolarEclipse2024Response.findOne({
    where: { user_uuid: userUUID }
  });
}
