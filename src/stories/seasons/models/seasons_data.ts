import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

export class SeasonsData extends Model<InferAttributes<SeasonsData>, InferCreationAttributes<SeasonsData>> {
  declare id: CreationOptional<number>;
  declare user_uuid: string;
  declare user_selected_dates: CreationOptional<string[]>;
  declare user_selected_dates_count: CreationOptional<number>;
  declare user_selected_locations: CreationOptional<string[]>;
  declare user_selected_locations_count: CreationOptional<number>;
  declare aha_moment_response: CreationOptional<string>;
  declare last_updated: CreationOptional<Date>;
  declare play_clicked_count: CreationOptional<number>;
  declare time_slider_used_count: CreationOptional<number>;
  declare events: CreationOptional<string[]>;
}

export function initializeSeasonsDataModel(sequelize: Sequelize) {
  SeasonsData.init({
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
    user_selected_dates: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    user_selected_dates_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
    },
    user_selected_locations: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    user_selected_locations_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
    },
    aha_moment_response: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    play_clicked_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      allowNull: false,
    },
    time_slider_used_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      allowNull: false,
    },
    events: {
      type: DataTypes.JSON,
      defaultValue: [],
      allowNull: false,
    },
    last_updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  }, {
    sequelize,
  });
}
