import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { APIKey } from "./api_key";
import { Role } from "./role";

export class APIKeyRole extends Model<InferAttributes<APIKeyRole>, InferCreationAttributes<APIKeyRole>> {
  declare api_key_id: number;
  declare role_id: number;
  declare assigned: CreationOptional<Date>;
}

export function initializeAPIKeyRoleModel(sequelize: Sequelize) {
  APIKeyRole.init({
    api_key_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: APIKey,
        key: "id",
      }
    },
    role_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Role,
        key: "id",
      }
    },
    assigned: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    }
  }, {
    sequelize,
    tableName: "APIKeysRoles"  
  });
}
