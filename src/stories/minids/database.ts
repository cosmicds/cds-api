import { cosmicdsDB } from "../../database";
import { logger } from "../../logger";
import { initializeModels, EclipseMiniResponse } from "./models";

initializeModels(cosmicdsDB);

export async function submitEclipseMiniResponse(data: {
  user_uuid: string,
  response: string,
  preset_locations: string[],
  user_selected_locations: [number, number][],
  timestamp: Date
}): Promise<EclipseMiniResponse | null> {

  logger.verbose(`Attempting to submit measurement for user ${data.user_uuid}`);

  return EclipseMiniResponse.create({ 
    ...data,
    preset_locations_count: data.preset_locations.length,
    user_selected_locations_count: data.user_selected_locations.length
  });
}

export async function getEclipseMiniResponses(userUUID: string): Promise<EclipseMiniResponse[]> {
  return EclipseMiniResponse.findAll({
    where: { user_uuid: userUUID }
  });
}
