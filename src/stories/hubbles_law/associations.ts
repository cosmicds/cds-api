import { Class, Student } from "../../models";
import { Galaxy, HubbleMeasurement, SyncMergedHubbleClasses } from "./models";
import { AsyncMergedHubbleStudentClasses } from "./models/async_merged_student_classes";
import { HubbleClassData } from "./models/hubble_class_data";
import { HubbleStudentData } from "./models/hubble_student_data";

export function setUpHubbleAssociations() {

  HubbleMeasurement.belongsTo(Student, {
    as: "student",
    targetKey: "id",
    foreignKey: "student_id",
  });

  Galaxy.hasMany(HubbleMeasurement, {
    foreignKey: "galaxy_id"
  });
  HubbleMeasurement.belongsTo(Galaxy, {
    as: "galaxy",
    targetKey: "id",
    foreignKey: "galaxy_id"
  });

  HubbleStudentData.belongsTo(Student, {
    as: "student",
    targetKey: "id",
    foreignKey: "student_id"
  });

  HubbleClassData.belongsTo(Class, {
    as: "class",
    targetKey: "id",
    foreignKey: "class_id"
  });

  AsyncMergedHubbleStudentClasses.belongsTo(Student, {
    as: "student",
    targetKey: "id",
    foreignKey: "student_id"
  });

  AsyncMergedHubbleStudentClasses.belongsTo(Class, {
    as: "class",
    targetKey: "id",
    foreignKey: "class_id"
  });

  SyncMergedHubbleClasses.belongsTo(Class, {
    as: "class",
    targetKey: "id",
    foreignKey: "class_id"
  });

}
