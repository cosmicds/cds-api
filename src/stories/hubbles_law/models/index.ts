import { Galaxy, initializeGalaxyModel } from "./galaxy";
import { HubbleMeasurement, initializeHubbleMeasurementModel } from "./hubble_measurement";
import { SampleHubbleMeasurement, initializeSampleHubbleMeasurementModel } from "./sample_measurement";
import { AsyncMergedHubbleStudentClasses, initializeAsyncMergedHubbleStudentClassesModel } from "./async_merged_student_classes";
import { SyncMergedHubbleClasses, initializeSyncMergedHubbleClassesModel } from "./sync_merged_classes";
import { Sequelize } from "sequelize";
import { initializeHubbleStudentDataModel } from "./hubble_student_data";
import { initializeHubbleClassDataModel } from "./hubble_class_data";
import { initializeHubbleClassMergeGroupModel } from "./hubble_class_merge_group";
import { initializeHubbleWaitingRoomOverrideModel, HubbleWaitingRoomOverride } from "./hubble_waiting_room_override";

export {
  Galaxy,
  HubbleMeasurement,
  SampleHubbleMeasurement,
  AsyncMergedHubbleStudentClasses,
  SyncMergedHubbleClasses,
  HubbleWaitingRoomOverride
};

export function initializeModels(db: Sequelize) {
  initializeGalaxyModel(db);
  initializeHubbleMeasurementModel(db);
  initializeSampleHubbleMeasurementModel(db);
  initializeAsyncMergedHubbleStudentClassesModel(db);
  initializeSyncMergedHubbleClassesModel(db);
  initializeHubbleStudentDataModel(db);
  initializeHubbleClassDataModel(db);
  initializeHubbleClassMergeGroupModel(db);
  initializeHubbleWaitingRoomOverrideModel(db);
}
