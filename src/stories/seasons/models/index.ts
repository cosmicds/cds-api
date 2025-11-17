import { Sequelize } from "sequelize";
import { SeasonsData, initializeSeasonsDataModel } from "./seasons_data";

export {
  SeasonsData,
};

export function initializeModels(db: Sequelize) {
  initializeSeasonsDataModel(db);
}
