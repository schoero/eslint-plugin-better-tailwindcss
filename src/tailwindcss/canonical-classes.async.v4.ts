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

  const canonicalizedClasses = tailwindContext.canonicalizeCandidates?.(classes, options);

  const removedClasses = classes.filter(className => !canonicalizedClasses.includes(className));
  const originalClasses = classes.filter(className => canonicalizedClasses.includes(className));
  const canonicalClasses = canonicalizedClasses.filter(className => !classes.includes(className));

  for(const originalClass of originalClasses){
    result[originalClass] = {
      input: [originalClass],
      output: originalClass
    };
  }

  if(canonicalClasses.length === 0){
    return result;
  }

  const originalClassesToCheck: string[] = [];

  for(const originalClass of removedClasses){
    originalClassesToCheck.push(originalClass);

    const nestedCanonicalizedClasses = tailwindContext.canonicalizeCandidates(originalClassesToCheck, options);

    for(const canonicalClass of canonicalClasses){
      if(nestedCanonicalizedClasses.includes(canonicalClass)){
        const originalClasses = originalClassesToCheck.filter(originalClass => {
          return !nestedCanonicalizedClasses.includes(originalClass);
        });

        for(const originalClass of originalClasses){
          result[originalClass] = {
            input: originalClasses,
            output: canonicalClass
          };
        }

        originalClassesToCheck.length = 0;
        break;
      }
    }
  }

  return result;

}
