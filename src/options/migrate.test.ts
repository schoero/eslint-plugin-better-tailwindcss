import { describe, expect, test } from "vitest";

import {
  hasLegacySelectorConfig,
  migrateFlatSelectorsToLegacySelectors,
  migrateLegacySelectorsToFlatSelectors
} from "better-tailwindcss:options/migrate.js";
import { MatcherType, SelectorKind } from "better-tailwindcss:types/rule.js";


describe("migrate", () => {
  test("should migrate legacy selectors to flat selectors", () => {
    const selectors = migrateLegacySelectorsToFlatSelectors({
      attributes: ["^class(?:Name)?$"],
      callees: [["^cva$", [{ match: MatcherType.String }]]]
    });

    expect(selectors).toStrictEqual([
      {
        kind: SelectorKind.Attribute,
        name: "^class(?:Name)?$"
      },
      {
        kind: SelectorKind.Callee,
        match: [{ type: MatcherType.String }],
        name: "^cva$"
      }
    ]);
  });

  test("should detect legacy selector config", () => {
    expect(hasLegacySelectorConfig({})).toBe(false);
    expect(hasLegacySelectorConfig({ attributes: [] })).toBe(true);
    expect(hasLegacySelectorConfig({ callees: [] })).toBe(true);
    expect(hasLegacySelectorConfig({ tags: [] })).toBe(true);
    expect(hasLegacySelectorConfig({ variables: [] })).toBe(true);
  });

  test("should migrate flat selectors to legacy selectors", () => {
    const selectors = migrateFlatSelectorsToLegacySelectors([
      {
        kind: SelectorKind.Attribute,
        name: "^class$"
      },
      {
        kind: SelectorKind.Callee,
        match: [{ type: MatcherType.String }],
        name: "^cva$"
      },
      {
        kind: SelectorKind.Variable,
        match: [{ path: "^foo$", type: MatcherType.ObjectKey }],
        name: "^classes$"
      }
    ]);

    expect(selectors).toStrictEqual({
      attributes: ["^class$"],
      callees: [["^cva$", [{ match: MatcherType.String }]]],
      variables: [["^classes$", [{ match: MatcherType.ObjectKey, pathPattern: "^foo$" }]]]
    });
  });

});
