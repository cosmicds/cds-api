import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";


export class Stage extends Model<InferAttributes<Stage>, InferCreationAttributes<Stage>> {
  declare story_name: string;
  declare stage_name: string;
  declare stage_index: CreationOptional<number | null>;
}

export function initializeStageModel(sequelize: Sequelize) {
  Stage.init({
    story_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    stage_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    stage_index: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: null,
    }
  }, {
    sequelize,
    engine: "InnoDB",
  });
}
