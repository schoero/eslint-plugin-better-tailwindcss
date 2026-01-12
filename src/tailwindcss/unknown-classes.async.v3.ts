import { normalize } from "../async-utils/path.js";

import type { AsyncContext } from "../utils/context.js";
import type { UnknownClass } from "./unknown-classes.js";


export async function getUnknownClasses(ctx: AsyncContext, tailwindContext: any, classes: string[]): Promise<UnknownClass[]> {
  const rules = await import(normalize(`${ctx.installation}/lib/lib/generateRules.js`));

  return classes
    .filter(className => {
      const generated = rules.generateRules?.([className], tailwindContext) ?? rules.default?.generateRules?.([className], tailwindContext);

      return generated.length === 0;
    });
}
