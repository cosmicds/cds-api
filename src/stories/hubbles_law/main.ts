import { classSetupRegistry } from "../../registries";
import { hubbleClassSetup } from "./database";
import { router, setup } from "./router";

classSetupRegistry.register("hubbles_law", hubbleClassSetup);

module.exports = {
  path: "/hubbles_law",
  router,
  setup,
};
