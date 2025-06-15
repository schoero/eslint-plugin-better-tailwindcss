import { runAsWorker } from "synckit";

import { createTailwindContext } from "./context.async.v4.js";

import type { GetUnregisteredClassesRequest, GetUnregisteredClassesResponse } from "./unregistered-classes.js";


runAsWorker(async ({ classes, configPath }: GetUnregisteredClassesRequest): Promise<GetUnregisteredClassesResponse> => {
  const context = await createTailwindContext(configPath);
  const css = context.candidatesToCss(classes);

  return classes.filter((_, index) => css.at(index) === null);
});
