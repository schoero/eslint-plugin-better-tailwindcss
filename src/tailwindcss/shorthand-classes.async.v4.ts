import { getClassVariants } from "./class-variants.async.v4.js";
import { getPrefix } from "./prefix.async.v4.js";
import { getShorthands } from "./shorthand-classes.async.js";
import { getUnregisteredClasses } from "./unregistered-classes.async.v4.js";

import type { GetShorthandClassesResponse } from "./shorthand-classes.js";


export function getShorthandClasses(context: any, classes: string[]): GetShorthandClassesResponse {
  const variants = getClassVariants(context, classes);
  const prefix = getPrefix(context);
  const separator = ":";

  const rawMap = classes.reduce<{ [base: string]: { className: string; isImportantAtEnd: boolean; isImportantAtStart: boolean; isNegative: boolean; variants: string[]; }; }>((acc, className) => {
    const classVariants = variants.find(([name]) => name === className)?.[1] ?? [];

    let base = className
      .replace(classVariants.join(separator), "")
      .replace(prefix, "")
      .replace(/^:/, "");

    const isNegative = base.startsWith("-");
    base = base.replace(/^-/, "");

    const isImportantAtStart = base.startsWith("!");
    base = base.replace(/^!/, "");

    const isImportantAtEnd = base.endsWith("!");
    base = base.replace(/!$/, "");

    acc[base] = { className, isImportantAtEnd, isImportantAtStart, isNegative, variants: classVariants };

    return acc;
  }, {});

  return getShorthands(Object.keys(rawMap))
    .reduce<GetShorthandClassesResponse>((acc, shorthandGroups) => {
      for(const [longhands, shorthands] of shorthandGroups){
        const { isNegative, variants } = rawMap[longhands[0]];

        const isImportantAtEnd = longhands.some(longhand => rawMap[longhand].isImportantAtEnd);
        const isImportantAtStart = !isImportantAtEnd && longhands.some(longhand => rawMap[longhand].isImportantAtStart);

        const importantAtStart = isImportantAtStart ? "!" : "";
        const importantAtEnd = isImportantAtEnd ? "!" : "";
        const negative = isNegative ? "-" : "";

        const longhandClasses = longhands.map(longhand => rawMap[longhand].className);
        const shorthandClasses = shorthands.map(shorthand => [
          prefix,
          ...variants,
          [
            importantAtStart,
            negative,
            shorthand,
            importantAtEnd
          ].join("")
        ].filter(chunk => !!chunk).join(separator));

        if(
          longhands.some(longhand => (rawMap[longhand].isImportantAtStart || rawMap[longhand].isImportantAtEnd) !== (isImportantAtStart || isImportantAtEnd)) ||
          longhands.some(longhand => rawMap[longhand].isNegative !== isNegative) ||
          longhands.some(longhand => rawMap[longhand].variants.join(separator) !== variants.join(separator)) ||
          shorthandClasses.length === 0 ||
          getUnregisteredClasses(context, shorthandClasses).length > 0
        ){
          continue;
        }

        acc.push([longhandClasses, shorthandClasses]);

        break;

      }

      return acc;
    }, []);
}
