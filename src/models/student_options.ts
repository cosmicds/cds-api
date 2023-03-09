import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { Student } from "./student";

export class StudentOptions extends Model<InferAttributes<StudentOptions>, InferCreationAttributes<StudentOptions>> {
  declare student_id: number;
  declare speech_autoread: CreationOptional<number>;
  declare speech_rate: CreationOptional<number>;
  declare speech_pitch: CreationOptional<number>;
}

const STUDENT_OPTIONS = ["speech_autoread", "speech_rate", "speech_pitch"] as const;
export type StudentOption = (typeof STUDENT_OPTIONS)[number];

export function isStudentOption(o: any): o is StudentOption {
  return typeof o === "string" && ([...STUDENT_OPTIONS] as string[]).includes(o);
}

export function initializeStudentOptionsModel(sequelize: Sequelize) {
  StudentOptions.init({
    student_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Student,
        key: "id"
      }
    },
    speech_autoread: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    speech_rate: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 1
    },
    speech_pitch: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    engine: "InnoDB"
  });
}
