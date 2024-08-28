import { Class, initializeClassModel } from "./class";
import { DashboardClassGroup, initializeDashboardClassGroupModel } from "./dashboard_class_group";
import { DummyClass, initializeDummyClassModel } from "./dummy_class";
import { Educator, initializeEducatorModel } from "./educator";
import { IgnoreStudent, initializeIgnoreStudentModel } from "./ignore_student";
import { ClassStories, initializeClassStoryModel } from "./story_class";
import { CosmicDSSession, initializeSessionModel } from "./session";
import { Stage, initializeStageModel } from "./stage";
import { StageState, initializeStageStateModel } from "./stage_state";
import { StoryState, initializeStoryStateModel } from "./story_state";
import { Story, initializeStoryModel } from "./story";
import { StudentsClasses, initializeStudentClassModel } from "./student_class";
import { Student, initializeStudentModel } from "./student";
import { Sequelize } from "sequelize/types";
import { initializeStudentOptionsModel } from "./student_options";
import { initializeQuestionModel } from "./question";
import { initializeAPIKeyModel } from "./api_key";

export {
  Class,
  ClassStories,
  CosmicDSSession,
  DashboardClassGroup,
  DummyClass,
  Educator,
  IgnoreStudent,
  Stage,
  StageState,
  Story,
  StoryState,
  Student,
  StudentsClasses,
};
export function initializeModels(db: Sequelize) {
  initializeAPIKeyModel(db);
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
  initializeIgnoreStudentModel(db);
  initializeQuestionModel(db);
  initializeDashboardClassGroupModel(db);
}
