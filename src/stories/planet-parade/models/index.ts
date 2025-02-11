import { Sequelize } from "sequelize";
import { PlanetParadeData, initializePlanetParadeDataModel } from "./planet_parade_data";

export {
  PlanetParadeData,
};

export function initializeModels(db: Sequelize) {
  initializePlanetParadeDataModel(db);
}
