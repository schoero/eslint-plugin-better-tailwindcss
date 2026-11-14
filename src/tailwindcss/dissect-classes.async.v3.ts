import { segment } from "../async-utils/segment.js";
import { getPrefix } from "./prefix.async.v3.js";

import type { AsyncContext } from "../utils/context.js";
import type { DissectedClass, DissectedClasses } from "./dissect-classes.js";


export async function getDissectedClasses(ctx: AsyncContext, tailwindContext: any, classes: string[]): Promise<DissectedClasses> {

  const prefix = getPrefix(tailwindContext);
  const separator = tailwindContext.tailwindConfig.separator ?? ":";

  return classes.reduce<Record<string, DissectedClass>>((acc, className) => {
    const splitChunks = segment(className, separator);
    const variants = splitChunks.slice(0, -1);

    let base = className;

    const variantsWithSeparator = variants.join(separator) + separator;

    if(base.startsWith(variantsWithSeparator)){
      base = base.slice(variantsWithSeparator.length);
    }

    if(base.startsWith(prefix)){
      base = base.slice(prefix.length);
    }

    const isNegative = base.startsWith("-");

    if(isNegative){
      base = base.slice(1);
    }

    const isImportantAtStart = base.startsWith("!");

    if(isImportantAtStart){
      base = base.slice(1);
    }

    const isImportantAtEnd = base.endsWith("!");

    if(isImportantAtEnd){
      base = base.slice(0, -1);
    }

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
