import { runAsWorker } from "synckit";

import { createTailwindContext } from "./context.async.v3.js";

import type { GetPrefixRequest, GetPrefixResponse } from "./prefix.js";


runAsWorker(async ({ configPath }: GetPrefixRequest): Promise<GetPrefixResponse> => {
  const context = await createTailwindContext(configPath);
  return context.tailwindConfig.prefix ?? "";
});
