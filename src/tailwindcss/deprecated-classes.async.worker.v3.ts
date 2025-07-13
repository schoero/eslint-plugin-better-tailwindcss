import { runAsWorker } from "synckit";

import type { GetDeprecatedClassesRequest } from "./deprecated-classes.js";


runAsWorker(async ({ classes, configPath }: GetDeprecatedClassesRequest) => {
  return {};
});
