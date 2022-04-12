import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { Student } from "./student";

export class StoryState extends Model<InferAttributes<StoryState>, InferCreationAttributes<StoryState>> {
  declare student_id: CreationOptional<number>;
  declare story_name: string;
  declare story_state: JSON;
}

export function initializeStoryStateModel(sequelize: Sequelize) {
    StoryState.init({
      student_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: Student,
          key: "id"
        }
      },
      story_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      story_state: {
        type: DataTypes.JSON,
        allowNull: false
      }
  }, {
    sequelize,
    engine: "InnoDB"
  });
}
