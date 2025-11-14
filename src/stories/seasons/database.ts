import * as S from "@effect/schema/Schema";

import { SeasonsData } from "./models";
import { logger } from "../../logger";
import { OptionalInt, OptionalString, OptionalStringArray, UpdateAttributes } from "../../utils";
import { CreationAttributes } from "sequelize";

type SeasonsDataUpdateAttributes = UpdateAttributes<SeasonsData>;

export const BaseSeasonsEntry = S.struct({
  user_uuid: S.string,
  user_selected_dates: OptionalStringArray,
  user_selected_dates_count: OptionalInt,
  user_selected_locations: OptionalStringArray,
  user_selected_locations_count: OptionalInt,
  aha_moment_response: OptionalString,
  events: OptionalStringArray,
});

export const SeasonsEntry = S.extend(BaseSeasonsEntry, S.struct({
  play_clicked_count: OptionalInt,
  time_slider_used_count: OptionalInt,
}));

export const SeasonsUpdate = S.extend(BaseSeasonsEntry, S.struct({
  delta_play_clicked_count: OptionalInt,
  delta_time_slider_used_count: OptionalInt,
}));

export type SeasonsEntryT = S.Schema.To<typeof SeasonsEntry>;
export type SeasonsUpdateT = S.Schema.To<typeof SeasonsUpdate>;

export async function submitSeasonsData(data: SeasonsEntryT): Promise<SeasonsData | null> {
  logger.verbose(`Attempting to submit Seasons data for user ${data.user_uuid}`);

  const dataWithCounts: CreationAttributes<SeasonsData> = {
    ...data,
    user_selected_locations_count: data.user_selected_locations_count ?? (data.user_selected_locations?.length ?? 0),
    user_selected_dates_count: data.user_selected_dates_count ?? (data.user_selected_dates?.length ?? 0),
  };

  return SeasonsData.upsert(dataWithCounts).then(([item, _]) => item);
}

export async function getAllSeasonsData(): Promise<SeasonsData[]> {
  return SeasonsData.findAll();
}

export async function getSeasonsData(userUUID: string): Promise<SeasonsData | null> {
  return SeasonsData.findOne({
    where: { user_uuid: userUUID },
  });
}

export async function updateSeasonsData(userUUID: string, update: SeasonsUpdateT): Promise<SeasonsData | null> {
  const data = await SeasonsData.findOne({ where: { user_uuid: userUUID } });

  if (data === null) {
    const created = await SeasonsData.create({
      user_uuid: userUUID,
      user_selected_dates: update.user_selected_dates ?? [],
      user_selected_dates_count: update.user_selected_dates?.length ?? 0,
      user_selected_locations: update.user_selected_locations ?? [],
      user_selected_locations_count: update.user_selected_locations?.length ?? 0,
      aha_moment_response: update.aha_moment_response,
      play_clicked_count: update.delta_play_clicked_count ?? 0,
      time_slider_used_count: update.delta_time_slider_used_count ?? 0,
    });
    return created;
  }

  const dbUpdate: SeasonsDataUpdateAttributes = {
    last_updated: new Date(),
  };

  if (update.user_selected_locations) {
    const selected = data.user_selected_locations.concat(update.user_selected_locations);
    dbUpdate.user_selected_locations = selected;
    dbUpdate.user_selected_locations_count = selected.length;
  }

  if (update.user_selected_dates) {
    const selected = data.user_selected_dates.concat(update.user_selected_dates);
    dbUpdate.user_selected_dates = selected;
    dbUpdate.user_selected_dates_count = selected.length;
  }

  const numberEntryKeys = ["play_clicked_count", "time_slider_used_count"] as const;
  for (const key of numberEntryKeys) {
    const updateKey: keyof SeasonsUpdateT = `delta_${key}`;
    const updateValue = update[updateKey];
    if (updateValue) {
      dbUpdate[key] = data[key] + updateValue;
    }
  }

  if (update.aha_moment_response) {
    dbUpdate.aha_moment_response = update.aha_moment_response;
  }

  const result = await data.update(dbUpdate).catch(_err => null);
  return result;
}
