import type { CanonicalClass } from "./canonical-classes.js";


export function getCanonicalClasses(tailwindContext: any, classes: string[]): CanonicalClass[] {
  const start = performance.now();
  const result = tailwindContext.canonicalizeCandidates(classes);
  console.log(`Canonicalization took ${(performance.now() - start).toFixed(2)} ms for ${classes.length} classes.`);

  return result;
}
