import { Sequelize } from "sequelize";
import { EclipseMiniResponse, initializeEclipseMiniResponseModel } from "./eclipse_response";

export {
  EclipseMiniResponse 
};

export function initializeModels(db: Sequelize) {
  initializeEclipseMiniResponseModel(db);
}
