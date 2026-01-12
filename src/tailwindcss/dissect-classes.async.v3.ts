import { escapeForRegex } from "../async-utils/escape.js";
import { normalize } from "../async-utils/path.js";
import { getPrefix } from "./prefix.async.v3.js";

import type { AsyncContext } from "../utils/context.js";
import type { DissectedClass, DissectedClasses } from "./dissect-classes.js";


export async function getDissectedClasses(ctx: AsyncContext, tailwindContext: any, classes: string[]): Promise<DissectedClasses> {

  const utils = await import(normalize(`${ctx.installation}/lib/util/splitAtTopLevelOnly.js`));

  const prefix = getPrefix(tailwindContext);
  const separator = tailwindContext.tailwindConfig.separator ?? ":";

  return classes.reduce<Record<string, DissectedClass>>((acc, className) => {
    const splitChunks = utils.splitAtTopLevelOnly?.(className, separator) ?? utils.default?.splitAtTopLevelOnly?.(className, separator);
    const variants = splitChunks.slice(0, -1);

    let base = className
      .replace(new RegExp(`^${escapeForRegex(variants.join(separator) + separator)}`), "")
      .replace(new RegExp(`^${escapeForRegex(prefix)}`), "");

    const isNegative = base.startsWith("-");
    base = base.replace(/^-/, "");

    const isImportantAtStart = base.startsWith("!");
    base = base.replace(/^!/, "");

    const isImportantAtEnd = base.endsWith("!");
    base = base.replace(/!$/, "");

    acc[className] = {
      base,
      className,
      important: [isImportantAtStart, isImportantAtEnd],
      negative: isNegative,
      prefix,
      separator,
      variants
    };

    return acc;
  }, {});
}
