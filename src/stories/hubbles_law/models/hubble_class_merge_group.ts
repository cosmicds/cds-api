import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes } from "sequelize";
import { Class } from "../../../models";

export class HubbleClassMergeGroup extends Model<InferAttributes<HubbleClassMergeGroup>, InferCreationAttributes<HubbleClassMergeGroup>> {
  declare group_id: number;
  declare class_id: number;
  declare merge_order: number;
}

export function initializeHubbleClassMergeGroupModel(sequelize: Sequelize) {
  HubbleClassMergeGroup.init({
    group_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
    class_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
      primaryKey: true,
      references: {
        model: Class,
        key: "id",
      }
    },
    merge_order: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    }
  }, {
    sequelize,
    indexes: [
      {
        fields: ["group_id"],
      },
      {
        fields: ["class_id"],
      },
    ]
  });
}
