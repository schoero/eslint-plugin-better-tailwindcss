import { describe, expectTypeOf, it } from "vitest";

import { SelectorKind } from "better-tailwindcss:types/rule.js";

import type { CommonOptions } from "better-tailwindcss:options/descriptions.js";

import type { Selector, Selectors, Settings } from "../../src/api/types.js";


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
      selectors: { extends: [{ kind: SelectorKind.Attribute, name: "^classNames$" }] }
    } satisfies Settings;

    expectTypeOf(settings).toExtend<Settings>();
    expectTypeOf<CommonOptions["selectors"]>().toEqualTypeOf<Selector[]>();
  });

  it("should accept preset names in the public selectors type", () => {
    const selectors = ["react", "clsx", { kind: SelectorKind.Callee, name: "^myFn$" }] satisfies Selectors;

    const settings = { selectors } satisfies Settings;

    expectTypeOf(selectors).toExtend<Selectors>();
    expectTypeOf(settings).toExtend<Settings>();
    expectTypeOf<"notAPreset">().not.toExtend<Selectors[number]>();
  });
});
