import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

export class TemporaryFile extends Model<InferAttributes<TemporaryFile>, InferCreationAttributes<TemporaryFile>> {
  declare id: CreationOptional<string>;
  declare content: Buffer;
  declare mime_type: string;
  declare filename: CreationOptional<string | null>;
}

export function initializeTemporaryFileModel(sequelize: Sequelize) {
  TemporaryFile.init({
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    }
  }, {
    sequelize,
  });
}
