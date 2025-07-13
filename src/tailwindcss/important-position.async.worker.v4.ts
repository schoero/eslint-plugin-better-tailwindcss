import { runAsWorker } from "synckit";

import { createTailwindContext } from "./context.async.v4.js";
import { getImportantPosition } from "./important-position.async.v4.js";

import type { GetImportantPositionRequest } from "./important-position.js";


runAsWorker(async ({ classes, configPath, position }: GetImportantPositionRequest) => {
  const context = await createTailwindContext(configPath);
  return getImportantPosition(context, classes, position);
});
