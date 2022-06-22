import { Class, Student } from "../../models";
import { SyncMergedHubbleClasses } from "./models";
import { AsyncMergedHubbleStudentClasses } from "./models/async_merged_student_classes"

export function setUpHubbleAssociations() {

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
