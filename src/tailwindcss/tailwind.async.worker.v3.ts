import { runAsWorker } from "synckit";

import { getClassOrder } from "./class-order.async.v3.js";
import { createTailwindContext } from "./context.async.v3.js";
import { getCustomComponentClasses } from "./custom-component-classes.async.v3.js";
import { getDissectedClasses } from "./dissect-classes.async.v3.js";
import { getPrefix, getSuffix } from "./prefix.async.v3.js";
import { getUnknownClasses } from "./unknown-classes.async.v3.js";

import type { AsyncContext } from "../utils/context.js";
import type { CanonicalClassOptions, CanonicalClasses } from "./canonical-classes.js";
import type { ConflictingClasses } from "./conflicting-classes.js";


type TailwindOperation =
  | "canonical-classes"
  | "class-order"
  | "conflicting-classes"
  | "custom-component-classes"
  | "dissect-classes"
  | "prefix"
  | "unknown-classes";

runAsWorker(async (operation: TailwindOperation, ctx: AsyncContext, ...args: unknown[]) => {
  const context = await createTailwindContext(ctx);

  switch (operation){
    case "prefix": {
      const prefix = getPrefix(context);
      const suffix = getSuffix(context);

      return { prefix, suffix, warnings: ctx.warnings };
    }

    case "class-order": {
      const [classes] = args as [string[]];
      const classOrder = getClassOrder(context, classes);

      return { classOrder, warnings: ctx.warnings };
    }

    case "custom-component-classes": {
      const customComponentClasses = await getCustomComponentClasses(ctx);

      return { customComponentClasses, warnings: ctx.warnings };
    }

    case "dissect-classes": {
      const [classes] = args as [string[]];
      const dissectedClasses = await getDissectedClasses(ctx, context, classes);

      return { dissectedClasses, warnings: ctx.warnings };
    }

    case "unknown-classes": {
      const [classes] = args as [string[]];
      const unknownClasses = await getUnknownClasses(ctx, context, classes);

      return { unknownClasses, warnings: ctx.warnings };
    }

    case "conflicting-classes": {
      const conflictingClasses = {} as ConflictingClasses;

      return { conflictingClasses, warnings: ctx.warnings };
    }

    case "canonical-classes": {
      const [classes] = args as [string[], CanonicalClassOptions];
      const canonicalClasses = classes.reduce<CanonicalClasses>((acc, className) => {
        acc[className] = {
          input: [className],
          output: className
        };
        return acc;
      }, {});

      return { canonicalClasses, warnings: ctx.warnings };
    }

    default:
      throw new Error(`Unknown tailwind worker operation: ${operation as string}`);
  }
});
