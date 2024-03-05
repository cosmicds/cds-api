import * as S from "@effect/schema/Schema";
import { cosmicdsDB } from "../../database";
import { logger } from "../../logger";

import { initializeModels, SolarEclipse2024Response } from "./models";

initializeModels(cosmicdsDB);

const LatLonArray = S.mutable(S.array(S.mutable(S.tuple(S.number, S.number))));

export const SolarEclipse2024Data = S.struct({
  user_uuid: S.string,
  selected_locations: LatLonArray,
  cloud_cover_selected_locations: LatLonArray,
  timestamp: S.Date,
});

export const SolarEclipse2024Update = S.struct({
  user_uuid: S.string,
  selected_locations: S.optional(LatLonArray, { exact: true }),
  cloud_cover_selected_locations: S.optional(LatLonArray, { exact: true }),
  timestamp: S.Date,
});

export type SolarEclipse2024DataT = S.Schema.To<typeof SolarEclipse2024Data>;
export type SolarEclipse2024UpdateT = S.Schema.To<typeof SolarEclipse2024Update>;

export async function submitSolarEclipse2024Response(data: SolarEclipse2024DataT): Promise<SolarEclipse2024Response | null> {
  logger.verbose(`Attempting to submit solar eclipse 2024 measurement for user ${data.user_uuid}`);

  const dataWithCounts = {
    ...data,
    selected_locations_count: data.selected_locations.length,
    cloud_cover_selected_locations_count: data.cloud_cover_selected_locations.length,
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

export async function updateSolarEclipse2024Response(userUUID: string, update: SolarEclipse2024UpdateT): Promise<boolean> {
  const document = await SolarEclipse2024Response.findOne({ where: { user_uuid: userUUID } });
  if (document === null) {
    return false;
  }
  const result = await document.update(
    {
      ...update,
      selected_locations_count: update.selected_locations?.length ?? 0,
      cloud_cover_selected_locations_count: update.cloud_cover_selected_locations?.length ?? 0,
    }
  );
  return result !== null;
}
