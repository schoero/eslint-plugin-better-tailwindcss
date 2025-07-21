import * as utils from "tailwindcss3/lib/util/splitAtTopLevelOnly.js";

import { getPrefix } from "./prefix.async.v3.js";

import type { DissectedClass } from "./dissect-classes.js";


export function getDissectedClasses(context: any, classes: string[]): DissectedClass[] {
  const prefix = getPrefix(context);
  const separator = context.tailwindConfig.separator ?? ":";

  return classes.map(className => {
    const splitChunks = utils.splitAtTopLevelOnly?.(className, separator) ?? utils.default?.splitAtTopLevelOnly?.(className, separator);
    const variants = splitChunks.slice(0, -1);

    let base = className
      .replace(new RegExp(`^${variants.join(separator)}`), "")
      .replace(new RegExp(`^${prefix}`), "")
      .replace(new RegExp(`^${separator}`), "");

    const isNegative = base.startsWith("-");
    base = base.replace(/^-/, "");

    const isImportantAtStart = base.startsWith("!");
    base = base.replace(/^!/, "");

    const isImportantAtEnd = base.endsWith("!");
    base = base.replace(/!$/, "");

    return {
      base,
      className,
      important: [isImportantAtStart, isImportantAtEnd],
      negative: isNegative,
      prefix,
      separator,
      variants
    };
  });
}
