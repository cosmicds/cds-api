import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

export class SolarEclipse2024Data extends Model<InferAttributes<SolarEclipse2024Data>, InferCreationAttributes<SolarEclipse2024Data>> {
  declare id: CreationOptional<number>;
  declare user_uuid: string;
  declare selected_locations: [number, number][];
  declare selected_locations_count: number;
  declare cloud_cover_selected_locations: [number, number][];
  declare cloud_cover_selected_locations_count: number;
  declare info_time_ms: CreationOptional<number>;
  declare app_time_ms: CreationOptional<number>;
  declare timestamp: CreationOptional<Date>;
}

export function initializeSolarEclipse2024DataModel(sequelize: Sequelize) {
  SolarEclipse2024Data.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_uuid: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    selected_locations: {
      type: DataTypes.JSON,
      allowNull: false
    },
    selected_locations_count: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cloud_cover_selected_locations: {
      type: DataTypes.JSON,
      allowNull: false
    },
    cloud_cover_selected_locations_count: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    info_time_ms: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    app_time_ms: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    }
  }, {
    sequelize,
    engine: "InnoDB",
  });
}
