import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { Class } from "../../../models";

export class HubbleClassData extends Model<InferAttributes<HubbleClassData>, InferCreationAttributes<HubbleClassData>> {
  declare class_id: number;
  declare hubble_fit_value: number;
  declare hubble_fit_unit: string;
  declare age_value: number;
  declare age_unit: string;
}

export function initializeHubbleClassDataModel(sequelize: Sequelize) {
  HubbleClassData.init({
    class_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Class,
        key: "id"
      }
    },
    hubble_fit_value: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    hubble_fit_unit: {
      type: DataTypes.STRING,
      allowNull: true
    },
    age_value: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    age_unit: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    engine: "InnoDB",
    freezeTableName: true
  });
}
