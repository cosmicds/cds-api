import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

export class TemporaryFile extends Model<InferAttributes<TemporaryFile>, InferCreationAttributes<TemporaryFile>> {
  declare id: CreationOptional<string>;
  declare content: Buffer;
  declare mime_type: string;
  declare filename: CreationOptional<string | null>;
  declare created_at: CreationOptional<Date>;
  declare last_modified: CreationOptional<Date>;
  declare expires_at: CreationOptional<Date>;
}

export function initializeTemporaryFileModel(sequelize: Sequelize) {
  TemporaryFile.init({
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    content: {
      type: DataTypes.BLOB,
      allowNull: false,
    },
    mime_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filename: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
   last_modified: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("(NOW() + INTERVAL 30 MINUTE)"),
    },
  }, {
    sequelize,
  });
}
