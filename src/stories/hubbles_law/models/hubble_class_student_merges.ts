import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes } from "sequelize";
import { Class, Student } from "../../../models";

export class HubbleClassStudentMerge extends Model<InferAttributes<HubbleClassStudentMerge>, InferCreationAttributes<HubbleClassStudentMerge>> {
  declare student_id: number;
  declare class_id: number;
}

export function initialHubbleClassStudentMergeModel(sequelize: Sequelize) {
  HubbleClassStudentMerge.init({
    student_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Student,
        key: "id",
      }
    },
    class_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Class,
        key: "id",
      }
    },
  }, {
    sequelize,
    indexes: [
      {
        fields: ["student_id"],
      },
      {
        fields: ["class_id"],
      },
    ]
  });
}
