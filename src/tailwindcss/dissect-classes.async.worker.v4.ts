import { runAsWorker } from "synckit";

import { getAsyncContext } from "../async-utils/context.js";
import { createTailwindContext } from "./context.async.v4.js";
import { getDissectedClasses } from "./dissect-classes.async.v4.js";

import type { GetDissectedClassRequest, GetDissectedClassResponse } from "./dissect-classes.js";


runAsWorker(async ({ classes, configPath, cwd }: GetDissectedClassRequest): Promise<GetDissectedClassResponse> => {
  const { ctx, warnings } = await getAsyncContext({ configPath, cwd });
  const context = await createTailwindContext(ctx);

  const dissectedClasses = getDissectedClasses(context, classes);
  return { dissectedClasses, warnings: [...warnings] };
});
