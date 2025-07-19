import * as rules from "tailwindcss3/lib/lib/generateRules.js";

import type { UnregisteredClass } from "./unregistered-classes.js";


export function getUnregisteredClasses(context: any, classes: string[]): UnregisteredClass[] {
  return classes
    .filter(className => {
      const generated = rules.generateRules?.([className], context) ?? rules.default?.generateRules?.([className], context);

      return generated.length === 0;
    });
}
