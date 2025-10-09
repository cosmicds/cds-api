import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { Story } from "./story";

export enum ExperienceRating {
  VeryBad = "very_bad",
  Poor = "poor",
  Good = "good",
  Excellent = "excellent",
}

export class UserExperienceRating extends Model<InferAttributes<UserExperienceRating>, InferCreationAttributes<UserExperienceRating>> {
  declare id: CreationOptional<number>;
  declare story_name: string;
  declare rating: CreationOptional<ExperienceRating>;
  declare uuid: string;
  declare comments: CreationOptional<string>;
  declare question: string;
}

export function initializeUserExperienceRatingModel(sequelize: Sequelize) {
  UserExperienceRating.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      unique: true
    },
    story_name: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Story,
        key: "name",
      }
    },
    rating: {
      type: DataTypes.ENUM(ExperienceRating.VeryBad, ExperienceRating.Poor, ExperienceRating.Good, ExperienceRating.Excellent),
      allowNull: true,
    },
    uuid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    sequelize,
    indexes: [
      {
        fields: ["story_name"],
      },
      {
        fields: ["story_name", "uuid"],
      }
    ]
  });
}
