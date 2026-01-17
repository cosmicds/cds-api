import { Class, Student, StudentsClasses } from "../../models";
import { Galaxy, HubbleMeasurement, SampleHubbleMeasurement, SyncMergedHubbleClasses } from "./models";
import { AsyncMergedHubbleStudentClasses } from "./models/async_merged_student_classes";
import { HubbleClassData } from "./models/hubble_class_data";
import { HubbleClassStudentMerge } from "./models/hubble_class_student_merges";
import { HubbleStudentData } from "./models/hubble_student_data";

export function setUpHubbleAssociations() {

  HubbleMeasurement.belongsTo(Student, {
    as: "student",
    targetKey: "id",
    foreignKey: "student_id",
  });
  SampleHubbleMeasurement.belongsTo(Student, {
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
  Galaxy.hasMany(SampleHubbleMeasurement, {
    foreignKey: "galaxy_id"
  });
  SampleHubbleMeasurement.belongsTo(Galaxy, {
    as: "galaxy",
    targetKey: "id",
    foreignKey: "galaxy_id"
  });

  StudentsClasses.hasMany(HubbleMeasurement, {
    foreignKey: "student_id",
  });
  HubbleMeasurement.belongsTo(StudentsClasses, {
    as: "measurement",
    targetKey: "student_id",
    foreignKey: "student_id",
  });

  StudentsClasses.hasMany(SampleHubbleMeasurement, {
    foreignKey: "student_id",
  });
  SampleHubbleMeasurement.belongsTo(StudentsClasses, {
    as: "measurement",
    targetKey: "student_id",
    foreignKey: "student_id",
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

  HubbleClassData.belongsTo(StudentsClasses, {
    as: "class_data",
    targetKey: "class_id",
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
