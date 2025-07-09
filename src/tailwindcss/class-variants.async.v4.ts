import type { GetClassVariantsResponse } from "./class-variants.js";


export function getClassVariants(context: any, classes: string[]): GetClassVariantsResponse {
  return classes.map(className => {
    const [parsed] = context.parseCandidate(className);

    if(!parsed?.variants){
      return [className, []];
    }

    const variants = parsed.variants.map(variant => context.printVariant(variant)).reverse();
    return [className, variants];
  });
}
