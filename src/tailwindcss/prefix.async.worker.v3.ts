import { runAsWorker } from "synckit";

import { createTailwindContext } from "./context.async.v3.js";
import { getPrefix } from "./prefix.async.v3.js";

import type { GetPrefixRequest } from "./prefix.js";


runAsWorker(async ({ configPath }: GetPrefixRequest) => {
  const context = await createTailwindContext(configPath);
  return getPrefix(context);
});
