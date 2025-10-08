import { 
    APIKeyRole,
  Class,
  ClassStories,
  IgnoreClass,
  IgnoreStudent,
  Permission,
  Role,
  RolePermission,
  Story,
  StoryState,
  Student,
  StudentsClasses,
} from "./models";
import { APIKey } from "./models/api_key";

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
  Class.belongsToMany(Student, {
    through: StudentsClasses,
    sourceKey: "id",
    targetKey: "id",
    foreignKey: "class_id",
    otherKey: "student_id",
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

  Student.hasMany(StoryState, {
    foreignKey: "student_id"
  });
  StoryState.belongsTo(Student, {
    as: "student",
    targetKey: "id",
    foreignKey: "student_id"
  });

  Story.hasMany(StoryState, {
    foreignKey: "story_name"
  });
  StoryState.belongsTo(Story, {
    as: "story",
    targetKey: "name",
    foreignKey: "story_name"
  });

  Student.hasMany(IgnoreStudent, {
    foreignKey: "student_id"
  });
  IgnoreStudent.belongsTo(Student, {
    as: "student",
    targetKey: "id",
    foreignKey: "student_id"
  });

  Class.hasMany(IgnoreClass, {
    foreignKey: "class_id"
  });
  IgnoreClass.belongsTo(Class, {
    as: "class",
    targetKey: "id",
    foreignKey: "class_id"
  });

  Story.hasMany(IgnoreStudent, {
    foreignKey: "story_name"
  });
  IgnoreStudent.belongsTo(Story, {
    as: "story",
    targetKey: "name",
    foreignKey: "story_name"
  });

  Story.hasMany(IgnoreClass, {
    foreignKey: "story_name"
  });
  IgnoreClass.belongsTo(Story, {
    as: "story",
    targetKey: "name",
    foreignKey: "story_name"
  });
  
  Story.hasMany(ClassStories, {
    foreignKey: "story_name"
  });
  ClassStories.belongsTo(Story, {
    as: "story",
    targetKey: "name",
    foreignKey: "story_name"
  });

  Class.hasMany(ClassStories, {
    foreignKey: "class_id"
  });
  ClassStories.belongsTo(Class, {
    as: "class",
    targetKey: "id",
    foreignKey: "class_id"
  });

  Student.hasMany(StudentsClasses, {
    foreignKey: "student_id",
  });
  StudentsClasses.belongsTo(Student, {
    as: "student",
    targetKey: "id",
    foreignKey: "student_id",
  });

  Class.hasMany(StudentsClasses, {
    foreignKey: "class_id"
  });
  StudentsClasses.belongsTo(Class, {
    as: "class",
    targetKey: "id",
    foreignKey: "class_id"
  });

  Permission.hasMany(RolePermission, {
    foreignKey: "permission_id",
  });
  RolePermission.belongsTo(Permission, {
    as: "permission",
    targetKey: "id",
    foreignKey: "permission_id",
  });

  Role.hasMany(RolePermission, {
    foreignKey: "role_id",
  });
  RolePermission.belongsTo(Role, {
    as: "role_permission",
    targetKey: "id",
    foreignKey: "role_id",
  });

  Permission.belongsToMany(Role, {
    through: RolePermission,
    sourceKey: "id",
    targetKey: "id",
    foreignKey: "permission_id",
    otherKey: "role_id",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  APIKey.hasMany(APIKeyRole, {
    foreignKey: "api_key_id",
  });

  Role.belongsToMany(APIKey, {
    through: APIKeyRole,
    sourceKey: "id",
    targetKey: "id",
    foreignKey: "role_id",
    otherKey: "api_key_id",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  APIKey.belongsToMany(Role, {
    through: APIKeyRole,
    sourceKey: "id",
    targetKey: "id",
    foreignKey: "api_key_id",
    otherKey: "role_id",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

}
