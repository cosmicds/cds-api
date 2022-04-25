import { Student } from "./models/student";
import { Class } from "./models/class";
import { Story } from "./models/story";
import { StudentsClasses } from "./models/student_class";
import { ClassStories } from "./models/story_class";
import { StoryState } from "./models/story_state";

export function setUpAssociations() {

  Student.belongsToMany(Class, {
    through: StudentsClasses,
    sourceKey: "id",
    targetKey: "id",
    foreignKey: "student_id",
    otherKey: "class_id",
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  });

  Story.belongsToMany(Class, {
    through: ClassStories,
    sourceKey: "name",
    targetKey: "id",
    foreignKey: "story_name",
    otherKey: "class_id",
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  });

  Story.belongsToMany(Student, {
    through: StoryState,
    sourceKey: "name",
    targetKey: "id",
    foreignKey: "story_name",
    otherKey: "student_id",
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  });

}
