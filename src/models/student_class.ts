import { Sequelize, DataTypes, Model, CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { Class } from "./class";
import { Student } from "./student";

export class StudentsClasses extends Model<InferAttributes<StudentsClasses>, InferCreationAttributes<StudentsClasses>> {
  declare student_id: number;
  declare class_id: number;
  declare joined: CreationOptional<Date>;
}

export function initializeStudentClassModel(sequelize: Sequelize) {
  StudentsClasses.init({
    student_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Student,
        key: "id"
      }
    },
    class_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Class,
        key: "id"
      }
    },
    joined: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    },
  }, {
    sequelize,
    freezeTableName: true,
    indexes: [
      {
        fields: ["class_id"],
      },
    ]
  });
}
