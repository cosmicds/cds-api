import * as S from "@effect/schema/Schema";

import { logger } from "../../logger";
import { UpdateAttributes, LatLonArray, OptionalInt, OptionalLatLonArray } from "../../utils";

import { SolarEclipse2026Data } from "./models";
import { CreationAttributes } from "sequelize";

type SolarEclipse2026UpdateAttributes = UpdateAttributes<SolarEclipse2026Data>;

export const SolarEclipse2026Entry = S.struct({
  user_uuid: S.string,
  user_selected_locations: LatLonArray,
  cloud_cover_selected_locations: LatLonArray,
  text_search_selected_locations: LatLonArray,
  advanced_weather_selected_locations_count: OptionalInt,
  cloud_cover_selected_locations_count: OptionalInt,
  info_time_ms: OptionalInt,
  app_time_ms: OptionalInt,
  advanced_weather_time_ms: OptionalInt,
  weather_info_time_ms: OptionalInt,
  user_guide_time_ms: OptionalInt,
  eclipse_timer_time_ms: OptionalInt,
  forecast_info_time_ms: OptionalInt,
});

export const SolarEclipse2026Update = S.struct({
  user_selected_locations: OptionalLatLonArray,
  cloud_cover_selected_locations: OptionalLatLonArray,
  text_search_selected_locations: OptionalLatLonArray,
  delta_advanced_weather_selected_locations_count: OptionalInt,
  delta_cloud_cover_selected_locations_count: OptionalInt,
  delta_info_time_ms: OptionalInt,
  delta_app_time_ms: OptionalInt,
  delta_advanced_weather_time_ms: OptionalInt,
  delta_weather_info_time_ms: OptionalInt,
  delta_user_guide_time_ms: OptionalInt,
  delta_eclipse_timer_time_ms: OptionalInt,
  delta_forecast_info_time_ms: OptionalInt,
});

export type SolarEclipse2026EntryT = S.Schema.To<typeof SolarEclipse2026Entry>;
export type SolarEclipse2026UpdateT = S.Schema.To<typeof SolarEclipse2026Update>;

export async function submitSolarEclipse2026Data(data: SolarEclipse2026EntryT): Promise<SolarEclipse2026Data | null> {
  logger.verbose(`Attempting to submit solar eclipse 2026 measurement for user ${data.user_uuid}`);

  const dataWithCounts: CreationAttributes<SolarEclipse2026Data> = {
    ...data,
    cloud_cover_selected_locations_count: data.cloud_cover_selected_locations_count ?? data.cloud_cover_selected_locations.length,
    user_selected_locations_count: data.user_selected_locations.length,
    text_search_selected_locations_count: data.text_search_selected_locations.length,
  };

  return SolarEclipse2026Data.upsert(dataWithCounts).then(([item, _]) => item);
}

export async function getAllSolarEclipse2026Data(): Promise<SolarEclipse2026Data[]> {
  return SolarEclipse2026Data.findAll();
}

export async function getSolarEclipse2026Data(userUUID: string): Promise<SolarEclipse2026Data | null> {
  return SolarEclipse2026Data.findOne({
    where: { user_uuid: userUUID }
  });
}

export async function updateSolarEclipse2026Data(userUUID: string, update: SolarEclipse2026UpdateT): Promise<boolean> {
  const data = await SolarEclipse2026Data.findOne({ where: { user_uuid: userUUID } });
  if (data === null) {
    return false;
  }
  const dbUpdate: SolarEclipse2026UpdateAttributes = {};
  if (update.user_selected_locations) {
    const selected = data.user_selected_locations.concat(update.user_selected_locations);
    dbUpdate.user_selected_locations = selected;
    dbUpdate.user_selected_locations_count = selected.length;
  }
  if (update.cloud_cover_selected_locations) {
    const selected = data.cloud_cover_selected_locations.concat(update.cloud_cover_selected_locations);
    dbUpdate.cloud_cover_selected_locations = selected;
  }
  if (update.text_search_selected_locations) {
    const selected = data.text_search_selected_locations.concat(update.text_search_selected_locations);
    dbUpdate.text_search_selected_locations = selected;
    dbUpdate.text_search_selected_locations_count = selected.length;
  }
  if (update.delta_cloud_cover_selected_locations_count) {
    dbUpdate.cloud_cover_selected_locations_count = data.cloud_cover_selected_locations_count + update.delta_cloud_cover_selected_locations_count;
  }
  if (update.delta_info_time_ms) {
    dbUpdate.info_time_ms = data.info_time_ms + update.delta_info_time_ms;
  }
  if (update.delta_app_time_ms) {
    dbUpdate.app_time_ms = data.app_time_ms + update.delta_app_time_ms;
  }
  if (update.delta_weather_info_time_ms) {
    dbUpdate.weather_info_time_ms = data.weather_info_time_ms + update.delta_weather_info_time_ms;
  }
  if (update.delta_user_guide_time_ms) {
    dbUpdate.user_guide_time_ms = data.user_guide_time_ms + update.delta_user_guide_time_ms;
  }
  if (update.delta_eclipse_timer_time_ms) {
    dbUpdate.eclipse_timer_time_ms = data.eclipse_timer_time_ms + update.delta_eclipse_timer_time_ms;
  }
  if (update.delta_forecast_info_time_ms) {
    dbUpdate.forecast_info_time_ms = data.forecast_info_time_ms + update.delta_forecast_info_time_ms;
  }
  const result = await data.update(dbUpdate);
  return result !== null;
}
