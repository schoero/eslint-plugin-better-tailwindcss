import { describe, expectTypeOf, it } from "vitest";

import { SelectorKind } from "better-tailwindcss:types/rule.js";

import type { CommonOptions } from "better-tailwindcss:options/descriptions.js";
import type { Selectors } from "better-tailwindcss:options/schemas/selectors.js";

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

  it("should accept extended selectors in the settings but resolve them to a flat list in the options", () => {
    const settings = {
      selectors: { extend: [{ kind: SelectorKind.Attribute, name: "^classNames$" }] }
    } satisfies Settings;

    expectTypeOf(settings).toExtend<Settings>();
    expectTypeOf<CommonOptions["selectors"]>().toEqualTypeOf<Selectors>();
  });
});
