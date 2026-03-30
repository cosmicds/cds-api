import { Schemas, schemas as baseSchemas } from "../../openapi/schemas";
import { modelToSchema } from "../../openapi/utils";
import { Galaxy } from "./models";

const measurementInput = {
  type: "object",
  required: ["student_id"],
  properties: {
    student_id: { type: "integer" },
    galaxy_id: { type: "integer" },
    galaxy_name: { type: "string" },
    rest_wave_value: { type: "number" },
    rest_wave_unit: { type: "string" },
    obs_wave_value: { type: "number" },
    obs_wave_unit: { type: "string" },
    velocity_value: { type: "number" },
    velocity_unit: { type: "string" },
    ang_size_value: { type: "number" },
    ang_size_unit: { type: "string" },
    est_dist_value: { type: "number" },
    est_dist_unit: { type: "string" },
    brightness: { type: "number" },
  }
};

const measurement = {
  ...measurementInput,
  required: ["student_id", "galaxy_id"],
};

const sampleMeasurementInput = {
  ...measurementInput,
  properties: {
    ...measurementInput.properties, 
    measurement_number: { 
      type: "string", 
      // enum: ["first", "second"],
    },
  },
};

const sampleMeasurement = {
  ...sampleMeasurementInput,
  required: ["student_id", "galaxy_id"],
};

export function schemas(): Schemas {
  return {
    ...baseSchemas(),
    Galaxy: modelToSchema(Galaxy),
    HubbleMeasurementInput: measurementInput,
    HubbleMeasurement: measurement,
    HubbleSampleMeasurementInput: sampleMeasurementInput,
    HubbleSampleMeasurement: sampleMeasurement,
  };
}
