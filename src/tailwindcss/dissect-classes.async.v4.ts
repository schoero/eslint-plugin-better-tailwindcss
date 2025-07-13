import { getPrefix } from "./prefix.async.v4.js";

import type { GetDissectedClassResponse } from "./dissect-classes.js";


export function getDissectedClasses(context: any, classes: string[]): GetDissectedClassResponse {
  const prefix = getPrefix(context);
  const separator = ":";

  return classes.map(className => {
    const [parsed] = context.parseCandidate(className);

    const variants = parsed?.variants?.map(variant => context.printVariant(variant)).reverse() ?? [];

    let base = className
      .replace(variants.join(separator), "")
      .replace(prefix + separator, "")
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
    } satisfies GetDissectedClassResponse[number];
  });
}
