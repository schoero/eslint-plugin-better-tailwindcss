import { runAsWorker } from "synckit";

import { getClassVariants } from "./class-variants.async.v3.js";
import { createTailwindContext } from "./context.async.v3.js";
import { getPrefix } from "./prefix.async.v3.js";
import { getShorthands } from "./shorthand-classes.async.js";
import { getUnregisteredClasses } from "./unregistered-classes.async.v3.js";

import type { GetShorthandClassesRequest, GetShorthandClassesResponse } from "./shorthand-classes.js";


runAsWorker(async ({ classes, configPath }: GetShorthandClassesRequest) => {
  const context = await createTailwindContext(configPath);
  return getShorthandClasses(context, classes);
});

export function getShorthandClasses(context: any, classes: string[]): GetShorthandClassesResponse {
  const variants = getClassVariants(context, classes);
  const prefix = getPrefix(context);
  const separator = context.tailwindConfig.separator ?? ":";

  const rawMap = classes.reduce<{ [className: string]: string; }>((acc, className) => {
    const classVariants = variants.find(([name]) => name === className)?.[1] ?? [];
    const rawClassName = className
      .replace(classVariants.join(separator), "")
      .replace(prefix, "");

    acc[rawClassName] = className;
    return acc;
  }, {});

  return getShorthands(Object.keys(rawMap))
    .map<GetShorthandClassesResponse[number]>(([longhands, shorthands]) => {
      const classVariants = variants.find(([name]) => name === rawMap[longhands[0]])?.[1] ?? [];

      return [
        longhands.map(longhand => rawMap[longhand]),
        shorthands.map(shorthand => `${classVariants.join(separator)}${prefix}${shorthand}`)
      ];
    })
    .filter(([, shorthands]) => getUnregisteredClasses(context, shorthands).length === 0);
}
