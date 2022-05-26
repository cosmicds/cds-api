import { Class, initializeClassModel } from "./class";
import { Educator, initializeEducatorModel } from "./educator";
import { ClassStories, initializeClassStoryModel } from "./story_class";
import { CosmicDSSession, initializeSessionModel } from "./session";
import { StoryState, initializeStoryStateModel } from "./story_state";
import { Story, initializeStoryModel } from "./story";
import { StudentsClasses, initializeStudentClassModel } from "./student_class";
import { Student, initializeStudentModel } from "./student";
import { Sequelize } from "sequelize/types";

export {
  CosmicDSSession,
  Class,
  Educator,
  ClassStories,
  StoryState,
  Story,
  StudentsClasses,
  Student
};

export function initializeModels(db: Sequelize) {
  initializeSessionModel(db);
  initializeEducatorModel(db);
  initializeStudentModel(db);
  initializeClassModel(db);
  initializeStoryModel(db);
  initializeStudentClassModel(db);
  initializeStoryStateModel(db);
  initializeClassStoryModel(db);
}
