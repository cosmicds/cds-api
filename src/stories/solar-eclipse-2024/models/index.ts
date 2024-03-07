import { Sequelize } from "sequelize";
import { SolarEclipse2024Data, initializeSolarEclipse2024DataModel } from "./eclipse_data";

export {
  SolarEclipse2024Data
};

export function initializeModels(db: Sequelize) {
  initializeSolarEclipse2024DataModel(db);
}
