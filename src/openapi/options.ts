import type { SecurityScheme, Tag } from "swagger-jsdoc";

export const COSMICDS_HOST = "https://api.cosmicds.cfa.harvard.edu";

export const COSMICDS_OPENAPI_VERSION = "3.1.0";

export const COSMICDS_OPENAPI_TAGS: Tag[] = [
  {
    name: "students",
    description: "Operations relating to student management",
  },
  {
    name: "educators",
    description: "Operations relating to educator management",
  },
  {
    name: "classes",
    description: "Operations relating to class management",
  },
  {
    name: "stories",
    description: "Operations related to managing data stories",
  },
  {
    name: "questions",
    description: "Operations related to managing questions",
  },
];

export const COSMICDS_OPENAPI_APIKEY_SCHEME: SecurityScheme = {
  type: "apiKey",
  in: "header",
  name: "Authorization",
};
