import { toJsonSchema } from "@valibot/to-json-schema";
import { validate } from "json-schema";
import { describe, expect, test } from "vitest";

import { ATTRIBUTES_OPTION_SCHEMA } from "better-tailwindcss:options/schemas/attributes.js";
import { CALLEES_OPTION_SCHEMA } from "better-tailwindcss:options/schemas/callees.js";
import { VARIABLES_OPTION_SCHEMA } from "better-tailwindcss:options/schemas/variables.js";
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

});
