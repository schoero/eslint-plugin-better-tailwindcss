import { runAsWorker } from "synckit";

import { createTailwindContext } from "./context.async.v3.js";

import type { GetPrefixRequest, GetPrefixResponse } from "./prefix.js";


runAsWorker(async ({ configPath }: GetPrefixRequest) => {
  const context = await createTailwindContext(configPath);
  return getPrefix(context);
});

export function getPrefix(context: any): GetPrefixResponse {
  return context.tailwindConfig.prefix ?? "";
}
