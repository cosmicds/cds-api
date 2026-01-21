import { Galaxy, initializeGalaxyModel } from "./galaxy";
import { HubbleMeasurement, initializeHubbleMeasurementModel } from "./hubble_measurement";
import { SampleHubbleMeasurement, initializeSampleHubbleMeasurementModel } from "./sample_measurement";
import { AsyncMergedHubbleStudentClasses, initializeAsyncMergedHubbleStudentClassesModel } from "./async_merged_student_classes";
import { SyncMergedHubbleClasses, initializeSyncMergedHubbleClassesModel } from "./sync_merged_classes";
import { Sequelize } from "sequelize";
import { HubbleStudentData, initializeHubbleStudentDataModel } from "./hubble_student_data";
import { HubbleClassData, initializeHubbleClassDataModel } from "./hubble_class_data";
import { HubbleClassMergeGroup, initializeHubbleClassMergeGroupModel } from "./hubble_class_merge_group";
import { HubbleWaitingRoomOverride, initializeHubbleWaitingRoomOverrideModel } from "./hubble_waiting_room_override";
import { HubbleClassStudentMerge, initialHubbleClassStudentMergeModel } from "./hubble_class_student_merges";

export {
  Galaxy,
  HubbleMeasurement,
  SampleHubbleMeasurement,
  AsyncMergedHubbleStudentClasses,
  SyncMergedHubbleClasses,
  HubbleWaitingRoomOverride,
  HubbleStudentData,
  HubbleClassData,
  HubbleClassMergeGroup,
  HubbleClassStudentMerge,
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
  initialHubbleClassStudentMergeModel(db);
}
