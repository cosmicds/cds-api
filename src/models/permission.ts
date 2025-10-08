import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

export class Permission extends Model<InferAttributes<Permission>, InferCreationAttributes<Permission>> {
  declare id: CreationOptional<number>;
  declare action: string;
  declare resource_pattern: string;
  declare name: CreationOptional<string>;
}

export function initializePermissionModel(sequelize: Sequelize) {
  Permission.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resource_pattern: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      defaultValue: true,
    }
  }, {
    sequelize,
  });
}
