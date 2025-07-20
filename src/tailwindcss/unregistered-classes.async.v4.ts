import type { UnregisteredClass } from "./unregistered-classes.js";


export function getUnregisteredClasses(context: any, classes: string[]): UnregisteredClass[] {
  const css = context.candidatesToCss(classes);

  return classes.filter((_, index) => css.at(index) === null);
}
