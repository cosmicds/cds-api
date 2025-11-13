import * as S from "@effect/schema/Schema";

import { logger } from "../../logger";
import { OptionalInt, OptionalIntArray, OptionalString, OptionalStringArray } from "../../utils";

export const SeasonsEntry = S.struct({
  user_uuid: S.string,
  user_selected_dates: OptionalIntArray,
  user_selected_dates_count: OptionalInt,
  user_selected_locations: OptionalStringArray,
  user_selected_locations_count: OptionalInt,
  response: OptionalString,
});

export type SeasonsEntryT = S.Schema.To<typeof SeasonsEntry>;
