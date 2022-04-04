import { Educator } from './educator';
import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

export class Class extends Model<InferAttributes<Class>, InferCreationAttributes<Class>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare educator_id: number;
  declare created: CreationOptional<Date>;
  declare active: CreationOptional<number>;
  declare code: string;
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
        key: 'id'
      }
    },
    created: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    },
    active: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    engine: 'InnoDB'
  });
}
