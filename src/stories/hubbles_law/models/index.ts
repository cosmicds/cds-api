import { Galaxy, initializeGalaxyModel } from "./galaxy";
import { HubbleMeasurement, initializeHubbleMeasurementModel } from "./hubble_measurement";
import { AsyncMergedHubbleStudentClasses, initializeAsyncMergedHubbleStudentClassesModel } from "./async_merged_student_classes";
import { SyncMergedHubbleClasses, initializeSyncMergedHubbleClassesModel } from "./sync_merged_classes";
import { Sequelize } from "sequelize/types";

export {
  Galaxy,
  HubbleMeasurement,
  AsyncMergedHubbleStudentClasses,
  SyncMergedHubbleClasses
};

export function initializeModels(db: Sequelize) {
  initializeGalaxyModel(db);
  initializeHubbleMeasurementModel(db);
  initializeAsyncMergedHubbleStudentClassesModel(db);
  initializeSyncMergedHubbleClassesModel(db);
}
