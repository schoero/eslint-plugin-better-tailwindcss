import { describe, expectTypeOf, it } from "vitest";

import type { Settings } from "../../src/api/types.js";


describe("settings", () => {
  it("should expose settings as optional input values", () => {
    const settings = {
      cwd: ".",
      detectComponentClasses: true,
      entryPoint: "styles.css",
      messageStyle: "compact",
      rootFontSize: 16,
      tailwindConfig: "tailwind.config.js",
      tsconfig: "tsconfig.json"
    } satisfies Settings;
    const emptySettings = {} satisfies Settings;

    expectTypeOf(settings).toExtend<Settings>();
    expectTypeOf(emptySettings).toExtend<Settings>();
  });
});
