import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { Story } from "./story";

export enum ExperienceRating {
  VeryBad = "very_bad",
  Poor = "poor",
  Medium = "medium",
  Good = "good",
  Excellent = "excellent",
}

export class UserExperienceRating extends Model<InferAttributes<UserExperienceRating>, InferCreationAttributes<UserExperienceRating>> {
  declare story_name: string;
  declare rating: CreationOptional<ExperienceRating>;
  declare uuid: string;
  declare comments: CreationOptional<string>;
  declare question: string;
}

export function initializeUserExperienceRatingModel(sequelize: Sequelize) {
  UserExperienceRating.init({
    story_name: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Story,
        key: "name",
      }
    },
    rating: {
      type: DataTypes.ENUM(ExperienceRating.VeryBad, ExperienceRating.Poor, ExperienceRating.Medium, ExperienceRating.Good, ExperienceRating.Excellent),
      allowNull: true,
    },
    uuid: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
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
    sequelize
  });
}
