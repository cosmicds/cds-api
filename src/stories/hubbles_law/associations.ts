import { Class, Student } from "../../models";
import { HubbleMeasurement, SyncMergedHubbleClasses } from "./models";
import { AsyncMergedHubbleStudentClasses } from "./models/async_merged_student_classes";

export function setUpHubbleAssociations() {

  HubbleMeasurement.belongsTo(Student, {
    as: "student",
    targetKey: "id",
    foreignKey: "student_id",
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
