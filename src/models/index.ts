import { APIKeyRole, initializeAPIKeyRoleModel } from "./api_key_role";
import { Class, initializeClassModel } from "./class";
import { DashboardClassGroup, initializeDashboardClassGroupModel } from "./dashboard_class_group";
import { DummyClass, initializeDummyClassModel } from "./dummy_class";
import { Educator, initializeEducatorModel } from "./educator";
import { IgnoreClass, initializeIgnoreClassModel } from "./ignore_class";
import { IgnoreStudent, initializeIgnoreStudentModel } from "./ignore_student";
import { ClassStories, initializeClassStoryModel } from "./story_class";
import { CosmicDSSession, initializeSessionModel } from "./session";
import { Permission, initializePermissionModel } from "./permission";
import { Question, initializeQuestionModel } from "./question";
import { Role, initializeRoleModel } from "./role";
import { RolePermission, initializeRolePermissionModel } from "./role_permission";
import { Stage, initializeStageModel } from "./stage";
import { StageState, initializeStageStateModel } from "./stage_state";
import { Story, initializeStoryModel } from "./story";
import { StoryState, initializeStoryStateModel } from "./story_state";
import { StoryVisitInfo, initializeStoryVisitInfoModel } from "./story_visit";
import { StudentsClasses, initializeStudentClassModel } from "./student_class";
import { Student, initializeStudentModel } from "./student";
import { Sequelize } from "sequelize/types";
import { initializeStudentOptionsModel } from "./student_options";
import { initializeAPIKeyModel } from "./api_key";
import { initializeUserExperienceRatingModel } from "./user_experience";

export {
  APIKeyRole,
  Class,
  ClassStories,
  CosmicDSSession,
  DashboardClassGroup,
  DummyClass,
  Educator,
  IgnoreClass,
  IgnoreStudent,
  Permission,
  Question,
  Role,
  RolePermission,
  Stage,
  StageState,
  Story,
  StoryState,
  StoryVisitInfo,
  Student,
  StudentsClasses,
};
export function initializeModels(db: Sequelize) {
  initializeAPIKeyModel(db);
  initializeRoleModel(db);
  initializePermissionModel(db);
  initializeRolePermissionModel(db);
  initializeAPIKeyRoleModel(db);
  initializeSessionModel(db);
  initializeEducatorModel(db);
  initializeClassModel(db);
  initializeStudentModel(db);
  initializeStoryModel(db);
  initializeClassStoryModel(db);
  initializeDummyClassModel(db);
  initializeStageModel(db);
  initializeStageStateModel(db);
  initializeStoryStateModel(db);
  initializeStudentClassModel(db);
  initializeStudentOptionsModel(db);
  initializeIgnoreClassModel(db);
  initializeIgnoreStudentModel(db);
  initializeQuestionModel(db);
  initializeDashboardClassGroupModel(db);
  initializeStoryVisitInfoModel(db);
  initializeUserExperienceRatingModel(db);
}
