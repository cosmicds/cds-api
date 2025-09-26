import * as S from "@effect/schema/Schema";
import * as Either from "effect/Either";

import type { GenericRequest, GenericResponse } from "./utils";
import { ExperienceRating } from "./models/user_experience";
import { addExperienceInfoForStory } from "./database";

export async function handleUserExperienceSubmission(req: GenericRequest, res: GenericResponse) {
  const schema = S.struct({
    story_name: S.string,
    comments: S.optional(S.string),
    uuid: S.string,
    question: S.string,
    rating: S.optional(S.enums(ExperienceRating)),
  });
  const body = req.body;
  const maybe = S.decodeUnknownEither(schema)(body);
  if (Either.isLeft(maybe)) {
    res.status(400).json({
      success: false,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error The generated schema has a properties field
      error: `Invalid request body; should have the following schema: ${JSON.stringify(JSONSchema.make(schema).properties)}`,
    });
    return;
  }

  const data = maybe.right;
  const experienceInfo = await addExperienceInfoForStory(data);
  if (experienceInfo !== null) {
    res.json({
      success: true,
    });
  } else {
    res.status(500).json({
      success: false,
      error: "Error creating user experience info",
    });
  }
}
