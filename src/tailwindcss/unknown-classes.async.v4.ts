import { Cache } from "../async-utils/cache.js";

import type { UnknownClass } from "./unknown-classes.js";


export function getUnknownClasses(tailwindContext: any, classes: string[]): UnknownClass[] {
  return Cache.get(
    ["unknown-classes", ...classes],
    () => {
      const css = tailwindContext.candidatesToCss(classes);

      return classes.filter((_, index) => css.at(index) === null);
    }
  );
}
