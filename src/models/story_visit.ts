import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { Story } from "./story";

export class StoryVisitInfo extends Model<InferAttributes<StoryVisitInfo>, InferCreationAttributes<StoryVisitInfo>> {
  declare id: CreationOptional<number>;
  declare story_name: string;
  declare info: JSON;
  declare timestamp: CreationOptional<Date>;
}

export function initializeStoryVisitInfoModel(sequelize: Sequelize) {
  StoryVisitInfo.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
    story_name: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Story,
        key: "name",
      }
    },
    info: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    }
  }, {
    sequelize,
  });
}
