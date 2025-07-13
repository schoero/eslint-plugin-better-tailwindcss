import { replacePlaceholders } from "../async-utils/string.js";
import { getClassVariants } from "./class-variants.async.v4.js";
import { getPrefix } from "./prefix.async.v4.js";

import type { GetDeprecatedClassesResponse } from "./deprecated-classes.js";


export const deprecated = [
  ["^shadow$", "shadow-sm"],
  ["^drop-shadow$", "drop-shadow-sm"],
  ["^blur$", "blur-sm"],
  ["^backdrop-blur$", "backdrop-blur-sm"],
  ["^rounded$", "rounded-sm"],

  ["^bg-opacity-(.*)$"],
  ["^text-opacity-(.*)$"],
  ["^border-opacity-(.*)$"],
  ["^divide-opacity-(.*)$"],
  ["^ring-opacity-(.*)$"],
  ["^placeholder-opacity-(.*)$"],

  ["^flex-shrink-(.*)$", "shrink-$1"],
  ["^flex-grow-(.*)$", "grow-$1"],

  ["^overflow-ellipsis$", "text-ellipsis"],

  ["^decoration-slice$", "box-decoration-slice"],
  ["^decoration-clone$", "box-decoration-clone"]
] satisfies [before: string, after?: string][];


export function getDeprecatedClasses(context: any, classes: string[]): GetDeprecatedClassesResponse {
  const variants = getClassVariants(context, classes);
  const prefix = getPrefix(context);
  const separator = ":";

  return classes.reduce<GetDeprecatedClassesResponse>((acc, className) => {
    const classVariants = variants.find(([name]) => name === className)?.[1] ?? [];

    let base = className
      .replace(classVariants.join(separator), "")
      .replace(prefix + separator, "")
      .replace(/^:/, "");

    const isImportantAtStart = base.startsWith("!");
    base = base.replace(/^!/, "");

    const isImportantAtEnd = base.endsWith("!");
    base = base.replace(/!$/, "");

    const deprecations = getDeprecations(base);

    const importantAtStart = isImportantAtStart && "!";
    const importantAtEnd = isImportantAtEnd && "!";

    acc[className] = deprecations
      ? [prefix,
        ...classVariants,
        [importantAtStart, deprecations, importantAtEnd].filter(Boolean).join("")].filter(Boolean).join(separator)
      : undefined;

    return acc;
  }, {});
}


function getDeprecations(className: string) {
  for(const [classPattern, replacement] of deprecated){
    const match = className.match(new RegExp(classPattern));

    if(!match){
      continue;
    }

    return replacement && replacePlaceholders(replacement, match);
  }
}
