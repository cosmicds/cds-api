import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize/types";
import { Story } from "./story";

export class Question extends Model<InferAttributes<Question>, InferCreationAttributes<Question>> {
  declare id: CreationOptional<number>;
  declare tag: string;
  declare text: string;
  declare shorthand: string;
  declare story_name: string;
  declare version: CreationOptional<number>;
  declare created: CreationOptional<Date>;
}

export function initializeQuestionModel(sequelize: Sequelize) {
  Question.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      unique: true
    },
    tag: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shorthand: {
      type: DataTypes.STRING,
      allowNull: false
    },
    story_name: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Story,
        key: "id"
      }
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    created: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    }
  }, {
    sequelize,
    engine: "InnoDB",
    indexes: [
      {
        unique: true,
        fields: ["tag"]
      }
    ]
  });
}
