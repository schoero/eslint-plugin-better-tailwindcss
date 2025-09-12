import { runAsWorker } from "synckit";

import { getAsyncContext } from "../async-utils/context.js";
import { createTailwindContext } from "./context.async.v4.js";
import { getUnknownClasses } from "./unknown-classes.async.v4.js";

import type { GetUnknownClassesRequest, GetUnknownClassesResponse } from "./unknown-classes.js";


runAsWorker(async ({ classes, configPath, cwd, tsconfigPath }: GetUnknownClassesRequest): Promise<GetUnknownClassesResponse> => {
  const { ctx, warnings } = await getAsyncContext({ configPath, cwd, tsconfigPath });
  const tailwindContext = await createTailwindContext(ctx);

  const unknownClasses = getUnknownClasses(tailwindContext, classes);
  return { unknownClasses, warnings: [...warnings] };
});
