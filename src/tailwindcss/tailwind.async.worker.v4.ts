import { runAsWorker } from "synckit";

import { getCanonicalClasses } from "./canonical-classes.async.v4.js";
import { getClassOrder } from "./class-order.async.v4.js";
import { getConflictingClasses } from "./conflicting-classes.async.v4.js";
import { createTailwindContext } from "./context.async.v4.js";
import { getCustomComponentClasses } from "./custom-component-classes.async.v4.js";
import { getDissectedClasses } from "./dissect-classes.async.v4.js";
import { getPrefix, getSuffix } from "./prefix.async.v4.js";
import { getUnknownClasses } from "./unknown-classes.async.v4.js";

import type { AsyncContext } from "../utils/context.js";
import type { CanonicalClassOptions } from "./canonical-classes.js";


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
      const dissectedClasses = getDissectedClasses(context, classes);

      return { dissectedClasses, warnings: ctx.warnings };
    }

    case "unknown-classes": {
      const [classes] = args as [string[]];
      const unknownClasses = getUnknownClasses(context, classes);

      return { unknownClasses, warnings: ctx.warnings };
    }

    case "conflicting-classes": {
      const [classes] = args as [string[]];
      const conflictingClasses = await getConflictingClasses(context, classes);

      return { conflictingClasses, warnings: ctx.warnings };
    }

    case "canonical-classes": {
      const [classes, options] = args as [string[], CanonicalClassOptions];
      const canonicalClasses = getCanonicalClasses(context, classes, options);

      return { canonicalClasses, warnings: ctx.warnings };
    }

    default:
      throw new Error(`Unknown tailwind worker operation: ${operation as string}`);
  }
});
