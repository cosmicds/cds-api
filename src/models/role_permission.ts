import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { Permission } from "./permission";
import { Role } from "./role";

export class RolePermission extends Model<InferAttributes<RolePermission>, InferCreationAttributes<RolePermission>> {
  declare role_id: number;
  declare permission_id: number;
  declare assigned: CreationOptional<Date>;
}

export function initializeRolePermissionModel(sequelize: Sequelize) {
  RolePermission.init({
    role_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Role,
        key: "id",
      }
    },
    permission_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Permission,
        key: "id",
      }
    },
    assigned: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    }
  },
  {
    sequelize,
    tableName: "RolesPermissions",
  });
}
