import type { CanonicalClass } from "./canonical-classes.js";


export function getCanonicalClasses(tailwindContext: any, classes: string[]): CanonicalClass[] {
  return tailwindContext?.canonicalizeCandidates?.(classes) ?? classes;
}
