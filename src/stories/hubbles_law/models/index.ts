import { Galaxy, initializeGalaxyModel } from "./galaxy";
import { HubbleMeasurement, initializeHubbleMeasurementModel } from "./hubble_measurement";
import { SampleHubbleMeasurement, initializeSampleHubbleMeasurementModel } from "./sample_measurement";
import { AsyncMergedHubbleStudentClasses, initializeAsyncMergedHubbleStudentClassesModel } from "./async_merged_student_classes";
import { SyncMergedHubbleClasses, initializeSyncMergedHubbleClassesModel } from "./sync_merged_classes";
import { Sequelize } from "sequelize/types";
import { initializeHubbleStudentDataModel } from "./hubble_student_data";
import { initializeHubbleClassDataModel } from "./hubble_class_data";

export {
  Galaxy,
  HubbleMeasurement,
  SampleHubbleMeasurement,
  AsyncMergedHubbleStudentClasses,
  SyncMergedHubbleClasses
};

export function initializeModels(db: Sequelize) {
  initializeGalaxyModel(db);
  initializeHubbleMeasurementModel(db);
  initializeSampleHubbleMeasurementModel(db);
  initializeAsyncMergedHubbleStudentClassesModel(db);
  initializeSyncMergedHubbleClassesModel(db);
  initializeHubbleStudentDataModel(db);
  initializeHubbleClassDataModel(db);
}
