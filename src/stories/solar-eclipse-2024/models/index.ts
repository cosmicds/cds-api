import { Sequelize } from "sequelize";
import { SolarEclipse2024Response, initializeSolarEclipse2024ResponseModel } from "./eclipse_response";

export {
  SolarEclipse2024Response
};

export function initializeModels(db: Sequelize) {
  initializeSolarEclipse2024ResponseModel(db);
}
