import { Class, CLASS_ATTRIBUTES, classOptions } from "./class";
import { Sequelize } from "sequelize";

// NB: This model is actually a view defined on the Classes table
// where `active = 1`
export class ActiveClass extends Class {}

export function initializeActiveClassModel(sequelize: Sequelize) {
  ActiveClass.init(CLASS_ATTRIBUTES, classOptions(sequelize));
}
