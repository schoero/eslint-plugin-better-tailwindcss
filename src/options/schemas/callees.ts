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


const CALLEE_MATCHER_SCHEMA = pipe(
  tuple([
    pipe(
      string(),
      description("Callee name for which children get linted if matched.")
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

export type CalleeMatchers = InferOutput<typeof CALLEE_MATCHER_SCHEMA>;

const CALLEE_NAME_SCHEMA = pipe(
  string(),
  description("Callee name for which children get linted.")
);

export type CalleeName = InferOutput<typeof CALLEE_NAME_SCHEMA>;

export const CALLEES_SCHEMA = pipe(
  array(
    union([
      CALLEE_MATCHER_SCHEMA,
      CALLEE_NAME_SCHEMA
    ])
  ),
  description("List of function names which arguments should get linted.")
);

export type Callees = InferOutput<typeof CALLEES_SCHEMA>;

export const CALLEES_OPTION_SCHEMA = strictObject({
  callees: optional(CALLEES_SCHEMA)
});

export type CalleesOptions = InferOutput<typeof CALLEES_OPTION_SCHEMA>;
