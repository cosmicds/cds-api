import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

export class PlanetParadeData extends Model<InferAttributes<PlanetParadeData>, InferCreationAttributes<PlanetParadeData>> {
  declare id: CreationOptional<number>;
  declare user_uuid: string;
  declare user_selected_search_locations: [number, number][];
  declare user_selected_search_locations_count: number;
  declare user_selected_map_locations: [number, number][];
  declare user_selected_map_locations_count: number;
  declare app_time_ms: CreationOptional<number>;
  declare info_time_ms: CreationOptional<number>;
  declare video_time_ms: CreationOptional<number>;
  declare video_opened: CreationOptional<boolean>;
  declare video_played: CreationOptional<boolean>;
  declare last_updated: CreationOptional<Date>;
}

export function initializePlanetParadeDataModel(sequelize: Sequelize) {
  PlanetParadeData.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    user_uuid: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    user_selected_search_locations: {
      type: DataTypes.JSON,
      allowNull: false
    },
    user_selected_search_locations_count: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_selected_map_locations: {
      type: DataTypes.JSON,
      allowNull: false
    },
    user_selected_map_locations_count: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    app_time_ms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    info_time_ms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    video_time_ms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    video_opened: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    video_played: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    last_updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    }
  }, {
    sequelize,
  });
}
