import { createRunOperation, getOrRunOperationPerClass } from "better-tailwindcss:tailwindcss/operation.js";

import type { Warning } from "better-tailwindcss:types/async.js";
import type { Context } from "better-tailwindcss:types/rule.js";
import type { AsyncContext } from "better-tailwindcss:utils/context.js";


export interface DissectedClass {
  base: string;
  className: string;
  important: [start: boolean, end: boolean];
  negative: boolean;
  prefix: string;
  separator: string;
  /** Will be undefined in tailwindcss 4 for non-tailwind classes. */
  variants: string[] | undefined;
}

export interface DissectedClasses {
  [className: string]: DissectedClass;
}

export type GetDissectedClasses = (ctx: AsyncContext, classes: string[]) => {
  dissectedClasses: DissectedClasses;
  warnings: (Warning | undefined)[];
};

export let getDissectedClasses: GetDissectedClasses = () => { throw new Error("getDissectedClasses() called before being initialized"); };

export function createGetDissectedClasses(ctx: Context): GetDissectedClasses {
  const runOperation = createRunOperation(ctx);

  getDissectedClasses = (ctx, classes) => ({
    // dissecting a class does not depend on the other classes
    dissectedClasses: getOrRunOperationPerClass(ctx, "dissected-class", classes, uncachedClasses => runOperation("getDissectedClasses", ctx, uncachedClasses)),
    warnings: ctx.warnings
  });

  return getDissectedClasses;
}
