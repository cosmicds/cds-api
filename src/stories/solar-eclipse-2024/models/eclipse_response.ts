import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

export class SolarEclipse2024Response extends Model<InferAttributes<SolarEclipse2024Response>, InferCreationAttributes<SolarEclipse2024Response>> {
  declare id: CreationOptional<number>;
  declare user_uuid: string;
  declare selected_locations: [number, number][];
  declare selected_locations_count: number;
  declare cloud_cover_selected_locations: [number, number][];
  declare cloud_cover_selected_locations_count: number;
  declare timestamp: CreationOptional<Date>;
}

export function initializeSolarEclipse2024ResponseModel(sequelize: Sequelize) {
  SolarEclipse2024Response.init({
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
