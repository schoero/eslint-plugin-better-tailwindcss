import { describe, expect, it } from "vitest";

import { getCanonicalClasses } from "./canonical-classes.async.v4.js";


describe("getCanonicalClasses", () => {

  // #422
  it.each(["__proto__", "constructor", "toString"])("should preserve %s when it is canonicalized", className => {
    const tailwindContext = {
      candidatesToCss: (classes: string[]) => classes.map(() => ""),
      canonicalizeCandidates: (classes: string[]) => classes.map(className => `${className}-canonical`)
    };

    const canonicalClasses = getCanonicalClasses(tailwindContext, [className], {
      collapse: undefined,
      logicalToPhysical: undefined,
      rem: undefined
    });

    const clonedCanonicalClasses = structuredClone(canonicalClasses);

    for(const result of [canonicalClasses, clonedCanonicalClasses]){
      expect(Object.keys(result)).toEqual([className]);
      expect(result[className]).toEqual({
        input: [className],
        output: `${className}-canonical`
      });
    }
  });
});
