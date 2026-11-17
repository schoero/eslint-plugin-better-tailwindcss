import { segment } from "../async-utils/segment.js";
import { getPrefix } from "./prefix.async.v4.js";

import type { DissectedClass, DissectedClasses } from "./dissect-classes.js";


export function getDissectedClasses(tailwindContext: any, classes: string[]): DissectedClasses {
  const prefix = getPrefix(tailwindContext);
  const separator = ":";

  return classes.reduce<Record<string, DissectedClass>>((acc, className) => {
    const splitChunks = segment(className, separator);
    const variants = splitChunks
      .slice(0, -1)
      .filter((variant, index) => {
        if(variant === prefix && index === 0){
          return false;
        }
        return true;
      });

    let base = className;

    const prefixWithSeparator = prefix + separator;

    if(base.startsWith(prefixWithSeparator)){
      base = base.slice(prefixWithSeparator.length);
    }

    const variantsWithSeparator = variants.join(separator) + separator;

    if(base.startsWith(variantsWithSeparator)){
      base = base.slice(variantsWithSeparator.length);
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
