import { Class } from "../../../models";
import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

export class HubbleWaitingRoomOverride extends Model<InferAttributes<HubbleWaitingRoomOverride>, InferCreationAttributes<HubbleWaitingRoomOverride>> {
  declare class_id: number;
  declare timestamp: CreationOptional<Date>;
}

export function initializeHubbleWaitingRoomOverrideModel(sequelize: Sequelize) {
  HubbleWaitingRoomOverride.init({
    class_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Class,
        key: "id",
      }
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
