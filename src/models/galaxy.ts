import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

export class Galaxy extends Model<InferAttributes<Galaxy>, InferCreationAttributes<Galaxy>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare ra: number;
  declare decl: number;
  declare z: number;
  declare type: string;
}

export function initializeGalaxyModel(sequelize: Sequelize) {
  Galaxy.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    ra: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    decl: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    z: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    engine: 'InnoDB'
  })
}
