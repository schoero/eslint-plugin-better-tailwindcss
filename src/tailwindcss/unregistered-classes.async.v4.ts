import { runAsWorker } from "synckit";

import { createTailwindContext } from "./context.async.v4.js";

import type { GetUnregisteredClassesRequest, GetUnregisteredClassesResponse } from "./unregistered-classes.js";


runAsWorker(async ({ classes, configPath }: GetUnregisteredClassesRequest) => {
  const context = await createTailwindContext(configPath);
  return getUnregisteredClasses(context, classes);
});

export function getUnregisteredClasses(context: any, classes: string[]): GetUnregisteredClassesResponse {
  const css = context.candidatesToCss(classes);

  return classes.filter((_, index) => css.at(index) === null);
}
