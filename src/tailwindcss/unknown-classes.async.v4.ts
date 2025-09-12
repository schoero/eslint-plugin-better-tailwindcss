import type { UnknownClass } from "./unknown-classes.js";


export function getUnknownClasses(context: any, classes: string[]): UnknownClass[] {
  const css = context.candidatesToCss(classes);

  return classes.filter((_, index) => css.at(index) === null);
}
