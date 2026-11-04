import { toJsonSchema } from "@valibot/to-json-schema";
import { Linter } from "eslint";
import { validate } from "json-schema";
import { describe, expect, test } from "vitest";

import { ATTRIBUTES_OPTION_SCHEMA } from "better-tailwindcss:options/schemas/attributes.js";
import { CALLEES_OPTION_SCHEMA } from "better-tailwindcss:options/schemas/callees.js";
import { VARIABLES_OPTION_SCHEMA } from "better-tailwindcss:options/schemas/variables.js";
import { noUnnecessaryWhitespace } from "better-tailwindcss:rules/no-unnecessary-whitespace.js";
import { MatcherType } from "better-tailwindcss:types/rule.js";

import type { AttributesOptions } from "better-tailwindcss:options/schemas/attributes.js";
import type { CalleesOptions } from "better-tailwindcss:options/schemas/callees.js";
import type { VariablesOptions } from "better-tailwindcss:options/schemas/variables.js";


describe("descriptions", () => {

  test("name config", () => {

    const attributes = {
      attributes: [
        "class",
        "className"
      ]
    } satisfies AttributesOptions;

    expect(
      validate(attributes, toJsonSchema(ATTRIBUTES_OPTION_SCHEMA))
    ).toStrictEqual(
      { errors: [], valid: true }
    );

    const callees = {
      callees: [
        "callee"
      ]
    } satisfies CalleesOptions;

    expect(
      validate(callees, toJsonSchema(CALLEES_OPTION_SCHEMA))
    ).toStrictEqual(
      { errors: [], valid: true }
    );

    const variable = {
      variables: [
        "classes",
        "styles"
      ]
    } satisfies VariablesOptions;

    expect(
      validate(variable, toJsonSchema(VARIABLES_OPTION_SCHEMA))
    ).toStrictEqual(
      { errors: [], valid: true }
    );

  });

  test("regex config", () => {

    const attributes = {
      attributes: [
        "(class|className)",
        "(.*)"
      ]
    } satisfies AttributesOptions;

    expect(
      validate(attributes, toJsonSchema(ATTRIBUTES_OPTION_SCHEMA))
    ).toStrictEqual(
      { errors: [], valid: true }
    );

    const callees = {
      callees: [
        "callee(.*)",
        "(.*)"
      ]
    } satisfies CalleesOptions;

    expect(
      validate(callees, toJsonSchema(CALLEES_OPTION_SCHEMA))
    ).toStrictEqual(
      { errors: [], valid: true }
    );

    const variable = {
      variables: [
        "variable = (.*)",
        "(.*)"
      ]
    } satisfies VariablesOptions;

    expect(
      validate(variable, toJsonSchema(VARIABLES_OPTION_SCHEMA))
    ).toStrictEqual(
      { errors: [], valid: true }
    );

  });

  test("matcher config", () => {

    const attributes: AttributesOptions = {
      attributes: [
        [
          "class",
          [
            {
              match: MatcherType.String
            },
            {
              match: MatcherType.ObjectKey,
              pathPattern: "^.*"
            },
            {
              match: MatcherType.ObjectValue
            }
          ]
        ]
      ]
    };

    expect(
      validate(attributes, toJsonSchema(ATTRIBUTES_OPTION_SCHEMA))
    ).toStrictEqual(
      { errors: [], valid: true }
    );

    const callees: CalleesOptions = {
      callees: [
        [
          "callee",
          [
            {
              match: MatcherType.String
            },
            {
              match: MatcherType.ObjectKey,
              pathPattern: "^.*"
            },
            {
              match: MatcherType.ObjectValue
            }
          ]
        ]
      ]
    };

    expect(
      validate(callees, toJsonSchema(CALLEES_OPTION_SCHEMA))
    ).toStrictEqual(
      { errors: [], valid: true }
    );

    const variable: VariablesOptions = {
      variables: [
        [
          "variable",
          [
            {
              match: MatcherType.String
            },
            {
              match: MatcherType.ObjectKey,
              pathPattern: "^.*"
            },
            {
              match: MatcherType.ObjectValue
            }
          ]
        ]
      ]
    };

    expect(
      validate(variable, toJsonSchema(VARIABLES_OPTION_SCHEMA))
    ).toStrictEqual(
      { errors: [], valid: true }
    );

  });

  test("selectors config", () => {

    const selectors = {
      selectors: [
        {
          callTarget: -1,
          kind: "callee",
          match: [
            {
              type: MatcherType.String
            }
          ],
          path: "^classes\\.push$"
        },
        {
          kind: "tag",
          name: "^tw$"
        },
        {
          kind: "attribute",
          match: [
            {
              path: "^compoundVariants\\[\\d+\\]\\.(?:className|class)$",
              type: MatcherType.ObjectValue
            }
          ],
          name: "^class(?:Name)?$"
        }
      ]
    };

    expect(() => validateRuleOptions(selectors)).not.toThrow();

  });

  test("selectors extend config", () => {

    const selectors = {
      selectors: {
        extend: [
          {
            kind: "attribute",
            match: [{ type: MatcherType.ObjectValue }],
            name: "^classNames$"
          }
        ]
      }
    };

    expect(() => validateRuleOptions(selectors)).not.toThrow();

  });

  test("invalid selectors extend config", () => {

    const selector = {
      kind: "attribute",
      match: [{ type: MatcherType.ObjectValue }],
      name: "^classNames$"
    };

    expect(() => validateRuleOptions({ selectors: { extends: [selector] } })).toThrow();
    expect(() => validateRuleOptions({ selectors: { extend: [selector], extra: true } })).toThrow();
    expect(() => validateRuleOptions({ selectors: { extend: selector } })).toThrow();
    expect(() => validateRuleOptions({ selectors: "^classNames$" })).toThrow();

  });

  test("selectors targetCall and targetArgument config", () => {

    const selectors = {
      selectors: [
        {
          kind: "callee",
          name: "^cn$",
          targetArgument: "first",
          targetCall: "last"
        },
        {
          callTarget: -1,
          kind: "callee",
          name: "^legacy$",
          targetArgument: 0
        }
      ]
    };

    expect(() => validateRuleOptions(selectors)).not.toThrow();

  });

  test("selectors anonymousFunctionReturn matcher config", () => {

    const selectors = {
      selectors: [
        {
          kind: "callee",
          match: [{
            match: [
              { type: MatcherType.String },
              { type: MatcherType.ObjectKey },
              { path: "^compoundVariants\\[\\d+\\]\\.(?:className|class)$", type: MatcherType.ObjectValue }
            ],
            type: MatcherType.AnonymousFunctionReturn
          }],
          name: "^classFactory$"
        }
      ]
    };

    expect(() => validateRuleOptions(selectors)).not.toThrow();

  });

});

function validateRuleOptions(options: Record<string, unknown>) {
  const linter = new Linter({ configType: "flat" });

  linter.verify("", {
    plugins: {
      "better-tailwindcss": {
        rules: { [noUnnecessaryWhitespace.name]: noUnnecessaryWhitespace.rule }
      }
    },
    rules: {
      [`better-tailwindcss/${noUnnecessaryWhitespace.name}`]: ["error", options]
    }
  });
}
