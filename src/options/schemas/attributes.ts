import {
  array,
  description,
  object,
  optional,
  pipe,
  string,
  tuple,
  union
} from "valibot";

import { DEFAULT_ATTRIBUTE_NAMES } from "better-tailwindcss:options/default-options.js";
import {
  OBJECT_KEY_MATCHER_SCHEMA,
  OBJECT_VALUE_MATCHER_SCHEMA,
  STRING_MATCHER_SCHEMA
} from "better-tailwindcss:options/schemas/matchers.js";

import type { Rule } from "eslint";
import type { InferOutput } from "valibot";


export const ATTRIBUTE_REGEX_CONFIG = pipe(
  tuple([
    pipe(
      string(),
      description("Regular expression that filters the attribute and matches the content for further processing in a group.")
    ),
    pipe(
      string(),
      description("Regular expression that matches each string literal in a group.")
    )
  ]),
  description("List of regular expressions that matches string literals which should get linted.")
);

export const ATTRIBUTE_MATCHER_CONFIG = pipe(
  tuple([
    pipe(
      string(),
      description("Attribute name for which children get linted if matched.")
    ),
    pipe(
      array(
        union([
          STRING_MATCHER_SCHEMA,
          OBJECT_KEY_MATCHER_SCHEMA,
          OBJECT_VALUE_MATCHER_SCHEMA
        ])
      ),
      description("List of matchers that will be applied.")
    )
  ]),
  description("List of matchers that will automatically be matched.")
);

export const ATTRIBUTE_NAME_CONFIG = pipe(
  string(),
  description("Attribute name that for which children get linted.")
);

export const ATTRIBUTE_SCHEMA = pipe(
  array(
    union([
      ATTRIBUTE_NAME_CONFIG,
      ATTRIBUTE_REGEX_CONFIG,
      ATTRIBUTE_MATCHER_CONFIG
    ])
  ),
  description("List of attribute names that should get linted.")
);

export type Attributes = InferOutput<typeof ATTRIBUTE_SCHEMA>;

export const ATTRIBUTES_OPTIONS_SCHEMA = object({
  attributes: optional(ATTRIBUTE_SCHEMA, DEFAULT_ATTRIBUTE_NAMES)
}) satisfies Rule.RuleMetaData["schema"];

export type AttributesOptions = InferOutput<typeof ATTRIBUTES_OPTIONS_SCHEMA>;
