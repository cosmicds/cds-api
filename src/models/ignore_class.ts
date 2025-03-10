import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes } from "sequelize";
import { Class } from "./class";
import { Story } from "./story";

export class IgnoreClass extends Model<InferAttributes<IgnoreClass>, InferCreationAttributes<IgnoreClass>> {
  declare class_id: number;
  declare story_name: string;
}

export function initializeIgnoreClassModel(sequelize: Sequelize) {
  IgnoreClass.init({
    class_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Class,
        key: "id"
      }
    },
    story_name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Story,
        key: "name"
      }
    }
  }, {
    sequelize,
  });
}
