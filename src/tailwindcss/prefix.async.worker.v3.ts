import { runAsWorker } from "synckit";

import { createTailwindContext } from "./context.async.v3.js";
import { getPrefix, getSuffix } from "./prefix.async.v3.js";

import type { Async } from "../types/async.js";
import type { GetPrefix } from "./prefix.js";


runAsWorker<Async<GetPrefix>>(async ctx => {
  const context = await createTailwindContext(ctx);

  const prefix = getPrefix(context);
  const suffix = getSuffix(context);

  return { prefix, suffix, warnings: ctx.warnings };
});
