import { Class, initializeClassModel } from "./class";
import { DummyClass, initializeDummyClassModel } from "./dummy_class";
import { Educator, initializeEducatorModel } from "./educator";
import { ClassStories, initializeClassStoryModel } from "./story_class";
import { CosmicDSSession, initializeSessionModel } from "./session";
import { StoryState, initializeStoryStateModel } from "./story_state";
import { Story, initializeStoryModel } from "./story";
import { StudentsClasses, initializeStudentClassModel } from "./student_class";
import { Student, initializeStudentModel } from "./student";
import { Sequelize } from "sequelize/types";

export {
  Class,
  ClassStories,
  CosmicDSSession,
  DummyClass,
  Educator,
  Story,
  StoryState,
  Student,
  StudentsClasses,
};

export function initializeModels(db: Sequelize) {
  initializeClassModel(db);
  initializeClassStoryModel(db);
  initializeSessionModel(db);
  initializeDummyClassModel(db);
  initializeEducatorModel(db);
  initializeStoryModel(db);
  initializeStoryStateModel(db);
  initializeStudentModel(db);
  initializeStudentClassModel(db);
}
