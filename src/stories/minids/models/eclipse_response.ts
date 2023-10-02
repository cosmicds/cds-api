import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

export class EclipseMiniResponse extends Model<InferAttributes<EclipseMiniResponse>, InferCreationAttributes<EclipseMiniResponse>> {
  declare id: CreationOptional<number>;
  declare user_uuid: string;
  declare response: string;
  declare preset_locations: JSON;
  declare preset_locations_count: number;
  declare user_selected_locations: JSON;
  declare user_selected_locations_count: number;
  declare timestamp: CreationOptional<Date>;
}

export function initialEclipseMiniModel(sequelize: Sequelize) {
  EclipseMiniResponse.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_uuid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    response: {
      type: DataTypes.CHAR,
      allowNull: false
    },
    preset_locations: {
      type: DataTypes.JSON
    },
    preset_locations_count: {
      type: DataTypes.INTEGER
    },
    user_selected_locations: {
      type: DataTypes.JSON
    },
    user_selected_locations_count: {
      type: DataTypes.INTEGER
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    }
  }, {
    sequelize,
    engine: "InnoDB"
  });
}
