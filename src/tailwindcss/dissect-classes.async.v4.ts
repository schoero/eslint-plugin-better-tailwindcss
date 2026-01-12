import { escapeForRegex } from "../async-utils/escape.js";
import { getPrefix } from "./prefix.async.v4.js";

import type { DissectedClass, DissectedClasses } from "./dissect-classes.js";


export function getDissectedClasses(tailwindContext: any, classes: string[]): DissectedClasses {
  const prefix = getPrefix(tailwindContext);
  const separator = ":";

  return classes.reduce<Record<string, DissectedClass>>((acc, className) => {
    const [parsed] = tailwindContext.parseCandidate(className);

    const variants = parsed?.variants?.map(variant => tailwindContext.printVariant(variant)).reverse();

    let base = className
      .replace(new RegExp(`^${escapeForRegex(prefix + separator)}`), "")
      .replace(new RegExp(`^${escapeForRegex((variants?.join(separator) ?? "") + separator)}`), "");

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
