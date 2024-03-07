import * as S from "@effect/schema/Schema";
import { cosmicdsDB } from "../../database";
import { logger } from "../../logger";

import { UpdateAttributes } from "../../utils";
import { initializeModels, SolarEclipse2024Data } from "./models";

type SolarEclipse2024UpdateAttributes = UpdateAttributes<SolarEclipse2024Data>;

initializeModels(cosmicdsDB);

const LatLonArray = S.mutable(S.array(S.mutable(S.tuple(S.number, S.number))));

export const SolarEclipse2024Entry = S.struct({
  user_uuid: S.string,
  selected_locations: LatLonArray,
  cloud_cover_selected_locations: LatLonArray,
  info_time_ms: S.optional(S.number.pipe(S.int()), { exact: true }),
  app_time_ms: S.optional(S.number.pipe(S.int()), { exact: true }),
});

export const SolarEclipse2024Update = S.struct({
  user_uuid: S.string,
  selected_locations: S.optional(LatLonArray, { exact: true }),
  cloud_cover_selected_locations: S.optional(LatLonArray, { exact: true }),
  delta_info_time_ms: S.optional(S.number.pipe(S.int()), { exact: true }),
  delta_app_time_ms: S.optional(S.number.pipe(S.int()), { exact: true }),
});

export type SolarEclipse2024DataT = S.Schema.To<typeof SolarEclipse2024Entry>;
export type SolarEclipse2024UpdateT = S.Schema.To<typeof SolarEclipse2024Update>;

export async function submitSolarEclipse2024Response(data: SolarEclipse2024DataT): Promise<SolarEclipse2024Data | null> {
  logger.verbose(`Attempting to submit solar eclipse 2024 measurement for user ${data.user_uuid}`);

  const dataWithCounts = {
    ...data,
    selected_locations_count: data.selected_locations.length,
    cloud_cover_selected_locations_count: data.cloud_cover_selected_locations.length,
  };

  return SolarEclipse2024Data.upsert(dataWithCounts).then(([item, _]) => item);
}

export async function getAllSolarEclipse2024Data(): Promise<SolarEclipse2024Data[]> {
  return SolarEclipse2024Data.findAll();
}

export async function getSolarEclipse2024Data(userUUID: string): Promise<SolarEclipse2024Data | null> {
  return SolarEclipse2024Data.findOne({
    where: { user_uuid: userUUID }
  });
}

export async function updateSolarEclipse2024Data(userUUID: string, update: SolarEclipse2024UpdateT): Promise<boolean> {
  const data = await SolarEclipse2024Data.findOne({ where: { user_uuid: userUUID } });
  if (data === null) {
    return false;
  }
  const dbUpdate: SolarEclipse2024UpdateAttributes = {
    user_uuid: update.user_uuid,
  };
  if (update.selected_locations) {
    const selected = data.selected_locations.concat(update.selected_locations);
    dbUpdate.selected_locations = selected;
    dbUpdate.selected_locations_count = selected.length;
  }
  if (update.cloud_cover_selected_locations) {
    const selected = data.cloud_cover_selected_locations.concat(update.cloud_cover_selected_locations);
    dbUpdate.cloud_cover_selected_locations = selected;
    dbUpdate.cloud_cover_selected_locations_count = selected.length;
  }
  if (update.delta_info_time_ms) {
    dbUpdate.info_time_ms = data.info_time_ms + update.delta_info_time_ms;
  }
  if (update.delta_app_time_ms) {
    dbUpdate.app_time_ms = data.app_time_ms + update.delta_app_time_ms;
  }
  const result = await data.update(dbUpdate);
  return result !== null;
}
