import { cosmicdsDB } from "../../database";
import { logger } from "../../logger";
import { initializeModels, EclipseMiniResponse } from "./models";

initializeModels(cosmicdsDB);

export interface EclipseMiniData {
  user_uuid: string;
  response: string;
  preset_locations: string[],
  user_selected_locations: [number, number][],
  timestamp: Date
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
