import * as S from "@effect/schema/Schema";

import { SeasonsData } from "./models";
import { logger } from "../../logger";
import { OptionalInt, OptionalNumberArray, OptionalNumberPair, OptionalNumberPairArray, OptionalStringArray, StringArray, UpdateAttributes, arrayType } from "../../utils";
import { CreationAttributes } from "sequelize";

type SeasonsDataUpdateAttributes = UpdateAttributes<SeasonsData>;

export const SeasonsUpdate = S.struct({
  app_time_ms: OptionalInt,
  user_selected_dates: OptionalStringArray,
  user_selected_dates_count: OptionalInt,
  user_selected_locations: OptionalNumberPairArray,
  user_selected_locations_count: OptionalInt,
  wwt_start_stop_times: OptionalNumberPair,
  wwt_time_reset_count: OptionalInt,
  wwt_reverse_count: OptionalInt,
  wwt_play_pause_count: OptionalInt,
  wwt_speedups: OptionalNumberArray,
  wwt_slowdowns: OptionalNumberArray,
  time_slider_used_count: OptionalInt,
  aha_moment_response: S.optional(S.union(S.string, StringArray)),
  events: OptionalStringArray,
});

export const SeasonsEntry = S.extend(SeasonsUpdate, S.struct({ user_uuid: S.string }));

export type SeasonsUpdateT = S.Schema.To<typeof SeasonsUpdate>;
export type SeasonsEntryT = S.Schema.To<typeof SeasonsEntry>;

export async function submitSeasonsData(data: SeasonsEntryT): Promise<SeasonsData | null> {
  logger.verbose(`Attempting to submit Seasons data for user ${data.user_uuid}`);

  const startStopTimes = data.wwt_start_stop_times ? [data.wwt_start_stop_times] : [];
  const dataWithCounts: CreationAttributes<SeasonsData> = {
    ...data,
    wwt_start_stop_times: startStopTimes,
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

  const responses = typeof update.aha_moment_response === "string" ? [update.aha_moment_response] : update.aha_moment_response;

  if (data === null) {
    const startStopTimes = update.wwt_start_stop_times ? [update.wwt_start_stop_times] : [];
    const creationData: CreationAttributes<SeasonsData> = {
      user_uuid: userUUID,
      app_time_ms: update.app_time_ms ?? 0,
      user_selected_dates: update.user_selected_dates ?? [],
      user_selected_dates_count: update.user_selected_dates?.length ?? 0,
      user_selected_locations: update.user_selected_locations ?? [],
      user_selected_locations_count: update.user_selected_locations?.length ?? 0,
      time_slider_used_count: update.time_slider_used_count ?? 0,
      wwt_play_pause_count: update.wwt_play_pause_count ?? 0,
      wwt_time_reset_count: update.wwt_time_reset_count ?? 0,
      wwt_reverse_count: update.wwt_reverse_count ?? 0,
      wwt_speedups: update.wwt_speedups ?? [],
      wwt_slowdowns: update.wwt_slowdowns ?? [],
      wwt_start_stop_times: startStopTimes,
    };
    if (responses) {
      creationData.aha_moment_responses = responses;
    }
    return SeasonsData.create(creationData);
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

  // For the time delta, it's fine to skip the update logic whether 
  // they're null/undefined (nothing to report) or zero (no change)
  if (update.app_time_ms) {
    dbUpdate.app_time_ms = data.app_time_ms + update.app_time_ms;
  }
  //
  // See comment above about skipping the update logic
  // if deltas are either null/undefined or zero
  const numberEntryKeys = [
    "time_slider_used_count",
    "wwt_play_pause_count",
    "wwt_time_reset_count",
    "wwt_reverse_count",
  ] as const;
  for (const key of numberEntryKeys) {
    const updateKey = key as keyof SeasonsUpdateT;
    const updateValue = update[updateKey] as number;
    if (updateValue) {
      const currentValue = data[key] as number;
      dbUpdate[key] = currentValue + updateValue;
    }
  }

  if (responses) {
    dbUpdate.aha_moment_responses = data.aha_moment_responses.concat(responses);
  }

  if (update.wwt_speedups) {
    dbUpdate.wwt_speedups = data.wwt_speedups.concat(update.wwt_speedups);
  }

  if (update.wwt_slowdowns) {
    dbUpdate.wwt_slowdowns = data.wwt_slowdowns.concat(update.wwt_slowdowns);
  }

  if (update.wwt_start_stop_times) {
    dbUpdate.wwt_start_stop_times = data.wwt_start_stop_times.concat([update.wwt_start_stop_times]);
  }

  return data.update(dbUpdate).catch(_err => null);
}
