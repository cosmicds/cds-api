import * as S from "@effect/schema/Schema";

import { logger } from "../../logger";
import { LatLonArray, OptionalInt, OptionalLatLonArray, OptionalBoolean, UpdateAttributes } from "../../utils";

import { PlanetParadeData } from "./models";
import { CreationAttributes } from "sequelize";

type PlanetParadeUpdateAttributes = UpdateAttributes<PlanetParadeData>;

export const PlanetParadeEntry = S.struct({
  user_uuid: S.string,
  user_selected_search_locations: LatLonArray,
  user_selected_search_locations_count: OptionalInt,
  user_selected_map_locations: LatLonArray,
  user_selected_map_locations_count: OptionalInt,
  app_time_ms: OptionalInt,
  info_time_ms: OptionalInt,
  video_time_ms: OptionalInt,
  video_opened: OptionalBoolean,
  video_played: OptionalBoolean,
});

export const PlanetParadeUpdate = S.struct({
  user_selected_search_locations: OptionalLatLonArray,
  user_selected_map_locations: OptionalLatLonArray,
  delta_app_time_ms: OptionalInt,
  delta_info_time_ms: OptionalInt,
  delta_video_time_ms: OptionalInt,
  video_opened: OptionalBoolean,
  video_played: OptionalBoolean,
});

export type PlanetParadeEntryT = S.Schema.To<typeof PlanetParadeEntry>;
export type PlanetParadeUpdateT = S.Schema.To<typeof PlanetParadeUpdate>;

export async function submitPlanetParadeData(data: PlanetParadeEntryT): Promise<PlanetParadeData | null> {
  logger.verbose(`Attempting to submit planet parade data for user ${data.user_uuid}`);

  const dataWithCounts: CreationAttributes<PlanetParadeData> = {
    ...data,
    user_selected_search_locations_count: data.user_selected_search_locations_count ?? 0,
    user_selected_map_locations_count: data.user_selected_map_locations_count ?? 0,
  };

  return PlanetParadeData.upsert(dataWithCounts).then(([item, _]) => item);
}

export async function getAllPlanetParadeData(): Promise<PlanetParadeData[]> {
  return PlanetParadeData.findAll();
}

export async function getPlanetParadeData(userUUID: string): Promise<PlanetParadeData | null> {
  return PlanetParadeData.findOne({
    where: { user_uuid: userUUID }
  });
}

export async function updatePlanetParadeData(userUUID: string, update: PlanetParadeUpdateT): Promise<PlanetParadeData | null> {
  const data = await PlanetParadeData.findOne({ where: { user_uuid: userUUID } });

  if (data === null) {
    const created = await PlanetParadeData.create({
      user_uuid: userUUID,
      user_selected_search_locations: update.user_selected_search_locations ?? [],
      user_selected_search_locations_count: update.user_selected_search_locations?.length ?? 0,
      user_selected_map_locations: update.user_selected_map_locations ?? [],
      user_selected_map_locations_count: update.user_selected_search_locations?.length ?? 0,
      app_time_ms: update.delta_app_time_ms ?? 0,
      info_time_ms: update.delta_info_time_ms ?? 0,
      video_time_ms: update.delta_video_time_ms ?? 0,
      video_opened: update.video_opened ?? false,
      video_played: update.video_played ?? false,
    });
    return created;
  }
  
  const dbUpdate: PlanetParadeUpdateAttributes = {};
  if (update.user_selected_map_locations) {
    const selected = data.user_selected_map_locations.concat(update.user_selected_map_locations);
    dbUpdate.user_selected_map_locations = selected;
    dbUpdate.user_selected_map_locations_count = selected.length;
  }

  if (update.user_selected_search_locations) {
    const selected = data.user_selected_search_locations.concat(update.user_selected_search_locations);
    dbUpdate.user_selected_search_locations = selected;
    dbUpdate.user_selected_search_locations_count = selected.length;
  }

  // For the time deltas, it's fine to skip the update logic whether 
  // they're null/undefined (nothing to report) or zero (no change)
  if (update.delta_app_time_ms) {
    dbUpdate.app_time_ms = data.app_time_ms + update.delta_app_time_ms;
  }

  if (update.delta_info_time_ms) {
    dbUpdate.info_time_ms = data.info_time_ms + update.delta_info_time_ms;
  }

  if (update.delta_video_time_ms) {
    dbUpdate.video_time_ms = data.video_time_ms + update.delta_video_time_ms;
  }

  // A user can't ever "un-open" or "un-play" the video
  if (update.video_opened) {
    dbUpdate.video_opened = true;
  }

  if (update.video_played) {
    dbUpdate.video_played = true;
  }

  const result = await data.update(dbUpdate).catch(_err => null);
  return result;
}
