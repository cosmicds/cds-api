export enum SubmitHubbleMeasurementResult {
  BadRequest = "bad_request",
  MeasurementCreated = "measurement_created",
  MeasurementUpdated = "measurement_updated",
  NoSuchStudent = "no_such_student"
}

export namespace SubmitHubbleMeasurementResult {
  export function success(result: SubmitHubbleMeasurementResult): boolean {
    return result === SubmitHubbleMeasurementResult.MeasurementCreated ||
      result == SubmitHubbleMeasurementResult.MeasurementUpdated;
  }
}

export enum RemoveHubbleMeasurementResult {
  BadRequest = "bad_request",
  MeasurementDeleted = "measurement_deleted",
  NoSuchMeasurement = "no_such_measurement"
}

export namespace RemoveHubbleMeasurementResult {
  export function success(result: RemoveHubbleMeasurementResult): boolean {
    return result === RemoveHubbleMeasurementResult.MeasurementDeleted;
  }

  export function statusCode(result: RemoveHubbleMeasurementResult): number {
    switch (result) {
      case RemoveHubbleMeasurementResult.BadRequest:
        return 400;
      case RemoveHubbleMeasurementResult.MeasurementDeleted:
        return 200;
      case RemoveHubbleMeasurementResult.NoSuchMeasurement:
        return 404;
    }
  }
}
