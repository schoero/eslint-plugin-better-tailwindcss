import { getClassVariants } from "./class-variants.async.v3.js";
import { getPrefix } from "./prefix.async.v3.js";
import { getShorthands } from "./shorthand-classes.async.js";
import { getUnregisteredClasses } from "./unregistered-classes.async.v3.js";

import type { GetShorthandClassesResponse } from "./shorthand-classes.js";


export function getShorthandClasses(context: any, classes: string[]): GetShorthandClassesResponse {
  const variants = getClassVariants(context, classes);
  const prefix = getPrefix(context);
  const separator = context.tailwindConfig.separator ?? ":";

  const rawMap = classes.reduce<{ [className: string]: string; }>((acc, className) => {
    const classVariants = variants.find(([name]) => name === className)?.[1] ?? [];
    const rawClassName = className
      .replace(classVariants.join(separator), "")
      .replace(prefix, "")
      .replace(/^:/, "");

    acc[rawClassName] = className;
    return acc;
  }, {});

  return getShorthands(Object.keys(rawMap))
    .map<GetShorthandClassesResponse[number]>(([longhands, shorthands]) => {
      const classVariants = variants.find(([name]) => name === rawMap[longhands[0]])?.[1] ?? [];

      const isNegative = (/^!?-/).test(rawMap[longhands[0]]);
      const isImportant = (/^!|!$/).test(rawMap[longhands[0]]);

      const negative = isNegative ? "-" : "";
      const important = isImportant ? "!" : "";

      return [
        longhands.map(longhand => rawMap[longhand]),
        shorthands.map(shorthand => `${[...classVariants, prefix].join(separator)}${important}${negative}${shorthand}`)
      ];
    })
    .filter(([longhands, shorthands]) => {
      const longhandVariants = getClassVariants(context, longhands)
        .map(([, variants]) => variants.join(separator))
        .filter((variants, index, arr) => arr.indexOf(variants) === index);

      return (
        longhandVariants.length <= 1 &&
        getUnregisteredClasses(context, shorthands).length === 0
      );
    });
}
