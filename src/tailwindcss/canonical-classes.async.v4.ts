import { getUnknownClasses } from "./unknown-classes.async.v4.js";

import type { CanonicalClasses, CanonicalClassOptions } from "./canonical-classes.js";


export function getCanonicalClasses(tailwindContext: any, classes: string[], options: CanonicalClassOptions): CanonicalClasses {
  const result: CanonicalClasses = {};

  if(typeof tailwindContext?.canonicalizeCandidates !== "function"){
    for(const className of classes){
      result[className] = {
        input: [className],
        output: className
      };
    }
    return result;
  }

  // tailwind currently crashes when unknown classes are passed to canonicalizeCandidates
  const unknownClasses = getUnknownClasses(tailwindContext, classes);
  const knownClasses = classes.filter(className => !unknownClasses.includes(className));

  const canonicalizedClasses = tailwindContext.canonicalizeCandidates?.(knownClasses, options);

  const removedClasses = knownClasses.filter(className => !canonicalizedClasses.includes(className));
  const originalClasses = knownClasses.filter(className => canonicalizedClasses.includes(className));
  const canonicalClasses = canonicalizedClasses.filter(className => !classes.includes(className));

  for(const originalClass of originalClasses){
    result[originalClass] = {
      input: [originalClass],
      output: originalClass
    };
  }

  for(const unknownClass of unknownClasses){
    result[unknownClass] = {
      input: [unknownClass],
      output: unknownClass
    };
  }

  if(canonicalClasses.length === 0){
    return result;
  }

  for(const canonicalClass of canonicalClasses){
    const necessaryClasses = removedClasses.filter(removedClass => {
      const subset = removedClasses.filter(className => className !== removedClass);
      const subsetCanonical = tailwindContext.canonicalizeCandidates(
        subset,
        options
      );
      return !subsetCanonical.includes(canonicalClass);
    });

    for(const originalClass of necessaryClasses){
      result[originalClass] = {
        input: necessaryClasses,
        output: canonicalClass
      };
    }
  }

  return result;
}
