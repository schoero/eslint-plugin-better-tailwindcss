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

export type AttributeMatchers = InferOutput<typeof ATTRIBUTE_MATCHER_CONFIG>;

export const ATTRIBUTE_NAME_CONFIG = pipe(
  string(),
  description("Attribute name that for which children get linted.")
);

export type AttributeName = InferOutput<typeof ATTRIBUTE_NAME_CONFIG>;

export const ATTRIBUTES_SCHEMA = pipe(
  array(
    union([
      ATTRIBUTE_NAME_CONFIG,
      ATTRIBUTE_MATCHER_CONFIG
    ])
  ),
  description("List of attribute names that should get linted.")
);

export type Attributes = InferOutput<typeof ATTRIBUTES_SCHEMA>;

export const ATTRIBUTES_OPTION_SCHEMA = object({
  attributes: optional(ATTRIBUTES_SCHEMA, DEFAULT_ATTRIBUTE_NAMES)
}) satisfies Rule.RuleMetaData["schema"];

export type AttributesOptions = InferOutput<typeof ATTRIBUTES_OPTION_SCHEMA>;
