export enum SubmitHubbleMeasurementResult {
  BadRequest = "bad_request",
  MeasurementCreated = "measurement_created",
  MeasurementUpdated = "measurement_updated",
  NoSuchStudent = "no_such_student",
  NoSuchGalaxy = "no_such_galaxy",
}

export namespace SubmitHubbleMeasurementResult {
  export function success(result: SubmitHubbleMeasurementResult): boolean {
    return result === SubmitHubbleMeasurementResult.MeasurementCreated ||
      result == SubmitHubbleMeasurementResult.MeasurementUpdated;
  }

  export function statusCode(result: SubmitHubbleMeasurementResult): number {
    switch (result) {
      case SubmitHubbleMeasurementResult.BadRequest:
        return 400;
      case SubmitHubbleMeasurementResult.MeasurementCreated:
      case SubmitHubbleMeasurementResult.MeasurementUpdated:
        return 200;
      case SubmitHubbleMeasurementResult.NoSuchStudent:
      case SubmitHubbleMeasurementResult.NoSuchGalaxy:
        return 422;
    }
  }
}

export enum RemoveHubbleMeasurementResult {
  MeasurementDeleted = "measurement_deleted",
  NoSuchMeasurement = "no_such_measurement",
}

export namespace RemoveHubbleMeasurementResult {
  export function success(result: RemoveHubbleMeasurementResult): boolean {
    return result === RemoveHubbleMeasurementResult.MeasurementDeleted;
  }

  export function statusCode(result: RemoveHubbleMeasurementResult): number {
    switch (result) {
      case RemoveHubbleMeasurementResult.NoSuchMeasurement:
        return 400;
      case RemoveHubbleMeasurementResult.MeasurementDeleted:
        return 200;
    }
  }
}
