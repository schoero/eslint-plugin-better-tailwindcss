import { runAsWorker } from "synckit";

import { getAsyncContext } from "../async-utils/context.js";
import { createTailwindContext } from "./context.async.v3.js";
import { getPrefix, getSuffix } from "./prefix.async.v3.js";

import type { GetPrefixRequest, GetPrefixResponse } from "./prefix.js";


runAsWorker(async ({ configPath, cwd }: GetPrefixRequest): Promise<GetPrefixResponse> => {
  const { ctx, warnings } = await getAsyncContext({ configPath, cwd });
  const context = await createTailwindContext(ctx);

  const prefix = getPrefix(context);
  const suffix = getSuffix(context);
  return { prefix, suffix, warnings: [...warnings] };
});
