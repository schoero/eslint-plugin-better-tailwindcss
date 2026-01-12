import type { UnknownClass } from "./unknown-classes.js";


export function getUnknownClasses(tailwindContext: any, classes: string[]): UnknownClass[] {
  const css = tailwindContext.candidatesToCss(classes);

  return classes.filter((_, index) => css.at(index) === null);
}
