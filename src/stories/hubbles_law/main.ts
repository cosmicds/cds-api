import { classSetupRegistry } from "../../registries";
import { hubbleClassSetup } from "./database";
import { BASE_PATH, router, setup } from "./router";

classSetupRegistry.register("hubbles_law", hubbleClassSetup);

module.exports = {
  path: BASE_PATH,
  router,
  setup,
};
