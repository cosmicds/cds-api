import { cosmicdsDB } from "../../database";
import { logger } from "../../logger";
import {
  isArrayThatSatisfies,
  isNumberArray,
  isStringArray
} from "../../utils";

import { initializeModels, EclipseMiniResponse } from "./models";

initializeModels(cosmicdsDB);

export interface EclipseMiniData {
  user_uuid: string;
  mc_responses: string[];
  preset_locations: string[],
  user_selected_locations: [number, number][],
  timestamp: Date
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isValidEclipseMiniData(data: any): data is EclipseMiniData {

  return typeof data.user_uuid === "string" &&
    (!data.mc_responses || isStringArray(data.mc_responses)) &&
    isStringArray(data.preset_locations) &&
    isArrayThatSatisfies(data.user_selected_locations, (arr) => {
      return arr.every(x => isNumberArray(x) && x.length === 2);
    });
}

export async function submitEclipseMiniResponse(data: EclipseMiniData): Promise<EclipseMiniResponse | null> {

  logger.verbose(`Attempting to submit measurement for user ${data.user_uuid}`);

  const dataWithCounts = {
    ...data,
    preset_locations_count: data.preset_locations.length,
    user_selected_locations_count: data.user_selected_locations.length
  };

  return EclipseMiniResponse.upsert(dataWithCounts).then(([item, _]) => item);

}

export async function getAllEclipseMiniResponses(): Promise<EclipseMiniResponse[]> {
  return EclipseMiniResponse.findAll();
}

export async function getEclipseMiniResponse(userUUID: string): Promise<EclipseMiniResponse | null> {
  return EclipseMiniResponse.findOne({
    where: { user_uuid: userUUID }
  });
}
