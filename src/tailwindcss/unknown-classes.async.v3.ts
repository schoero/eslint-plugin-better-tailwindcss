import * as rules from "tailwindcss3/lib/lib/generateRules.js";

import type { UnknownClass } from "./unknown-classes.js";


export function getUnknownClasses(context: any, classes: string[]): UnknownClass[] {
  return classes
    .filter(className => {
      const generated = rules.generateRules?.([className], context) ?? rules.default?.generateRules?.([className], context);

      return generated.length === 0;
    });
}
