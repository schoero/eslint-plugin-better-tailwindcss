import {
  array,
  description,
  optional,
  pipe,
  strictObject,
  string,
  tuple,
  union
} from "valibot";

import {
  OBJECT_KEY_MATCHER_SCHEMA,
  OBJECT_VALUE_MATCHER_SCHEMA,
  STRING_MATCHER_SCHEMA
} from "better-tailwindcss:options/schemas/matchers.js";

import type { InferOutput } from "valibot";


export const VARIABLE_MATCHER_CONFIG = pipe(
  tuple([
    pipe(
      string(),
      description("Variable name for which children get linted if matched.")
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

export type VariableMatchers = InferOutput<typeof VARIABLE_MATCHER_CONFIG>;

export const VARIABLE_NAME_CONFIG = pipe(
  string(),
  description("Variable name for which children get linted.")
);

export type VariableName = InferOutput<typeof VARIABLE_NAME_CONFIG>;

export const VARIABLES_SCHEMA = pipe(
  array(
    union([
      VARIABLE_MATCHER_CONFIG,
      VARIABLE_NAME_CONFIG
    ])
  ),
  description("List of variable names which values should get linted.")
);

export type Variables = InferOutput<typeof VARIABLES_SCHEMA>;

export const VARIABLES_OPTION_SCHEMA = strictObject({
  variables: optional(VARIABLES_SCHEMA)
});

export type VariablesOptions = InferOutput<typeof VARIABLES_OPTION_SCHEMA>;
