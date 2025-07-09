import type { GetUnregisteredClassesResponse } from "./unregistered-classes.js";


export function getUnregisteredClasses(context: any, classes: string[]): GetUnregisteredClassesResponse {
  const css = context.candidatesToCss(classes);

  return classes.filter((_, index) => css.at(index) === null);
}
