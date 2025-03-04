import { Educator } from "./educator";
import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

export class Class extends Model<InferAttributes<Class>, InferCreationAttributes<Class>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare educator_id: number;
  declare created: CreationOptional<Date>;
  declare updated: CreationOptional<Date>;
  declare active: CreationOptional<boolean>;
  declare code: string;
  declare asynchronous: CreationOptional<boolean>;
  declare test: CreationOptional<boolean>;
  declare expected_size: CreationOptional<number>;
  declare small_class: CreationOptional<boolean>;
}

export function initializeClassModel(sequelize: Sequelize) {
  Class.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    educator_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Educator,
        key: "id"
      }
    },
    created: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    },
    updated: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    asynchronous: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    test: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    expected_size: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    small_class: {
      type: DataTypes.VIRTUAL,
      // type: "tinyint(1) GENERATED ALWAYS AS (expected_size < 15) VIRTUAL",
      get() {
        return this.expected_size < 15; 
      }
    },
  }, {
    sequelize,
    indexes: [
      {
        fields: ["code"],
      }
    ]
  });
}
